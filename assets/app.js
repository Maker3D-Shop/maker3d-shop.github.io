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
    product.dimensions ? `Dimensões: ${product.dimensions}` : null
  ].filter(Boolean);

  return lines.join("\n");
}

function openWhats(product, selections) {
  const text = encodeURIComponent(buildWhatsMsg(product, selections));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
}

/* ---------- Card ---------- */
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

/* ---------- Drawer (Filtros) ---------- */
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

  const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const chips = ["Tudo", ...categories];

  let active = "Tudo";

  function renderChips() {
    list.innerHTML = chips.map((c) => `
      <button class="filterChip ${c === active ? "active" : ""}" type="button" data-cat="${c}">
        ${c}
      </button>
    `).join("");
  }

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    active = btn.getAttribute("data-cat");
    renderChips();
    onFilterChange(active);
    // fecha em mobile (sensação boa)
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

  function setLeftPanelMode({ mode, textHtml, modelUrl }) {
    const viewer = $("#mViewer");
    const textBlock = $("#mTextBlock");

    if (mode === "model") {
      ensureModelViewer();
      if (viewer) {
        viewer.style.display = "";
        if (modelUrl) viewer.setAttribute("src", modelUrl);
        else viewer.removeAttribute("src");
      }
      if (textBlock) {
        textBlock.style.display = "none";
        textBlock.innerHTML = "";
      }
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
        options: [
          { name: "Material", values: ["PLA (padrão)", "PETG (mais resistente)", "TPU (flexível)"] },
          { name: "Cor", values: ["Colorido (sortido)", "Preto", "Branco", "Cinza", "Laranja", "Azul", "Vermelho"] }
        ]
      };

    $("#mTitle").textContent = custom.name;
    $("#mCategory").textContent = custom.category || "";
    $("#mDesc").textContent = custom.description || "";
    $("#mDim").textContent = ""; // se quiser tirar dimensões aqui também
    $("#mPrice").textContent = "Sob consulta";

    setLeftPanelMode({
      mode: "text",
      textHtml: `
        <div class="panel">
          <p class="small"><strong>Como funciona:</strong> você manda a ideia (foto, desenho ou STL) e a gente te orienta.</p>
          <p class="small"><strong>Pra agilizar:</strong> diga o uso, tamanho aproximado, material e cor.</p>
          <p class="small">(A finalização é pelo WhatsApp.)</p>
        </div>
      `
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
    $("#mDim").textContent = ""; // ✅ remove o bloco de dimensões do lado das opções (se quiser, deixa vazio)
    $("#mPrice").textContent = moneyBRL(p.price);

    if (p.modelUrl) {
      setLeftPanelMode({ mode: "model", modelUrl: p.modelUrl });
    } else {
      setLeftPanelMode({
        mode: "text",
        textHtml: `<div class="panel"><p class="small">Sem visualização 3D aqui — pede no WhatsApp que a gente manda mais detalhes.</p></div>`
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
}

/* ---------- Render Catálogo + Busca + Filtro ---------- */
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
      const matchesCat = (cat === "Tudo") || ((p.category || "") === cat);
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

/* ---------- Boot ---------- */
(async function main() {
  try {
    const productsAll = await loadProducts();
    const productsById = new Map(productsAll.map((p) => [p.id, p]));

    // modal
    wireModal(productsById);

    // estado do filtro
    let activeCategory = "Tudo";
    const getActiveCategory = () => activeCategory;

    // drawer chips
    wireDrawer(productsAll, (cat) => {
      activeCategory = cat;
      // reaplica busca + filtro
      const q = ($("#searchInput")?.value || "").trim().toLowerCase();
      const filtered = productsAll.filter((p) => {
        const matchesCat = (activeCategory === "Tudo") || ((p.category || "") === activeCategory);
        if (!matchesCat) return false;
        if (!q) return true;
        const hay = `${p.name || ""} ${p.category || ""} ${p.description || ""}`.toLowerCase();
        return hay.includes(q);
      });
      renderCatalogIntoGrid(filtered);
    });

    // busca
    wireSearch(productsAll, getActiveCategory, renderCatalogIntoGrid);

    // render inicial
    renderCatalogIntoGrid(productsAll.filter(p => p.id !== "custom"));
  } catch (err) {
    console.error(err);
    const grid = $("#catalogGrid");
    if (grid) grid.innerHTML = `<div class="card" style="padding:14px;">Erro carregando produtos.</div>`;
  }
})();
