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
  const target = $("#catalogGrid") || $("#track") || $(".container") || document.body;
  const box = document.createElement("div");
  box.className = "card";
  box.style.padding = "14px";
  box.style.margin = "12px 0";
  box.innerHTML = `
    <div style="font-weight:900;margin-bottom:6px">Erro</div>
    <div class="small" style="opacity:.85">${msg}</div>
  `;
  target.prepend(box);
}

/* ---------------- Utils ---------------- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------------- Card ---------------- */
function productCard(p) {
  const img = p.image
    ? `
    <div class="thumb">
      <img src="${p.image}" alt="${p.name || ""}" loading="lazy"/>
    </div>`
    : `
    <div class="thumb">
      <div class="thumbPh">Sem foto</div>
    </div>`;

  const dims = (p.dimensions || "").trim();

  return `
  <article class="card product">
    ${img}
    <div class="pBody">
      <div class="pTop">
        <h3 class="pName">${p.name || ""}</h3>
        ${p.category ? `<div class="chip">${p.category}</div>` : ``}
      </div>

      ${p.description ? `<div class="pDesc">${String(p.description).replace(/\n/g, "<br>")}</div>` : ``}

      <div class="pMeta">
        <div class="pPrice">${moneyBRL(p.price)}</div>
        ${dims ? `<div class="pDim small">${dims}</div>` : ``}
      </div>

      <div class="pActions">
        <button class="btn ghost" data-open="${p.id}">Ver opções</button>
        <button class="btn" data-buy="${p.id}">Comprar</button>
      </div>
    </div>
  </article>`;
}

/* ---------------- Modal: Fotos + 3D (abas) ---------------- */
function ensureMediaUI() {
  const leftCol = $("#mTextBlock")?.parentElement || $(".modalGrid > div");
  if (!leftCol) return null;

  let wrap = $("#mMediaWrap");
  if (wrap) return wrap;

  wrap = document.createElement("div");
  wrap.id = "mMediaWrap";
  wrap.className = "mediaWrap";
  wrap.innerHTML = `
    <div class="mediaTabs">
      <button class="mediaTab active" data-tab="photos">Fotos</button>
      <button class="mediaTab" data-tab="model">3D</button>
    </div>
  `;
  leftCol.prepend(wrap);

  const viewer = $("#mViewer");
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
      <button class="thumbBtn ${i === 0 ? "active" : ""}" data-src="${src}" aria-label="Foto ${i + 1}">
        <img src="${src}" alt="" loading="lazy"/>
      </button>`
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

/* ---------------- Viewer look ---------------- */
function applyViewerPreset(viewer) {
  if (!viewer) return;
  viewer.style.background = "rgba(255, 159, 28, 0.16)";
  viewer.style.filter = "grayscale(1) brightness(1.35) contrast(1.10)";
  viewer.setAttribute("exposure", "0.9");
  viewer.setAttribute("shadow-intensity", "1");
  viewer.setAttribute("camera-controls", "");
  viewer.setAttribute("touch-action", "pan-y");
}

/* ---------------- Drawer (Filtros) ---------------- */
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
    list.innerHTML = chips.map((c) => `<button class="chip ${c === active ? "on" : ""}" data-cat="${c}">${c}</button>`).join("");
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

/* ---------------- Modal (multicor) ---------------- */
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

    // 1) opções normais
    (product.options || []).forEach((opt) => {
      const first = (opt.values || [])[0];
      addSelect(wrap, opt.name, opt.values || [], (v) => setSelection(opt.name, v), first);
      if (first) setSelection(opt.name, first);
    });

    // 2) cores
    const cc = product.colorConfig;
    const palette = cc?.palette || [];
    if (!palette.length) return;

    const colorSection = document.createElement("div");
    wrap.appendChild(colorSection);

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

    let multiCount = Number(rawMultiMax);
    if (!Number.isFinite(multiCount)) multiCount = 2;
    multiCount = Math.max(2, Math.min(8, Math.floor(multiCount)));

    const rerenderColors = () => {
      colorSection.innerHTML = "";
      clearSelectionsByPrefix([
        "Tipo de cor:",
        "Cor:",
        "Cor 1:",
        "Cor 2:",
        "Cor 3:",
        "Cor 4:",
        "Cor 5:",
        "Cor 6:",
        "Cor 7:",
        "Cor 8:",
      ]);

      // Se tiver 2 modos (sólida + multi), mostra seletor. Se só tiver 1, a UI já nasce naquele modo.
      if (modes.includes("solid") && modes.includes("multi")) {
        addSelect(
          colorSection,
          "Tipo de cor",
          ["Sólida (1 cor)", `Multicor (até ${multiCount})`],
          (v) => {
            mode = v.startsWith("Multi") ? "multi" : "solid";
            rerenderColors();
          },
          mode === "multi" ? `Multicor (até ${multiCount})` : "Sólida (1 cor)"
        );
      }

      setSelection("Tipo de cor", mode === "multi" ? "Multicor" : "Sólida");

      // Partes nomeadas (opcional no JSON): colorConfig.multiParts = ["Folhas","Rosa","Base"]
      const parts = Array.isArray(cc?.multiParts) ? cc.multiParts.filter(Boolean) : [];
      const count =
        mode === "multi"
          ? Math.min(multiCount, parts.length ? parts.length : multiCount)
          : 1;

      // 🔥 No WhatsApp/JSON: sempre salva como Cor 1, Cor 2, Cor 3...
      for (let i = 1; i <= count; i++) {
        const key = `Cor ${i}`;
        const partName = parts[i - 1];
        const label = partName ? `${key} — ${partName}` : key;

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

    // ✅ descrição normal
    $("#mDesc").textContent = p.description || "";

    $("#mPrice").textContent = moneyBRL(p.price);

    const gallery = p.gallery && p.gallery.length ? p.gallery : p.image ? [p.image] : [];

    ensureMediaUI();
    renderPhotos(gallery);

    const viewer = $("#mViewer");
    const textBlock = $("#mTextBlock");

    if (p.modelUrl) {
      ensureModelViewer();
      if (viewer) {
        viewer.style.display = "";
        viewer.setAttribute("src", p.modelUrl);
        applyViewerPreset(viewer);
      }
      if (textBlock) textBlock.style.display = "";
    } else {
      if (viewer) viewer.style.display = "none";
      setActiveTab("photos");
    }

    // opções
    const selections = [];
    renderOptions(p, selections);

    // botões
    const buyBtn = $("#mBuy");
    const shareBtn = $("#mShare");

    if (buyBtn) {
      buyBtn.onclick = () => openWhats(p, selections);
    }

    if (shareBtn) {
      shareBtn.onclick = async () => {
        const url = new URL(window.location.href);
        url.searchParams.set("p", id);
        try {
          await navigator.clipboard.writeText(url.toString());
          shareBtn.textContent = "Link copiado ✅";
          setTimeout(() => (shareBtn.textContent = "Copiar link"), 1500);
        } catch {
          prompt("Copie o link:", url.toString());
        }
      };
    }

    modalBackdrop.classList.add("open");
  };
}

/* ---------------- Main ---------------- */
(async function main() {
  try {
    const all = await loadProducts();
    const productsById = new Map(all.map((p) => [p.id, p]));

    const grid = $("#catalogGrid") || $("#track");
    if (grid) grid.innerHTML = all.map(productCard).join("");

    // Abrir modal
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

    wireDrawer(all, (activeCategory) => {
      const items = activeCategory === "Tudo" ? all : all.filter((p) => p.category === activeCategory);
      if (grid) grid.innerHTML = items.map(productCard).join("");
    });

    wireModal(productsById);

    // Abrir via URL ?p=ID
    const url = new URL(window.location.href);
    const pid = url.searchParams.get("p");
    if (pid && productsById.has(pid)) {
      setTimeout(() => window.openProductById(pid), 50);
    }
  } catch (err) {
    showFatal("Falha ao iniciar catálogo.", err);
  }
})();
