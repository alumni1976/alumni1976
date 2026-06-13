const SUPABASE_URL = "https://hpnrlshfxxcyujrxegka.supabase.co";

const SUPABASE_KEY =
  document.getElementById("supabase-db")?.dataset?.apikey;

const SEND_MAIL_FUNCTION_URL =
  "https://hpnrlshfxxcyujrxegka.supabase.co/functions/v1/send-mail-gmail";

const POSTS_PAGE_SIZE = 10;

let currentMember = null;
let currentOffset = 0;
let allPostsLoaded = false;
let currentCategoryFilter = "all";
let currentOwnOnly = false;

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function properCase(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/(^|\s)\S/g, c => c.toUpperCase());
}

function memberName(member) {
  if (!member) return "Μέλος";

  const first = properCase(member.first_name || "");
  const last = properCase(member.last_name || "");

  return `${first} ${last}`.trim() || "Μέλος";
}

function memberInitials(member) {
  if (!member) return "Μ";

  const first = member.first_name?.trim()?.[0] || "";
  const last = member.last_name?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || "Μ";
}

function memberAvatar(member, avatarClass = "thinktank-avatar-48") {
  const photo = String(member?.photo_link_clord || "").trim();
  const initials = memberInitials(member);
  const safeAvatarClass = escapeHtml(avatarClass);

  if (photo) {
    return `
      <img
        class="post-avatar-image ${safeAvatarClass}"
        src="${escapeHtml(photo)}"
        alt="${escapeHtml(memberName(member))}"
        onerror="this.outerHTML='<div class=&quot;post-avatar ${safeAvatarClass}&quot;>${escapeHtml(initials)}</div>'"
      >
    `;
  }

  return `<div class="post-avatar ${safeAvatarClass}">${escapeHtml(initials)}</div>`;
}

function formatDate(dateValue) {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleDateString("el-GR");
}

async function supabaseFetch(path, options = {}) {
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
    throw data;
  }

  return data;
}

async function sendThinkTankEmail({ type, title = "", message = "" }) {
  if (!currentMember?.email) {
    console.warn("ThinkTank email skipped: missing member email.");
    return { ok: false, reason: "missing_member_email" };
  }

  try {
    const response = await fetch(SEND_MAIL_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type,
        name: currentMember.member_name || memberName(currentMember),
        email: currentMember.email,
        title,
        message
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.warn("ThinkTank email returned error:", error);
      return { ok: false, reason: "function_error", error };
    }

    return { ok: true };
  } catch (err) {
    console.error("ThinkTank email failed:", err);
    return { ok: false, reason: "network_or_function_error", error: err };
  }
}

export async function render() {
  return `
    <div class="profs-header">
      <div class="profs-eyebrow">MEMBERS ONLY</div>

      <h1>Δεξαμενή <em>Σκέψεων</em></h1>

      <p>
        Η σελίδα αυτή είναι διαθέσιμη μόνο σε εξουσιοδοτημένα μέλη
        των αποφοίτων του 1976.
      </p>
    </div>

    <main class="thinktank-main">

      <section class="thinktank-login" id="thinktankLoginBox">
        <article class="thinktank-card">
          <div class="section-tag">ΠΡΟΣΒΑΣΗ ΜΕΛΟΥΣ</div>

          <h2>Είσοδος στη Δεξαμενή Σκέψεων</h2>

          <p>
            Πληκτρολογήστε τον προσωπικό κωδικό που σας έχει δοθεί
            από τον διαχειριστή.
          </p>

          <input
            id="thinktankPassword"
            type="password"
            class="thinktank-input"
            placeholder="Κωδικός πρόσβασης"
          >

          <button id="thinktankLoginBtn" class="btn-primary thinktank-button">
            Είσοδος
          </button>

          <p id="thinktankLoginMessage" class="thinktank-message"></p>
        </article>
      </section>

      <section class="thinktank-private hidden" id="thinktankPrivateArea">

        <article class="thinktank-card">
          <div class="section-tag">ΚΑΛΩΣ ΗΡΘΑΤΕ</div>

          <h2 id="thinktankWelcome">Δεξαμενή Σκέψεων</h2>

          <p>
            Μπορείτε να γράψετε νέα ανάρτηση, να κάνετε σχόλια
            και να δηλώσετε ότι σας αρέσει μια δημοσίευση.
          </p>

          <button id="thinktankLogoutBtn" class="btn-outline">
            Αποσύνδεση
          </button>
        </article>

        <article class="thinktank-card">
          <div class="section-tag">ΝΕΑ ΑΝΑΡΤΗΣΗ</div>

          <h2>Υποβολή σκέψης</h2>

          <select id="postCategory" class="thinktank-input">
            <option value="thought">Σκέψη</option>
            <option value="memory">Ανάμνηση</option>
            <option value="news">Νέα μέλους</option>
            <option value="career">Πανεπιστήμιο & επάγγελμα</option>
          </select>

          <textarea
            id="postBody"
            class="thinktank-textarea"
            placeholder="Γράψτε το κείμενό σας..."
          ></textarea>

          <button id="submitPostBtn" class="btn-primary thinktank-button">
            Υποβολή για έγκριση
          </button>

          <p id="postMessage" class="thinktank-message"></p>
        </article>

        <article class="thinktank-card">
          <div class="section-tag">ΑΝΑΡΤΗΣΕΙΣ</div>
          <h2>Εγκεκριμένες αναρτήσεις</h2>

          <div class="thinktank-filters" style="display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin-bottom:16px;">
            <select id="categoryFilter" class="thinktank-input" style="width:auto;">
              <option value="all">Όλες οι κατηγορίες</option>
              <option value="thought">Σκέψη</option>
              <option value="memory">Ανάμνηση</option>
              <option value="news">Νέα μέλους</option>
              <option value="career">Πανεπιστήμιο &amp; επάγγελμα</option>
            </select>

            <label style="display:flex; align-items:center; gap:6px;">
              <input type="checkbox" id="ownOnlyFilter">
              Μόνο οι δικές μου αναρτήσεις
            </label>
          </div>

          <div id="postsList">
            <p>Φόρτωση αναρτήσεων...</p>
          </div>

          <div id="loadMoreWrap" style="margin-top:24px; display:none;">
            <button id="loadMorePostsBtn" class="btn-outline">
              Φόρτωση παλαιότερων αναρτήσεων
            </button>
          </div>
        </article>

      </section>

    </main>
  `;
}

export async function afterRender() {
  const savedMember = sessionStorage.getItem("thinktankMember");

  if (savedMember) {
    currentMember = JSON.parse(savedMember);
    openPrivateArea();
    await resetAndLoadPosts();
  }

  const loginBtn = document.getElementById("thinktankLoginBtn");
  const passwordInput = document.getElementById("thinktankPassword");
  const loginMessage = document.getElementById("thinktankLoginMessage");

  loginBtn?.addEventListener("click", async () => {
    const password = passwordInput.value.trim();

    if (!password) {
      loginMessage.textContent = "Παρακαλώ πληκτρολογήστε κωδικό.";
      return;
    }

    if (!SUPABASE_KEY) {
      loginMessage.textContent = "Δεν βρέθηκε Supabase API key.";
      return;
    }

    loginMessage.textContent = "Έλεγχος κωδικού...";

    try {
      const data = await supabaseFetch(
        "/rest/v1/rpc/verify_thinktank_password",
        {
          method: "POST",
          body: JSON.stringify({ input_pass: password })
        }
      );

      if (!data || data.length === 0) {
        loginMessage.textContent = "Λάθος κωδικός ή μη ενεργό μέλος.";
        return;
      }

      currentMember = data[0];

      sessionStorage.setItem(
        "thinktankMember",
        JSON.stringify(currentMember)
      );

      openPrivateArea();
      await resetAndLoadPosts();

    } catch (err) {
      console.error(err);
      loginMessage.textContent =
        err?.message || "Σφάλμα σύνδεσης με τη βάση.";
    }
  });

  document.getElementById("submitPostBtn")?.addEventListener("click", async () => {
    const postMessage = document.getElementById("postMessage");
    const category = document.getElementById("postCategory").value;
    const body = document.getElementById("postBody").value.trim();

    if (!currentMember) {
      postMessage.textContent = "Πρέπει πρώτα να γίνει είσοδος.";
      return;
    }

    if (!body) {
      postMessage.textContent = "Η ανάρτηση δεν μπορεί να είναι κενή.";
      return;
    }

    postMessage.textContent = "Αποθήκευση...";

    try {
      await supabaseFetch("/rest/v1/posts", {
        method: "POST",
        headers: {
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          member_id: currentMember.member_id,
          category,
          body,
          is_approved: false
        })
      });

      const emailResult = await sendThinkTankEmail({
        type: "thought",
        title: category,
        message: body
      });

      document.getElementById("postBody").value = "";

      if (emailResult.ok) {
        postMessage.textContent =
          "Η ανάρτηση υποβλήθηκε και αναμένει έγκριση. Στάλθηκε email επιβεβαίωσης.";
      } else {
        postMessage.textContent =
          "Η ανάρτηση υποβλήθηκε και αναμένει έγκριση. Δεν στάλθηκε email επιβεβαίωσης.";
      }

      await resetAndLoadPosts();

    } catch (err) {
      console.error(err);
      postMessage.textContent =
        err?.message || "Αποτυχία αποθήκευσης.";
    }
  });

  document.getElementById("loadMorePostsBtn")?.addEventListener("click", async () => {
    await loadApprovedPosts(false);
  });

  document.getElementById("categoryFilter")?.addEventListener("change", async (e) => {
    currentCategoryFilter = e.target.value;
    await resetAndLoadPosts();
  });

  document.getElementById("ownOnlyFilter")?.addEventListener("change", async (e) => {
    currentOwnOnly = e.target.checked;
    await resetAndLoadPosts();
  });

  document.getElementById("thinktankLogoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem("thinktankMember");
    currentMember = null;
    currentOffset = 0;
    allPostsLoaded = false;
    currentCategoryFilter = "all";
    currentOwnOnly = false;

    document.getElementById("thinktankPrivateArea")?.classList.add("hidden");
    document.getElementById("thinktankLoginBox")?.classList.remove("hidden");

    const passwordInput = document.getElementById("thinktankPassword");
    const loginMessage = document.getElementById("thinktankLoginMessage");
    if (passwordInput) passwordInput.value = "";
    if (loginMessage) loginMessage.textContent = "";
  });
}

function openPrivateArea() {
  document.getElementById("thinktankLoginBox")?.classList.add("hidden");
  document.getElementById("thinktankPrivateArea")?.classList.remove("hidden");

  const welcome = document.getElementById("thinktankWelcome");
  if (welcome && currentMember) {
    welcome.textContent = `Καλώς ήρθες, ${currentMember.member_name}`;
  }
}

async function resetAndLoadPosts() {
  currentOffset = 0;
  allPostsLoaded = false;

  const postsList = document.getElementById("postsList");
  if (postsList) {
    postsList.innerHTML = "";
  }

  await loadApprovedPosts(true);
}

async function loadApprovedPosts(isFirstLoad = false) {
  const postsList = document.getElementById("postsList");
  const loadMoreWrap = document.getElementById("loadMoreWrap");

  if (!postsList || allPostsLoaded) return;

  if (isFirstLoad) {
    postsList.innerHTML = `<p>Φόρτωση αναρτήσεων...</p>`;
  }

  try {
    let postsUrl =
      `/rest/v1/posts?select=id,member_id,category,body,created_at,members(first_name,last_name,photo_link_clord)&is_approved=eq.true&order=created_at.desc&offset=${currentOffset}&limit=${POSTS_PAGE_SIZE}`;

    if (currentCategoryFilter !== "all") {
      postsUrl += `&category=eq.${encodeURIComponent(currentCategoryFilter)}`;
    }

    if (currentOwnOnly && currentMember) {
      postsUrl += `&member_id=eq.${currentMember.member_id}`;
    }

    const posts = await supabaseFetch(postsUrl);

    if (!posts || posts.length === 0) {
      if (currentOffset === 0) {
        postsList.innerHTML = `<p>Δεν υπάρχουν ακόμη εγκεκριμένες αναρτήσεις.</p>`;
      }

      allPostsLoaded = true;
      if (loadMoreWrap) loadMoreWrap.style.display = "none";
      return;
    }

    if (isFirstLoad) {
      postsList.innerHTML = "";
    }

    const postIds = posts.map(post => post.id);

    const likes = await supabaseFetch(
      `/rest/v1/post_likes?select=id,post_id,member_id&post_id=in.(${postIds.join(",")})`
    );

    const comments = await supabaseFetch(
      `/rest/v1/post_comments?select=id,post_id,member_id,comment_text,created_at,members(first_name,last_name,photo_link_clord)&is_approved=eq.true&post_id=in.(${postIds.join(",")})&order=created_at.asc`
    );

    postsList.insertAdjacentHTML(
      "beforeend",
      posts.map(post => {
        const postLikes = likes.filter(like => like.post_id === post.id);
        const postComments = comments.filter(comment => comment.post_id === post.id);

        return `
          <article class="thinktank-post" data-post-id="${post.id}">
            <div class="post-header thinktank-post-header">
              ${memberAvatar(post.members, "thinktank-avatar-48")}

              <div>
                <h3>${escapeHtml(memberName(post.members))}</h3>
                <span>${formatDate(post.created_at)} · ${escapeHtml(post.category || "thought")}</span>
              </div>
            </div>

            <p>${escapeHtml(post.body)}</p>

            <div class="post-actions">
              <button class="thinktank-action like-btn" data-post-id="${post.id}">
                ❤️ Μου αρέσει (${postLikes.length})
              </button>

              <span>💬 Σχόλια (${postComments.length})</span>
            </div>

            <div class="thinktank-comments">
              ${postComments.map(comment => `
                <div class="thinktank-comment">
                  <div class="post-header comment-header thinktank-comment-header">
                    ${memberAvatar(comment.members, "thinktank-avatar-34")}

                    <div>
                      <strong>${escapeHtml(memberName(comment.members))}</strong>
                      <span>${formatDate(comment.created_at)}</span>
                    </div>
                  </div>

                  <p>${escapeHtml(comment.comment_text)}</p>
                </div>
              `).join("")}
            </div>

            <div class="thinktank-comment-form">
              <input
                class="thinktank-input comment-input"
                data-post-id="${post.id}"
                placeholder="Γράψτε σχόλιο..."
              >

              <button class="btn-outline comment-btn" data-post-id="${post.id}">
                Υποβολή σχολίου
              </button>
            </div>
          </article>
        `;
      }).join("")
    );

    currentOffset += posts.length;

    if (posts.length < POSTS_PAGE_SIZE) {
      allPostsLoaded = true;
      if (loadMoreWrap) loadMoreWrap.style.display = "none";
    } else {
      if (loadMoreWrap) loadMoreWrap.style.display = "block";
    }

    attachPostEvents();

  } catch (err) {
    console.error(err);
    postsList.innerHTML = `<p>Αποτυχία φόρτωσης αναρτήσεων.</p>`;
  }
}

function attachPostEvents() {
  document.querySelectorAll(".like-btn").forEach(button => {
    if (button.dataset.bound === "true") return;

    button.dataset.bound = "true";

    button.addEventListener("click", async () => {
      const postId = Number(button.dataset.postId);
      await likePost(postId);
    });
  });

  document.querySelectorAll(".comment-btn").forEach(button => {
    if (button.dataset.bound === "true") return;

    button.dataset.bound = "true";

    button.addEventListener("click", async () => {
      const postId = Number(button.dataset.postId);
      const input = document.querySelector(
        `.comment-input[data-post-id="${postId}"]`
      );

      const text = input.value.trim();
      if (!text) return;

      await addComment(postId, text);
      input.value = "";
    });
  });
}

async function likePost(postId) {
  if (!currentMember) return;

  try {
    await supabaseFetch("/rest/v1/post_likes", {
      method: "POST",
      headers: {
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        post_id: postId,
        member_id: currentMember.member_id
      })
    });

    await resetAndLoadPosts();

  } catch (err) {
    console.error(err);
    alert("Έχετε ήδη δηλώσει ότι σας αρέσει αυτή η ανάρτηση.");
  }
}

async function addComment(postId, commentText) {
  if (!currentMember) return;

  try {
    await supabaseFetch("/rest/v1/post_comments", {
      method: "POST",
      headers: {
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        post_id: postId,
        member_id: currentMember.member_id,
        comment_text: commentText,
        is_approved: false
      })
    });

    const emailResult = await sendThinkTankEmail({
      type: "comment",
      title: "",
      message: commentText
    });

    if (emailResult.ok) {
      alert("Το σχόλιο υποβλήθηκε και αναμένει έγκριση. Στάλθηκε email επιβεβαίωσης.");
    } else {
      alert("Το σχόλιο υποβλήθηκε και αναμένει έγκριση. Δεν στάλθηκε email επιβεβαίωσης.");
    }

  } catch (err) {
    console.error(err);
    alert("Αποτυχία αποθήκευσης σχολίου.");
  }
}
