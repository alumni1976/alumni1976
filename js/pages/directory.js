function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function googleDriveImage(url, size = 'w160') {
  if (!url) return '';

  const cleanUrl = String(url).trim();

  const patterns = [
    /\/file\/d\/([^/]+)/,
    /\/d\/([^/]+)/,
    /[?&]id=([^&]+)/,
    /thumbnail\?id=([^&]+)/,
    /uc\?id=([^&]+)/
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=${size}`;
    }
  }

  return cleanUrl;
}

export async function render() {
  return `
    <section class="directory-page">
      <p class="section-tag">Ευρετήριο</p>
      <h2>Ευρετήριο Αποφοίτων</h2>

      <p>Επιλέξτε απόφοιτο από τη λίστα.</p>

      <div class="member-search-box">
        <input id="memberSearch" type="text" placeholder="Αναζήτηση με επώνυμο..." autocomplete="off">
        <div id="memberOptions" class="member-options"></div>
      </div>

      <div id="memberDetails" class="member-details"></div>
    </section>
  `;
}

export async function afterRender() {
  const repo = window.menuRepository;

  if (!repo) {
    console.error('menuRepository not found');
    return;
  }

  const dataset = await repo.fetchMembers();
  const members = dataset.items || [];

  const searchInput = document.getElementById('memberSearch');
  const optionsBox = document.getElementById('memberOptions');
  const detailsBox = document.getElementById('memberDetails');

  function fullName(member) {
    return `${member.last_name || ''} ${member.first_name || ''}`.trim();
  }

  function displayName(member) {
    return `${member.first_name || ''} ${member.last_name || ''}`.trim();
  }

  function renderOptions(filter = '') {
    const q = filter.toLowerCase();

    const filtered = members
      .filter(m => fullName(m).toLowerCase().includes(q))
      .sort((a, b) => fullName(a).localeCompare(fullName(b), 'el'));

    optionsBox.innerHTML = filtered.map(m => {
      const thumb = googleDriveImage(m.photo_link, 'w120');
      const name = fullName(m);

      return `
        <div class="member-option" data-id="${escapeHtml(m.id)}">
          <div class="member-option-thumb">
            ${
              thumb
                ? `<img src="${escapeHtml(thumb)}" alt="${escapeHtml(name)}">`
                : `<span class="member-option-icon">👤</span>`
            }
          </div>

          <span>${escapeHtml(name)}</span>
        </div>
      `;
    }).join('');
  }

  function renderDetails(member) {
    const photo = googleDriveImage(member.photo_link, 'w700');
    const avatar = `<div class="member-photo avatar-gold">👤</div>`;

    detailsBox.innerHTML = `
      <button id="backToSearch" class="btn-outline" type="button">
        ← Επιστροφή στη λίστα
      </button>

      <div class="member-card">
        ${
  photo
    ? `<img class="member-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(displayName(member))}">`
    : avatar
}

        <div>
          <h3>${escapeHtml(displayName(member))}</h3>

          <p><strong>Email:</strong> ${escapeHtml(member.email || '-')}</p>
          <p><strong>Τηλέφωνο:</strong> ${escapeHtml(member.phone || '-')}</p>
          <p><strong>Διεύθυνση:</strong> ${escapeHtml(member.address || '-')}</p>

          <div class="member-actions">
            ${member.cv_link ? `<a class="btn-primary" href="${escapeHtml(member.cv_link)}" target="_blank">CV</a>` : ''}
            ${member.media_link ? `<a class="btn-primary" href="${escapeHtml(member.media_link)}" target="_blank">Media</a>` : ''}
          </div>
        </div>
      </div>
    `;

    optionsBox.innerHTML = '';
    searchInput.value = fullName(member);

    document.getElementById('backToSearch').addEventListener('click', () => {
      detailsBox.innerHTML = '';
      searchInput.value = '';
      renderOptions();
      searchInput.focus();
    });
  }

  searchInput.addEventListener('input', () => {
    renderOptions(searchInput.value);
  });

  optionsBox.addEventListener('click', e => {
    const option = e.target.closest('.member-option');
    if (!option) return;

    const member = members.find(m => String(m.id) === option.dataset.id);
    if (!member) return;

    renderDetails(member);
  });

  renderOptions();
}