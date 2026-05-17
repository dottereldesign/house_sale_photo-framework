(function () {
  const sources = window.RENTAL_DATA_SOURCES || [];
  const slug = window.DATA_SOURCE_SLUG;
  const source = sources.find((item) => item.slug === slug);
  const mount = document.querySelector("[data-source-page]");
  if (!mount || !source) return;

  document.title = `${source.title} | Rental Launch Board`;
  mount.innerHTML = `
    <section class="data-detail-hero">
      <p class="eyebrow">${escapeHtml(source.category)}</p>
      <h1>${escapeHtml(source.title)}</h1>
      <p>${escapeHtml(source.fit)}</p>
      <a class="primary-link" href="${escapeHtml(source.sourceUrl)}">Open source</a>
    </section>
    <section class="data-detail-grid">
      <article class="feature-card">
        <h3>What we can get</h3>
        <p>${escapeHtml(source.what)}</p>
      </article>
      <article class="feature-card">
        <h3>API / local use</h3>
        <p>${escapeHtml(source.access)}</p>
      </article>
      <article class="feature-card">
        <h3>Fit</h3>
        <p>${escapeHtml(source.fit)}</p>
      </article>
    </section>
    <section class="data-notes">
      <div>
        <p class="eyebrow">Implementation notes</p>
        <h2>Next actions</h2>
      </div>
      <ul>${source.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul>
      <label>
        <span>Local notes for this source</span>
        <textarea data-source-notes placeholder="API key notes, endpoint tests, order reference numbers, document status..."></textarea>
      </label>
    </section>
  `;

  const notes = mount.querySelector("[data-source-notes]");
  const key = `rental-launch-source-notes:${source.slug}`;
  notes.value = localStorage.getItem(key) || "";
  notes.addEventListener("input", () => localStorage.setItem(key, notes.value));

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
