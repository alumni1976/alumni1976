const SUPABASE_URL = "https://hpnrlshfxxcyujrxegka.supabase.co";

const SUPABASE_KEY =
  document.getElementById("supabase-db")?.dataset?.apikey;

const SEND_CONTACT_FUNCTION_URL =
  "https://hpnrlshfxxcyujrxegka.supabase.co/functions/v1/send-contact-notification";

let selectedMember = null;

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fullName(member) {
  return `${member.last_name || ""} ${member.first_name || ""}`.trim();
}

function displayName(member) {
  return `${member.first_name || ""} ${member.last_name || ""}`.trim();
}

function memberPhotoMarkup(member, className = "") {
  const photo = String(member.photo_link_clord || "").trim();
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

async function sendContactNotification({ member, subject, message }) {
  if (!member?.email) {
    return { ok: false, reason: "missing_member_email" };
  }

  try {
    const response = await fetch(SEND_CONTACT_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: displayName(member),
        email: member.email,
        subject,
        message
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.warn("Contact notification returned error:", {
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
    console.error("Contact notification failed:", err);

    return {
      ok: false,
      reason: "network_or_function_error",
      error: err
    };
  }
}

async function markEmailSent(contactId) {
  if (!contactId) return;

  await supabaseFetch(
    `/rest/v1/contactforms?id=eq.${encodeURIComponent(contactId)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        email_sent: true
      })
    }
  );
}

export async function render() {
  return `
    <section class="contact-page">
      <p class="section-tag">Επικοινωνία</p>
      <h2>Επικοινωνία</h2>

      <p>
        Για διορθώσεις στοιχείων, προτάσεις περιεχομένου ή τεχνικά θέματα
        σχετικά με την ιστοσελίδα, μπορείτε να στείλετε μήνυμα στον διαχειριστή.
      </p>

      <form id="contactForm" class="event-registration-form contact-form">
        <label>
          Απόφοιτος <span>*</span>
          <input
            id="contactMemberSearch"
            type="text"
            placeholder="Πληκτρολογήστε επώνυμο..."
            autocomplete="off"
          >
        </label>

        <div id="contactMemberOptions" class="event-member-options"></div>

        <div id="selectedContactMemberBox" class="selected-member-box hidden"></div>

        <label>
          Θέμα <span>*</span>
          <select id="contactSubject">
            <option value="">Επιλέξτε θέμα...</option>
            <option value="Γενική επικοινωνία">Γενική επικοινωνία</option>
            <option value="Διόρθωση στοιχείων">Διόρθωση στοιχείων</option>
            <option value="Πρόταση περιεχομένου">Πρόταση περιεχομένου</option>
            <option value="Τεχνικό πρόβλημα">Τεχνικό πρόβλημα</option>
            <option value="Άλλο">Άλλο</option>
          </select>
        </label>

        <label>
          Μήνυμα <span>*</span>
          <textarea
            id="contactMessage"
            placeholder="Γράψτε το μήνυμά σας..."
          ></textarea>
        </label>

        <button
          id="submitContactBtn"
          class="btn-primary event-register-btn"
          type="submit"
        >
          Αποστολή Μηνύματος
        </button>

        <p id="contactStatusMessage" class="registration-message"></p>
      </form>
    </section>
  `;
}

export async function afterRender() {
  const form = document.getElementById("contactForm");
  const memberSearch = document.getElementById("contactMemberSearch");
  const memberOptions = document.getElementById("contactMemberOptions");
  const selectedMemberBox = document.getElementById("selectedContactMemberBox");
  const subjectInput = document.getElementById("contactSubject");
  const messageInput = document.getElementById("contactMessage");
  const statusMessage = document.getElementById("contactStatusMessage");
  const submitButton = document.getElementById("submitContactBtn");

  let members = [];

  try {
    const dataset = await supabaseFetch(
      "/rest/v1/members?select=id,first_name,last_name,email,photo_link_clord,status&order=last_name.asc"
    );

    members = (dataset || []).filter(member => member.status !== "deceased");

  } catch (err) {
    console.error(err);
    statusMessage.textContent =
      "Αποτυχία φόρτωσης στοιχείων μελών.";
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
          ${memberPhotoMarkup(member, "event-member-thumb-img")}
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
          ${memberPhotoMarkup(selectedMember, "selected-member-photo")}
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
      statusMessage.textContent =
        "Παρακαλώ επιλέξτε απόφοιτο από τη λίστα.";
      return;
    }

    if (!selectedMember.email) {
      statusMessage.textContent =
        "Ο επιλεγμένος απόφοιτος δεν έχει email στο αρχείο μελών.";
      return;
    }

    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    if (!subject) {
      statusMessage.textContent = "Παρακαλώ επιλέξτε θέμα.";
      return;
    }

    if (!message) {
      statusMessage.textContent = "Παρακαλώ γράψτε μήνυμα.";
      return;
    }

    submitButton.disabled = true;
    statusMessage.textContent = "Αποθήκευση μηνύματος...";

    try {
      const inserted = await supabaseFetch("/rest/v1/contactforms", {
        method: "POST",
        headers: {
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          member_id: Number(selectedMember.id),
          subject,
          message,
          status: "new",
          email_sent: false
        })
      });

      const contactId = inserted?.[0]?.id;

      statusMessage.textContent =
        "Το μήνυμα καταχωρήθηκε. Αποστολή ειδοποίησης...";

      const emailResult = await sendContactNotification({
        member: selectedMember,
        subject,
        message
      });

      if (emailResult.ok) {
        await markEmailSent(contactId);
      }

      form.reset();
      selectedMember = null;
      selectedMemberBox.classList.add("hidden");
      selectedMemberBox.innerHTML = "";

      if (emailResult.ok) {
        statusMessage.innerHTML =
          "✓ Το μήνυμά σας καταχωρήθηκε με επιτυχία.<br>Ο διαχειριστής έχει ενημερωθεί.<br>Σας ευχαριστούμε.";
      } else {
        statusMessage.innerHTML =
          "✓ Το μήνυμά σας καταχωρήθηκε με επιτυχία.<br>Δεν στάλθηκε email ειδοποίησης. Θα γίνει έλεγχος από τον διαχειριστή.<br>Σας ευχαριστούμε.";
      }

    } catch (err) {
      console.error(err);
      statusMessage.textContent =
        err?.message || "Αποτυχία αποθήκευσης μηνύματος.";

    } finally {
      submitButton.disabled = false;
    }
  });
}