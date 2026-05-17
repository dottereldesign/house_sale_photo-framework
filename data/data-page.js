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
      <article class="feature-card">
        <h3>Pricing</h3>
        <p>${escapeHtml(source.price)}</p>
      </article>
      <article class="feature-card">
        <h3>Legal use</h3>
        <p>${escapeHtml(source.legalUse)}</p>
      </article>
      <article class="feature-card">
        <h3>Formats</h3>
        <p>${escapeHtml(source.formats)}</p>
      </article>
    </section>
    <section class="data-safe-interface">
      <div>
        <p class="eyebrow">Get data safely</p>
        <h2>Use official access paths</h2>
        <p>${escapeHtml(source.safePractice)}</p>
      </div>
      <div class="safe-action-row">
        <a class="primary-link" href="${escapeHtml(source.sourceUrl)}">Open official source</a>
        <a class="secondary-link" href="${escapeHtml(source.downloadUrl || source.sourceUrl)}">Open API / download / order page</a>
      </div>
      <form class="data-config-form" data-source-config>
        <label>
          <span>Official endpoint or order URL</span>
          <input name="endpoint" type="url" placeholder="Paste the exact official API/download/order URL">
        </label>
        <label>
          <span>API key label or order reference</span>
          <input name="credential" type="text" placeholder="Store only local notes, not public keys">
        </label>
        <label>
          <span>Refresh / retrieval plan</span>
          <select name="refresh">
            <option value="manual">Manual only</option>
            <option value="daily">Daily max</option>
            <option value="weekly">Weekly max</option>
            <option value="monthly">Monthly max</option>
          </select>
        </label>
        <label>
          <span>Preferred output</span>
          <select name="format">
            <option value="local-json">Local JSON cache</option>
            <option value="csv">CSV if officially available</option>
            <option value="excel">Excel if officially available</option>
            <option value="pdf">PDF/document upload</option>
          </select>
        </label>
        <button type="submit">Save access plan locally</button>
      </form>
      <p class="save-state" data-config-status></p>
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

  const configForm = mount.querySelector("[data-source-config]");
  const configStatus = mount.querySelector("[data-config-status]");
  const configKey = `rental-launch-source-config:${source.slug}`;
  const savedConfig = JSON.parse(localStorage.getItem(configKey) || "{}");
  Object.entries(savedConfig).forEach(([name, value]) => {
    const field = configForm.elements[name];
    if (field) field.value = value;
  });
  configForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(configForm).entries());
    localStorage.setItem(configKey, JSON.stringify(data));
    configStatus.textContent = "Saved locally. Nothing was sent to the source.";
  });

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
