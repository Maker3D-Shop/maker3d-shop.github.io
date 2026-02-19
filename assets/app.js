// Maker3D Shop - app.js (home + catálogo + modal + cores multi-partes)
// Ajuste seguro (compatível com seu HTML/CSS atual)

const WHATSAPP_NUMBER = "5531984566047";

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];

function moneyBRL(v) {
  if (v === null || v === undefined) return "Sob consulta";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  } catch {
    return `R$ ${v}`;
  }
}

function ensureModelViewer() {
  if (window.customElements && window.customElements.get("model-viewer")) return;
  const s = document.createElement("script");
  s.type = "module";
  s.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
  document.head.appendChild(s);
}

async function loadProducts() {
  const r = await fetch("assets/products.json", { cache: "no-store" });
  if (!r.ok) throw new Error(`products.json não carregou (HTTP ${r.status})`);
  const data = await r.json();
  if (!Array.isArray(data)) throw new Error("products.json precisa ser um ARRAY []");
  return data;
}

function buildWhatsMsg(product, selections) {
  const lines = [
    `Olá! Quero: ${product.name}`,
    product.category ? `Categoria: ${product.category}` : null,
    product.price != null ? `Preço: ${moneyBRL(product.price)}` : "Preço: sob consulta",
    selections?.length ? `Opções:\n- ${selections.join("\n- ")}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

function openWhats(product, selections) {
  const text = encodeURIComponent(buildWhatsMsg(product, selections));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
}

/* ---------------- Card (compatível com style.css) ---------------- */
function productCard(p) {
  const img = p.image
    ? `<div class="thumb"><img src="${p.image}" alt="${p.name || ""}" loading="lazy" /></div>`
    : `<div class="thumb"><div class="thumbPh">Sem foto</div></div>`;

  const desc = (p.description || "").trim();
  const dims = (p.dimensions || "").trim();

  return `
  <article class="card product">
    ${img}

    <div class="pmeta">
      <div class="pmetaTop">
        <h3 class="pname">${p.name || ""}</h3>
        ${p.category ? `<span class="tag">${p.category}</span>` : ``}
      </div>

      ${desc ? `<p class="pdesc">${String(desc).replace(/\n/g, "<br>")}</p>` : ``}

      <div class="priceLine">
        <span class="price">${moneyBRL(p.price)}</span>
        ${dims ? `<span class="small">${dims}</span>` : ``}
      </div>

      <div class="pactions">
        <button class="btn ghost" type="button" data-open="${p.id}">Ver opções</button>
        <button class="btn" type="button" data-buy="${p.id}">Comprar</button>
      </div>
    </div>
  </article>`;
}

/* ---------------- Drawer (Catálogo) ---------------- */
function wireDrawer(allProducts, onFilterChange) {
  const backdrop = $("#drawerBackdrop");
  const openBtn = $("#openDrawer");
  const closeBtn = $("#closeDrawer");
  const list = $("#filterList");
  if (!backdrop || !openBtn || !closeBtn || !list) return;

  const open = () => backdrop.classList.add("open");
  const close = () => backdrop.classList.remove("open");

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  const categories = [...new Set(allProducts.map((p) => p.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

  const chips = ["Tudo", ...categories];
  let active = "Tudo";

  function renderChips() {
    list.innerHTML = chips
      .map(
        (c) => `<button class="filterChip ${c === active ? "active" : ""}" type="button" data-cat="${c}">${c}</button>`
      )
      .join("");
  }

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    active = btn.getAttribute("data-cat") || "Tudo";
    renderChips();
    onFilterChange(active);
    close();
  });

  renderChips();
}

/* ---------------- Search (Catálogo) ---------------- */
function wireSearch(getCurrentItems, onSearchChange) {
  const input = $("#searchInput");
  const clearBtn = $("#clearSearch");
  if (!input || !clearBtn) return;

  const apply = () => {
    const q = (input.value || "").trim().toLowerCase();
    const items = getCurrentItems();
    if (!q) return onSearchChange(items);

    const filtered = items.filter((p) => {
      const hay = `${p.name || ""} ${p.category || ""} ${p.description || ""}`.toLowerCase();
      return hay.includes(q);
    });
    onSearchChange(filtered);
  };

  input.addEventListener("input", apply);
  clearBtn.addEventListener("click", () => {
    input.value = "";
    apply();
    input.focus();
  });
}

/* ---------------- Modal (Opções + Cores multicor com partes) ---------------- */
function wireModal(productsById) {
  const modalBackdrop = $("#modalBackdrop");
  if (!modalBackdrop) return;

  const closeAll = () => modalBackdrop.classList.remove("open");
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeAll();
    if (e.target.closest("[data-close]")) closeAll();
  });

  function addSelect(wrap, labelText, values, onChange, initialValue) {
    const label = document.createElement("p");
    label.className = "small";
    label.style.fontWeight = "800";
    label.style.margin = "0 0 6px";
    label.textContent = labelText;

    const sel = document.createElement("select");
    sel.className = "select";

    (values || []).forEach((v) => {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      sel.appendChild(o);
    });

    if (initialValue != null) sel.value = initialValue;

    sel.addEventListener("change", () => onChange(sel.value));

    wrap.appendChild(label);
    wrap.appendChild(sel);

    const spacer = document.createElement("div");
    spacer.style.height = "10px";
    wrap.appendChild(spacer);

    return sel;
  }

  function renderOptions(product, selections) {
    const wrap = $("#mOptions");
    if (!wrap) return;
    wrap.innerHTML = "";

    const setSelection = (key, value) => {
      const prefix = key + ":";
      const idx = selections.findIndex((s) => s.startsWith(prefix));
      const txt = `${key}: ${value}`;
      if (idx >= 0) selections[idx] = txt;
      else selections.push(txt);
    };

    const clearSelectionsByPrefix = (prefixes) => {
      for (let i = selections.length - 1; i >= 0; i--) {
        if (prefixes.some((p) => selections[i].startsWith(p))) selections.splice(i, 1);
      }
    };

    // 1) Opções normais
    (product.options || []).forEach((opt) => {
      const first = (opt.values || [])[0];
      addSelect(wrap, opt.name, opt.values || [], (v) => setSelection(opt.name, v), first);
      if (first != null) setSelection(opt.name, first);
    });

    // 2) Cores
    const cc = product.colorConfig;
    const palette = cc?.palette || [];
    if (!palette.length) return;

    const def = cc?.default || palette[0];
    const legacyIsMulti = !!cc?.multicolor;

    const modes =
      Array.isArray(cc?.modes) && cc.modes.length
        ? cc.modes
        : legacyIsMulti
        ? ["solid", "multi"]
        : ["solid"];

    let mode =
      cc?.defaultMode && modes.includes(cc.defaultMode)
        ? cc.defaultMode
        : modes.includes("multi")
        ? "multi"
        : "solid";

    const rawMultiMax = cc?.multiMaxColors ?? cc?.multimaxcolors ?? cc?.maxColors ?? (legacyIsMulti ? 2 : 1);
    let multiMax = Number(rawMultiMax);
    if (!Number.isFinite(multiMax)) multiMax = 2;
    multiMax = Math.max(2, Math.min(8, Math.floor(multiMax)));

    const parts = Array.isArray(cc?.multiParts) ? cc.multiParts.filter(Boolean) : [];

    const colorSection = document.createElement("div");
    wrap.appendChild(colorSection);

    const rerenderColors = () => {
      colorSection.innerHTML = "";
      clearSelectionsByPrefix([
        "Tipo de cor:",
        "Cor 1:",
        "Cor 2:",
        "Cor 3:",
        "Cor 4:",
        "Cor 5:",
        "Cor 6:",
        "Cor 7:",
        "Cor 8:",
      ]);

      // seletor de modo (se existir solid e multi)
      if (modes.includes("solid") && modes.includes("multi")) {
        addSelect(
          colorSection,
          "Tipo de cor",
          ["Sólida (1 cor)", `Multicor (até ${multiMax})`],
          (v) => {
            mode = v.startsWith("Multi") ? "multi" : "solid";
            rerenderColors();
          },
          mode === "multi" ? `Multicor (até ${multiMax})` : "Sólida (1 cor)"
        );
      }

      setSelection("Tipo de cor", mode === "multi" ? "Multicor" : "Sólida");

      const count = mode === "multi" ? (parts.length ? Math.min(parts.length, multiMax) : multiMax) : 1;

      for (let i = 1; i <= count; i++) {
        const key = `Cor ${i}`; // ✅ sempre salva como Cor 1 / Cor 2 / Cor 3...
        const label = parts[i - 1] ? `${key} — ${parts[i - 1]}` : key;

        addSelect(colorSection, label, palette, (v) => setSelection(key, v), def);
        setSelection(key, def);
      }
    };

    rerenderColors();
  }

  window.openProductById = (id) => {
    const p = productsById.get(id);
    if (!p) return;

    $("#mTitle").textContent = p.name || "Produto";
    $("#mCategory").textContent = p.category || "";
    $("#mDesc").textContent = p.description || "";
    $("#mPrice").textContent = moneyBRL(p.price);

    const dimEl = $("#mDim");
    const dims = (p.dimensions || "").trim();
    if (dimEl) {
      dimEl.textContent = dims;
      dimEl.style.display = dims ? "" : "none";
    }

    const viewer = $("#mViewer");
    const textBlock = $("#mTextBlock");

    if (p.modelUrl && viewer) {
      ensureModelViewer();
      viewer.style.display = "";
      viewer.setAttribute("src", p.modelUrl);
      viewer.setAttribute("camera-controls", "");
      viewer.setAttribute("touch-action", "pan-y");
      if (textBlock) textBlock.textContent = "Arraste para girar / dê zoom com o mouse.";
    } else {
      if (viewer) {
        viewer.style.display = "none";
        viewer.removeAttribute("src");
      }
      if (textBlock) textBlock.textContent = "";
    }

    const selections = [];
    renderOptions(p, selections);

    const buyInside = $("#mBuyInside");
    if (buyInside) buyInside.onclick = () => openWhats(p, selections.filter(Boolean));

    modalBackdrop.classList.add("open");
  };
}

/* ---------------- Home Carousel (4 itens) ---------------- */
function renderHomeCarouselRandom4(products) {
  const track = $("#track");
  const dotsWrap = $("#dots");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  if (!track || !dotsWrap) return;

  const shuffled = [...products].sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, Math.min(4, shuffled.length));

  let idx = 0;

  track.innerHTML = chosen
    .map(
      (p) => `
    <div class="carouselSlide">
      ${productCard(p)}
    </div>`
    )
    .join("");

  dotsWrap.innerHTML = chosen
    .map(
      (_, i) =>
        `<button class="dot ${i === 0 ? "active" : ""}" type="button" aria-label="Ir para ${i + 1}" data-i="${i}"></button>`
    )
    .join("");

  function apply() {
    track.style.transform = `translateX(${-idx * 100}%)`;
    $$(".dot", dotsWrap).forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  dotsWrap.addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (!b) return;
    idx = Number(b.getAttribute("data-i")) || 0;
    apply();
  });

  const prev = () => {
    idx = (idx - 1 + chosen.length) % chosen.length;
    apply();
  };

  const next = () => {
    idx = (idx + 1) % chosen.length;
    apply();
  };

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  apply();
}

/* ---------------- Main ---------------- */
(async function main() {
  try {
    const all = await loadProducts();
    const productsById = new Map(all.map((p) => [p.id, p]));

    // Home carousel (se existir)
    renderHomeCarouselRandom4(all);

    // Catálogo grid (se existir)
    const catalogGrid = $("#catalogGrid");
    let currentCategory = "Tudo";
    let categoryFiltered = all;

    const renderGrid = (items) => {
      if (!catalogGrid) return;
      catalogGrid.innerHTML = items.map(productCard).join("");
    };

    if (catalogGrid) {
      renderGrid(all);

      wireDrawer(all, (cat) => {
        currentCategory = cat;
        categoryFiltered = currentCategory === "Tudo" ? all : all.filter((p) => p.category === currentCategory);
        renderGrid(categoryFiltered);

        // re-aplica busca atual
        const input = $("#searchInput");
        if (input && input.value.trim()) {
          const q = input.value.trim().toLowerCase();
          const filtered = categoryFiltered.filter((p) =>
            `${p.name || ""} ${p.category || ""} ${p.description || ""}`.toLowerCase().includes(q)
          );
          renderGrid(filtered);
        }
      });

      wireSearch(
        () => categoryFiltered,
        (items) => renderGrid(items)
      );
    }

    // Modal
    wireModal(productsById);

    // Click handlers (home + catálogo)
    document.addEventListener("click", (e) => {
      const btnOpen = e.target.closest("[data-open]");
      const btnBuy = e.target.closest("[data-buy]");

      if (btnOpen) {
        const id = btnOpen.getAttribute("data-open");
        if (id) window.openProductById?.(id);
      }

      if (btnBuy) {
        const id = btnBuy.getAttribute("data-buy");
        const p = productsById.get(id);
        if (p) openWhats(p, []);
      }
    });

    // Abrir via URL ?p=ID
    const url = new URL(window.location.href);
    const pid = url.searchParams.get("p");
    if (pid && productsById.has(pid)) {
      setTimeout(() => window.openProductById(pid), 50);
    }
  } catch (err) {
    console.error("[MAKER3D] Falha ao iniciar:", err);
    const target = $(".container") || document.body;
    const box = document.createElement("div");
    box.className = "card";
    box.style.padding = "14px";
    box.style.margin = "12px 0";
    box.innerHTML = `
      <div style="font-weight:900;margin-bottom:6px">Erro</div>
      <div class="small" style="opacity:.85">Falha ao iniciar catálogo.</div>
      <div class="small" style="opacity:.85;margin-top:6px">${String(err?.message || err)}</div>
    `;
    target.prepend(box);
  }
})();
