export async function render() {
  return `
    <div class="profs-header">
      <div class="profs-header-orb"></div>
      <div class="profs-eyebrow">
        Σχολή Ηλεκτρολόγων Μηχανικών · Πανεπιστήμιο Πατρών
      </div>
      <h1>Οι <em>Καθηγητές</em> μας</h1>
      <p>
        Η ποιότητα των σπουδών μας είναι το αποτέλεσμα της εξαιρετικής καθοδήγησης των καθηγητών μας.
      </p>
    </div>

    <main class="profs-main">
      <div class="prof-section">
        <div class="prof-section-label">Εν Ζωή</div>
        <h2 class="prof-section-title">Οι Δάσκαλοί μας εν ζωή</h2>
        <p class="prof-section-subtitle">
          Με βαθιά εκτίμηση και ευγνωμοσύνη τιμούμε τους καθηγητές που μας καθοδήγησαν.
        </p>

        <div class="prof-grid">
          ${profCard({
            image: 'https://lh3.googleusercontent.com/d/1-wqq0eVx-D5jipUpjBDeAgSRIYdXbe0m',
            alt: 'Βασίλης Μακιός',
            initials: 'ΒΜ',
            name: 'Καθηγητής Βασίλης Μακιός',
            dates: '1938 –'
          })}

          ${profCard({
            image: 'https://lh3.googleusercontent.com/d/1by72JFamn6-LrPMJ5v1xmdpH9ZXBr7xo',
            alt: 'Γιώργος Παπαδόπουλος',
            initials: 'ΓΠ',
            name: 'Καθηγητής Γ. Παπαδόπουλος',
            dates: '1940 –'
          })}
        </div>
      </div>

      <div class="prof-section-divider"></div>

      <div class="prof-section">
        <div class="prof-section-label">Μνήμη</div>
        <h2 class="prof-section-title">Οι Δάσκαλοί μας που έχουν φύγει</h2>
        <p class="prof-section-subtitle">Πάντα θα σας θυμόμαστε…</p>

        <div class="prof-grid">
          ${profCard({
            memorial: true,
            image: 'https://lh3.googleusercontent.com/d/1yUnuHpeIjY9SiWUatSZr1Ky6Xf21s2lD',
            alt: 'Σπύρος Τζαφέστας',
            initials: 'ΣΤ',
            name: 'Καθηγητής Σπ. Τζαφέστας',
            dates: '3/12/1939 – Απρίλιος 2019'
          })}

          ${profCard({
            memorial: true,
            image: 'https://lh3.googleusercontent.com/d/1agIJmO6GhxxzMdtHV0xOArxcMBA6NGsa',
            alt: 'Θανάσης Σαφάκας',
            initials: 'ΘΣ',
            name: 'Καθηγητής Θανάσης Σαφάκας',
            dates: '13/1/1943 – 28/12/2020'
          })}

          ${profCard({
            memorial: true,
            image: 'https://lh3.googleusercontent.com/d/1Eew-OQ4rDFGcOkQvj8Qw9CNY5Y3yDcyY',
            alt: 'Γλαύκος Γαλανός',
            initials: 'ΓΓ',
            name: 'Καθηγητής Γλαύκος Γαλανός',
            dates: '9/12/1940 – 11/4/2021'
          })}

          ${profCard({
            memorial: true,
            image: 'https://lh3.googleusercontent.com/d/1KqeN15eWYbc1tM5GgsdszPmOfqXw0QoZ',
            alt: 'Άρις Σισούρας',
            initials: 'ΑΣ',
            name: 'Καθηγητής Άρις Σισούρας',
            dates: '30/11/1938 – 3/9/2023'
          })}

          ${profCard({
            memorial: true,
            image: 'https://lh3.googleusercontent.com/d/1PLYTvYN68exLRBRHyFBBAyyVl_XfYbRm',
            alt: 'Νίκος Τζάννες',
            initials: 'ΝΤ',
            name: 'Νίκος Τζάννες',
            dates: '1937 – 2025'
          })}

          ${profCard({
            memorial: true,
            image: 'https://lh3.googleusercontent.com/d/1ELv6LwDif6HL-BVqXpSeqFVBa2Ev7RPY',
            alt: 'Γιώργος Κοκκινάκης',
            initials: 'ΓΚ',
            name: 'Γιώργος Κοκκινάκης',
            dates: '1939 – 2025'
          })}
        </div>
      </div>
    </main>
  `;
}

function profCard({ image, alt, initials, name, dates, memorial = false }) {
  return `
    <div class="prof-card ${memorial ? 'memorial' : ''}">
      <div class="prof-photo-wrap">
        <img
          src="${image}"
          alt="${alt}"
          onerror="this.parentElement.innerHTML='<div class=prof-initials>${initials}</div>'"
        />
      </div>
      <div class="prof-name">${name}</div>
      <div class="prof-dates">${dates}</div>
    </div>
  `;
}
