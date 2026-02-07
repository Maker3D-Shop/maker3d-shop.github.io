// MAKER3D — app.js (WhatsApp checkout)
const WHATSAPP_NUMBER = "5531984566047";

const $  = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => [...el.querySelectorAll(q)];

function moneyBRL(v){
  if (v === null || v === undefined) return "Sob consulta";
  try {
    return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
  } catch {
    return `R$ ${v}`;
  }
}

function ensureModelViewer(){
  if (window.customElements && window.customElements.get("model-viewer")) return;
  const s = document.createElement("script");
  s.type = "module";
  s.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
  document.head.appendChild(s);
}

async function loadProducts(){
  const r = await fetch("assets/products.json", { cache: "no-store" });
  if (!r.ok) throw new Error("products.json não carregou");
  return await r.json();
}

function buildWhatsMsg(product, selections){
  const lines = [
    `Olá! Quero comprar: ${product.name}`,
    product.category ? `Categoria: ${product.category}` : null,
    product.price != null ? `Preço: ${moneyBRL(product.price)}` : "Preço: sob consulta",
    selections?.length ? `Opções: ${selections.join(" • ")}` : null,
    product.dimensions ? `Dimensões: ${product.dimensions}` : null
  ].filter(Boolean);
  return lines.join("\n");
}

function openWhats(product, selections){
  const text = encodeURIComponent(buildWhatsMsg(product, selections));
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* ---------------- Modal ---------------- */
function wireModal(productsById){
  const modal = $("#modal");
  if (!modal) return;

  const closeAll = () => modal.classList.remove("open");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAll();
    if (e.target.closest("[data-close]")) closeAll();
  });

  window.openProductById = (id) => {
    const p = productsById.get(id);
    if (!p) return;

    ensureModelViewer();

    $("#mTitle").textContent = p.name || "Produto";
    $("#mCategory").textContent = p.category || "";
    $("#mDesc").textContent = p.description || "";
    $("#mDim").textContent = p.dimensions ? `Dimensões: ${p.dimensions}` : "";
    $("#mPrice").textContent = moneyBRL(p.price);

    const viewer = $("#mViewer");
    if (viewer){
      if (p.modelUrl){
        viewer.setAttribute("src", p.modelUrl);
        viewer.style.display = "";
      } else {
        viewer.removeAttribute("src");
        viewer.style.display = "none";
      }
    }

    // Options
    const optsWrap = $("#mOptions");
    optsWrap.innerHTML = "";
    const selections = [];

    (p.options || []).forEach((opt, idx) => {
      const label = document.createElement("p");
      label.className = "small";
      label.style.fontWeight = "800";
      label.style.margin = "0 0 6px";
      label.textContent = opt.name;

      const sel = document.createElement("select");
      sel.className = "select";
      (opt.values || []).forEach(v => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = v;
        sel.appendChild(o);
      });

      selections[idx] = `${opt.name}: ${sel.value}`;
      sel.addEventListener("change", () => {
        selections[idx] = `${opt.name}: ${sel.value}`;
      });

      optsWrap.appendChild(label);
      optsWrap.appendChild(sel);

      const spacer = document.createElement("div");
      spacer.style.height = "10px";
      optsWrap.appendChild(spacer);
    });

    const buyBtn = $("#mBuyInside");
    if (buyBtn){
      buyBtn.onclick = () => openWhats(p, selections.filter(Boolean));
    }

    modal.classList.add("open");
  };

  // Delegation: abrir modal clicando em botões/cards
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    if (!open) return;
    const id = open.getAttribute("data-open");
    window.openProductById(id);
  });
}

/* ---------------- UI helpers ---------------- */
function productCard(p){
  const img = p.image
    ? `<div class="thumb"><img src="${p.image}" alt="${p.name || "Produto"}"></div>`
    : `<div class="thumb"></div>`;

  return `
  <article class="card">
    <div class="product">
      ${img}

      <div class="pmeta">
        <div class="pmetaTop">
          <h3 class="pname" title="${p.name || ""}">${p.name || ""}</h3>
          ${p.category ? `<span class="tag">${p.category}</span>` : ``}
        </div>

        ${p.description ? `<p class="pdesc">${p.description}</p>` : ``}

        <div class="priceLine">
          <span class="price">${moneyBRL(p.price)}</span>
          <span class="small">${p.dimensions ? p.dimensions : ""}</span>
        </div>
      </div>

      <div class="pactions">
        <button class="btn ghost" data-open="${p.id}">Ver opções</button>
        <button class="btn primary" data-open="${p.id}">Comprar</button>
      </div>
    </div>
  </article>
  `;
}

function renderHome(products){
  const grid = $("#highlightsGrid");
  if (!grid) return;
  const highlights = products.slice(0, 4);
  grid.innerHTML = highlights.map(productCard).join("");

  const btnCustom = $("#btnCustom");
  if (btnCustom){
    btnCustom.onclick = () => {
      const custom = products.find(p => (p.name || "").toLowerCase().includes("custom")) || products[products.length - 1];
      if (custom) window.openProductById(custom.id);
    };
  }
}

function renderCatalog(products){
  const grid = $("#catalogGrid");
  if (!grid) return;

  const input = $("#catalogSearch");
  const clear = $("#searchClear");

  const draw = (q="") => {
    const s = q.trim().toLowerCase();
    const filtered = !s ? products : products.filter(p => {
      const blob = `${p.name} ${p.category} ${p.description}`.toLowerCase();
      return blob.includes(s);
    });
    grid.innerHTML = filtered.map(productCard).join("");
  };

  if (input){
    input.addEventListener("input", () => draw(input.value));
  }
  if (clear && input){
    clear.addEventListener("click", () => {
      input.value = "";
      draw("");
      input.focus();
    });
  }

  draw("");
}

function renderHighlightsCarousel(products){
  const track = $("#track");
  const dotsWrap = $("#dots");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const carousel = $("#carousel");
  if (!track || !dotsWrap) return;

  const items = products.slice(0, 4);
  let idx = 0;
  let timer = null;

  track.innerHTML = items.map(p => `<div class="carouselSlide">${productCard(p)}</div>`).join("");
  dotsWrap.innerHTML = items.map((_, i) => `<button class="dot" data-dot="${i}" aria-label="Ir para ${i+1}"></button>`).join("");

  const setIndex = (n) => {
    idx = (n + items.length) % items.length;
    track.style.transform = `translateX(${-idx * 100}%)`;
    $$(".dot", dotsWrap).forEach((d,i)=>d.classList.toggle("active", i===idx));
  };

  const stop = () => { if (timer) clearInterval(timer); timer = null; };
  const start = () => { stop(); timer = setInterval(()=>setIndex(idx+1), 4500); };

  dotsWrap.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dot]");
    if (!b) return;
    stop();
    setIndex(parseInt(b.dataset.dot,10) || 0);
    start();
  });

  if (prevBtn) prevBtn.onclick = () => { stop(); setIndex(idx-1); start(); };
  if (nextBtn) nextBtn.onclick = () => { stop(); setIndex(idx+1); start(); };

  if (carousel){
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("touchstart", stop, {passive:true});
    carousel.addEventListener("touchend", start, {passive:true});
  }

  setIndex(0);
  start();
}

/* ---------------- Boot ---------------- */
(async function main(){
  try{
    const products = await loadProducts();
    const byId = new Map(products.map(p => [p.id, p]));
    wireModal(byId);

    const page = document.body?.dataset?.page || "";
    if (page === "home") renderHome(products);
    if (page === "catalog") renderCatalog(products);
    if (page === "highlights") renderHighlightsCarousel(products);

  } catch(err){
    console.error(err);
    const target = $("#highlightsGrid") || $("#catalogGrid") || $("#track");
    if (target){
      target.innerHTML = `
        <article class="card">
          <div class="product">
            <div class="pmeta" style="grid-column:1 / -1;">
              <h3 class="pname">Não foi possível carregar o catálogo.</h3>
              <p class="pdesc">Verifique o caminho de <b>assets/products.json</b> e tente novamente.</p>
            </div>
          </div>
        </article>
      `;
    }
  }
})();
