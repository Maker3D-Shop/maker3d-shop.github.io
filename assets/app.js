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
    selections?.length ? `Opções: ${selections.join(" • ")}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

function openWhats(product, selections) {
  const text = encodeURIComponent(buildWhatsMsg(product, selections));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
}

function showFatal(msg, err) {
  console.error("[MAKER3D]", msg, err || "");
  const target = $("#catalogGrid") || $(".container") || document.body;
  const box = document.createElement("div");
  box.className = "card";
  box.style.padding = "14px";
  box.style.margin = "12px 0";
  box.innerHTML = `
    <p style="margin:0 0 6px;font-weight:800;">Erro no catálogo</p>
    <p style="margin:0;opacity:.85;">${msg}</p>
    <p style="margin:8px 0 0;opacity:.7;font-size:12px;">
      Abra o Console (F12) pra ver detalhes.
    </p>
  `;
  target.prepend(box);
}

/* ---------- Card ---------- */
function productCard(p) {
  const img = p.image
    ? `<div class="thumb"><img src="${p.image}" alt="${p.name || ""}"></div>`
    : `<div class="thumb"></div>`;

  const dims = p.dimensions ? p.dimensions : "—";

  return `
  <article class="card product">
    ${img}
    <div class="pmeta">
      <div class="pmetaTop">
        <h3 class="pname">${p.name || ""}</h3>
        ${p.category ? `<span class="tag">${p.category}</span>` : ``}
      </div>

      ${p.description ? `<p class="pdesc">${String(p.description).replace(/\n/g, "<br>")}</p>` : ``}

      <div class="priceLine">
        <span class="price">${moneyBRL(p.price)}</span>
        <span class="small">${dims}</span>
      </div>

      <div class="pactions">
        <button class="btn ghost" data-open="${p.id}" type="button">Ver opções</button>
        <button class="btn primary" data-buy="${p.id}" type="button">Comprar</button>
      </div>
    </div>
  </article>`;
}

/* ---------- Modal mídia (Fotos/3D) ---------- */
function ensureMediaUI() {
  const textBlock = $("#mTextBlock");
  const viewer = $("#mViewer");
  if (!textBlock && !viewer) return null;

  let wrap = $("#mMediaWrap");
  if (wrap) return wrap;

  wrap = document.createElement("div");
  wrap.id = "mMediaWrap";
  wrap.className = "mediaWrap";
  wrap.innerHTML = `
    <div class="mediaTabs">
      <button class="mediaTab active" data-tab="photos" type="button">Fotos</button>
      <button class="mediaTab" data-tab="model" type="button">3D</button>
    </div>
    <div id="mPhotos" class="mediaPane">
      <img id="mPhotoMain" class="photoMain" alt="Foto do produto">
      <div id="mPhotoThumbs" class="photoThumbs"></div>
    </div>
    <div id="mModelPane" class="mediaPane" style="display:none;"></div>
  `;

  const left = textBlock?.parentElement || viewer?.parentElement || $(".modalLeft");
  left?.prepend(wrap);

  const modelPane = $("#mModelPane");
  if (viewer && modelPane) modelPane.appendChild(viewer);

  $$(".mediaTab", wrap).forEach((b) => (b.onclick = () => setActiveTab(b.dataset.tab)));

  return wrap;
}

function setActiveTab(tab) {
  const wrap = $("#mMediaWrap");
  if (!wrap) return;

  $$(".mediaTab", wrap).forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  const photos = $("#mPhotos");
  const modelPane = $("#mModelPane");
  if (photos) photos.style.display = tab === "photos" ? "" : "none";
  if (modelPane) modelPane.style.display = tab === "model" ? "" : "none";
}

function renderPhotos(gallery) {
  const main = $("#mPhotoMain");
  const thumbs = $("#mPhotoThumbs");
  if (!main || !thumbs) return;

  const imgs = (gallery || []).filter(Boolean);
  if (!imgs.length) {
    main.style.display = "none";
    thumbs.innerHTML = "";
    return;
  }

  main.style.display = "";
  main.src = imgs[0];

  thumbs.innerHTML = imgs
    .map(
      (src, i) => `
      <button class="thumbBtn ${i === 0 ? "active" : ""}" data-src="${src}" type="button">
        <img src="${src}" alt="thumb ${i + 1}">
      </button>
    `
    )
    .join("");

  thumbs.onclick = (e) => {
    const btn = e.target.closest(".thumbBtn");
    if (!btn) return;
    const src = btn.getAttribute("data-src");
    if (src) main.src = src;
    $$(".thumbBtn", thumbs).forEach((b) => b.classList.toggle("active", b === btn));
  };
}

/* ---------- Viewer look ---------- */
const presets = {
  bg_orange_model_white: {
    background: "rgba(255, 159, 28, 0.18)",
    filter: "grayscale(1) brightness(1.35) contrast(1.10)",
  },
};

function applyViewerPreset(viewer, presetName = "bg_orange_model_white") {
  if (!viewer) return;
  const p = presets[presetName] || presets.bg_orange_model_white;

  viewer.style.background = p.background;
  viewer.style.filter = p.filter;

  viewer.setAttribute("exposure", "0.9");
  viewer.setAttribute("shadow-intensity", "1");
  viewer.setAttribute("camera-controls", "");
  viewer.setAttribute("touch-action", "pan-y");
}

/* ---------- Drawer filtros ---------- */
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
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });

  const categories = [...new Set(allProducts.map((p) => p.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

  const chips = ["Tudo", ...categories];
  let active = "Tudo";

  function renderChips() {
    list.innerHTML = chips
      .map((c) => `<button class="filterChip ${c === active ? "active" : ""}" data-cat="${c}" type="button">${c}</button>`)
      .join("");
  }

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    active = btn.getAttribute("data-cat");
    renderChips();
    onFilterChange(active);
    close();
  });

  renderChips();
}

/* ---------- Modal ---------- */
function wireModal(productsById) {
  const modal = $("#modal");
  if (!modal) return;

  const closeAll = () => modal.classList.remove("open");

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAll();
    if (e.target.closest("[data-close]")) closeAll();
  });

  function setLeftPanelMode({ mode, modelUrl, gallery, textHtml }) {
    ensureMediaUI();
    const viewer = $("#mViewer");
    const textBlock = $("#mTextBlock");

    renderPhotos(gallery || []);

    if (mode === "model") {
      ensureModelViewer();
      if (viewer) {
        viewer.style.display = "";
        if (modelUrl) viewer.setAttribute("src", modelUrl);
        else viewer.removeAttribute("src");
        applyViewerPreset(viewer, "bg_orange_model_white");
      }
      if (textBlock) {
        textBlock.style.display = "none";
        textBlock.innerHTML = "";
      }
      setActiveTab("model");
      return;
    }

    if (viewer) {
      viewer.style.display = "none";
      viewer.removeAttribute("src");
    }
    if (textBlock) {
      textBlock.style.display = "";
      textBlock.innerHTML = textHtml || "";
    }
    setActiveTab("photos");
  }

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

    (product.options || []).forEach((opt) => {
      const first = (opt.values || [])[0];
      addSelect(wrap, opt.name, opt.values || [], (v) => setSelection(opt.name, v), first);
      if (first) setSelection(opt.name, first);
    });

    // ✅ aceita seu schema novo (modes/multiMaxColors)
    const cc = product.colorConfig;
    const palette = cc?.palette || [];
    if (!palette.length) return;

    const def = cc?.default || palette[0];
    const modes = Array.isArray(cc?.modes) && cc.modes.length ? cc.modes : ["solid"];
    const multiMaxColors = Math.max(2, Number(cc?.multiMaxColors || 2));

    let mode = cc?.defaultMode && modes.includes(cc.defaultMode) ? cc.defaultMode : (modes.includes("multi") ? "multi" : "solid");
    let qty = mode === "multi" ? Math.min(2, multiMaxColors) : 1;

    const colorWrap = document.createElement("div");
    wrap.appendChild(colorWrap);

    const clearColorSelections = () => {
      for (let i = selections.length - 1; i >= 0; i--) {
        if (
          selections[i].startsWith("Tipo de cor:") ||
          selections[i].startsWith("Qtd. cores:") ||
          selections[i].startsWith("Cor")
        ) selections.splice(i, 1);
      }
    };

    const renderColorPickers = () => {
      clearColorSelections();
      colorWrap.innerHTML = "";

      setSelection("Tipo de cor", mode === "multi" ? "Multicor" : "Sólida");
      if (mode === "multi") setSelection("Qtd. cores", String(qty));

      const count = mode === "multi" ? qty : 1;
      for (let i = 1; i <= count; i++) {
        const label = count === 1 ? "Cor" : `Cor ${i}`;
        addSelect(colorWrap, label, palette, (v) => setSelection(label, v), def);
        setSelection(label, def);
      }
    };

    if (modes.includes("solid") && modes.includes("multi")) {
      addSelect(
        wrap,
        "Tipo de cor",
        ["Sólida (1 cor)", `Multicor (até ${multiMaxColors})`],
        (v) => {
          mode = v.startsWith("Multi") ? "multi" : "solid";
          qty = mode === "multi" ? Math.min(2, multiMaxColors) : 1;
          renderCatalogExtra();
        },
        mode === "multi" ? `Multicor (até ${multiMaxColors})` : "Sólida (1 cor)"
      );
    }

    function renderCatalogExtra() {
      // remove seletor antigo de quantidade (recria simples)
      // (como o modal é reconstruído por clique, isso é suficiente)
      if (mode === "multi") {
        // cria um seletor de quantidade antes das cores
        const qtyWrap = document.createElement("div");
        colorWrap.parentElement.insertBefore(qtyWrap, colorWrap);

        addSelect(
          qtyWrap,
          "Quantidade de cores",
          Array.from({ length: multiMaxColors }, (_, i) => String(i + 1)),
          (v) => { qty = Math.max(1, Math.min(multiMaxColors, Number(v))); renderColorPickers(); },
          String(qty)
        );
      }
      renderColorPickers();
    }

    renderCatalogExtra();
  }

  window.openProductById = (id) => {
    const p = productsById.get(id);
    if (!p) return;

    $("#mTitle").textContent = p.name || "Produto";
    $("#mCategory").textContent = p.category || "";
    $("#mDesc").textContent = p.description || "";
    $("#mPrice").textContent = moneyBRL(p.price);

    const gallery = p.gallery && p.gallery.length ? p.gallery : p.image ? [p.image] : [];

    if (p.modelUrl) {
      setLeftPanelMode({ mode: "model", modelUrl: p.modelUrl, gallery });
    } else {
      setLeftPanelMode({ mode: "text", gallery, textHtml: `Sem visualização 3D — chama no WhatsApp.` });
    }

    const selections = [];
    renderOptions(p, selections);

    $("#mBuyInside").onclick = () => openWhats(p, selections.filter(Boolean));
    modal.classList.add("open");
  };

  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    if (open) window.openProductById(open.getAttribute("data-open"));
  });

  document.addEventListener("click", (e) => {
    const buy = e.target.closest("[data-buy]");
    if (!buy) return;
    const id = buy.getAttribute("data-buy");
    const p = productsById.get(id);
    if (!p) return;
    openWhats(p, []);
  });
}

/* ---------- Home Carousel ---------- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderHomeCarouselRandom4(products) {
  const track = $("#track");
  const dotsWrap = $("#dots");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const carousel = $("#carousel");
  if (!track || !dotsWrap) return;

  const chosen = shuffle(products).slice(0, 4);
  let idx = 0;
  let dir = 1;
  let timer = null;

  track.innerHTML = chosen.map((p) => `<div class="carouselSlide">${productCard(p)}</div>`).join("");
  dotsWrap.innerHTML = chosen.map((_, i) => `<button class="dot ${i === 0 ? "active" : ""}" type="button"></button>`).join("");

  const dots = $$(".dot", dotsWrap);

  const set = (i) => {
    idx = Math.max(0, Math.min(chosen.length - 1, i));
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("active", di === idx));
  };

  const tick = () => {
    if (chosen.length <= 1) return;
    let next = idx + dir;
    if (next >= chosen.length) { dir = -1; next = idx + dir; }
    if (next < 0) { dir = 1; next = idx + dir; }
    set(next);
  };

  const restart = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(tick, 4200);
  };

  dots.forEach((d, i) =>
    d.addEventListener("click", () => {
      dir = i > idx ? 1 : -1;
      set(i);
      restart();
    })
  );

  prevBtn?.addEventListener("click", () => { dir = -1; set(idx - 1); restart(); });
  nextBtn?.addEventListener("click", () => { dir = 1; set(idx + 1); restart(); });

  restart();
  carousel?.addEventListener("mouseenter", () => timer && clearInterval(timer));
  carousel?.addEventListener("mouseleave", restart);
}

/* ---------- Catálogo render ---------- */
function renderCatalogIntoGrid(products) {
  const grid = $("#catalogGrid");
  if (!grid) return;

  if (!products || !products.length) {
    grid.innerHTML = `<div class="card" style="padding:14px;">Nenhum item para mostrar.</div>`;
    return;
  }
  grid.innerHTML = products.map(productCard).join("");
}

function wireSearch(allProducts, getActiveCategory, onResult) {
  const input = $("#searchInput");
  const clear = $("#clearSearch");
  if (!input || !clear) return;

  function apply() {
    const q = (input.value || "").trim().toLowerCase();
    const cat = getActiveCategory();

    const filtered = allProducts.filter((p) => {
      const matchesCat = cat === "Tudo" || (p.category || "") === cat;
      if (!matchesCat) return false;
      if (!q) return true;
      const hay = `${p.name || ""} ${p.category || ""} ${p.description || ""}`.toLowerCase();
      return hay.includes(q);
    });

    onResult(filtered);
  }

  input.addEventListener("input", apply);
  clear.addEventListener("click", () => { input.value = ""; apply(); });

  apply();
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const productsAll = await loadProducts();

    const productsById = new Map(productsAll.map((p) => [p.id, p]));
    wireModal(productsById);

    // Home
    renderHomeCarouselRandom4(productsAll);

    // Catálogo
    let activeCategory = "Tudo";
    const getActiveCategory = () => activeCategory;

    wireDrawer(productsAll, (cat) => {
      activeCategory = cat;
      const q = ($("#searchInput")?.value || "").trim().toLowerCase();

      const filtered = productsAll.filter((p) => {
        const matchesCat = activeCategory === "Tudo" || (p.category || "") === activeCategory;
        if (!matchesCat) return false;
        if (!q) return true;
        const hay = `${p.name || ""} ${p.category || ""} ${p.description || ""}`.toLowerCase();
        return hay.includes(q);
      });

      renderCatalogIntoGrid(filtered);
    });

    wireSearch(productsAll, getActiveCategory, renderCatalogIntoGrid);

    if ($("#catalogGrid")) renderCatalogIntoGrid(productsAll);
  } catch (err) {
    showFatal(err?.message || "Falha ao carregar catálogo.", err);
  }
});
