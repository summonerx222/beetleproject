const beetles = window.BEETLES || [];
const body = document.body;

const elements = {
  grid: document.getElementById('beetleGrid'),
  template: document.getElementById('beetleCardTemplate'),
  totalCount: document.getElementById('totalCount'),
  searchInput: document.getElementById('searchInput'),
  regionFilter: document.getElementById('regionFilter'),
  typeFilter: document.getElementById('typeFilter'),
  resultsText: document.getElementById('resultsText'),
  emptyState: document.getElementById('emptyState'),
  resetFilters: document.getElementById('resetFilters'),
  latinToggle: document.getElementById('latinToggle'),
  themeToggle: document.getElementById('themeToggle'),
  randomBeetle: document.getElementById('randomBeetle'),
  modal: document.getElementById('modal'),
  modalContent: document.getElementById('modalContent'),
  closeModal: document.getElementById('closeModal')
};

const state = {
  query: '',
  region: 'Все регионы',
  type: 'Все типы',
  latinVisible: false,
  theme: localStorage.getItem('beetle-theme') || 'dark'
};

function init() {
  elements.totalCount.textContent = String(beetles.length);
  populateSelect(elements.regionFilter, 'Все регионы', uniqueValues('region'));
  populateSelect(elements.typeFilter, 'Все типы', uniqueValues('type'));
  setTheme(state.theme);
  render();
  attachEvents();
  observeReveal();
}

function uniqueValues(key) {
  return [...new Set(beetles.map(item => item[key]))].sort((a, b) => a.localeCompare(b, 'ru'));
}

function populateSelect(select, defaultText, values) {
  const options = [defaultText, ...values];
  select.innerHTML = options.map(value => `<option value="${value}">${value}</option>`).join('');
}

function attachEvents() {
  elements.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value.trim().toLowerCase();
    render();
  });

  elements.regionFilter.addEventListener('change', (event) => {
    state.region = event.target.value;
    render();
  });

  elements.typeFilter.addEventListener('change', (event) => {
    state.type = event.target.value;
    render();
  });

  elements.resetFilters.addEventListener('click', () => {
    state.query = '';
    state.region = 'Все регионы';
    state.type = 'Все типы';
    elements.searchInput.value = '';
    elements.regionFilter.value = state.region;
    elements.typeFilter.value = state.type;
    render();
  });

  elements.latinToggle.addEventListener('click', () => {
    state.latinVisible = !state.latinVisible;
    elements.latinToggle.setAttribute('aria-pressed', String(state.latinVisible));
    elements.grid.classList.toggle('hidden-latin', !state.latinVisible);
  });

  elements.themeToggle.addEventListener('click', () => {
    setTheme(body.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  elements.randomBeetle.addEventListener('click', () => {
    const item = beetles[Math.floor(Math.random() * beetles.length)];
    openModal(item);
  });

  elements.closeModal.addEventListener('click', closeModal);
  elements.modal.addEventListener('click', (event) => {
    if (event.target.dataset.close === 'true') closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

function setTheme(theme) {
  state.theme = theme;
  body.dataset.theme = theme;
  localStorage.setItem('beetle-theme', theme);
  const label = theme === 'dark' ? 'Gothic' : 'Light cabinet';
  elements.themeToggle.querySelector('.theme-label').textContent = label;
}

function filteredBeetles() {
  return beetles.filter(item => {
    const haystack = [item.name, item.latin, item.region, item.type, item.habitat, item.note].join(' ').toLowerCase();
    const matchQuery = !state.query || haystack.includes(state.query);
    const matchRegion = state.region === 'Все регионы' || item.region === state.region;
    const matchType = state.type === 'Все типы' || item.type === state.type;
    return matchQuery && matchRegion && matchType;
  });
}

function render() {
  const items = filteredBeetles();
  elements.grid.innerHTML = '';
  elements.grid.classList.toggle('hidden-latin', !state.latinVisible);

  items.forEach((item, index) => {
    const node = elements.template.content.firstElementChild.cloneNode(true);
    const button = node.querySelector('.card-hit');
    node.style.transitionDelay = `${Math.min(index * 0.04, 0.24)}s`;

    node.querySelector('.card-region').textContent = item.region;
    node.querySelector('.card-type').textContent = item.type;
    node.querySelector('.card-name').textContent = item.name;
    node.querySelector('.card-latin').textContent = item.latin;
    node.querySelector('.card-note').textContent = item.note;
    node.querySelector('.habitat').textContent = item.habitat;
    node.querySelector('.rarity').textContent = item.rarity;

    const art = node.querySelector('.card-art');
    art.style.background = `linear-gradient(180deg, ${hexToRgba(item.colors[0], 0.20)}, ${hexToRgba(item.colors[1], 0.24)})`;

    button.addEventListener('click', () => openModal(item));
    elements.grid.appendChild(node);
  });

  elements.resultsText.textContent = `Найдено ${items.length} ${pluralize(items.length, ['экземпляр', 'экземпляра', 'экземпляров'])}`;
  elements.emptyState.classList.toggle('hidden', items.length !== 0);
  requestAnimationFrame(observeReveal);
}

function openModal(item) {
  elements.modalContent.innerHTML = `
    <section class="modal-hero" style="--c1:${hexToRgba(item.colors[0], 0.45)}; --c2:${hexToRgba(item.colors[1], 0.55)}">
      <div class="modal-copy">
        <p class="eyebrow">карточка экземпляра</p>
        <h3 id="modalTitle">${item.name}</h3>
        <p><em>${item.latin}</em></p>
      </div>
    </section>
    <ul class="modal-meta">
      <li><strong>Регион:</strong> ${item.region}</li>
      <li><strong>Тип:</strong> ${item.type}</li>
      <li><strong>Среда:</strong> ${item.habitat}</li>
      <li><strong>Короткий факт:</strong> ${item.fact}</li>
      <li><strong>Почему он здесь:</strong> ${item.details}</li>
    </ul>
  `;
  elements.modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  elements.modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function observeReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-card');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(target => io.observe(target));
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function pluralize(number, words) {
  const mod10 = number % 10;
  const mod100 = number % 100;
  if (mod10 === 1 && mod100 !== 11) return words[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return words[1];
  return words[2];
}

init();
