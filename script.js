const galleryGrid = document.getElementById('galleryGrid');
const searchInput = document.getElementById('searchInput');
const regionFilter = document.getElementById('regionFilter');
const bugCount = document.getElementById('bugCount');
const randomBugBtn = document.getElementById('randomBugBtn');
const bugDialog = document.getElementById('bugDialog');
const dialogVisual = document.getElementById('dialogVisual');
const dialogLatin = document.getElementById('dialogLatin');
const dialogTitle = document.getElementById('dialogTitle');
const dialogRegion = document.getElementById('dialogRegion');
const dialogDescription = document.getElementById('dialogDescription');
const dialogFacts = document.getElementById('dialogFacts');
const dialogTags = document.getElementById('dialogTags');
const scrollBugsLayer = document.querySelector('.scroll-bugs');

const decorativeBugSources = [
  'assets/stag-beetle.svg',
  'assets/jewel-beetle.svg',
  'assets/orchid-mantis.svg',
  'assets/hercules-beetle.svg'
];

function renderFilters() {
  const regions = [...new Set(insects.map(item => item.region))].sort((a, b) => a.localeCompare(b, 'ru'));
  regions.forEach(region => {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    regionFilter.append(option);
  });
}

function createCard(item) {
  const article = document.createElement('article');
  article.className = 'bug-card';
  article.tabIndex = 0;
  article.setAttribute('role', 'button');
  article.setAttribute('aria-label', `Открыть карточку: ${item.name}`);
  article.innerHTML = `
    <div class="bug-visual">
      <img src="${item.image}" alt="${item.name}" loading="lazy" />
    </div>
    <div class="bug-meta">
      <h3 class="bug-name">${item.name}</h3>
      <p class="bug-latin">${item.latin}</p>
      <p class="bug-region">${item.region}</p>
      <div class="tag-row">
        ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </div>
  `;

  article.addEventListener('click', () => openDialog(item));
  article.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDialog(item);
    }
  });

  return article;
}

function renderGallery() {
  const term = searchInput.value.trim().toLowerCase();
  const region = regionFilter.value;

  const filtered = insects.filter(item => {
    const matchesTerm = [item.name, item.latin, item.region, ...item.tags]
      .join(' ')
      .toLowerCase()
      .includes(term);
    const matchesRegion = region === 'all' || item.region === region;
    return matchesTerm && matchesRegion;
  });

  galleryGrid.innerHTML = '';
  bugCount.textContent = filtered.length;

  if (!filtered.length) {
    galleryGrid.innerHTML = `<div class="empty-state">Ничего не найдено. Попробуй другой запрос или сбрось фильтр.</div>`;
    return;
  }

  filtered.forEach(item => galleryGrid.append(createCard(item)));
}

function openDialog(item) {
  dialogVisual.innerHTML = `<img src="${item.image}" alt="${item.name}" />`;
  dialogLatin.textContent = item.latin;
  dialogTitle.textContent = item.name;
  dialogRegion.textContent = item.region;
  dialogDescription.textContent = item.description;
  dialogFacts.innerHTML = item.facts.map(fact => `<li>${fact}</li>`).join('');
  dialogTags.innerHTML = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

  bugDialog.showModal();
  document.body.classList.add('dialog-open');
}

function closeDialog() {
  bugDialog.close();
  document.body.classList.remove('dialog-open');
}

function openRandomBug() {
  const randomItem = insects[Math.floor(Math.random() * insects.length)];
  openDialog(randomItem);
}

function setupDialog() {
  bugDialog.addEventListener('click', event => {
    const content = bugDialog.querySelector('.dialog-content');
    if (!content.contains(event.target)) {
      closeDialog();
    }
  });

  bugDialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
  });
}

function spawnScrollBugs() {
  const count = Math.min(10, Math.max(6, Math.floor(window.innerWidth / 180)));
  scrollBugsLayer.innerHTML = '';

  for (let i = 0; i < count; i += 1) {
    const wrapper = document.createElement('div');
    wrapper.className = 'scroll-bug';
    const image = decorativeBugSources[i % decorativeBugSources.length];
    wrapper.innerHTML = `<img src="${image}" alt="" />`;
    wrapper.dataset.depth = String((i % 4) + 1);
    wrapper.dataset.baseX = String(Math.random() * 92);
    wrapper.dataset.baseY = String(Math.random() * 100);
    wrapper.dataset.rotation = String((Math.random() * 70) - 35);
    scrollBugsLayer.append(wrapper);
  }

  updateScrollBugs();
}

function updateScrollBugs() {
  const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollMax > 0 ? window.scrollY / scrollMax : 0;
  const bugs = scrollBugsLayer.querySelectorAll('.scroll-bug');

  bugs.forEach((bug, index) => {
    const depth = Number(bug.dataset.depth);
    const baseX = Number(bug.dataset.baseX);
    const baseY = Number(bug.dataset.baseY);
    const rotation = Number(bug.dataset.rotation);
    const shiftY = progress * (110 + depth * 45) - index * 6;
    const shiftX = Math.sin(progress * Math.PI * 2 + index) * (8 + depth * 4);
    const opacity = 0.12 + (depth * 0.03) + progress * 0.08;

    bug.style.left = `${baseX}%`;
    bug.style.top = `${(baseY + shiftY) % 110 - 5}%`;
    bug.style.opacity = opacity.toFixed(2);
    bug.style.transform = `translate3d(${shiftX}px, 0, 0) rotate(${rotation + progress * 140}deg)`;
  });
}

searchInput.addEventListener('input', renderGallery);
regionFilter.addEventListener('change', renderGallery);
randomBugBtn.addEventListener('click', openRandomBug);
window.addEventListener('scroll', updateScrollBugs, { passive: true });
window.addEventListener('resize', spawnScrollBugs);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && bugDialog.open) {
    closeDialog();
  }
});

renderFilters();
renderGallery();
setupDialog();
spawnScrollBugs();
bugCount.textContent = insects.length;
