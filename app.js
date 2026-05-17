const rooms = [
  { id: "dining", name: "Dining room", icon: "icon-dining" },
  { id: "hallway", name: "Hallway", icon: "icon-hallway" },
  { id: "lounge", name: "Lounge", icon: "icon-lounge" },
  { id: "kitchen", name: "Kitchen", icon: "icon-kitchen" },
  { id: "master", name: "Master bedroom", icon: "icon-bedroom" },
  { id: "single-1", name: "Single bedroom 1", icon: "icon-bedroom" },
  { id: "single-2", name: "Single bedroom 2", icon: "icon-bedroom" },
  { id: "bathroom", name: "Bathroom", icon: "icon-bath" },
  { id: "toilet", name: "Toilet", icon: "icon-toilet" },
  { id: "laundry", name: "Laundry", icon: "icon-laundry" },
  { id: "outside", name: "Outside shots", icon: "icon-outside" },
];

const statusOptions = [
  { id: "todo", label: "To shoot" },
  { id: "needs-more", label: "Needs more" },
  { id: "complete", label: "Complete" },
];

const photoKinds = {
  reference: "Reference",
  listing: "Listing",
};

const dbName = "house-photo-board";
const statusKey = "house-photo-board-statuses";
const seedPhotosKey = "house-photo-board-seed-loaded";
const webpQuality = 0.86;
const referenceImportPath = window.location.pathname.includes("/photography/")
  ? "../trademe-reference-import.json"
  : "trademe-reference-import.json";
const seedPhotosPath = window.location.pathname.includes("/photography/")
  ? "photos.json"
  : "photography/photos.json";
let db;
let photos = [];
let statuses = loadStatuses();
let openRooms = new Set(rooms.map((room) => room.id));
let lastReferenceImportGeneratedAt = "";

const roomsView = document.querySelector("#roomsView");
const allView = document.querySelector("#allView");
const categoryNav = document.querySelector("#categoryNav");
const roomsViewBtn = document.querySelector("#roomsViewBtn");
const allViewBtn = document.querySelector("#allViewBtn");
const totalPhotos = document.querySelector("#totalPhotos");
const completeRooms = document.querySelector("#completeRooms");
const needsMoreRooms = document.querySelector("#needsMoreRooms");
const photoModal = document.querySelector("#photoModal");
const modalImage = document.querySelector("#modalImage");
const modalTitle = document.querySelector("#modalTitle");
const modalRoom = document.querySelector("#modalRoom");

init();

async function init() {
  db = await openDb();
  photos = await migrateExistingPhotosToWebp((await getAllPhotos()).map(normalizePhoto));
  if (!photos.length && !localStorage.getItem(seedPhotosKey)) {
    photos = await loadSeedPhotos();
    localStorage.setItem(seedPhotosKey, "true");
  }
  bindGlobalActions();
  startReferenceAutoImport();
  render();
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.createObjectStore("photos", { keyPath: "id" });
      store.createIndex("roomId", "roomId", { unique: false });
    };
  });
}

function tx(storeName, mode = "readonly") {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function getAllPhotos() {
  return new Promise((resolve, reject) => {
    const request = tx("photos").getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result.sort((a, b) => a.createdAt - b.createdAt));
  });
}

function savePhoto(photo) {
  return new Promise((resolve, reject) => {
    const request = tx("photos", "readwrite").put(photo);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function updatePhoto(photo) {
  return savePhoto(photo);
}

function deletePhoto(id) {
  return new Promise((resolve, reject) => {
    const request = tx("photos", "readwrite").delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function clearPhotos() {
  return new Promise((resolve, reject) => {
    const request = tx("photos", "readwrite").clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function loadStatuses() {
  const saved = JSON.parse(localStorage.getItem(statusKey) || "{}");
  return rooms.reduce((next, room) => {
    next[room.id] = saved[room.id] || "todo";
    return next;
  }, {});
}

function saveStatuses() {
  localStorage.setItem(statusKey, JSON.stringify(statuses));
}

function bindGlobalActions() {
  roomsViewBtn.addEventListener("click", () => setView("rooms"));
  allViewBtn.addEventListener("click", () => setView("all"));
  document.querySelector("#closeModal").addEventListener("click", () => photoModal.close());
  photoModal.addEventListener("click", (event) => {
    if (event.target === photoModal) photoModal.close();
  });
  document.querySelector("#exportBtn").addEventListener("click", exportProject);
  document.querySelector("#importInput").addEventListener("change", importProject);
  document.querySelector("#loadRefsBtn").addEventListener("click", loadReferenceImport);
  document.querySelector("#clearBtn").addEventListener("click", async () => {
    if (!confirm("Clear all photos and checklist statuses stored in this browser?")) return;
    await clearPhotos();
    statuses = rooms.reduce((next, room) => ({ ...next, [room.id]: "todo" }), {});
    saveStatuses();
    localStorage.setItem(seedPhotosKey, "true");
    photos = [];
    render();
  });
}

function setView(view) {
  const showAll = view === "all";
  roomsView.classList.toggle("hidden", showAll);
  allView.classList.toggle("hidden", !showAll);
  roomsViewBtn.classList.toggle("active", !showAll);
  allViewBtn.classList.toggle("active", showAll);
}

function render() {
  renderSummary();
  renderCategoryNav();
  renderRooms();
  renderAll();
}

function renderSummary() {
  totalPhotos.textContent = photos.filter((photo) => photo.kind === "listing").length;
  completeRooms.textContent = Object.values(statuses).filter((status) => status === "complete").length;
  needsMoreRooms.textContent = Object.values(statuses).filter((status) => status === "needs-more").length;
}

function renderRooms() {
  roomsView.innerHTML = rooms.map((room) => roomTemplate(room)).join("");
  rooms.forEach((room) => bindRoom(room));
}

function renderCategoryNav() {
  if (!categoryNav) return;
  categoryNav.innerHTML = rooms.map((room) => {
    const roomPhotos = photos.filter((photo) => photo.roomId === room.id);
    const referenceCount = roomPhotos.filter((photo) => photo.kind === "reference").length;
    const listingCount = roomPhotos.filter((photo) => photo.kind === "listing").length;
    const finalCount = roomPhotos.filter((photo) => photo.kind === "listing" && photo.isFinal).length;
    const complete = statuses[room.id] === "complete" ? " complete" : "";
    return `
      <button class="category-link${complete}" type="button" data-room-link="${room.id}">
        <span class="category-link-title">
          <svg aria-hidden="true"><use href="#${room.icon}"></use></svg>
          ${room.name}
        </span>
        <span class="category-link-meta">${listingCount} listing · ${referenceCount} ref · ${finalCount} final</span>
      </button>
    `;
  }).join("");

  categoryNav.querySelectorAll("[data-room-link]").forEach((button) => {
    button.addEventListener("click", () => jumpToRoom(button.dataset.roomLink));
  });
}

function jumpToRoom(roomId) {
  setView("rooms");
  openRooms.add(roomId);
  renderRooms();
  const roomEl = document.querySelector(`[data-room="${roomId}"]`);
  roomEl?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function roomTemplate(room) {
  const roomPhotos = photos.filter((photo) => photo.roomId === room.id);
  const referencePhotos = roomPhotos.filter((photo) => photo.kind === "reference");
  const listingPhotos = roomPhotos.filter((photo) => photo.kind === "listing");
  const finalPhotos = listingPhotos.filter((photo) => photo.isFinal);
  const open = openRooms.has(room.id) ? " open" : "";
  return `
    <article id="room-${room.id}" class="room${open}" data-room="${room.id}">
      <button class="room-toggle" type="button" aria-expanded="${openRooms.has(room.id)}">
        <span class="room-icon"><svg aria-hidden="true"><use href="#${room.icon}"></use></svg></span>
        <span class="room-title">
          <strong>${room.name}</strong>
          <span>${listingPhotos.length} listing · ${referencePhotos.length} reference · ${finalPhotos.length} final · ${statusLabel(statuses[room.id])}</span>
        </span>
        <svg class="chevron" aria-hidden="true"><use href="#icon-chevron"></use></svg>
      </button>
      <div class="room-body">
        <div class="status-row" aria-label="${room.name} status">
          ${statusOptions.map((option) => `
            <button class="${statuses[room.id] === option.id ? "active" : ""}" type="button" data-status="${option.id}">
              ${option.id === "complete" ? '<svg aria-hidden="true"><use href="#icon-check"></use></svg>' : ""}
              ${option.label}
            </button>
          `).join("")}
        </div>
        <div class="upload-panel">
          <div class="add-actions">
            <label class="add-button">
              <input type="file" accept="image/*" multiple data-file-kind="reference">
              Add reference photos
            </label>
            <label class="add-button primary">
              <input type="file" accept="image/*" multiple data-file-kind="listing">
              Choose listing photos
            </label>
            <label class="add-button camera-button">
              <input type="file" accept="image/*" capture="environment" data-file-kind="listing">
              Take listing photo
            </label>
          </div>
          <div class="dropzone" data-dropzone="${room.id}">
            <span>
              <strong>Drop photos into ${room.name}</strong>
              <label>
                Save dropped files as
                <select data-drop-kind>
                  <option value="listing">listing photos</option>
                  <option value="reference">reference photos</option>
                </select>
              </label>
            </span>
          </div>
        </div>
        <div class="photo-section">
          <div class="section-heading">
            <h2>Reference images</h2>
            <span>${referencePhotos.length}</span>
          </div>
          <div class="photo-grid">
            ${referencePhotos.length ? referencePhotos.map(photoTemplate).join("") : '<p class="empty">Add examples for angles, styling, or must-capture details.</p>'}
          </div>
        </div>
        <div class="photo-section">
          <div class="section-heading">
            <h2>Listing photos</h2>
            <span>${listingPhotos.length} total · ${finalPhotos.length} final</span>
          </div>
          <div class="photo-grid">
            ${listingPhotos.length ? listingPhotos.map(photoTemplate).join("") : '<p class="empty">Add the real shots for the rental listing.</p>'}
          </div>
        </div>
      </div>
    </article>
  `;
}

function bindRoom(room) {
  const roomEl = roomsView.querySelector(`[data-room="${room.id}"]`);
  const toggle = roomEl.querySelector(".room-toggle");
  const dropzone = roomEl.querySelector(".dropzone");
  const dropKind = roomEl.querySelector("[data-drop-kind]");

  toggle.addEventListener("click", () => {
    if (openRooms.has(room.id)) {
      openRooms.delete(room.id);
    } else {
      openRooms.add(room.id);
    }
    renderRooms();
  });

  roomEl.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
      statuses[room.id] = button.dataset.status;
      saveStatuses();
      render();
    });
  });

  roomEl.querySelectorAll("[data-file-kind]").forEach((fileInput) => {
    fileInput.addEventListener("change", async () => {
      await addFiles(room.id, [...fileInput.files], fileInput.dataset.fileKind);
      fileInput.value = "";
    });
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove("dragover");
    });
  });

  dropzone.addEventListener("drop", async (event) => {
    await addFiles(room.id, [...event.dataTransfer.files], dropKind.value);
  });

  roomEl.querySelectorAll("[data-photo]").forEach(bindPhotoCard);
}

function renderAll() {
  allView.innerHTML = photos.length
    ? photos.map(photoTemplate).join("")
    : '<p class="empty">Drop photos into folders to build the full listing set.</p>';
  allView.querySelectorAll("[data-photo]").forEach(bindPhotoCard);
}

function photoTemplate(photo) {
  const room = rooms.find((item) => item.id === photo.roomId);
  const photoName = escapeHtml(photo.name);
  const roomName = escapeHtml(room ? room.name : "Unsorted");
  const kindLabel = escapeHtml(photoKinds[photo.kind] || "Listing");
  const version = escapeHtml(photo.version || "");
  const finalBadge = photo.kind === "listing" && photo.isFinal ? '<span class="badge final">Final</span>' : "";
  const unverifiedBadge = photo.verifiedRoom === false ? '<span class="badge warning">Unverified room</span>' : "";
  const finalButton = photo.kind === "listing"
    ? `<button class="mark-final ${photo.isFinal ? "active" : ""}" type="button">${photo.isFinal ? "Final shot" : "Mark final"}</button>`
    : "";
  const roomOptions = rooms.map((item) => `
    <option value="${escapeHtml(item.id)}" ${item.id === photo.roomId ? "selected" : ""}>${escapeHtml(item.name)}</option>
  `).join("");
  return `
    <article class="photo-card" data-photo="${escapeHtml(photo.id)}">
      <button class="preview" type="button" aria-label="Open ${photoName}">
        <img src="${escapeHtml(photoSource(photo))}" alt="${photoName}">
        <span class="badges">
          <span class="badge">${kindLabel}</span>
          ${finalBadge}
          ${unverifiedBadge}
        </span>
      </button>
      <footer>
        <span title="${photoName}">${roomName}</span>
        <label class="version-field">
          <span>Version</span>
          <input type="text" value="${version}" placeholder="v1">
        </label>
        <label class="room-field">
          <span>Room</span>
          <select>${roomOptions}</select>
        </label>
        ${finalButton}
        <button class="delete-photo" type="button" aria-label="Delete ${photoName}">
          <svg aria-hidden="true"><use href="#icon-trash"></use></svg>
        </button>
      </footer>
    </article>
  `;
}

function bindPhotoCard(card) {
  const photo = photos.find((item) => item.id === card.dataset.photo);
  if (!photo) return;
  const room = rooms.find((item) => item.id === photo.roomId);

  card.querySelector(".preview").addEventListener("click", () => {
    modalImage.src = photoSource(photo);
    modalImage.alt = photo.name;
    modalTitle.textContent = photo.name;
    modalRoom.textContent = `${room ? room.name : "Unsorted"} · ${photoKinds[photo.kind] || "Listing"}${photo.verifiedRoom === false ? " · Unverified room" : ""}${photo.version ? ` · ${photo.version}` : ""}${photo.isFinal ? " · Final" : ""}`;
    photoModal.showModal();
  });

  const versionInput = card.querySelector(".version-field input");
  if (versionInput) {
    versionInput.addEventListener("click", (event) => event.stopPropagation());
    versionInput.addEventListener("change", async () => {
      photo.version = versionInput.value.trim();
      await updatePhoto(photo);
      render();
    });
  }

  const finalButton = card.querySelector(".mark-final");
  if (finalButton) {
    finalButton.addEventListener("click", async () => {
      photo.isFinal = !photo.isFinal;
      await updatePhoto(photo);
      render();
    });
  }

  const roomSelect = card.querySelector(".room-field select");
  if (roomSelect) {
    roomSelect.addEventListener("click", (event) => event.stopPropagation());
    roomSelect.addEventListener("change", async () => {
      photo.roomId = roomSelect.value;
      photo.verifiedRoom = true;
      await updatePhoto(photo);
      openRooms.add(photo.roomId);
      render();
    });
  }

  card.querySelector(".delete-photo").addEventListener("click", async () => {
    await deletePhoto(photo.id);
    photos = photos.filter((item) => item.id !== photo.id);
    render();
  });
}

async function addFiles(roomId, files, kind = "listing") {
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));
  for (const file of imageFiles) {
    const converted = await convertImageFileToWebp(file);
    const photo = {
      id: crypto.randomUUID(),
      roomId,
      kind: photoKinds[kind] ? kind : "listing",
      name: renameAsWebp(file.name),
      type: "image/webp",
      size: converted.size,
      createdAt: Date.now(),
      version: "",
      isFinal: false,
      dataUrl: converted.dataUrl,
    };
    await savePhoto(photo);
    photos.push(photo);
  }
  photos.sort((a, b) => a.createdAt - b.createdAt);
  render();
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

async function convertImageFileToWebp(file) {
  return convertDataUrlToWebp(await readFile(file));
}

async function convertDataUrlToWebp(dataUrl) {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("WebP conversion failed"));
    }, "image/webp", webpQuality);
  });

  return {
    dataUrl: await readBlobAsDataUrl(blob),
    size: blob.size,
  };
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not decode image"));
    image.src = dataUrl;
  });
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function loadSeedPhotos() {
  try {
    const response = await fetch(`${seedPhotosPath}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    const seededPhotos = (payload.photos || []).map(normalizePhoto);
    for (const photo of seededPhotos) {
      await savePhoto(photo);
    }
    return seededPhotos.sort((a, b) => a.createdAt - b.createdAt);
  } catch (error) {
    console.warn("Could not load seeded photos", error);
    return [];
  }
}

async function migrateExistingPhotosToWebp(existingPhotos) {
  const migrated = [];
  for (const photo of existingPhotos) {
    const nextPhoto = await ensureWebpPhoto(photo);
    if (nextPhoto !== photo) await savePhoto(nextPhoto);
    migrated.push(nextPhoto);
  }
  return migrated.sort((a, b) => a.createdAt - b.createdAt);
}

async function ensureWebpPhoto(photo) {
  if (photo.src && photo.type === "image/webp") return photo;
  if (photo.type === "image/webp" && String(photo.dataUrl).startsWith("data:image/webp")) return photo;
  try {
    const converted = await convertDataUrlToWebp(photo.dataUrl);
    return {
      ...photo,
      name: renameAsWebp(photo.name),
      type: "image/webp",
      size: converted.size,
      dataUrl: converted.dataUrl,
    };
  } catch (error) {
    console.warn(`Could not convert ${photo.name || "photo"} to WebP`, error);
    return photo;
  }
}

function renameAsWebp(name) {
  const cleanName = name || "photo";
  return cleanName.replace(/\.[^.]+$/, "") + ".webp";
}

function photoSource(photo) {
  return photo.dataUrl || photo.src || "";
}

function statusLabel(status) {
  return statusOptions.find((option) => option.id === status)?.label || "To shoot";
}

function normalizePhoto(photo) {
  const kind = photoKinds[photo.kind] ? photo.kind : "listing";
  return {
    ...photo,
    kind,
    version: photo.version || "",
    isFinal: Boolean(photo.isFinal) && kind !== "reference",
    verifiedRoom: photo.verifiedRoom !== false,
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function exportProject() {
  const payload = {
    exportedAt: new Date().toISOString(),
    rooms,
    statuses,
    photos,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `house-photo-board-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importProject(event) {
  const file = event.target.files[0];
  if (!file) return;
  const payload = JSON.parse(await file.text());
  if (!Array.isArray(payload.photos)) {
    alert("That backup file does not look like a Rental Launch Board export.");
    return;
  }

  await applyImportPayload(payload);
  photos = await migrateExistingPhotosToWebp((await getAllPhotos()).map(normalizePhoto));
  event.target.value = "";
  render();
}

async function loadReferenceImport() {
  try {
    const payload = await fetchReferenceImport();
    await mergeReferencePayload(payload);
    if (payload.unmatched?.length) {
      alert(`Loaded matched reference photos. ${payload.unmatched.length} file(s) did not match a room name.`);
    }
  } catch (error) {
    alert("No Trade Me reference import file found. Run `node scripts/watch-trademe-photos.js --once` first.");
  }
}

function startReferenceAutoImport() {
  mergeLatestReferenceImport({ silent: true });
  window.setInterval(() => mergeLatestReferenceImport({ silent: true }), 6000);
}

async function mergeLatestReferenceImport({ silent = false } = {}) {
  try {
    const payload = await fetchReferenceImport();
    if (payload.generatedAt && payload.generatedAt === lastReferenceImportGeneratedAt) return;
    await mergeReferencePayload(payload);
  } catch (error) {
    if (!silent) throw error;
  }
}

async function fetchReferenceImport() {
  const response = await fetch(`${referenceImportPath}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("missing import file");
  return response.json();
}

async function mergeReferencePayload(payload) {
  await applyImportPayload(payload);
  lastReferenceImportGeneratedAt = payload.generatedAt || "";
  photos = await migrateExistingPhotosToWebp((await getAllPhotos()).map(normalizePhoto));
  render();
}

async function applyImportPayload(payload) {
  const merge = payload.importMode === "merge";
  if (!merge) {
    await clearPhotos();
  }

  for (const photo of payload.photos.map(normalizePhoto)) {
    await savePhoto(await ensureWebpPhoto(photo));
  }

  if (payload.statuses) {
    statuses = { ...loadStatuses(), ...payload.statuses };
    saveStatuses();
  }
}
