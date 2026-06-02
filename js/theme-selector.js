const THEME_STORAGE_KEY = "alumni1976Theme";

const THEMES = [
  "style-deep-navy-university",
  "style-academic-gold",
  "style-engineering-tech",
  "style-executive-alumni",
  "style-polytechnic-heritage"
];

const DEFAULT_THEME = "style-deep-navy-university";

function normalizeTheme(theme) {
  return THEMES.includes(theme) ? theme : DEFAULT_THEME;
}

function applyTheme(theme) {
  const selectedTheme = normalizeTheme(theme);

  document.body.classList.remove(...THEMES);
  document.body.classList.add(selectedTheme);
  document.documentElement.dataset.theme = selectedTheme;

  localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);

  const selector = document.getElementById("themeSelector");
  if (selector) selector.value = selectedTheme;
}

function initThemeSelector() {
  const savedTheme = normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
  applyTheme(savedTheme);

  const selector = document.getElementById("themeSelector");
  if (!selector) return;

  selector.addEventListener("change", () => {
    applyTheme(selector.value);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initThemeSelector);
} else {
  initThemeSelector();
}
