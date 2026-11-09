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
      ${link.price ? `<span class="pill price price-${link.price.toLowerCase()}">${link.price}</span>` : ""}
      ${link.level ? `<span class="pill level">${link.level}</span>` : ""}
