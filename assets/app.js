// Maker3D — app.js (sem PIX, WhatsApp only)
const WHATSAPP_NUMBER = "5531984566047";

const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => [...el.querySelectorAll(q)];

function moneyBRL(v){
  if (v === null || v === undefined) return "Sob consulta";
  try { return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v); }
  catch { return `R$ ${v}`; }
}

function buildWhatsMsg(product, selections){
  const lines = [
    `Olá! Quero comprar: ${product.name}`,
    product.category ? `Categoria: ${product.category}` : null,
    product.price != null ? `Preço: ${moneyBRL(product.price)}` : "Preço: sob consulta",
    selections?.length ? `Opções: ${selections.join(" • ")}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

function openWhats(product, selections){
  const text = encodeURIComponent(buildWhatsMsg(product, selections));
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

async function loadProducts(){
  const r = await fetch("assets/products.json", { cache: "no-store" });
  if (!r.ok) throw new Error("products.json não carregou");
  return await r.json();
}

/* ---------- Modal ---------- */
function ensureModelViewer(){
  if (window.customElements && window.customElements.get("model-viewer")) return;
  const s = document.createElement("script");
  s.type = "module";
  s.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
  document.head.appendChild(s);
}

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

    const optsWrap = $("#mOptions");
    optsWrap.innerHTML = "";
    const selections = [];

    (p.options || []).forEach((opt, idx) => {
      const label = document.createElement("div");
      label.className = "small";
      label.style.fontWeight = "900";
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

  // Abrir modal clicando em cards
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (!b) return;
    const id = b.getAttribute("data-open");
    window.openProductById(id);
  });
}

/* ---------- Renderers ---------- */
function productCard(p){
  return `
    <div class="card">
      <div class="product">
        <div class="thumb">${p.image ? `<img src="${p.image}" alt="${p.name}">` : ""}</div>

        <div class="pmeta">
          <div class="top">
            <p class="pname">${p.name || ""}</p>
            <span class="tag">${p.category || ""}</span>
          </div>
          <p class="pdesc">${p.description || ""}</p>
        </div>

        <div class="pactions">
          <button class="btn primary" data-open="${p.id}">Ver opções</button>
          <button class="btn ghost" data-open="${p.id}">Comprar</button>
        </div>
      </div>
    </div>
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
      const custom = products.find(p => p.id === "p5") || products[products.length - 1];
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
    clear.addEventListener("click", () => { input.value = ""; draw(""); input.focus(); });
  }

  draw("");
}

function renderHighlightsCarousel(products){
  const track = $("#track");
  const dotsWrap = $("#dots");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  if (!track || !dotsWrap) return;

  const items = products.slice(0, 4);
  let idx = 0;
  let timer = null;

  track.innerHTML = items.map(p => `
    <div class="carouselSlide">
      ${productCard(p)}
    </div>
  `).join("");

  dotsWrap.innerHTML = items.map((_, i) =>
    `<button class="dot ${i===0?"active":""}" data-dot="${i}" aria-label="Ir para ${i+1}"></button>`
  ).join("");

  const setIndex = (n) => {
    idx = (n + items.length) % items.length;
    track.style.transform = `translateX(${-idx * 100}%)`;
    $$(".dot", dotsWrap).forEach((d,i)=>d.classList.toggle("active", i===idx));
  };

  const stop = () => { if (timer) clearInterval(timer); timer=null; };
  const start = () => { stop(); timer = setInterval(()=>setIndex(idx+1), 4500); };

  dotsWrap.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dot]");
    if (!b) return;
    stop();
    setIndex(parseInt(b.dataset.dot,10)||0);
    start();
  });

  if (prevBtn) prevBtn.onclick = () => { stop(); setIndex(idx-1); start(); };
  if (nextBtn) nextBtn.onclick = () => { stop(); setIndex(idx+1); start(); };

  const carousel = $("#carousel");
  if (carousel){
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("touchstart", stop, {passive:true});
    carousel.addEventListener("touchend", start, {passive:true});
  }

  setIndex(0);
  start();
}

/* ---------- Boot ---------- */
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
      target.innerHTML = `<div class="panel"><p class="small">Não foi possível carregar o catálogo.</p></div>`;
    }
  }
})();
