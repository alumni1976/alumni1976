export async function render() {
  return `
    <main class="page home-page">

      <section class="hero chronicle-hero">
        <div class="hero-grid-overlay"></div>
        <div class="hero-year-bg">1976</div>

        <div class="hero-content">
          <div class="hero-eyebrow">Πενήντα χρόνια κοινής πορείας</div>

          <h1 class="hero-title">
            Η <em>Ιστορία</em> μας
          </h1>

          <p class="hero-desc">
            Ψηφιακός τόπος μνήμης και επικοινωνίας για τους αποφοίτους
            της Σχολής Ηλεκτρολόγων Μηχανικών του Πανεπιστημίου Πατρών,
            τάξη του 1976.
          </p>

          <div class="hero-wisdom">
            <p>⚡ Η θεωρία δείχνει τον δρόμο. Η πράξη τον επιβεβαιώνει.</p>
            <p>🎓 Η γνώση αποκτά αξία όταν μοιράζεται.</p>
            <p>🤝 Η κοινή διαδρομή γίνεται κοινή μνήμη.</p>
          </div>

          <div class="hero-actions">
            <a class="btn btn-primary" href="#/alumnievents">Επετειακή Εκδήλωση</a>
            <a class="btn btn-outline" href="#/community">Κατάλογος Μελών</a>
          </div>
        </div>
      </section>

      <div class="stats-strip">
        <div class="stat-item">
          <span class="stat-number">50</span>
          <span class="stat-label">Χρόνια από την αποφοίτηση</span>
        </div>

        <div class="stat-item">
          <span class="stat-number">1976</span>
          <span class="stat-label">Έτος αποφοίτησης</span>
        </div>

        <div class="stat-item">
          <span class="stat-number">2026</span>
          <span class="stat-label">Έτος επετείου</span>
        </div>

        <div class="stat-item">
          <span class="stat-number">∞</span>
          <span class="stat-label">Αναμνήσεις και δεσμοί</span>
        </div>
      </div>

      <div class="ornament-divider"><span>✦</span></div>

      <section class="section feature-section">
        <div class="section-header">
          <div class="section-eyebrow">Τι φιλοξενεί ο χώρος μας</div>

          <h2 class="section-title">
            Επιστροφή στις μνήμες. Επαφή με τους φίλους. Γιορτή της διαδρομής.
          </h2>

          <p class="section-subtitle">
            Ένας λιτός και ζωντανός χώρος για πρόσωπα, φωτογραφίες,
            εκδηλώσεις και σκέψεις από μισό αιώνα κοινής πορείας.
          </p>
        </div>

        <div class="card-grid">
          <a class="card" href="#/alumnievents">
            <div class="card-icon">🎓</div>
            <div class="card-title">Επετειακή Συνάντηση</div>
            <div class="card-text">
              Η μεγάλη συνάντηση των αποφοίτων του 1976, πενήντα χρόνια μετά.
            </div>
          </a>

          <a class="card" href="#/community">
            <div class="card-icon">🤝</div>
            <div class="card-title">Κατάλογος Αποφοίτων</div>
            <div class="card-text">
              Πρόσωπα, στοιχεία επικοινωνίας, βιογραφικά και σύνδεσμοι των μελών.
            </div>
          </a>

          <a class="card" href="#/thinktank">
            <div class="card-icon">💡</div>
            <div class="card-title">Δεξαμενή Σκέψεων</div>
            <div class="card-text">
              Αναμνήσεις, ιδέες, προβληματισμοί και εμπειρίες των αποφοίτων.
            </div>
          </a>
        </div>
      </section>

      <div class="ornament-divider"><span>✦</span></div>

      <section id="heritage" class="section heritage-section">
        <div class="heritage-layout">
          <div>
            <div class="section-eyebrow">Η Κληρονομιά μας</div>

            <h2 class="section-title">
              Μηχανικοί που άφησαν το αποτύπωμά τους
            </h2>

            <p>
              Τα πενήντα χρόνια από την αποφοίτησή μας είναι μια διαδρομή
              προσφοράς, δημιουργίας και επιτυχιών. Με περηφάνια κοιτάμε
              το παρελθόν, τιμώντας τις αξίες και το ήθος που μας καθόρισαν
              ως μηχανικούς και ανθρώπους.
            </p>

            <blockquote>
              «Οἵτινες ποτ᾽ ἔστε χαίρετε! Εἰρηνικῶς πρός φίλους φίλοι ἐληλύθαμεν.»
              <cite>— Ηχογράφηση, Ανδρέας Καζαντζίδης, Cornell University</cite>
            </blockquote>
          </div>

          <div class="heritage-photo">
            <img
              src="https://drive.google.com/thumbnail?id=1Kskj_9y0lNF94FT3XZgS-D9RyQk81XjN&sz=w2000"
              alt="Alumni 1976"
            >
          </div>
        </div>
      </section>

      <section id="memory" class="section memory-section">
        <div class="memory-card">
          <div class="section-eyebrow">Μνήμη</div>

          <h2>Αφιερωμένο στη μνήμη του</h2>

          <p>
            Με αφορμή τη συμπλήρωση ενός χρόνου από τον θάνατο του αγαπημένου
            μας συμφοιτητή, αφιερώνουμε λίγες σκέψεις μνήμης. Δεν ήταν απλώς
            ένας συμφοιτητής — ήταν φίλος και συνοδοιπόρος στα χρόνια των σπουδών.
          </p>

          <div class="person">Δημήτρης Κολέτσος</div>
          <div class="dates">1954 – 2025</div>
          <span class="rip">✦ Αιωνία του η μνήμη</span>
        </div>
      </section>

      <section id="event" class="section event-section">
        <div class="event-card">
          <div class="event-date">
            <div class="day">20</div>
            <div class="month">Ιουν</div>
          </div>

          <div class="event-body">
            <div class="section-eyebrow">Προσεχείς Εκδηλώσεις</div>

            <h2>Reunion Αποφοίτων 1976</h2>

            <p>
              Πεντηκονταετής επετειακή συνάντηση των αποφοίτων της Σχολής
              Ηλεκτρολόγων Μηχανικών. Ένα ιστορικό ραντεβού με τον χρόνο,
              τους φίλους και τις αναμνήσεις μας.
            </p>

            <p class="location">
              📍 Πανεπιστήμιο Πατρών, Ρίο · Σάββατο 20 Ιουνίου 2026
            </p>

            <a href="#/alumnievents" class="btn btn-primary">Πληροφορίες Εκδήλωσης</a>
          </div>
        </div>
      </section>

    </main>
  `;
}
