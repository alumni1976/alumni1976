export async function render() {
  return `
<!-- ── HERO ── -->
<div class="hero">
  <span class="hero-tag">Αποφοίτηση 1976</span>
  <h1>Πενήντα Χρόνια<br><em>Προσφοράς</em><br>&amp; Δημιουργίας</h1>
  <p class="dept">Σχολή Ηλεκτρολόγων Μηχανικών</p>
  <p class="uni">Πανεπιστήμιο Πατρών · Πολυτεχνική Σχολή</p>
  <p class="desc">Εκπρόσωποι του 1976 — απόφοιτοι με κοινή ιστορία, κοινές αξίες και αδιάπτωτη φλόγα για τη γνώση και την τεχνολογία.</p>
  <div class="hero-btns">
    <a href="#event" class="btn-primary">Επετειακή Εκδήλωση →</a>
    <a href="community.html" class="btn-outline">Κοινότητα</a>
  </div>
</div>

<!-- ── STATS ── -->
<div class="stats">
  <div class="stat"><div class="num">50</div><div class="lbl">Χρόνια από την Αποφοίτηση</div></div>
  <div class="stat"><div class="num">1976</div><div class="lbl">Έτος Αποφοίτησης</div></div>
  <div class="stat"><div class="num">2026</div><div class="lbl">Έτος Επετείου</div></div>
  <div class="stat"><div class="num">∞</div><div class="lbl">Αναμνήσεις</div></div>
</div>

<!-- ── HERITAGE ── -->
<section id="heritage">
  <p class="section-tag">Η Κληρονομιά μας</p>
  <h2>Μηχανικοί που άφησαν<br>το αποτύπωμά τους</h2>
  <div class="heritage-grid">
    <div class="heritage-text">
      <p>Τα 50 χρόνια από την αποφοίτησή μας είναι μια διαδυναμική ιστορία προσφοράς και επιτυχιών. Με περηφάνια κοιτάμε το παρελθόν, τιμώντας τις αξίες και το ήθος που μας καθόρισαν ως μηχανικούς και ανθρώπους.</p>
      <p>Συνεχίζουμε να κρατάμε τη φλόγα της δημιουργίας ζωντανή, παραμένοντας πάντα ενωμένοι από τις κοινές μας αναμνήσεις.</p>
      <div class="quote">
        «Οἵτινες ποτ᾽ ἔστε χαίρετε! Εἰρηνικῶς πρός φίλους φίλοι ἐληλύθαμεν.»
        <cite>— Ηχογράφηση, Ανδρέας Καζαντζίδης, Cornell University</cite>
      </div>
      <p>Πριν από 50 χρόνια, ήμασταν οι νέοι Ηλεκτρολόγοι Μηχανικοί μιας Ελλάδας που άλλαζε. Με τους λογαριθμικούς μας κανόνες, τα πρώτα επιστημονικά κομπιουτεράκια και το μυαλό γεμάτο εξισώσεις του Maxwell, θεωρία κυκλωμάτων και όνειρα.</p>
    </div>
    <div class="heritage-img">
      <img src="https://drive.google.com/thumbnail?id=1Kskj_9y0lNF94FT3XZgS-D9RyQk81XjN&sz=w2000" alt="Alumni Reunion 1976" />
    </div>
  </div>
</section>

<!-- ── MEMORY ── -->
<section id="memory">
  <p class="section-tag">Μνήμη</p>
  <h2>Αφιερωμένο στη μνήμη του</h2>
  <div class="memory-card">
    <p>Με αφορμή τη συμπλήρωση ενός χρόνου από τον θάνατο του αγαπημένου μας συμφοιτητή, αφιερώνουμε λίγες σκέψεις μνήμης. Δεν ήταν απλώς ένας συμφοιτητής — ήταν φίλος και συνοδοιπόρος στα χρόνια των σπουδών.</p>
    <p>Με το χαμόγελό του, την ευγένεια και την αφοσίωσή του άγγιξε τις ζωές όλων μας. Η απουσία του αφήνει ένα κενό, αλλά η μνήμη του παραμένει ζωντανή στις καρδιές μας.</p>
    <div class="person">Δημήτρης Κολέτσος</div>
    <div class="dates">1954 – 2025</div>
    <span class="rip">✦ Αιωνία του η μνήμη</span>
  </div>
</section>

<!-- ── EVENT ── -->
<section id="event">
  <p class="section-tag">Προσεχείς Εκδηλώσεις</p>
  <h2>Η Μεγάλη Επετειακή Συνάντηση</h2>
  <div class="event-card">
    <div class="event-date">
      <div class="day">20</div>
      <div class="month">Ιουν</div>
    </div>
    <div class="event-body">
      <h3>Reunion Αποφοίτων 1976</h3>
      <p>Πεντηκονταετής επετειακή συνάντηση των αποφοίτων της Σχολής Ηλεκτρολόγων Μηχανικών. Ένα ιστορικό ραντεβού με τον χρόνο, τους φίλους και τις αναμνήσεις μας.</p>
      <p class="location">📍 Πανεπιστήμιο Πατρών, Ρίο · Σάββατο 20 Ιουνίου 2026</p>
      <a href="#" class="btn-primary">Δήλωση Συμμετοχής →</a>
    </div>
  </div>
</section>

<!-- ── CONTACT ── -->
<section id="contact">
  <p class="section-tag">Επικοινωνία</p>
  <h2>Ελάτε σε επαφή μαζί μας</h2>
  <div class="contact-grid">
    <div class="contact-info">
      <p><strong>Τοποθεσία</strong><br>Ρίο, Πάτρα, Ελλάδα</p>
      <p><strong>Email</strong><br><a href="mailto:alumni1976@gmail.com">alumni1976@gmail.com</a></p>
    </div>
    <div class="contact-form">
      <div class="form-grid">
        <input type="text" placeholder="Όνομα" />
        <input type="text" placeholder="Επώνυμο" />
      </div>
      <div class="form-full">
        <input type="email" placeholder="Email" />
      </div>
      <div class="form-full">
        <textarea placeholder="Μήνυμα"></textarea>
      </div>
      <div class="form-full" style="margin-top:12px">
        <a href="#" class="btn-primary">Αποστολή Μηνύματος →</a>
      </div>
    </div>
  </div>
</section>
  `;
}
