function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function googleDriveImage(url, size = "w800") {
  if (!url) return "";

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

function hasValue(value) {
  return value && String(value).trim() !== "";
}

function buildLinks(member) {
  const links = [];

  // Prefer Cloudinary CV URL, fall back to Google Drive
  const cvLink = hasValue(member.cv_link_clord)
    ? String(member.cv_link_clord).trim()
    : hasValue(member.cv_link)
      ? String(member.cv_link).trim()
      : "";

  const mediaLink = hasValue(member.media_link) ? String(member.media_link).trim() : "";

  if (cvLink) {
    links.push(`
      <a class="community-link-btn" href="${escapeHtml(cvLink)}" target="_blank" rel="noopener">
        CV
      </a>
    `);
  }

  if (mediaLink) {
    links.push(`
      <a class="community-link-btn" href="${escapeHtml(mediaLink)}" target="_blank" rel="noopener">
        Media
      </a>
    `);
  }

  if (cvLink && mediaLink) {
    const qs = new URLSearchParams({
      cv: cvLink,
      media_link: mediaLink
    });

    links.push(`
      <a class="community-link-btn community-link-btn-featured" href="cv-viewer.html?${qs.toString()}" target="_blank" rel="noopener">
        CV & Media
      </a>
    `);
  }

  return links.join("");
}

function isDeceased(member) {
  return String(member.status || "active").trim().toLowerCase() === "deceased";
}

function resolvePhotoSrc(member) {
  // Prefer Cloudinary URL; fall back to Google Drive URL
  if (hasValue(member.photo_link_clord)) {
    return String(member.photo_link_clord).trim();
  }
  if (hasValue(member.photo_link)) {
    return googleDriveImage(member.photo_link, "w900");
  }
  return "";
}

export async function render() {
  return `
    <div class="community-header">
      <div class="community-eyebrow">ΑΠΟΦΟΙΤΟΙ 1976</div>

      <h1>Η <em>Κοινότητά</em> μας</h1>

      <p>
        Πρόσωπα, διαδρομές και αναμνήσεις από την κοινή πορεία
        των αποφοίτων της Σχολής Ηλεκτρολόγων Μηχανικών.
      </p>
    </div>

    <main class="community-main">
      <div id="communityGrid" class="community-grid">
        <div class="community-loading">Φόρτωση μελών...</div>
      </div>
    </main>
  `;
}

export async function afterRender() {
  const repo = window.menuRepository;
  const grid = document.getElementById("communityGrid");

  if (!grid) return;

  if (!repo) {
    console.error("menuRepository not found");
    grid.innerHTML = `
      <div class="community-empty">
        Αδυναμία φόρτωσης δεδομένων μελών.
      </div>
    `;
    return;
  }

  try {
    const dataset = await repo.fetchMembers();
    const members = dataset.items || [];

    const visibleMembers = members.filter(member => {
      const first = hasValue(member.first_name);
      const last = hasValue(member.last_name);
      const photo = hasValue(member.photo_link_clord) || hasValue(member.photo_link);

      return photo && (first || last);
    });

    if (!visibleMembers.length) {
      grid.innerHTML = `
        <div class="community-empty">
          Δεν βρέθηκαν μέλη για εμφάνιση.
        </div>
      `;
      return;
    }

    grid.innerHTML = visibleMembers.map(member => {
      const first = member.first_name || "";
      const last = member.last_name || "";
      const fullName = `${first} ${last}`.trim();
      const photoSrc = resolvePhotoSrc(member);
      const links = buildLinks(member);
      const deceased = isDeceased(member);
      const footerContent = deceased
        ? `<div class="community-memorial">✝ Στη μνήμη</div>`
        : links;

      return `
        <article class="community-card${deceased ? " community-card-deceased" : ""}">
          <h3 class="community-name">${escapeHtml(fullName)}</h3>

          <div class="community-photo-frame">
            ${photoSrc ? `
              <img
                src="${escapeHtml(photoSrc)}"
                alt="${escapeHtml(fullName)}"
                loading="lazy"
                onerror="this.closest('.community-photo-frame').classList.add('photo-missing'); this.remove();"
              >
            ` : `
              <div class="community-photo-placeholder">Χωρίς φωτογραφία</div>
            `}
          </div>

          ${footerContent ? `
            <div class="community-links${deceased ? " community-links-memorial" : ""}">
              ${footerContent}
            </div>
          ` : ""}
        </article>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
    grid.innerHTML = `
      <div class="community-empty">
        Αποτυχία φόρτωσης μελών.
      </div>
    `;
  }
}
