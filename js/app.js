import { loadRoute } from './router.js';

const FALLBACK_MENU = [
  { item: 'Αρχική', url: 'home' },
  { item: 'Μέλη', url: 'community' },
  { item: 'Φωτογραφίες', url: 'alumniphotos' },
  { item: 'Καθηγητές', url: 'alumniprofs' },
  { item: 'Εκδηλώσεις', url: 'alumnievents' },
  { item: 'ThinkTank', url: 'thinktank' },
  {
    item: 'Reunion 1976',
    url: 'reunion',
    children: [
      { item: 'Εντυπώσεις Πρωταγωνιστών', url: 'reuniongreetings' },
      { item: 'Βίντεο Ομιλητών', url: 'reunionvideos' },
      { item: 'Φωτογραφικό Υλικό', url: 'reunionphotos' },
      { item: 'Συμμετέχοντες', url: 'reunionattendees' }
    ]
  }
];

function normalizeRoute(url) {
  let r = String(url || '')
    .trim()
    .replace('.html', '')
    .replace(/^#\//, '')
    .replace(/^\//, '');

  return (r === 'index' || r === '') ? 'home' : r;
}

function closeAllDropdowns() {
  document
    .querySelectorAll('#menu .has-dropdown')
    .forEach(li => li.classList.remove('open'));
}

function setActiveMenuItem() {
  const path = location.hash.replace('#/', '') || 'home';

  document.querySelectorAll('#menu a').forEach(a => {
    a.classList.remove('active');

    if ((a.getAttribute('href') || '') === '#/' + path) {
      a.classList.add('active');
    }
  });

  document.querySelectorAll('#menu .has-dropdown').forEach(li => {
    if (li.querySelector('a.active')) {
      li.querySelector(':scope > a')?.classList.add('active');
    }
  });
}

function renderMenuRows(rows) {

  const menu = document.getElementById('menu');

  if (!menu) return;

  menu.innerHTML = rows.map(row => {

    const route = normalizeRoute(row.url);

    if (row.children && row.children.length) {

      const childItems = row.children.map(c =>
        `<li><a href="#/${normalizeRoute(c.url)}">${c.item}</a></li>`
      ).join('');

      return `
        <li class="has-dropdown">
          <a href="#/${route}" class="dropdown-toggle">
            ${row.item}
            <span class="dropdown-caret">▾</span>
          </a>
          <ul class="dropdown-menu">${childItems}</ul>
        </li>
      `;
    }

    return `<li><a href="#/${route}">${row.item}</a></li>`;

  }).join('');

  menu.querySelectorAll('.has-dropdown').forEach(li => {

    li.querySelector('.dropdown-toggle')
      .addEventListener('click', e => {

        const isOpen =
          li.classList.contains('open');

        closeAllDropdowns();

        if (!isOpen) {
          e.preventDefault();
          li.classList.add('open');
        }

      });

  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#menu')) {
      closeAllDropdowns();
    }
  });

  setActiveMenuItem();
}

async function renderMenu() {

  const dbScript =
    document.getElementById('supabase-db');

  const apiKey =
    dbScript?.dataset?.apikey;

  try {

    if (window.menuRepository) {

      const dataset =
        await window.menuRepository.fetchMenuData('menuitems');

      if (dataset?.items?.length) {

        const items = dataset.items;

        const reunionIdx =
          items.findIndex(
            i => normalizeRoute(i.url) === 'reunion'
          );

        if (reunionIdx >= 0) {

          items[reunionIdx].children =
            FALLBACK_MENU.find(
              m => m.url === 'reunion'
            )?.children || [];

        }

        renderMenuRows(items);
        return;
      }
    }

  } catch (e) {

    console.warn(
      'DB menu failed, using fallback:',
      e.message
    );

  }

  renderMenuRows(FALLBACK_MENU);
}

window.addEventListener('hashchange', async () => {

  await loadRoute();

  setActiveMenuItem();

  closeAllDropdowns();

});

window.addEventListener('DOMContentLoaded', async () => {

  const dbScript =
    document.getElementById('supabase-db');

  const apiKey =
    dbScript?.dataset?.apikey;

  if (
    typeof window.SupabaseMenuRepository !== 'undefined' &&
    apiKey
  ) {

    window.menuRepository =
      new window.SupabaseMenuRepository(apiKey);

    console.log(
      'menuRepository initialized',
      window.menuRepository
    );

  } else {

    console.error(
      'SupabaseMenuRepository not available'
    );

  }

  await renderMenu();

  await loadRoute();

  setActiveMenuItem();

});