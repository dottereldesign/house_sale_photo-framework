(function () {
  const storageKey = "rental-launch-theme";
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(storageKey);
  const initialTheme = savedTheme || "light";

  root.dataset.theme = initialTheme;
  updateLabels(initialTheme);

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = nextTheme;
      localStorage.setItem(storageKey, nextTheme);
      updateLabels(nextTheme);
    });
  });

  function updateLabels(theme) {
    document.querySelectorAll("[data-theme-label]").forEach((label) => {
      label.textContent = theme === "dark" ? "Light" : "Dark";
    });
  }
})();
