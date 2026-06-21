const SUPABASE_URL = "https://hpnrlshfxxcyujrxegka.supabase.co";

const SUPABASE_KEY =
  document.getElementById("supabase-db")?.dataset?.apikey;

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatGreekDate(dateValue) {
  if (!dateValue) return "";

  return new Date(dateValue).toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function googleDriveImage(url, size = "w1600") {
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

async function supabaseFetch(path) {
  if (!SUPABASE_KEY) {
    throw new Error("Δεν βρέθηκε Supabase API key.");
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw data || new Error(`Σφάλμα API: ${response.status}`);
  }

  return data || [];
}

export async function render() {
  return `
    <section class="events-page">
      <p class="section-tag">Εκδηλώσεις</p>
      <h2>Εκδηλώσεις Αποφοίτων</h2>
      <p class="events-intro">
        Συναντήσεις, επετειακές εκδηλώσεις και στιγμές που συνεχίζουν
        την κοινή μας πορεία πενήντα χρόνια μετά.
      </p>

      <div id="eventsList" class="events-list">
        <p>Φόρτωση εκδηλώσεων...</p>
      </div>
    </section>
  `;
}

export async function afterRender() {
  const eventsList = document.getElementById("eventsList");

  if (!eventsList) return;

  try {
    const events = await supabaseFetch(
      "/rest/v1/alumnievents?select=id,title,event_date,event_time,location,description,banner_image,featured,sort_order&active=eq.true&order=sort_order.asc,event_date.asc"
    );

    if (!events.length) {
      eventsList.innerHTML = `
        <article class="event-card">
          <h3>Δεν υπάρχουν προσεχείς εκδηλώσεις αυτή τη στιγμή.</h3>
          <p>
            Το Reunion 50 Ετών πραγματοποιήθηκε με μεγάλη επιτυχία στις
            20 Ιουνίου 2026. Δείτε το αναμνηστικό άρθρο στην
            <a href="#/home">αρχική σελίδα</a>.
          </p>
        </article>
      `;
      return;
    }

    eventsList.innerHTML = events.map(event => {
      const image = googleDriveImage(event.banner_image, "w1800");

      return `
        <article class="event-card ${event.featured ? "event-card-featured" : ""}">
          ${image ? `
            <div class="event-image-wrap">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(event.title)}">
            </div>
          ` : ""}

          <div class="event-content">
            <div class="event-date-box">
              <span>${escapeHtml(formatGreekDate(event.event_date))}</span>
              ${event.event_time ? `<small>${escapeHtml(event.event_time)}</small>` : ""}
            </div>

            <h3>${escapeHtml(event.title)}</h3>

            ${event.location ? `<p class="event-location">📍 ${escapeHtml(event.location)}</p>` : ""}

            <p class="event-description">${escapeHtml(event.description || "")}</p>

            <a class="btn-primary event-register-btn" href="#/eventregistration?id=${escapeHtml(event.id)}">
              Δήλωση Συμμετοχής
            </a>
          </div>
        </article>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
    eventsList.innerHTML = `
      <article class="event-card">
        <h3>Αποτυχία φόρτωσης εκδηλώσεων.</h3>
        <p>Παρακαλώ δοκιμάστε ξανά αργότερα.</p>
      </article>
    `;
  }
}
