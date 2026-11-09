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

// Load the data file, with friendly fallbacks for loading and failure
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

// Build a chip for each subject, plus "All"
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

// Match a link against the search query (name, description, level, tags)
function matches(link, query) {
  if (!query) return true;
  const haystack = [link.name, link.description, link.level, ...(link.tags || [])]
    .join(" ")
    .toLowerCase();
  return query.split(/\s+/).every(word => haystack.includes(word));
}

function render() {
  const q = state.query.trim().toLowerCase();
  els.results.innerHTML = "";
  let total = 0;

  state.categories
    .filter(cat => state.activeFilter === "all" || cat.id === state.activeFilter)
    .forEach(cat => {
      const shown = cat.links.filter(link => matches(link, q));
      if (shown.length === 0) return;
      total += shown.length;

      const section = document.createElement("section");
      section.innerHTML = `
        <h2 class="category-head">
          <span aria-hidden="true">${cat.emoji || ""}</span>
          ${cat.name}
          <span class="count">${shown.length}</span>
        </h2>
        <div class="cards"></div>
      `;

      const grid = section.querySelector(".cards");
      shown.forEach((link, i) => {
        const card = document.createElement("article");
        card.className = "card";
        card.style.animationDelay = `${i * 60}ms`;
        card.innerHTML = `
          <h3><a href="${link.url}" target="_blank" rel="noopener">${link.name}</a></h3>
          <p>${link.description}</p>
          <div class="meta">
            ${link.level ? `<span class="pill level">${link.level}</span>` : ""}
            ${(link.tags || []).map(t => `<span class="pill tag">${t}</span>`).join("")}
          </div>
        `;
        grid.appendChild(card);
      });

      els.results.appendChild(section);
    });

  els.empty.hidden = total > 0;
}

// Debounce typing so we don't re-render on every keystroke
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

init();