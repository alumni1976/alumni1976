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

  console.log('MEMBERS:', members);

  const searchInput =
    document.getElementById('memberSearch');

  const optionsBox =
    document.getElementById('memberOptions');

  const detailsBox =
    document.getElementById('memberDetails');

  function renderOptions(filter = '') {

    const q = filter.toLowerCase();

    const filtered = members.filter(m =>
      `${m.last_name || ''} ${m.first_name || ''}`
        .toLowerCase()
        .includes(q)
    );

    optionsBox.innerHTML =
      filtered.map(m => `

        <div class="member-option" data-id="${m.id}">

          <img
            src="${m.photo_link || ''}"
            onerror="this.style.display='none'"
          >

          <span>
            ${m.last_name || ''} ${m.first_name || ''}
          </span>

        </div>

      `).join('');
  }

  function renderDetails(member) {

    detailsBox.innerHTML = `

      <div class="member-card">

        <img
          class="member-photo"
          src="${member.photo_link || ''}"
          onerror="this.style.display='none'"
        >

        <div>

          <h3>
            ${member.first_name || ''}
            ${member.last_name || ''}
          </h3>

          <p>
            <strong>Email:</strong>
            ${member.email || '-'}
          </p>

          <p>
            <strong>Τηλέφωνο:</strong>
            ${member.phone || '-'}
          </p>

          <p>
            <strong>Διεύθυνση:</strong>
            ${member.address || '-'}
          </p>

          <div class="member-actions">

            ${member.cv_link
              ? `<a class="btn-primary" href="${member.cv_link}" target="_blank">CV</a>`
              : ''
            }

            ${member.media_link
              ? `<a class="btn-outline" href="${member.media_link}" target="_blank">Media</a>`
              : ''
            }

          </div>

        </div>

      </div>

    `;
  }

  searchInput.addEventListener('input', () => {
    renderOptions(searchInput.value);
  });

  optionsBox.addEventListener('click', e => {

    const option =
      e.target.closest('.member-option');

    if (!option) return;

    const member =
      members.find(m =>
        String(m.id) === option.dataset.id
      );

    if (!member) return;

    searchInput.value =
      `${member.last_name || ''} ${member.first_name || ''}`;

    optionsBox.innerHTML = '';

    renderDetails(member);

  });

  renderOptions();
}