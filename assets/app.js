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

/* ---------- Product Card ---------- */
function productCard(p) {
  const img = p.image
    ? `<div class="thumb"><img src="${p.image}" alt="${(p.name || "").replaceAll('"', "")}"></div>`
    : `<div class="thumb"></div>`;

  const dims = p.dimensions ? p.dimensions : "—";

  return `
  <article class="card">
    <div class="product">
      ${img}
      <div class="pmeta">
        <div class="pmetaTop">
          <h3 class="pname">${p.name || ""}</h3>
          ${p.category ? `<span class="tag">${p.category}</span>` : ``}
        </div>
        ${p.description ? `<p class="pdesc">${p.description}</p>` : ``}
        <div class="priceLine">
          <span class="price">${moneyBRL(p.price)}</span>
          <span class="pill">${dims}</span>
        </div>
      </div>

      <div class="pactions">
        <button class="btn primary" data-open="${p.id}">Ver opções</button>
        <button class="btn" data-buy="${p.id}">Comprar</button>
      </div>
    </div>
  </article>
  `;
}

/* ---------- Modal: Fotos + 3D ---------- */
function ensureMediaUI() {
  // injeta UI dentro do lado esquerdo do modal
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
      <button type="button" class="mediaTab active" data-tab="photos">Fotos</button>
      <button type="button" class="mediaTab" data-tab="model">3D</button>
    </div>

    <div id="mPhotos" class="mediaPane">
      <img id="mPhotoMain" class="photoMain" alt="Foto do produto">
      <div id="mPhotoThumbs" class="photoThumbs"></div>
    </div>

    <div id="mModelPane" class="mediaPane" style="display:none;"></div>
  `;

  // coloca a UI antes do bloco de texto (quando existir)
  if (textBlock && textBlock.parentElement) {
    textBlock.parentElement.insertBefore(wrap, textBlock);
  } else if (viewer && viewer.parentElement) {
    viewer.parentElement.insertBefore(wrap, viewer);
  } else {
    $(".modalBody")?.prepend(wrap);
  }

  // move o model-viewer existente pra dentro do pane "3D"
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
        <button type="button" class="thumbBtn ${i === 0 ? "active" : ""}" data-src="${src}">
          <img src="${src}" alt="miniatura">
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

/* ---------- Modal ---------- */
function wireModal(productsById) {
  const modal = $("#modal");
  if (!modal) return;

  const closeAll = () => modal.classList.remove("open");

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAll();
    if (e.target.closest("[data-close]")) closeAll();
  });

  // ✅ remove o bloco "Dimensões" ao lado das opções (some pra sempre)
  const dimEl = $("#mDim");
  if (dimEl) {
    dimEl.textContent = "";
    dimEl.style.display = "none";
  }

  function setLeftPanelMode({ mode, textHtml, modelUrl, gallery }) {
    const ui = ensureMediaUI();
    const viewer = $("#mViewer");
    const textBlock = $("#mTextBlock");

    // tabs click
    if (ui) {
      const btns = $$(".mediaTab", ui);
      btns.forEach((b) => (b.onclick = () => setActiveTab(b.dataset.tab)));
    }

    // fotos
    renderPhotos(gallery || []);

    // modo 3D
    if (mode === "model") {
      ensureModelViewer();

      if (textBlock) {
        textBlock.style.display = "none";
        textBlock.innerHTML = "";
      }

      // garante que o botão 3D aparece
      const btn3d = $('.mediaTab[data-tab="model"]', ui || document);
      if (btn3d) btn3d.style.display = "";

      if (viewer) {
        viewer.style.display = "";
        if (modelUrl) viewer.setAttribute("src", modelUrl);
        else viewer.removeAttribute("src");
      }

      setActiveTab("model");
      return;
    }

    // modo texto (sem 3D)
    if (viewer) {
      viewer.style.display = "none";
      viewer.removeAttribute("src");
    }

    // esconde aba 3D quando não tem model
    const btn3d = $('.mediaTab[data-tab="model"]', ui || document);
    if (btn3d) btn3d.style.display = "none";

    setActiveTab("photos");

    if (textBlock) {
      textBlock.style.display = "";
      textBlock.innerHTML = textHtml || "";
    }
  }

  function renderOptions(opts, selections) {
    const wrap = $("#mOptions");
    if (!wrap) return;

    wrap.innerHTML = "";
    (opts || []).forEach((opt, idx) => {
      const label = document.createElement("p");
      label.className = "small";
      label.style.fontWeight = "800";
      label.style.margin = "0 0 6px";
      label.textContent = opt.name;

      const sel = document.createElement("select");
      sel.className = "select";

      (opt.values || []).forEach((v) => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = v;
        sel.appendChild(o);
      });

      selections[idx] = `${opt.name}: ${sel.value}`;
      sel.addEventListener("change", () => (selections[idx] = `${opt.name}: ${sel.value}`));

      wrap.appendChild(label);
      wrap.appendChild(sel);

      const spacer = document.createElement("div");
      spacer.style.height = "10px";
      wrap.appendChild(spacer);
    });
  }

  function openCustomOrder() {
    const custom =
      productsById.get("custom") || {
        id: "custom",
        name: "Peça sob encomenda",
        category: "Serviços",
        price: null,
        dimensions: "Sob medida",
        description: "Você manda a ideia e a gente imprime do jeito certo.",
        gallery: ["assets/products/images/custom.jpg"],
        options: [
          { name: "Material", values: ["PLA (padrão)", "PETG (mais resistente)", "TPU (flexível)"] },
          { name: "Cor", values: ["Colorido (sortido)", "Preto", "Branco", "Cinza", "Laranja", "Azul", "Vermelho"] }
        ]
      };

    $("#mTitle").textContent = custom.name;
    $("#mCategory").textContent = custom.category || "";
    $("#mDesc").textContent = custom.description || "";
    $("#mPrice").textContent = "Sob consulta";

    setLeftPanelMode({
      mode: "text",
      textHtml: `
        <div class="panel">
          <p class="small"><strong>Como funciona:</strong> você manda a ideia (foto, desenho ou STL) e a gente te orienta.</p>
          <p class="small"><strong>Pra agilizar:</strong> diga o uso, tamanho aproximado, material e cor.</p>
          <p class="small">(A finalização é pelo WhatsApp.)</p>
        </div>
      `,
      gallery: custom.gallery || []
    });

    const selections = [];
    renderOptions(custom.options || [], selections);

    $("#mBuyInside").onclick = () => openWhats(custom, selections.filter(Boolean));
    modal.classList.add("open");
  }

  window.openProductById = (id) => {
    if (id === "custom") return openCustomOrder();

    const p = productsById.get(id);
    if (!p) return;

    $("#mTitle").textContent = p.name || "Produto";
    $("#mCategory").textContent = p.category || "";
    $("#mDesc").textContent = p.description || "";
    $("#mPrice").textContent = moneyBRL(p.price);

    const gallery =
      (p.gallery && p.gallery.length ? p.gallery : (p.image ? [p.image] : []));

    if (p.modelUrl) {
      setLeftPanelMode({ mode: "model", modelUrl: p.modelUrl, gallery });
    } else {
      setLeftPanelMode({
        mode: "text",
        textHtml: `<div class="panel"><p class="small">Sem visualização 3D aqui — pede no WhatsApp que a gente manda mais detalhes.</p></div>`,
        gallery
      });
    }

    const selections = [];
    renderOptions(p.options || [], selections);

    $("#mBuyInside").onclick = () => openWhats(p, selections.filter(Boolean));
    modal.classList.add("open");
  };

  // abrir modal
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    if (open) window.openProductById(open.getAttribute("data-open"));
  });

  // comprar direto
  document.addEventListener("click", (e) => {
    const buy = e.target.closest("[data-buy]");
    if (!buy) return;
    const id = buy.getAttribute("data-buy");
    const p = productsById.get(id);
    if (!p) return;
    openWhats(p, []);
  });

  const btnCustom = $("#btnCustom");
  if (btnCustom) btnCustom.onclick = openCustomOrder;
}

/* ---------- Home Carousel (ping-pong 1 por 1) ---------- */
function renderHomeCarousel(products) {
  const track = $("#track");
  const dotsWrap = $("#dots");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const carousel = $("#carousel");

  if (!track || !dotsWrap) return;

  const items = products.filter((p) => p.id !== "custom").slice(0, 6);

  let idx = 0;
  let dir = 1;
  let timer = null;

  track.innerHTML = items.map((p) => `<div class="carouselSlide">${productCard(p)}</div>`).join("");

  dotsWrap.innerHTML = items
    .map((_, i) => `<button class="dot ${i === 0 ? "active" : ""}" aria-label="slide ${i + 1}"></button>`)
    .join("");

  const dots = $$(".dot", dotsWrap);

  const set = (i) => {
    idx = Math.max(0, Math.min(items.length - 1, i));
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("active", di === idx));
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

  const tick = () => {
    if (items.length <= 1) return;
    let next = idx + dir;
    if (next >= items.length) {
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

  restart();

  carousel?.addEventListener("mouseenter", () => timer && clearInterval(timer));
  carousel?.addEventListener("mouseleave", restart);
}

/* ---------- Catalog List ---------- */
function renderCatalog(products) {
  const grid = $("#catalogGrid");
  if (!grid) return;

  const show = products.filter((p) => p.id !== "custom");
  grid.innerHTML = show.map(productCard).join("");

  const customSlot = $("#customSlot");
  if (customSlot) {
    const custom =
      products.find((p) => p.id === "custom") || {
        id: "custom",
        name: "Peça Custom (sob medida)",
        category: "Serviços",
        price: null,
        dimensions: "Sob medida",
        description: "Projeto e impressão sob medida.\nClique para escolher material, tolerância e acabamento."
      };
    customSlot.innerHTML = productCard(custom);
  }
}

/* ---------- Boot ---------- */
(async function main() {
  try {
    const products = await loadProducts();
    const productsById = new Map(products.map((p) => [p.id, p]));

    wireModal(productsById);
    renderHomeCarousel(products);
    renderCatalog(products);
  } catch (err) {
    console.error(err);
    const grid = $("#catalogGrid");
    if (grid) grid.innerHTML = `<div class="card" style="padding:14px;">Erro carregando produtos.</div>`;
  }
})();
