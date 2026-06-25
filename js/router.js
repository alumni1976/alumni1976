const routes = {
  home: () => import('./pages/home.js'),
  community: () => import('./pages/community.js'),
  alumniphotos: () => import('./pages/alumniphotos.js'),
  alumniprofs: () => import('./pages/alumniprofs.js'),
  alumnievents: () => import('./pages/alumnievents.js'),
  reunion: () => import('./pages/reunion.js'),
  reuniongreetings: () => import('./pages/reuniongreetings.js'),
  reunionvideos: () => import('./pages/reunionvideos.js'),
  reunionphotos: () => import('./pages/reunionphotos.js'),
  reunionattendees: () => import('./pages/reunionattendees.js'),
  eventregistration: () => import('./pages/eventregistration.js'),
  directory: () => import('./pages/directory.js'),
  faq: () => import('./pages/faq.js'),

  thinktank: () => import('./pages/thinktank.js'),
  contact: () => import('./pages/contact.js')
};

export async function loadRoute() {
  const app = document.getElementById('app');
  const rawPath = location.hash.replace('#/', '') || 'home';
  const path = rawPath.split('?')[0];
  const moduleLoader = routes[path];

  if (!moduleLoader) {
    app.innerHTML = `
      <section class="route-error">
        <h2>404</h2>
        <p>Η σελίδα δεν βρέθηκε.</p>
      </section>`;
    return;
  }

  try {
    const module = await moduleLoader();
    app.innerHTML = await module.render();
    if (typeof module.afterRender === 'function') await module.afterRender();
  } catch (err) {
    console.error("ROUTER ERROR:", err);
    app.innerHTML = `
      <div class="route-error">
        <h2>Error</h2>
        <p>Αποτυχία φόρτωσης της σελίδας.</p>
        <pre style="white-space:pre-wrap;color:#ff8080">${err.stack || err.message || err}</pre>
      </div>`;
  }
}
