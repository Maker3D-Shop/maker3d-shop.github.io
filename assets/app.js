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
  if (!r.ok) throw new Error("products.json não carregou");
  return await r.json();
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
    ? `<div class="thumb"><img src="${p.image}" alt="${p.name || ""}"></div>`
    : `<div class="thumb"></div>`;

  const dims = p.dimensions ? p.dimensions : "—";

  return `
  <div class="card">
    <div class="product">
      ${img}
      <div class="pmeta">
        <div class="pmetaTop">
          <p class="pname">${p.name || ""}</p>
          ${p.category ? `<span class="tag">${p.category}</span>` : ``}
        </div>
        ${p.description ? `<p class="pdesc">${p.description}</p>` : ``}
        <div class="priceLine">
          <span class="price">${moneyBRL(p.price)}</span>
          <span class="small">${dims}</span>
        </div>
      </div>

      <div class="pactions">
        <button class="btn ghost" data-open="${p.id}">Ver opções</button>
        <button class="btn primary" data-buy="${p.id}">Comprar</button>
      </div>
    </div>
  </div>
  `;
}

/* ---------------- Modal: Fotos + 3D (abas) ---------------- */
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
    <div class="mediaPane" id="mPhotos">
      <img id="mPhotoMain" class="photoMain" alt="Foto do produto" />
      <div id="mPhotoThumbs" class="photoThumbs"></div>
    </div>
    <div class="mediaPane" id="mModelPane" style="display:none"></div>
  `;

  if (textBlock && textBlock.parentElement) {
    textBlock.parentElement.insertBefore(wrap, textBlock);
  } else if (viewer && viewer.parentElement) {
    viewer.parentElement.insertBefore(wrap, viewer);
  } else {
    $(".modalBody")?.prepend(wrap);
  }

  const modelPane = $("#mModelPane");
  if (viewer && modelPane) modelPane.appendChild(viewer);
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
      <button class="thumbBtn ${i === 0 ? "active" : ""}" type="button" data-src="${src}">
        <img src="${src}" alt="thumb ${i + 1}">
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

/* ---------------- ✅ LOOK INVERTIDO: modelo branco + fundo laranja ---------------- */
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

/* ---------------- Drawer (Filtros) — só ativa no catálogo se existir ---------------- */
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
        (c) => `<button class="filterChip ${c === active ? "active" : ""}" data-cat="${c}" type="button">${c}</button>`
      )
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

/* ---------------- Modal ---------------- */
function wireModal(productsById) {
  const modal = $("#modal");
  if (!modal) return;

  const closeAll = () => modal.classList.remove("open");

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAll();
    if (e.target.closest("[data-close]")) closeAll();
  });

  function setLeftPanelMode({ mode, modelUrl, gallery, textHtml }) {
    const ui = ensureMediaUI();
    const viewer = $("#mViewer");
    const textBlock = $("#mTextBlock");

    if (ui) {
      const btns = $$(".mediaTab", ui);
      btns.forEach((b) => (b.onclick = () => setActiveTab(b.dataset.tab)));
    }

    renderPhotos(gallery || []);

    if (mode === "model") {
      ensureModelViewer();
      const btn3d = $('.mediaTab[data-tab="model"]', ui || document);
      if (btn3d) btn3d.style.display = "";

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

    const btn3d = $('.mediaTab[data-tab="model"]', ui || document);
    if (btn3d) btn3d.style.display = "none";

    setActiveTab("photos");

    if (textBlock) {
      textBlock.style.display = "";
      textBlock.innerHTML = textHtml || "";
    }
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

    // 1) opções normais (Material, Tamanho, etc)
    (product.options || []).forEach((opt) => {
      addSelect(
        wrap,
        opt.name,
        opt.values || [],
        (v) => {
          const idx = selections.findIndex((s) => s.startsWith(opt.name + ":"));
          const txt = `${opt.name}: ${v}`;
          if (idx >= 0) selections[idx] = txt;
          else selections.push(txt);
        },
        (opt.values || [])[0]
      );

      // set inicial
      const first = (opt.values || [])[0];
      if (first) selections.push(`${opt.name}: ${first}`);
    });

    // 2) cores (colorConfig)
    const cc = product.colorConfig;
    const palette = cc?.palette || [];
    if (!palette.length) return;

    const def = cc?.default || palette[0];
    const max = Math.max(1, Number(cc?.maxColors || 1));
    const isMulti = !!cc?.multicolor;

    let qty = isMulti ? Math.min(2, max) : 1;

    const colorRowsWrap = document.createElement("div");
    wrap.appendChild(colorRowsWrap);

    const setColorsUI = () => {
      colorRowsWrap.innerHTML = "";

      // remove seleções antigas de cor
      for (let i = selections.length - 1; i >= 0; i--) {
        if (selections[i].startsWith("Cor")) selections.splice(i, 1);
        if (selections[i].startsWith("Qtd. cores")) selections.splice(i, 1);
      }

      if (isMulti) selections.push(`Qtd. cores: ${qty}`);

      for (let i = 1; i <= qty; i++) {
        const label = qty === 1 ? "Cor" : `Cor ${i}`;
        addSelect(
          colorRowsWrap,
          label,
          palette,
          (v) => {
            const key = label + ":";
            const idx = selections.findIndex((s) => s.startsWith(key));
            const txt = `${label}: ${v}`;
            if (idx >= 0) selections[idx] = txt;
            else selections.push(txt);
          },
          def
        );

        // set inicial
        selections.push(`${label}: ${def}`);
      }
    };

    if (isMulti && max > 1) {
      addSelect(
        wrap,
        "Quantidade de cores",
        Array.from({ length: max }, (_, i) => String(i + 1)),
        (v) => {
          qty = Math.max(1, Math.min(max, Number(v)));
          setColorsUI();
        },
        String(qty)
      );
    }

    setColorsUI();
  }

  window.openProductById = (id) => {
    const p = productsById.get(id);
    if (!p) return;

    $("#mTitle").textContent = p.name || "Produto";
    $("#mCategory").textContent = p.category || "";
    $("#mDesc").textContent = p.description || "";

    const mDim = $("#mDim");
    if (mDim) mDim.style.display = "none";

    $("#mPrice").textContent = moneyBRL(p.price);

    const gallery = p.gallery && p.gallery.length ? p.gallery : p.image ? [p.image] : [];

    if (p.modelUrl) {
      setLeftPanelMode({ mode: "model", modelUrl: p.modelUrl, gallery });
    } else {
      setLeftPanelMode({
        mode: "text",
        gallery,
        textHtml: `Sem visualização 3D aqui — pede no WhatsApp que a gente manda mais detalhes.`,
      });
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

/* ---------------- Início: Carrossel 4 aleatórios (ping-pong) ---------------- */
function renderHomeCarouselRandom4(products) {
  const track = $("#track");
  const dotsWrap = $("#dots");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const carousel = $("#carousel");
  if (!track || !dotsWrap) return;

  const candidates = products.filter((p) => p.id !== "custom");
  const chosen = shuffle(candidates).slice(0, 4);

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
    if (next >= chosen.length) {
      dir = -1;
      next = idx + dir;
    }
    if (next < 0) {
      dir = 1;
      next = idx + dir;
    }
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

  prevBtn?.addEventListener("click", () => {
    dir = -1;
    set(idx - 1);
    restart();
  });

  nextBtn?.addEventListener("click", () => {
    dir = 1;
    set(idx + 1);
    restart();
  });

  restart();
  carousel?.addEventListener("mouseenter", () => timer && clearInterval(timer));
  carousel?.addEventListener("mouseleave", restart);
}

/* ---------------- Catálogo: grid + busca + filtro ---------------- */
function renderCatalogIntoGrid(products) {
  const grid = $("#catalogGrid");
  if (!grid) return;
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
  clear.addEventListener("click", () => {
    input.value = "";
    apply();
  });

  apply();
}

/* ---------------- Boot ---------------- */
(async function main() {
  try {
    const productsAll = await loadProducts();
    const productsById = new Map(productsAll.map((p) => [p.id, p]));

    wireModal(productsById);
    renderHomeCarouselRandom4(productsAll);

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

    if ($("#catalogGrid")) {
      renderCatalogIntoGrid(productsAll.filter((p) => p.id !== "custom"));
    }
  } catch (err) {
    console.error(err);
    const grid = $("#catalogGrid");
    if (grid) grid.innerHTML = `<p>Erro carregando produtos.</p>`;
  }
})();
