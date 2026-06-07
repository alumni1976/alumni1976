const SUPABASE_URL = "https://hpnrlshfxxcyujrxegka.supabase.co";

const SUPABASE_KEY =
  document.getElementById("supabase-db")?.dataset?.apikey;

const SEND_MAIL_FUNCTION_URL =
  "https://hpnrlshfxxcyujrxegka.supabase.co/functions/v1/send-event-confirmation";

let selectedMember = null;
let currentEvent = null;

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getEventId() {
  const hash = location.hash || "";
  const query = hash.includes("?") ? hash.split("?")[1] : "";
  const params = new URLSearchParams(query);
  return params.get("id") || "1";
}

function fullName(member) {
  return `${member.last_name || ""} ${member.first_name || ""}`.trim();
}

function displayName(member) {
  return `${member.first_name || ""} ${member.last_name || ""}`.trim();
}

function formatGreekDate(dateValue) {
  if (!dateValue) return "-";

  const months = [
    "Ιανουαρίου",
    "Φεβρουαρίου",
    "Μαρτίου",
    "Απριλίου",
    "Μαΐου",
    "Ιουνίου",
    "Ιουλίου",
    "Αυγούστου",
    "Σεπτεμβρίου",
    "Οκτωβρίου",
    "Νοεμβρίου",
    "Δεκεμβρίου"
  ];

  const value = String(dateValue).trim();
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const year = match[1];
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);

    if (months[monthIndex]) {
      return `${day} ${months[monthIndex]} ${year}`;
    }
  }

  return value;
}

function googleDriveImage(url, size = "w160") {
  if (!url) return "";

  const value = String(url).trim();

  if (!value) return "";

  if (value.includes("drive.google.com")) {
    const match =
      value.match(/\/d\/([^/]+)/) ||
      value.match(/[?&]id=([^&]+)/);

    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${encodeURIComponent(match[1])}&sz=${size}`;
    }
  }

  return value;
}

function memberPhotoMarkup(member, size = "w160", className = "") {
  const photo = googleDriveImage(member.photo_link, size);
  const name = displayName(member) || fullName(member);

  if (photo) {
    return `
      <img
        class="${escapeHtml(className)}"
        src="${escapeHtml(photo)}"
        alt="${escapeHtml(name)}"
      >
    `;
  }

  return `<div class="${escapeHtml(className)} event-member-avatar">👤</div>`;
}

/*
  REST calls to Supabase database.

  Kept in the same style as ThinkTank:
  - apikey
  - Authorization
  - Content-Type

  Do not use this function for Edge Function email sending.
*/
async function supabaseFetch(path, options = {}) {
  if (!SUPABASE_KEY) {
    throw new Error("Δεν βρέθηκε Supabase API key.");
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (options.headers?.Prefer === "return=minimal") {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw error;
    }

    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw data || new Error(`Σφάλμα API: ${response.status}`);
  }

  return data;
}

function buildConfirmationEmail({ member, event, registration }) {
  const memberName = displayName(member);

  const guestsCount = Number(registration.guests_count || 0);

  const guestsText =
    guestsCount === 1
      ? "1 συνοδός"
      : `${guestsCount} συνοδοί`;

  const mealText = registration.meal_participation ? "Ναι" : "Όχι";

  const title = `Επιβεβαίωση δήλωσης συμμετοχής - ${event.title}`;

  const message = `Αγαπητέ/ή ${memberName},

Η δήλωση συμμετοχής σας καταχωρήθηκε με επιτυχία.

Εκδήλωση: ${event.title}
Ημερομηνία: ${formatGreekDate(event.event_date)}
Ώρα: ${event.event_time || "-"}
Τοποθεσία: ${event.location || "-"}
Αριθμός συνοδών: ${guestsText}
Συμμετοχή στο γεύμα: ${mealText}

Σας ευχαριστούμε.
Alumni 1976`;

  return { title, message };
}

/*
  Event email confirmation.

  IMPORTANT:
  send-event-confirmation must have Verify JWT OFF in Supabase.

  Do NOT send:
  Authorization: Bearer SUPABASE_KEY

  because SUPABASE_KEY is sb_publishable_..., not a JWT.
*/
async function sendEventConfirmationEmail({ member, event, registration }) {
  if (!member?.email) {
    return { ok: false, reason: "missing_member_email" };
  }

  const email = buildConfirmationEmail({
    member,
    event,
    registration
  });

  try {
    const response = await fetch(SEND_MAIL_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: displayName(member),
        email: member.email,
        title: email.title,
        message: email.message
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.warn("Event confirmation email returned error:", {
        status: response.status,
        result
      });

      return {
        ok: false,
        reason: "function_error",
        status: response.status,
        error: result
      };
    }

    return { ok: true, result };

  } catch (err) {
    console.error("Event confirmation email failed:", err);

    return {
      ok: false,
      reason: "network_or_function_error",
      error: err
    };
  }
}

async function markConfirmationSent(registrationId) {
  if (!registrationId) return;

  await supabaseFetch(
    `/rest/v1/eventforms?id=eq.${encodeURIComponent(registrationId)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        confirmation_sent: true
      })
    }
  );
}

export async function render() {
  return `
    <section class="event-registration-page">
      <p class="section-tag">Δήλωση Συμμετοχής</p>
      <h2>Δήλωση Συμμετοχής</h2>

      <div id="registrationEventSummary" class="registration-event-summary">
        <p>Φόρτωση εκδήλωσης...</p>
      </div>

      <form id="eventRegistrationForm" class="event-registration-form">
        <label>
          Απόφοιτος <span>*</span>
          <input
            id="eventMemberSearch"
            type="text"
            placeholder="Πληκτρολογήστε επώνυμο..."
            autocomplete="off"
          >
        </label>

        <div id="eventMemberOptions" class="event-member-options"></div>

        <div id="selectedMemberBox" class="selected-member-box hidden"></div>

        <label>
          Αριθμός συνοδών
          <select id="guestsCount">
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </label>

        <label>
          Συμμετοχή στο γεύμα
          <select id="mealParticipation">
            <option value="true">Ναι</option>
            <option value="false">Όχι</option>
          </select>
        </label>

        <label>
          Σχόλια
          <textarea id="eventComments" placeholder="Προαιρετικά σχόλια..."></textarea>
        </label>

        <button
          id="submitEventRegistration"
          class="btn-primary event-register-btn"
          type="submit"
        >
          Υποβολή Δήλωσης
        </button>

        <p id="registrationMessage" class="registration-message"></p>
      </form>
    </section>
  `;
}

export async function afterRender() {
  const eventId = getEventId();

  const eventSummary = document.getElementById("registrationEventSummary");
  const form = document.getElementById("eventRegistrationForm");
  const memberSearch = document.getElementById("eventMemberSearch");
  const memberOptions = document.getElementById("eventMemberOptions");
  const selectedMemberBox = document.getElementById("selectedMemberBox");
  const registrationMessage = document.getElementById("registrationMessage");
  const submitButton = document.getElementById("submitEventRegistration");

  let members = [];

  try {
    const events = await supabaseFetch(
      `/rest/v1/alumnievents?select=id,title,event_date,event_time,location,description&id=eq.${encodeURIComponent(eventId)}&limit=1`
    );

    if (!events || !events.length) {
      eventSummary.innerHTML = `<p>Η εκδήλωση δεν βρέθηκε.</p>`;
      form.classList.add("hidden");
      return;
    }

    currentEvent = events[0];

    eventSummary.innerHTML = `
      <article class="registration-summary-card">
        <h3>${escapeHtml(currentEvent.title)}</h3>
        <p><strong>Ημερομηνία:</strong> ${escapeHtml(formatGreekDate(currentEvent.event_date))}</p>
        <p><strong>Ώρα:</strong> ${escapeHtml(currentEvent.event_time || "-")}</p>
        <p><strong>Τοποθεσία:</strong> ${escapeHtml(currentEvent.location || "-")}</p>
      </article>
    `;

    const dataset = await supabaseFetch(
      "/rest/v1/members?select=id,first_name,last_name,email,photo_link,status&order=last_name.asc"
    );

    members = (dataset || []).filter(member => String(member.status || "active").toLowerCase() !== "deceased");

  } catch (err) {
    console.error(err);
    eventSummary.innerHTML = `<p>Αποτυχία φόρτωσης στοιχείων.</p>`;
    form.classList.add("hidden");
    return;
  }

  function renderMemberOptions(filter = "") {
    const q = filter.trim().toLowerCase();

    if (!q) {
      memberOptions.innerHTML = "";
      return;
    }

    const filtered = members
      .filter(member => fullName(member).toLowerCase().includes(q))
      .slice(0, 12);

    if (!filtered.length) {
      memberOptions.innerHTML =
        `<div class="event-member-option muted">Δεν βρέθηκε μέλος.</div>`;
      return;
    }

    memberOptions.innerHTML = filtered.map(member => `
      <button
        class="event-member-option"
        type="button"
        data-id="${escapeHtml(member.id)}"
      >
        <span class="event-member-option-thumb">
          ${memberPhotoMarkup(member, "w120", "event-member-thumb-img")}
        </span>
        <span class="event-member-option-name">
          ${escapeHtml(fullName(member))}
        </span>
      </button>
    `).join("");
  }

  memberSearch.addEventListener("input", () => {
    selectedMember = null;
    selectedMemberBox.classList.add("hidden");
    selectedMemberBox.innerHTML = "";
    renderMemberOptions(memberSearch.value);
  });

  memberOptions.addEventListener("click", event => {
    const button = event.target.closest(".event-member-option");

    if (!button || !button.dataset.id) return;

    selectedMember = members.find(
      member => String(member.id) === button.dataset.id
    );

    if (!selectedMember) return;

    memberSearch.value = fullName(selectedMember);
    memberOptions.innerHTML = "";

    selectedMemberBox.classList.remove("hidden");
    selectedMemberBox.innerHTML = `
      <div class="selected-member-card">
        <div class="selected-member-photo-wrap">
          ${memberPhotoMarkup(selectedMember, "w420", "selected-member-photo")}
        </div>

        <div class="selected-member-info">
          <strong>Επιλεγμένος απόφοιτος</strong>
          <h3>${escapeHtml(displayName(selectedMember))}</h3>
          ${selectedMember.email ? `<span>${escapeHtml(selectedMember.email)}</span>` : ""}
        </div>
      </div>
    `;
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!selectedMember) {
      registrationMessage.textContent =
        "Παρακαλώ επιλέξτε απόφοιτο από τη λίστα.";
      return;
    }

    if (!selectedMember.email) {
      registrationMessage.textContent =
        "Ο επιλεγμένος απόφοιτος δεν έχει email στο αρχείο μελών.";
      return;
    }

    submitButton.disabled = true;
    registrationMessage.textContent = "Αποθήκευση δήλωσης...";

    const payload = {
      event_id: Number(currentEvent.id),
      member_id: Number(selectedMember.id),
      guests_count: Number(document.getElementById("guestsCount").value || 0),
      meal_participation:
        document.getElementById("mealParticipation").value === "true",
      comments: document.getElementById("eventComments").value.trim(),
      attendance_status: "registered",
      confirmation_sent: false
    };

    try {
      const inserted = await supabaseFetch("/rest/v1/eventforms", {
        method: "POST",
        headers: {
          Prefer: "return=representation"
        },
        body: JSON.stringify(payload)
      });

      const registrationId = inserted?.[0]?.id;

      registrationMessage.textContent =
        "Η δήλωση καταχωρήθηκε. Αποστολή email επιβεβαίωσης...";

      const emailResult = await sendEventConfirmationEmail({
        member: selectedMember,
        event: currentEvent,
        registration: payload
      });

      if (emailResult.ok) {
        await markConfirmationSent(registrationId);
      }

      form.reset();
      selectedMember = null;
      selectedMemberBox.classList.add("hidden");
      selectedMemberBox.innerHTML = "";

      if (emailResult.ok) {
        registrationMessage.innerHTML =
          "✓ Η δήλωση συμμετοχής σας καταχωρήθηκε με επιτυχία.<br>Έχει σταλεί email επιβεβαίωσης στη διεύθυνση που έχετε δηλώσει.<br>Σας ευχαριστούμε.";
      } else {
        registrationMessage.innerHTML =
          "✓ Η δήλωση συμμετοχής σας καταχωρήθηκε με επιτυχία.<br>Δεν στάλθηκε email επιβεβαίωσης. Θα γίνει έλεγχος από τον διαχειριστή.<br>Σας ευχαριστούμε.";
      }

    } catch (err) {
      console.error(err);

      const errorText = String(
        err?.message ||
        err?.details ||
        err?.hint ||
        err?.error ||
        ""
      ).toLowerCase();

      if (errorText.includes("duplicate")) {
        registrationMessage.textContent =
          "Υπάρχει ήδη δήλωση συμμετοχής για τον συγκεκριμένο απόφοιτο.";
        submitButton.disabled = false;
        return;
      }

      registrationMessage.textContent =
        "Αποτυχία αποθήκευσης δήλωσης.";

    } finally {
      submitButton.disabled = false;
    }
  });
}