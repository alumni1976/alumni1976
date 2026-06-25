async function loadJson(url) {
  try { const r = await fetch(url); return await r.json(); } catch { return []; }
}

export async function render() {
  return `
    <div class="profs-header photos-header">
      <div class="profs-eyebrow">50 ΧΡΟΝΙΑ ΜΕΤΑ</div>
      <h1>Reunion <em>1976</em></h1>
      <p>20 Ιουνίου 2026 · Πρυτανεία Πανεπιστημίου Πατρών, Ρίο</p>
    </div>
    <main class="photos-main">
      <section class="photos-section">

        <div id="rdStats" class="rd-stats-grid">
          <div class="rd-stat-card skeleton"></div>
          <div class="rd-stat-card skeleton"></div>
          <div class="rd-stat-card skeleton"></div>
          <div class="rd-stat-card skeleton"></div>
        </div>

        <div class="rd-nav-grid">
          <a href="#/reuniongreetings" class="rd-nav-card">
            <div class="rd-nav-icon">💬</div>
            <h3>Εντυπώσεις Πρωταγωνιστών</h3>
            <p>Τα μηνύματα και συναισθήματα των συναδέλφων μετά τη συνάντηση</p>
            <span class="rd-nav-arrow">→</span>
          </a>
          <a href="#/reunionvideos" class="rd-nav-card">
            <div class="rd-nav-icon">🎥</div>
            <h3>Βίντεο Ομιλητών</h3>
            <p>Βίντεο-χαιρετισμοί των συναδέλφων από την εκδήλωση</p>
            <span class="rd-nav-arrow">→</span>
          </a>
          <a href="#/reunionphotos" class="rd-nav-card">
            <div class="rd-nav-icon">📸</div>
            <h3>Φωτογραφικό Υλικό</h3>
            <p>Στιγμές και αναμνήσεις από τη συνάντηση</p>
            <span class="rd-nav-arrow">→</span>
          </a>
          <a href="#/reunionattendees" class="rd-nav-card">
            <div class="rd-nav-icon">👥</div>
            <h3>Συμμετέχοντες</h3>
            <p>Οι 29 συνάδελφοι που ήταν εκεί</p>
            <span class="rd-nav-arrow">→</span>
          </a>
        </div>

        <blockquote class="rd-quote">
          <p>«Ήμασταν εκεί. Τα ζήσαμε μαζί. Και παραμένουμε μια οικογένεια.»</p>
          <footer>— Alumni 1976, Ηλεκτρολόγοι Μηχανικοί Πανεπιστημίου Πατρών</footer>
        </blockquote>

      </section>
    </main>
  `;
}

export async function afterRender() {
  const statsGrid = document.getElementById('rdStats');
  if (!statsGrid) return;

  const [greetings, videos, photos, attendees] = await Promise.all([
    loadJson('./assets/data/greetings.json'),
    loadJson('./assets/data/videos.json'),
    loadJson('./assets/data/photos.json'),
    loadJson('./assets/data/attendees.json')
  ]);

  const presentCount = attendees.filter(a => a.attended === true).length;

  const stats = [
    { icon: '💬', label: 'Εντυπώσεις', value: greetings.length, href: '#/reuniongreetings' },
    { icon: '🎥', label: 'Βίντεο',      value: videos.length,    href: '#/reunionvideos'    },
    { icon: '📸', label: 'Φωτογραφίες', value: photos.length,    href: '#/reunionphotos'    },
    { icon: '👥', label: 'Παρόντες',    value: presentCount,     href: '#/reunionattendees' }
  ];

  statsGrid.innerHTML = stats.map(s => `
    <a href="${s.href}" class="rd-stat-card">
      <span class="rd-stat-icon">${s.icon}</span>
      <span class="rd-stat-value">${s.value}</span>
      <span class="rd-stat-label">${s.label}</span>
    </a>`).join('');
}
