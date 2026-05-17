(function () {
  const storageKey = "rental-launch-theme";
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(storageKey);
  const initialTheme = savedTheme || "light";

  root.dataset.theme = initialTheme;
  updateHeroOffset();
  updateLabels(initialTheme);

  window.addEventListener("resize", updateHeroOffset);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateHeroOffset);
  }

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

  const homeDataMount = document.querySelector("[data-home-data-sources]");
  if (homeDataMount && window.RENTAL_DATA_SOURCES) {
    homeDataMount.innerHTML = window.RENTAL_DATA_SOURCES.map((source) => `
      <article class="data-access-row">
        <div>
          <p class="eyebrow">${escapeHtml(source.category)}</p>
          <h3><a href="data/${source.slug}/">${escapeHtml(source.title)}</a></h3>
          <p>${escapeHtml(source.what)}</p>
        </div>
        <div>
          <span>Cost</span>
          <p>${escapeHtml(source.price)}</p>
        </div>
        <div>
          <span>Legal access</span>
          <p>${escapeHtml(source.acquisition)}</p>
        </div>
        <div>
          <span>Formats</span>
          <p>${escapeHtml(source.formats)}</p>
        </div>
      </article>
    `).join("");
  }

  initHomepageReveal();

  function updateHeroOffset() {
    const topbar = document.querySelector(".home-topbar");
    if (!topbar) return;
    root.style.setProperty("--hero-header-offset", `${Math.ceil(topbar.getBoundingClientRect().height)}px`);
  }

  function initHomepageReveal() {
    const home = document.querySelector(".home-main");
    if (!home) return;

    const selectors = [
      ".landing-hero > *",
      ".section-intro > *",
      ".feature-card",
      ".data-access-row",
      ".roadmap-list li",
      ".sources-section > *"
    ];
    const revealItems = Array.from(home.querySelectorAll(selectors.join(",")));
    if (!revealItems.length) return;

    revealItems.forEach((item, index) => {
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
    });
    root.classList.add("js-reveal-ready");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12
    });

    revealItems.forEach((item) => observer.observe(item));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
