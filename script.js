const DATA_URL = "links.json";

const state = {
  categories: [],
  activeFilter: "all",
  query: ""
};

const els = {
  search: document.getElementById("search"),
  filters: document.getElementById("filters"),
  results: document.getElementById("results"),
  status: document.getElementById("status"),
  empty: document.getElementById("empty"),
  clear: document.getElementById("clear")
};

// ---------- Loading ----------
async function init() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.categories = data.categories;
    buildFilters();
    render();
    els.status.textContent = `${countLinks()} free resources across ${state.categories.length} subjects.`;
  } catch (err) {
    console.error(err);
    els.status.textContent = "Our shelves are stuck. Try refreshing, or check that links.json is next to this page.";
    els.results.innerHTML = "";
  }
}

function countLinks() {
  return state.categories.reduce((n, c) => n + c.links.length, 0);
}

// ---------- Filters ----------
function buildFilters() {
  const options = [{ id: "all", name: "All" }, ...state.categories];
  els.filters.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (opt.id === state.activeFilter ? " is-active" : "");
    btn.textContent = opt.emoji ? `${opt.emoji} ${opt.name}` : opt.name;
    btn.dataset.id = opt.id;
    btn.addEventListener("click", () => {
      state.activeFilter = opt.id;
      document.querySelectorAll(".chip").forEach(c => c.classList.toggle("is-active", c.dataset.id === opt.id));
      render();
    });
    els.filters.appendChild(btn);
  });
}

// ---------- Search ----------
function matches(link, query) {
  if (!query) return true;
  const haystack = [link.name, link.description, link.level, ...(link.tags || [])]
    .join(" ")
    .toLowerCase();
  return query.split(/\s+/).every(word => haystack.includes(word));
}

// ---------- Cards ----------
const DUST_COLORS = ["#ef476f", "#ffd166", "#06a77d", "#4a3cc7", "#8f8aa8"];
const rand = (min, max) => min + Math.random() * (max - min);

function makeCard(link, i) {
  const card = document.createElement("article");
  card.className = "card" + (link.featured ? " featured" : "");
  card.style.animationDelay = `${i * 60}ms`;
  card.innerHTML = `
    <h3>${link.featured ? '<span class="star" title="Top pick" aria-label="Top pick">★</span>' : ""}<a href="${link.url}" target="_blank" rel="noopener">${link.name}</a></h3>
    <p>${link.description}</p>
    <div class="meta">
          ${link.goat ? '<span class="pill goat">GOAT 🐐</span>' : ""}
      ${link.price ? `<span class="pill price price-${link.price.toLowerCase()}">${link.price}</span>` : ""}
      ${link.level ? `<span class="pill level">${link.level}</span>` : ""}
      ${(link.tags || []).map(t => `<span class="pill tag">${t}</span>`).join("")}
    </div>
  `;

  // Dust grains used by the Thanos effect
  const dustLayer = document.createElement("div");
  dustLayer.className = "dust";
  card._dust = [];
  for (let k = 0; k < 120; k++) {
    const dot = document.createElement("span");
    dot.className = "dust-dot";
    const size = rand(1, 3);
    dot.style.left = `${rand(0, 100)}%`;
    dot.style.top = `${rand(0, 100)}%`;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.background = DUST_COLORS[k % DUST_COLORS.length];
    dot.dx = rand(-90, 90);
    dot.dy = rand(-160, -30);
    dot.delay = rand(0, 0.4);
    dot.phase = rand(0, Math.PI * 2);
    dot.maxOpacity = rand(0.5, 1);
    dustLayer.appendChild(dot);
    card._dust.push(dot);
  }
  card.appendChild(dustLayer);

  // Hover effects
  card.addEventListener("pointerenter", () => focusCard(card));
  card.addEventListener("pointermove", e => tilt(card, e));
  card.addEventListener("pointerleave", () => {
    untilt(card);
    unfocusCards();
  });

  return card;
}

// ---------- Telephoto focus + flat tilt ----------
const TILT_MAX = 12; // small angles, so the card stays nearly flat

function focusCard(card) {
  if (reduceMotion) return;
  document.body.classList.add("telephoto");
}

function unfocusCards() {
  document.body.classList.remove("telephoto");
}

function tilt(card, e) {
  if (reduceMotion || e.pointerType === "touch") return;

  const r = card.getBoundingClientRect();
  const px = clamp01((e.clientX - r.left) / r.width);
  const py = clamp01((e.clientY - r.top) / r.height);

  // A very long perspective flattens the card, like a telephoto lens
  const rx = (0.5 - py) * 2 * TILT_MAX;
  const ry = (px - 0.5) * 2 * TILT_MAX;

  card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
  card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
}

function untilt(card) {
  card.style.transform = "";
  card.style.setProperty("--mx", "50%");
  card.style.setProperty("--my", "50%");
}

// ---------- Top picks ----------
function renderTopPicks(q) {
  const box = document.getElementById("top-picks");
  const grid = document.getElementById("top-cards");
  grid.innerHTML = "";

  const cats = state.activeFilter === "all" ? state.categories : [];
  const picks = cats.flatMap(cat => cat.links.filter(link => link.featured && matches(link, q)));

  box.hidden = picks.length === 0;
  picks.forEach((link, i) => grid.appendChild(makeCard(link, i)));
}

// ---------- Render ----------
function render() {
  const q = state.query.trim().toLowerCase();
  els.results.innerHTML = "";
  let total = 0;

  renderTopPicks(q);

  state.categories
    .filter(cat => state.activeFilter === "all" || cat.id === state.activeFilter)
    .forEach(cat => {
      const shown = cat.links
        .filter(link => matches(link, q))
        .sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

      if (shown.length === 0) return;
      total += shown.length;

      const section = document.createElement("section");
      section.className = `subject subject-${cat.id}`;
      section.innerHTML = `
        <h2 class="category-head">
          <span class="subject-icon" aria-hidden="true">${cat.emoji || ""}</span>
          ${cat.name}
          <span class="count">${shown.length}</span>
        </h2>
        <div class="cards"></div>
      `;

      const grid = section.querySelector(".cards");
      shown.forEach((link, i) => grid.appendChild(makeCard(link, i)));

      els.results.appendChild(section);
    });

  els.empty.hidden = total > 0;
  requestSnap();
}

// ---------- Thanos snap (scroll-linked) ----------
const BAND = 140;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp01 = v => Math.min(1, Math.max(0, v));
let snapQueued = false;

function requestSnap() {
  if (reduceMotion || snapQueued) return;
  snapQueued = true;
  requestAnimationFrame(updateSnap);
}

function updateSnap() {
  snapQueued = false;
  const vh = window.innerHeight;

  document.querySelectorAll(".card").forEach(card => {
    const r = card.getBoundingClientRect();
    const pTop = clamp01((BAND - r.bottom) / BAND);
    const pBot = clamp01((r.top - (vh - BAND)) / BAND);
    const p = Math.max(pTop, pBot);
    applySnap(card, p, pTop > pBot ? -1 : 1);
  });
}

function applySnap(card, p, dir) {
  if (p <= 0.001) {
    if (card._snapped) {
      card.style.opacity = "";
      card.style.filter = "";
      card.style.translate = "";
      card.style.scale = "";
      card._dust.forEach(d => (d.style.opacity = "0"));
      card._snapped = false;
    }
    return;
  }

  card._snapped = true;

  // The card itself softly fades and blurs away
  card.style.opacity = String(Math.max(0, 1 - Math.pow(p, 1.3) * 1.1));
  card.style.filter = `blur(${(p * 4).toFixed(2)}px)`;
  card.style.translate = `0 ${(-p * 20 * dir).toFixed(1)}px`;
  card.style.scale = (1 - p * 0.04).toFixed(3);

  // Each grain starts moving at a slightly different moment, so the cloud spreads out
  card._dust.forEach(d => {
    const local = clamp01(p * 1.4 - d.delay);
    const fade = Math.sin(Math.min(1, local) * Math.PI);
    const sway = Math.sin(local * 6 + d.phase) * 6;
    d.style.opacity = (fade * d.maxOpacity).toFixed(3);
    d.style.transform = `translate(${(d.dx * local + sway).toFixed(1)}px, ${(d.dy * local).toFixed(1)}px)`;
  });
}

window.addEventListener("scroll", requestSnap, { passive: true });
window.addEventListener("resize", requestSnap);

// ---------- Search input ----------
let timer;
els.search.addEventListener("input", e => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    state.query = e.target.value;
    render();
  }, 150);
});

els.clear.addEventListener("click", () => {
  els.search.value = "";
  state.query = "";
  render();
  els.search.focus();
});

// ---------- Dark mode pull-cord ----------
const darkToggle = document.getElementById("darkToggle");
const THEME_KEY = "studyhub-dark";

if (darkToggle) {
  const applyTheme = isDark => {
    document.body.classList.toggle("dark", isDark);
    darkToggle.setAttribute("aria-pressed", String(isDark));
    darkToggle.dataset.tip = isDark
      ? "Click to turn off dark mode"
      : "Click to turn on dark mode";
  };

  let savedDark = false;
  try {
    savedDark = localStorage.getItem(THEME_KEY) === "true";
  } catch (e) {}
  applyTheme(savedDark);

  darkToggle.addEventListener("click", () => {
    const next = !document.body.classList.contains("dark");

    darkToggle.classList.remove("is-pulling");
    void darkToggle.offsetWidth;
    darkToggle.classList.add("is-pulling");

    setTimeout(() => applyTheme(next), 180);

    try {
      localStorage.setItem(THEME_KEY, String(next));
    } catch (e) {}
  });

  darkToggle.addEventListener("animationend", () => {
    darkToggle.classList.remove("is-pulling");
  });
}

init();
