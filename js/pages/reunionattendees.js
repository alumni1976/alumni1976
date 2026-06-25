const DATA_URL = './assets/data/attendees.json';

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function initials(first, last) {
  return [(first||'')[0],(last||'')[0]].filter(Boolean).map(c=>c.toUpperCase()).join('');
}

export async function render() {
  return `
    <div class="profs-header photos-header">
      <div class="profs-eyebrow">REUNION 2026</div>
      <h1>Συμμετέχοντες <em>Reunion</em></h1>
      <p>Οι συνάδελφοι που τίμησαν με την παρουσία τους τη συνάντηση της 20ης Ιουνίου 2026.</p>
    </div>
    <main class="photos-main">
      <section class="photos-section">

        <div class="photos-section-head">
          <div>
            <p class="section-tag">ΠΑΡΟΝΤΕΣ</p>
            <h2>Ήταν εκεί</h2>
          </div>
          <div class="photos-count" id="raCount"></div>
        </div>

        <div id="raMessage" class="photos-message">Φόρτωση λίστας...</div>

        <div id="raGrid" class="ra-grid hidden"></div>

        <div id="raAbsent" class="ra-absent-section hidden">
          <h3 class="ra-absent-title">Επίσης μέλη της γενιάς μας</h3>
          <p class="ra-absent-subtitle">Δεν παρευρέθηκαν αλλά είναι στην καρδιά μας</p>
          <div id="raAbsentList" class="ra-absent-list"></div>
        </div>

      </section>
    </main>
  `;
}

export async function afterRender() {
  const message    = document.getElementById('raMessage');
  const countEl    = document.getElementById('raCount');
  const grid       = document.getElementById('raGrid');
  const absentSec  = document.getElementById('raAbsent');
  const absentList = document.getElementById('raAbsentList');

  try {
    const res  = await fetch(DATA_URL);
    const all  = await res.json();

    const attended = all.filter(g => g.attended === true);
    const absent   = all.filter(g => g.attended !== true && (g.first_name || g.last_name));

    if (!attended.length) {
      message.textContent = 'Δεν υπάρχουν ακόμη καταχωρήσεις.';
      return;
    }

    message.textContent = '';
    grid.classList.remove('hidden');
    if (countEl) countEl.textContent = `${attended.length} παρόντες από ${all.length} μέλη`;

    // Attendees grid with photo or initials
    grid.innerHTML = attended.map((a, i) => {
      const name  = `${a.first_name||''} ${a.last_name||''}`.trim();
      const photo = a.photo_link_cloud || '';
      const avatarHtml = photo
        ? `<img src="${escHtml(photo)}" alt="${escHtml(name)}" class="ra-avatar-img" loading="lazy">`
        : `<div class="ra-avatar-placeholder">${initials(a.first_name, a.last_name)}</div>`;

      return `
        <article class="ra-card" style="animation-delay:${i*0.04}s">
          <div class="ra-avatar">${avatarHtml}</div>
          <div class="ra-name">${escHtml(name)}</div>
        </article>`;
    }).join('');

    // Absent members — compact list
    if (absent.length) {
      absentSec.classList.remove('hidden');
      absentList.innerHTML = absent.map(a => {
        const name = `${a.first_name||''} ${a.last_name||''}`.trim();
        return `<span class="ra-absent-name">${escHtml(name)}</span>`;
      }).join('');
    }

  } catch(err) {
    console.error(err);
    message.textContent = 'Αποτυχία φόρτωσης λίστας.';
  }
}
