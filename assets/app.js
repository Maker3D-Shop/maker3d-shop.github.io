// Maker3D — catálogo + modal + 3D viewer

const PRODUCTS = [
  {
    id: "keychain",
    name: "Chaveiro 3D Premium",
    category: "Acessórios",
    desc: "Acabamento limpo, ideal para presente e marcas.",
    priceFrom: "a partir de R$ 14,90",
    // coloque a imagem real em assets/img/...
    image: "assets/img/prod-1.jpg",
    // coloque o .glb em assets/models/...
    model: "assets/models/prod-1.glb",
    options: [
      { label: "Tamanho", values: ["P", "M", "G"] },
      { label: "Cor", values: ["Âmbar", "Creme", "Coral"] },
      { label: "Personalização", values: ["Sem nome", "Com nome"] }
    ],
    note: "Prazo médio: 2–4 dias. Personalização pode variar."
  },
  {
    id: "miniature",
    name: "Miniatura Decorativa",
    category: "Decoração",
    desc: "Modelo detalhado com visual sofisticado.",
    priceFrom: "sob consulta",
    image: "assets/img/prod-2.jpg",
    model: "assets/models/prod-2.glb",
    options: [
      { label: "Altura", values: ["8cm", "12cm", "18cm"] },
      { label: "Acabamento", values: ["Fosco", "Semi-brilho"] }
    ],
    note: "Se quiser, mando prévia em foto antes do envio."
  },
  {
    id: "prototype",
    name: "Protótipo Técnico",
    category: "Engenharia",
    desc: "Impressão precisa para testes e encaixes.",
    priceFrom: "a partir de R$ 49,90",
    image: "assets/img/prod-3.jpg",
    model: "assets/models/prod-3.glb",
    options: [
      { label: "Material", values: ["PLA", "PETG"] },
      { label: "Qualidade", values: ["Rápida", "Padrão", "Detalhada"] }
    ],
    note: "Envie medidas/arquivo STL para orçamento exato."
  },
  {
    id: "kit",
    name: "Kit Organizadores",
    category: "Utilidades",
    desc: "Padrão modular, encaixe e estética clean.",
    priceFrom: "a partir de R$ 29,90",
    image: "assets/img/prod-4.jpg",
    model: "assets/models/prod-4.glb",
    options: [
      { label: "Quantidade", values: ["2 peças", "4 peças", "8 peças"] }
    ],
    note: "Também faço sob medida pro seu espaço."
  }
];

function $(sel){ return document.querySelector(sel); }

function renderCatalog(targetId){
  const root = document.getElementById(targetId);
  if(!root) return;

  root.innerHTML = PRODUCTS.map(p => `
    <article class="card">
      <div class="product">
        <div class="thumb">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" onerror="this.style.display='none'">
        </div>

        <div class="pmeta">
          <div class="top">
            <p class="pname">${escapeHtml(p.name)}</p>
            <span class="tag">${escapeHtml(p.category)}</span>
          </div>
          <p class="pdesc">${escapeHtml(p.desc)}</p>
        </div>

        <div class="pactions">
          <button class="btn primary" data-open="${p.id}">Ver opções</button>
          <a class="btn ghost" href="contato.html">Comprar</a>
        </div>
      </div>
    </article>
  `).join("");

  root.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-open]");
    if(!btn) return;
    const id = btn.getAttribute("data-open");
    const product = PRODUCTS.find(x=>x.id===id);
    if(product) openModal(product);
  });
}

function openModal(p){
  $("#mTitle").textContent = p.name;
  $("#mCategory").textContent = p.category;
  $("#mDesc").textContent = p.desc;
  $("#mPrice").textContent = p.priceFrom;
  $("#mNote").textContent = p.note || "";

  // options
  const box = $("#mOptions");
  box.innerHTML = p.options.map((opt, i) => `
    <div class="panel">
      <p class="small" style="margin:0 0 8px; font-weight:900">${escapeHtml(opt.label)}</p>
      <select class="select" aria-label="${escapeHtml(opt.label)}">
        ${opt.values.map(v=>`<option>${escapeHtml(v)}</option>`).join("")}
      </select>
    </div>
  `).join("");

  // model viewer
  const viewer = $("#mViewer");
  if(p.model){
    viewer.setAttribute("src", p.model);
    viewer.style.display = "";
  }else{
    viewer.style.display = "none";
  }

  // whatsapp message
  const wpp = $("#mWhats");
  wpp.onclick = () => {
    const selects = [...box.querySelectorAll("select")];
    const picked = selects.map((s, idx) => `${p.options[idx].label}: ${s.value}`).join(" | ");
    const text = `Olá! Quero comprar: ${p.name}. Opções: ${picked}.`;
    const phone = "5531984566047"; // seu número
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  $("#modal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(){
  $("#modal").classList.remove("open");
  document.body.style.overflow = "";
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[m]));
}

document.addEventListener("click", (e)=>{
  if(e.target.matches("[data-close]")) closeModal();
  if(e.target.id==="modal") closeModal();
});

document.addEventListener("keydown", (e)=>{
  if(e.key==="Escape") closeModal();
});

// init
renderCatalog("catalogGrid");
