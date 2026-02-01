// Maker3D — Catálogo via products.json + modal + 3D + PIX
const PIX_KEY = "5531984566047"; // sua chave pix (telefone)
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

function renderCatalog(targetId){
  const root = document.getElementById(targetId);
  if(!root) return;

  if(!PRODUCTS.length){
    root.innerHTML = `<div class="card" style="padding:14px;">
      <p class="small" style="margin:0;">Nenhum produto cadastrado ainda em <b>assets/products.json</b>.</p>
    </div>`;
    return;
  }

  root.innerHTML = PRODUCTS.map(p => `
    <article class="card">
      <div class="product">
        <div class="thumb">
          <img src="${escapeHtml(p.image || "")}" alt="${escapeHtml(p.name)}" onerror="this.style.display='none'">
        </div>

        <div class="pmeta">
          <div class="top">
            <p class="pname">${escapeHtml(p.name)}</p>
            <span class="tag">${escapeHtml(p.category || "")}</span>
          </div>
          <p class="pdesc">${escapeHtml(p.description || "")}</p>
        </div>

        <div class="pactions">
          <button class="btn primary" data-open="${escapeHtml(p.id)}">Ver opções</button>
          <button class="btn ghost" data-buy="${escapeHtml(p.id)}">Comprar</button>
        </div>
      </div>
    </article>
  `).join("");

  root.addEventListener("click", (e)=>{
    const openBtn = e.target.closest("[data-open]");
    const buyBtn  = e.target.closest("[data-buy]");

    if(openBtn){
      const id = openBtn.getAttribute("data-open");
      const product = PRODUCTS.find(x=>x.id===id);
      if(product) openModal(product, { showPix:false });
    }

    if(buyBtn){
      const id = buyBtn.getAttribute("data-buy");
      const product = PRODUCTS.find(x=>x.id===id);
      if(product) openModal(product, { showPix:true });
    }
  });
}

function openModal(p, opts = { showPix:false }){
  $("#mTitle").textContent = p.name || "Produto";
  $("#mCategory").textContent = p.category || "";
  $("#mDesc").textContent = p.description || "";
  $("#mDim").textContent = p.dimensions ? `Dimensões: ${p.dimensions}` : "";
  $("#mPrice").textContent = formatPriceBRL(p.price);

  // options
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

  // model viewer
  const viewer = $("#mViewer");
  if(p.modelUrl){
    viewer.setAttribute("src", p.modelUrl);
    viewer.style.display = "";
  }else{
    viewer.style.display = "none";
  }

  // Whats message (com opções)
  const wpp = $("#mWhats");
  wpp.onclick = () => {
    const selects = [...box.querySelectorAll("select")];
    const picked = selects.map((s, idx) => `${options[idx]?.name || "Opção"}: ${s.value}`).join(" | ");
    const text = `Olá! Quero comprar: ${p.name}. ${picked ? "Opções: " + picked + "." : ""}`;
    window.open(`https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // PIX
  $("#pixKeyText").textContent = PIX_KEY;
  $("#btnCopyPix").onclick = async () => {
    try{
      await navigator.clipboard.writeText(PIX_KEY);
      $("#btnCopyPix").textContent = "Copiado ✅";
      setTimeout(()=> $("#btnCopyPix").textContent = "Copiar PIX", 1200);
    }catch{
      alert("Não deu pra copiar automaticamente. Copie manualmente: " + PIX_KEY);
    }
  };

  const pixBox = $("#pixBox");
  pixBox.classList.toggle("open", !!opts.showPix);

  $("#btnShowPix").onclick = () => {
    pixBox.classList.add("open");
    pixBox.scrollIntoView({ behavior:"smooth", block:"nearest" });
  };

  $("#modal").classList.add("open");
  document.body.style.overflow = "hidden";
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

(async function init(){
  await loadProducts();
  renderCatalog("catalogGrid");
})();
