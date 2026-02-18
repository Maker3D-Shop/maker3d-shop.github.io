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
    selections?.length ? `Opções: ${selections.join(" • ")}` : null
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
    ? `<div class="thumb"><img src="${p.image}" alt="${p.name || "Produto"}"></div>`
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
      ${p.description ? `<p class="pdesc">${p.description}</p>` : ``}
      <div class="priceLine">
        <span class="price">${moneyBRL(p.price)}</span>
        <span class="small">${dims}</span>
      </div>
      <div class="pactions">
        <button class="btn ghost" data-open="${p.id}">Ver opções</button>
        <button class="btn primary" data-buy="${p.id}">Comprar</button>
      </div>
    </div>
  </article>`;
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
      <button class="mediaTab active" data-tab="photos">Fotos</button>
      <button class="mediaTab" data-tab="model">3D</button>
    </div>
    <div id="mPhotos" class="mediaPane">
      <img id="mPhotoMain" class="photoMain" alt="Foto do produto">
      <div id="mPhotoThumbs" class="photoThumbs"></div>
    </div>
    <div id="mModelPane" class="mediaPane" style="display:none;"></div>
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
      <button class="thumbBtn ${i === 0 ? "active" : ""}" data-src="${src}">
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

/* ---------------- ✅ LOOK INVERTIDO: modelo branco + fundo laranja ---------------- */
const presets = {
  bg_orange_model_white: {
    background: "rgba(255, 159, 28, 0.18)",
    filter: "grayscale(1) brightness(1.35) contrast(1.10)"
  }
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
      .map((c) => `<button class="filterChip ${c === active ? "active" : ""}" data-cat="${c}">${c}</button>`)
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

    // util: set/replace seleção por chave
    const setSelection = (key, value) => {
      const prefix = key + ":";
      const idx = selections.findIndex((s) => s.startsWith(prefix));
      const txt = `${key}: ${value}`;
      if (idx >= 0) selections[idx] = txt;
      else selections.push(txt);
    };

    // 1) opções normais (Material, Tamanho, etc)
    (product.options || []).forEach((opt) => {
      const first = (opt.values || [])[0];
      addSelect(
        wrap,
        opt.name,
        opt.values || [],
        (v) => setSelection(opt.name, v),
        first
      );
      if (first) setSelection(opt.name, first);
    });

    // 2) cores (novo schema)
    const cc = product.colorConfig;
    const palette = cc?.palette || [];
    if (!palette.length) return;

    const def = cc?.default || palette[0];

    // fallback compatibilidade (caso você tenha JSON antigo)
    const legacyIsMulti = !!cc?.multicolor;
    const legacyMax = Math.max(1, Number(cc?.maxColors || 1));

    // novo: modes e multiMaxColors
    const modes = Array.isArray(cc?.modes) && cc.modes.length ? cc.modes : (legacyIsMulti ? ["solid", "multi"] : ["solid"]);
    const defaultMode = cc?.defaultMode && modes.includes(cc.defaultMode) ? cc.defaultMode : (modes.includes("multi") ? "multi" : "solid");
    const multiMaxColors = Math.max(2, Number(cc?.multiMaxColors || legacyMax || 2));

    let mode = defaultMode; // "solid" | "multi"
    let qty = mode === "multi" ? Math.min(2, multiMaxColors) : 1;

    const colorRowsWrap = document.createElement("div");
    wrap.appendChild(colorRowsWrap);

    // remove seleções antigas de cor (quando re-renderiza)
    const clearColorSelections = () => {
      for (let i = selections.length - 1; i >= 0; i--) {
        if (
          selections[i].startsWith("Tipo de cor:") ||
          selections[i].startsWith("Qtd. cores:") ||
          selections[i].startsWith("Cor:") ||
          selections[i].startsWith("Cor 1:") ||
          selections[i].startsWith("Cor 2:") ||
          selections[i].startsWith("Cor 3:") ||
          selections[i].startsWith("Cor 4:")
        ) selections.splice(i, 1);
      }
    };

    const renderColorPickers = () => {
      clearColorSelections();
      colorRowsWrap.innerHTML = "";

      const tipoLabel = mode === "multi" ? "Multicor" : "Sólida";
      setSelection("Tipo de cor", tipoLabel);

      if (mode === "multi") setSelection("Qtd. cores", String(qty));

      const count = mode === "multi" ? qty : 1;

      for (let i = 1; i <= count; i++) {
        const label = count === 1 ? "Cor" : `Cor ${i}`;
        addSelect(
          colorRowsWrap,
          label,
          palette,
          (v) => setSelection(label, v),
          def
        );
        setSelection(label, def);
      }
    };

    // 2.1) seletor de modo (se o produto permitir os dois)
    if (modes.includes("solid") && modes.includes("multi")) {
      addSelect(
        wrap,
        "Tipo de cor",
        ["Sólida (1 cor)", `Multicor (até ${multiMaxColors})`],
        (v) => {
          mode = v.startsWith("Multi") ? "multi" : "solid";
          qty = mode === "multi" ? Math.min(2, multiMaxColors) : 1;
          // re-render completo (inclui qtd)
          renderColorSection();
        },
        mode === "multi" ? `Multicor (até ${multiMaxColors})` : "Sólida (1 cor)"
      );
    } else {
      // se só tiver um modo, ainda assim escreve no WhatsApp
      setSelection("Tipo de cor", modes.includes("multi") ? "Multicor" : "Sólida");
      mode = modes.includes("multi") ? "multi" : "solid";
      qty = mode === "multi" ? Math.min(2, multiMaxColors) : 1;
    }

    // 2.2) UI de quantidade + cores (aparece só no modo multi)
    const renderColorSection = () => {
      // se for multi, mostra qtd. se não, remove (re-render)
      // a parte dos selects de cor fica no colorRowsWrap
      // a parte de "quantidade de cores" fica aqui, antes das cores.
      // Para simplificar, a gente recria tudo chamando renderColorPickers e controlando qty selector aqui.
      // Primeiro: apaga qualquer seletor anterior de "Quantidade de cores" recriando do zero:
      // (Como wrap já tem outras coisas, a maneira mais segura é: não tentar achar e remover, só criar condicionado 1x via re-render completo)
      // => solução: não guardar referência; em vez disso, quando mudar modo, a função acima chama renderColorSection(), mas o seletor de qty fica logo abaixo do seletor "Tipo de cor" e acima das cores. A forma segura aqui é: se for solid, não cria qty; se for multi, cria.
      // Como o modal é recriado por produto, isso é suficiente.

      // Remove seleções antigas e desenha as cores:
      renderColorPickers();
    };

    // Se modo multi, adiciona seletor de quantidade (logo após "Tipo de cor")
    if (mode === "multi") {
      addSelect(
        wrap,
        "Quantidade de cores",
        Array.from({ length: multiMaxColors }, (_, i) => String(i + 1)),
        (v) => {
          qty = Math.max(1, Math.min(multiMaxColors, Number(v)));
          renderColorPickers();
        },
        String(qty)
      );
