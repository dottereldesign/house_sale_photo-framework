(function () {
  const profile = window.RENTAL_PROPERTY_PROFILE;
  const mount = document.querySelector("[data-property-profile]");
  if (!profile || !mount) return;

  const money = new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  });

  mount.innerHTML = `
    <section class="data-detail-hero property-hero">
      <p class="eyebrow">Saved property profile</p>
      <h1>${escapeHtml(profile.displayAddress)}</h1>
      <p>${escapeHtml(profile.officialAddress)}</p>
      <a class="primary-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.officialAddress)}">Open map</a>
    </section>

    <section class="data-detail-grid">
      <article class="feature-card">
        <h3>Address match</h3>
        <p>${escapeHtml(profile.address.recordStatus)} CCC address record. Locality returned as ${escapeHtml(profile.address.localityName)}, not Casebrook.</p>
      </article>
      <article class="feature-card">
        <h3>Legal parcel</h3>
        <p>${escapeHtml(profile.parcel.legalDescription)}. Area ${profile.parcel.legalAreaSqm.toLocaleString()} sqm.</p>
      </article>
      <article class="feature-card">
        <h3>Rating valuation</h3>
        <p>CV ${money.format(profile.valuation.capitalValue)}. Land ${money.format(profile.valuation.landValue)}. Improvements ${money.format(profile.valuation.improvementsValue)}.</p>
      </article>
      <article class="feature-card">
        <h3>Building footprints</h3>
        <p>${profile.buildings.length} footprint records: ${profile.buildings.map((building) => `${building.footprintAreaSqm.toFixed(1)} sqm`).join(", ")}. These are not floor plans.</p>
      </article>
      <article class="feature-card">
        <h3>Planning zone</h3>
        <p>${profile.planning.zones.map((zone) => `${zone.type} (${zone.code})`).join(", ")}.</p>
      </article>
      <article class="feature-card">
        <h3>Hazards / overlays</h3>
        <p>${escapeHtml(profile.landCharacteristics.liquefactionVulnerability)}. Flood management catchment: ${escapeHtml(profile.planning.floodManagementCatchment)}.</p>
      </article>
    </section>

    <section class="data-safe-interface">
      <div>
        <p class="eyebrow">Free data used</p>
        <h2>Only this address was queried</h2>
        <p>The saved profile uses free Christchurch City Council Open Data ArcGIS REST queries filtered to this address, rating unit, or the matched parcel polygon. No bulk download is needed for this page.</p>
      </div>
      <div class="property-facts">
        ${fact("StreetAddressID", profile.identifiers.streetAddressId)}
        ${fact("RatingUnitID", profile.identifiers.ratingUnitId)}
        ${fact("Valuation ref", profile.identifiers.valuationReference)}
        ${fact("Coordinates", `${profile.coordinates.latitude.toFixed(6)}, ${profile.coordinates.longitude.toFixed(6)}`)}
        ${fact("Free floor plan found", "No")}
        ${fact("Saved", new Date(profile.fetchedAt).toLocaleString("en-NZ"))}
      </div>
    </section>

    <section class="data-notes">
      <div>
        <p class="eyebrow">Source notes</p>
        <h2>What this does and does not prove</h2>
      </div>
      <ul>
        ${profile.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <div class="property-source-list">
        ${profile.sourcesUsed.map((source) => `
          <a href="${escapeHtml(source.url)}">
            <strong>${escapeHtml(source.name)}</strong>
            <span>${escapeHtml(source.access)}</span>
          </a>
        `).join("")}
      </div>
    </section>
  `;

  function fact(label, value) {
    return `
      <div>
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `;
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
