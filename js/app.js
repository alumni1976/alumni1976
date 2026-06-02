import { loadRoute } from './router.js';

const FALLBACK_MENU = [
  { item: 'Αρχική', url: 'home' },
  { item: 'Μέλη', url: 'community' },
  { item: 'Φωτογραφίες', url: 'alumniphotos' },
  { item: 'Καθηγητές', url: 'alumniprofs' },
  { item: 'Εκδηλώσεις', url: 'alumnievents' },
  { item: 'ThinkTank', url: 'thinktank' }
];

window.addEventListener('hashchange', async () => {
  await loadRoute();
  setActiveMenuItem();
});

function normalizeRoute(url) {
  let route = String(url || '')
    .trim()
    .replace('.html', '')
    .replace(/^#\//, '')
    .replace(/^\//, '');

  if (route === 'index' || route === '') {
    route = 'home';
  }

  return route;
}

function setActiveMenuItem() {
  const path = location.hash.replace('#/', '') || 'home';

  document.querySelectorAll('#menu a').forEach(link => {
    link.classList.remove('active');

    if (link.getAttribute('href') === '#/' + path) {
      link.classList.add('active');
    }
  });
}

function renderMenuRows(rows) {
  const menu = document.getElementById('menu');
  if (!menu) return;

  menu.innerHTML = rows.map(row => {
    const route = normalizeRoute(row.url);
    return `<li><a href="#/${route}">${row.item}</a></li>`;
  }).join('');

  setActiveMenuItem();
}

async function renderMenu() {
  const dbScript = document.getElementById('supabase-db');
  const apiKey = dbScript?.dataset?.apikey;

  try {
    if (typeof SupabaseMenuRepository !== 'undefined' && apiKey) {
      window.menuRepository = new SupabaseMenuRepository(apiKey);
      const dataset = await window.menuRepository.fetchMenuData('menuitems');

      if (dataset && Array.isArray(dataset.items) && dataset.items.length) {
        renderMenuRows(dataset.items);
        return;
      }
    }
  } catch (err) {
    console.error('Menu failed, using fallback menu:', err);
  }

  renderMenuRows(FALLBACK_MENU);
}

window.addEventListener('DOMContentLoaded', async () => {
  await renderMenu();
  await loadRoute();
  setActiveMenuItem();
});
