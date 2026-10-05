// Wait for DOM and data to be ready
document.addEventListener("DOMContentLoaded", function () {
  // Fail loudly and visibly if a dependency didn't load
  if (typeof L === "undefined") {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p style="padding:12px;background:#ffe3e3;color:#c92a2a">Map library (Leaflet) failed to load. Check your internet connection.</p>'
    );
    return;
  }
  if (
    typeof NEIGHBORHOODS === "undefined" ||
    typeof HAZARDS === "undefined" ||
    typeof ROUTES === "undefined" ||
    typeof CHECKLIST === "undefined" ||
    typeof SEED === "undefined"
  ) {
    console.error("Data not loaded. Check that data.js is loaded before app.js");
    return;
  }

  const $ = s => document.querySelector(s);
  const esc = s =>
    String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const map = L.map("map", { zoomControl: false }).setView([37.225, -121.85], 12);
  L.control.zoom({ position: "bottomright" }).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const group = {};

  L.layerGroup(
    NEIGHBORHOODS.map(n =>
      L.polygon(n.poly, {
        color: "#495057",
        weight: 1.5,
        dashArray: "4",
        fillOpacity: 0.03
      }).bindTooltip(n.name, { sticky: true })
    )
  ).addTo(map);

  for (const [k, h] of Object.entries(HAZARDS)) {
    group[k] = L.layerGroup(
      h.polys.map(p =>
        L.polygon(p, {
          color: h.color,
          weight: 2,
          fillOpacity: 0.25
        }).bindPopup(`<b>${esc(h.label)}</b><br><small>${esc(h.src)}</small>`)
      )
    );
  }

  group.routes = L.layerGroup();
  ROUTES.forEach(r => {
    L.polyline(r.pts, { color: "#fff", weight: 9, opacity: 0.9 }).addTo(group.routes);
    L.polyline(r.pts, { color: "#2b8a3e", weight: 5, className: "route-flow" })
      .bindPopup(`<b>${esc(r.name)}</b><br><small>Illustrative route. Assembly: ${esc(r.assembly)}</small>`)
      .addTo(group.routes);
    L.circleMarker(r.pts[r.pts.length - 1], {
      radius: 7,
      color: "#fff",
      fillColor: "#2b8a3e",
      fillOpacity: 1,
      weight: 2
    })
      .bindTooltip("Exit: " + r.assembly)
      .addTo(group.routes);
  });

  function toggle(k, on) {
    if (!group[k]) return;
    if (on) group[k].addTo(map);
    else map.removeLayer(group[k]);
    const c = document.querySelector(`[data-layer="${k}"]`);
    if (c) c.checked = on;
  }

  document.querySelectorAll("[data-layer]").forEach(c => {
    c.onchange = () => toggle(c.dataset.layer, c.checked);
  });

  // Sensible defaults so the map isn't empty on first load
  toggle("routes", true);
  toggle("wildfire", true);
  toggle("quake", true);
  toggle("liquefaction", true);

  // Ray-casting point-in-polygon. Points are [lat, lng].
  function inPoly(p, poly) {
    let ins = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [a, b] = poly[i];
      const [c, d] = poly[j];
      if (b > p[1] !== d > p[1] && p[0] < ((c - a) * (p[1] - b)) / (d - b) + a) {
        ins = !ins;
      }
    }
    return ins;
  }

  // Approx km distance at San Jose's latitude
  const dist = (a, b) => Math.hypot((a[0] - b[0]) * 111, (a[1] - b[1]) * 88);

  function routeDist(pt, r) {
    let min = Infinity;
    for (let i = 0; i < r.pts.length - 1; i++) {
      for (let t = 0; t <= 10; t++) {
        const q = [
          r.pts[i][0] + ((r.pts[i + 1][0] - r.pts[i][0]) * t) / 10,
          r.pts[i][1] + ((r.pts[i + 1][1] - r.pts[i][1]) * t) / 10
        ];
        min = Math.min(min, dist(pt, q));
      }
    }
    return min;
  }

  let pin;

  async function search(e) {
    e.preventDefault();
    const q = $("#addr").value.trim();
    if (!q) return;

    const out = $("#result");
    out.innerHTML = '<p class="muted">Searching...</p>';

    try {
      const url =
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1&viewbox=-122.05,37.4,-121.7,37.1&q=" +
        encodeURIComponent(q + ", San Jose, CA");

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const r = await res.json();

      if (!r.length) {
        out.innerHTML = '<p class="warn">Address not found in San Jose. Try adding a street number.</p>';
        return;
      }

      show([+r[0].lat, +r[0].lon], r[0].display_name.split(",").slice(0, 3).join(","));
    } catch (err) {
      console.error("Search error:", err);
      out.innerHTML = '<p class="warn">Lookup failed. Check your internet connection and try again.</p>';
    }
  }

  function show(pt, label) {
    if (pin) map.removeLayer(pin);
    pin = L.marker(pt).addTo(map).bindPopup(esc(label)).openPopup();
    map.flyTo(pt, 14);

    const nb = NEIGHBORHOODS.find(n => inPoly(pt, n.poly));
    const hits = Object.entries(HAZARDS).filter(([, h]) => h.polys.some(p => inPoly(pt, p)));

    hits.forEach(([k]) => toggle(k, true));
    toggle("routes", true);

    const near = ROUTES.map(r => ({ r, d: routeDist(pt, r) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);

    $("#result").innerHTML = `
      <div class="card">
        <b>${esc(label)}</b>
        <div class="muted">${nb ? esc(nb.name) : "Outside D10 prototype coverage"}</div>
        <h4>Risk exposure</h4>
        ${
          hits.length
            ? hits.map(([, h]) => `<span class="chip" style="background:${h.color}">${esc(h.label)}</span>`).join("")
            : '<p class="muted">Not inside a mapped high-risk zone in this prototype.</p>'
        }
        <h4>Nearest evacuation routes</h4>
        ${near.map(n => `<div class="route">${esc(n.r.name)}<span>${n.d.toFixed(1)} km</span></div>`).join("")}
        ${nb ? `<button class="btn" data-goto="${esc(nb.name)}">Start my preparedness check</button>` : ""}
      </div>
    `;

    const goBtn = $("[data-goto]");
    if (goBtn) goBtn.onclick = () => window.goCheck(goBtn.dataset.goto);
  }

  const searchForm = $("#search");
  if (searchForm) searchForm.onsubmit = search;

  // ---------- Tabs ----------
  function tab(n) {
    document.querySelectorAll(".tab").forEach(t => {
      t.hidden = t.id !== "tab-" + n;
    });
    document.querySelectorAll("nav button").forEach(b => {
      b.classList.toggle("on", b.dataset.tab === n);
    });
    if (n === "map") setTimeout(() => map.invalidateSize(), 0);
  }

  document.querySelectorAll("nav button").forEach(b => (b.onclick = () => tab(b.dataset.tab)));

  // ---------- Checklist state (safe against bad/blocked localStorage) ----------
  const DEFAULT_STATE = { hood: NEIGHBORHOODS[0].name, done: {} };
  let st;
  try {
    st = JSON.parse(localStorage.getItem("bready")) || { ...DEFAULT_STATE };
  } catch (err) {
    st = { ...DEFAULT_STATE };
  }
  if (!st.done || typeof st.done !== "object") st.done = {};
  if (!NEIGHBORHOODS.some(n => n.name === st.hood)) st.hood = DEFAULT_STATE.hood;

  const save = () => {
    try {
      localStorage.setItem("bready", JSON.stringify(st));
    } catch (err) {
      /* storage unavailable (private mode); app still works for this session */
    }
  };

  const hoodSelect = $("#hood");
  if (hoodSelect) {
    hoodSelect.innerHTML = NEIGHBORHOODS.map(n => `<option>${esc(n.name)}</option>`).join("");
  }

  window.goCheck = function (h) {
    st.hood = h;
    save();
    render();
    tab("check");
  };

  function pct() {
    const total = CHECKLIST.length || 1;
    const done = CHECKLIST.filter(item => st.done[item.id]).length;
    return Math.round((done / total) * 100);
  }

  function renderSummary() {
    const p = pct();
    const meBar = $("#me");
    const mePct = $("#mepct");
    if (meBar) meBar.style.width = p + "%";
    if (mePct) mePct.textContent = p + "%";

    const rows = NEIGHBORHOODS.map(n => {
      const s = SEED[n.name] || { n: 0, sum: 0 };
      const me = n.name === st.hood && p > 0;
      const count = s.n + (me ? 1 : 0);
      return {
        n: n.name,
        v: count ? Math.round((s.sum + (me ? p : 0)) / count) : 0,
        you: me
      };
    }).sort((a, b) => b.v - a.v);

    const board = $("#board");
    if (board) {
      board.innerHTML = rows
        .map(
          (r, i) =>
            `<div class="lb">
          <span>${i + 1}. ${esc(r.n)}${r.you ? " <em>(includes you)</em>" : ""}</span>
          <div class="bar"><i style="width:${r.v}%"></i></div>
          <b>${r.v}%</b>
        </div>`
        )
        .join("");
    }
  }

  function renderChecklist() {
    const groups = {};
    CHECKLIST.forEach(item => {
      (groups[item.category] = groups[item.category] || []).push(item);
    });

    const itemsDiv = $("#items");
    if (itemsDiv) {
      itemsDiv.innerHTML = Object.entries(groups)
        .map(
          ([category, items]) => `
        <div class="check-group">
          <h3>${esc(category)}</h3>
          ${items
            .map(
              item => `
            <label class="item">
              <input type="checkbox" data-id="${esc(item.id)}" ${st.done[item.id] ? "checked" : ""}>
              <div>
                <b>${esc(item.title)}</b>
                <br>
                <small>${esc(item.desc)}</small>
              </div>
            </label>
          `
            )
            .join("")}
        </div>
      `
        )
        .join("");

      itemsDiv.querySelectorAll("input").forEach(input => {
        input.onchange = () => {
          st.done[input.dataset.id] = input.checked;
          save();
          renderSummary(); // no full re-render needed; avoids losing focus/scroll
        };
      });
    }

    renderSummary();
  }

  function render() {
    if (hoodSelect) hoodSelect.value = st.hood;
    renderChecklist();
  }

  if (hoodSelect) {
    hoodSelect.onchange = e => {
      st.hood = e.target.value;
      save();
      render();
    };
  }

  tab("map");
  render();
});
