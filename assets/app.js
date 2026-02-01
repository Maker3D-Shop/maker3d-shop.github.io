// Maker3D — Catálogo via products.json + modal + 3D + WhatsApp
const WHATS_PHONE = "5531984566047";
let PRODUCTS = [];

function $(sel){ return document.querySelector(sel); }

async function loadProducts(){
  try{
    const res = await fetch("assets/products.json", { cache: "no-store" });
    if(!res.ok) throw new Error("Falha ao carregar products.json");
    const data = await res.json();
    PRODUCTS = Array.isArray(data) ? data : [];
  }catch(e){
    console.error(e);
    PRODUCTS = [];
  }
}

function formatPriceBRL(value){
  if(value === null || value === undefined || value === "") return "sob consulta";
  const num = Number(value);
  if(Number.isNaN(num)) return "sob consulta";
  return num.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[m]));
}

function norm(s){
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getFilteredProducts(query){
  const q = norm(query).trim();
  if(!q) return PRODUCTS.slice();
  return PRODUCTS.filter(p=>{
    const hay = [
      p.name, p.category, p.description, p.dimensions
    ].map(norm).join(" ");
    return hay.includes(q);
  });
}

function renderCatalog(targetId, opts = {}){
  const root = document.getElementById(targetId);
  if(!root) return;

  const page = document.body.dataset.page || "";
  const limitDefault = (page === "home") ? 4 : null;

  const query = opts.query ?? "";
  const limit = (opts.limit ?? limitDefault);

  const list = getFilteredProducts(query);
  const view = (limit ? list.slice(0, limit) : list);

  if(!PRODUCTS.length){
    root.innerHTML = `<div class="card" style="padding:14px;">
      <p class="small" style="margin:0;">Nenhum produto cadastrado ainda em <b>assets/products.json</b>.</p>
    </div>`;
    return;
  }

  if(!view.length){
    root.innerHTML = `<div class="card" style="padding:14px;">
      <p class="small" style="margin:0;">Nada encontrado para <b>${escapeHtml(query)}</b>.</p>
    </div>`;
    return;
  }

  root.innerHTML = view.map(p => `
    <article class="card">
      <div class="product">
        <div class="thumb" role="button" tabindex="0" data-open="${escapeHtml(p.id)}" aria-label="Abrir ${escapeHtml(p.name)}">
          <img src="${escapeHtml(p.image || "")}" alt="${escapeHtml(p.name)}" onerror="this.style.display='none'">
        </div>

        <div class="pmeta" role="button" tabindex="0" data-open="${escapeHtml(p.id)}" aria-label="Ver opções de ${escapeHtml(p.name)}">
          <div class="top">
            <p class="pname">${escapeHtml(p.name)}</p>
            <span class="tag">${escapeHtml(p.category || "")}</span>
          </div>
          <p class="pdesc">${escapeHtml(p.description || "")}</p>
        </div>

        <div class="pactions">
          <button class="btn primary" data-open="${escapeHtml(p.id)}">Ver opções</button>
          <button class="btn ghost" data-open="${escapeHtml(p.id)}" data-focusbuy="1">Comprar</button>
        </div>
      </div>
    </article>
  `).join("");

  if(root.dataset.bound !== "1"){
    root.dataset.bound = "1";

    root.addEventListener("click", (e)=>{
      const openBtn = e.target.closest("[data-open]");
      if(openBtn){
        const id = openBtn.getAttribute("data-open");
        const focusBuy = openBtn.getAttribute("data-focusbuy") === "1";
        const product = PRODUCTS.find(x=>x.id===id);
        if(product) openModal(product, { focusBuy });
      }
    });

    root.addEventListener("keydown", (e)=>{
      if(e.key !== "Enter") return;
      const openable = e.target.closest("[data-open]");
      if(!openable) return;
      const id = openable.getAttribute("data-open");
      const product = PRODUCTS.find(x=>x.id===id);
      if(product) openModal(product, { focusBuy:false });
    });
  }
}

function openModal(p, opts = { focusBuy:false }){
  $("#mTitle").textContent = p.name || "Produto";
  $("#mCategory").textContent = p.category || "";
  $("#mDesc").textContent = p.description || "";
  $("#mDim").textContent = p.dimensions ? `Dimensões: ${p.dimensions}` : "";
  $("#mPrice").textContent = formatPriceBRL(p.price);

  const box = $("#mOptions");
  const options = Array.isArray(p.options) ? p.options : [];

  box.innerHTML = options.map((opt) => `
    <div class="panel">
      <p class="small" style="margin:0 0 8px; font-weight:900">${escapeHtml(opt.name || "")}</p>
      <select class="select" aria-label="${escapeHtml(opt.name || "")}">
        ${(opt.values || []).map(v=>`<option>${escapeHtml(v)}</option>`).join("")}
      </select>
    </div>
  `).join("");

  // 3D
  const viewer = $("#mViewer");
  if(p.modelUrl){
    viewer.setAttribute("src", p.modelUrl);
    viewer.style.display = "";
  }else{
    viewer.style.display = "none";
  }

  // WhatsApp msg
  const makeWhatsText = () => {
    const selects = [...box.querySelectorAll("select")];
    const picked = selects.map((s, idx) => `${options[idx]?.name || "Opção"}: ${s.value}`).join(" | ");
    return `Olá! Quero comprar: ${p.name}.${picked ? " Opções: " + picked + "." : ""}`;
  };

  const openWhats = () => {
    const text = makeWhatsText();
    window.open(`https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const wpp = $("#mWhats");
  wpp.onclick = openWhats;

  const buyInside = $("#mBuyInside");
  if(buyInside) buyInside.onclick = openWhats;

  $("#modal").classList.add("open");
  document.body.style.overflow = "hidden";

  // se clicou em "Comprar" no card, rola até a área comprar
  if(opts.focusBuy){
    setTimeout(()=>{
      buyInside?.scrollIntoView({ behavior:"smooth", block:"center" });
      buyInside?.focus?.();
    }, 120);
  }
}

function closeModal(){
  $("#modal").classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("click", (e)=>{
  if(e.target.matches("[data-close]")) closeModal();
  if(e.target.id==="modal") closeModal();
});

document.addEventListener("keydown", (e)=>{
  if(e.key==="Escape") closeModal();
});

function initSearch(){
  const input = $("#searchInput");
  const clear = $("#searchClear");
  if(!input) return;

  const rerender = () => renderCatalog("catalogGrid", { query: input.value });

  input.addEventListener("input", rerender);
  clear?.addEventListener("click", ()=>{
    input.value = "";
    input.focus();
    rerender();
  });

  rerender();
}

(async function init(){
  await loadProducts();

  const page = document.body.dataset.page || "";
  if(page === "home"){
    renderCatalog("catalogGrid", { limit: 4, query: "" });
  }else{
    renderCatalog("catalogGrid", { query: "" });
    initSearch();
  }
})();
