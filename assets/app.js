/* ========= CONFIG RÁPIDA =========
  Coloque seus links aqui:
*/
const CONTACT = {
  whatsapp: "https://wa.me/5500000000000?text=", // <- TROQUE
  instagram: "https://instagram.com/seuuser",     // <- TROQUE
};

const state = {
  products: [],
  query: "",
  category: "Todas",
  maxPrice: null,
  sort: "featured",
};

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function brl(n){
  if (typeof n !== "number") return "Sob consulta";
  return n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

function unique(arr){ return [...new Set(arr)]; }

function bySort(list, sort){
  const copy = [...list];
  if (sort === "priceAsc") return copy.sort((a,b)=>(a.price ?? 1e18) - (b.price ?? 1e18));
  if (sort === "priceDesc") return copy.sort((a,b)=>(b.price ?? -1) - (a.price ?? -1));
  if (sort === "nameAsc") return copy.sort((a,b)=>a.name.localeCompare(b.name));
  // featured: mantém a ordem do JSON (você controla)
  return copy;
}

function matches(p){
  const q = state.query.trim().toLowerCase();
  const catOk = state.category === "Todas" || p.category === state.category;

  const priceOk = (state.maxPrice == null)
    ? true
    : (typeof p.price === "number" ? p.price <= state.maxPrice : true);

  const qOk = !q
    ? true
    : (
      p.name.toLowerCase().includes(q) ||
      (p.tags || []).join(" ").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );

  return catOk && priceOk && qOk;
}

/* ---------- NAV (1 página com views) ---------- */
function showView(name){
  $$(".view").forEach(v => v.hidden = v.dataset.view !== name);
  // fecha menu mobile se aberto
  const mm = $("#mobileMenu");
  if (!mm.hidden) mm.hidden = true;
  history.replaceState(null, "", `#${name}`);
}

function setupNav(){
  function go(name){ showView(name); }

  document.body.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-nav]");
    if (!btn) return;
    const name = btn.dataset.nav;
    go(name);
  });

  $("#btnMenu").addEventListener("click", ()=>{
    const mm = $("#mobileMenu");
    mm.hidden = !mm.hidden;
  });

  // hash init
  const h = (location.hash || "#home").replace("#","");
  if (["home","catalogo","contato"].includes(h)) showView(h);
}

/* ---------- FILTROS UI ---------- */
function buildChips(categories){
  const box = $("#chips");
  box.innerHTML = "";

  const all = ["Todas", ...categories];
  all.forEach(cat=>{
    const b = document.createElement("button");
    b.className = "chip" + (state.category === cat ? " is-active" : "");
    b.type = "button";
    b.textContent = cat;
    b.addEventListener("click", ()=>{
      state.category = cat;
      render();
      buildChips(categories);
      // sincroniza sheet select
      $("#catSelect").value = cat;
    });
    box.appendChild(b);
  });
}

function buildSheetCategories(categories){
  const sel = $("#catSelect");
  sel.innerHTML = "";
  ["Todas", ...categories].forEach(c=>{
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    sel.appendChild(o);
  });
  sel.value = state.category;
}

function openSheet(){
  $("#sheetFilters").hidden = false;
}
function closeSheet(){
  $("#sheetFilters").hidden = true;
}
function openModal(){
  $("#modal").hidden = false;
}
function closeModal(){
  $("#modal").hidden = true;
}

/* ---------- RENDER GRID ---------- */
function cardTemplate(p){
  const priceLabel = (typeof p.price === "number") ? brl(p.price) : "Sob consulta";

  return `
    <article class="card" data-open="${p.id}">
      <div class="card__media">
        <img class="card__img" src="${p.image}" alt="${p.name}">
        <div class="card__overlay"></div>
      </div>

      <div class="card__body">
        <h3 class="card__title">${p.name}</h3>

        <div class="card__meta">
          <span class="pillTag">${p.category}</span>
          <span class="pillTag pillTag--accent">${priceLabel}</span>
        </div>

        <div class="card__footer">
          <button class="pill pill--primary card__cta" data-open="${p.id}" type="button">Ver opções</button>
          <span class="card__ghost">ID: ${p.id}</span>
        </div>
      </div>
    </article>
  `;
}

function render(){
  const list = bySort(state.products.filter(matches), state.sort);

  const grid = $("#grid");
  const empty = $("#empty");

  grid.innerHTML = list.map(cardTemplate).join("");

  empty.hidden = list.length !== 0;

  // events: abrir modal
  $$("[data-open]", grid).forEach(el=>{
    el.addEventListener("click", (e)=>{
      const id = el.dataset.open;
      openProduct(id);
    });
  });
}

/* ---------- MODAL: opções + 3D ---------- */
let selected = {
  id: null,
  choices: {} // optionName -> choice
};

function setTab(tabName){
  $$(".tab").forEach(t => t.classList.toggle("is-active", t.dataset.tab === tabName));
  $("#tab-opcoes").hidden = tabName !== "opcoes";
  $("#tab-model3d").hidden = tabName !== "model3d";
}

function openProduct(id){
  const p = state.products.find(x=>x.id===id);
  if (!p) return;

  selected.id = id;
  selected.choices = {};

  $("#mTitle").textContent = p.name;
  $("#mImage").src = p.image;
  $("#mImage").alt = p.name;
  $("#mCat").textContent = p.category;
  $("#mId").textContent = `ID: ${p.id}`;
  $("#mDesc").textContent = p.description || "";

  $("#mPrice").textContent = (typeof p.price === "number") ? brl(p.price) : "Sob consulta";

  // Opções
  const optBox = $("#mOptions");
  optBox.innerHTML = "";

  const options = Array.isArray(p.options) ? p.options : [];
  if (options.length === 0){
    optBox.innerHTML = `
      <div class="opt">
        <div class="opt__title">Sem opções configuradas</div>
        <div style="color: rgba(255,255,255,.74); font-weight:700;">
          Você pode adicionar opções no <code>assets/products.json</code>.
        </div>
      </div>
    `;
  } else {
    options.forEach(opt=>{
      const wrap = document.createElement("div");
      wrap.className = "opt";
      wrap.innerHTML = `
        <div class="opt__title">${opt.name}</div>
        <div class="opt__choices"></div>
      `;
      const choicesBox = $(".opt__choices", wrap);

      (opt.values || []).forEach((val, idx)=>{
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice" + (idx===0 ? " is-active" : "");
        b.textContent = val;
        b.addEventListener("click", ()=>{
          // marcar ativo
          $$(".choice", choicesBox).forEach(x=>x.classList.remove("is-active"));
          b.classList.add("is-active");
          selected.choices[opt.name] = val;
        });
        choicesBox.appendChild(b);

        // default: primeira escolha
        if (idx===0) selected.choices[opt.name] = val;
      });

      optBox.appendChild(wrap);
    });
  }

  // Modelo 3D
  const hasModel = !!p.modelUrl;
  const modelTabBtn = $$(".tab").find(t=>t.dataset.tab==="model3d");

  if (hasModel){
    $("#mModel").src = p.modelUrl;
    modelTabBtn.hidden = false;
  } else {
    $("#mModel").src = "";
    modelTabBtn.hidden = true;
  }

  // Tab inicial
  setTab("opcoes");

  // botões
  $("#mQuote").onclick = ()=> requestQuote(p);
  $("#mCopy").onclick = ()=> copySummary(p);

  // tabs
  $$(".tab").forEach(t=>{
    t.onclick = ()=> setTab(t.dataset.tab);
  });

  openModal();
}

function buildSummary(p){
  const choiceLines = Object.entries(selected.choices)
    .map(([k,v])=>`- ${k}: ${v}`)
    .join("\n");

  const priceLine = (typeof p.price === "number") ? brl(p.price) : "Sob consulta";

  return `MAKER3D • Orçamento
Produto: ${p.name}
ID: ${p.id}
Categoria: ${p.category}
Preço: ${priceLine}
Opções:
${choiceLines || "- (nenhuma)"}
`;
}

async function copySummary(p){
  const txt = buildSummary(p);
  try{
    await navigator.clipboard.writeText(txt);
    $("#mCopy").textContent = "Copiado ✓";
    setTimeout(()=> $("#mCopy").textContent = "Copiar resumo", 900);
  } catch {
    alert(txt);
  }
}

function requestQuote(p){
  const msg = encodeURIComponent(buildSummary(p));
  const url = CONTACT.whatsapp + msg;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* ---------- INICIALIZA ---------- */
async function loadProducts(){
  const res = await fetch("./assets/products.json");
  const data = await res.json();
  state.products = Array.isArray(data) ? data : [];

  const categories = unique(state.products.map(p=>p.category)).sort((a,b)=>a.localeCompare(b));

  buildChips(categories);
  buildSheetCategories(categories);

  // contatos
  $("#ctaWhatsapp").href = CONTACT.whatsapp + encodeURIComponent("Olá! Quero um orçamento 🙂");
  $("#ctaInstagram").href = CONTACT.instagram;

  render();
}

function setupControls(){
  $("#q").addEventListener("input", (e)=>{
    state.query = e.target.value || "";
    render();
  });

  $("#sort").addEventListener("change", (e)=>{
    state.sort = e.target.value;
    render();
  });

  // abrir sheet
  $("#btnFilters").addEventListener("click", openSheet);

  // fechar sheet / modal clicando fora e no botão
  document.body.addEventListener("click", (e)=>{
    const close = e.target.closest("[data-close]");
    if (!close) return;
    const what = close.dataset.close;
    if (what === "sheet") closeSheet();
    if (what === "modal") closeModal();
  });

  // aplicar sheet
  $("#applyFilters").addEventListener("click", ()=>{
    state.category = $("#catSelect").value;

    const mp = $("#maxPrice").value;
    state.maxPrice = (mp === "" ? null : Number(mp));

    closeSheet();

    // re-render + chips sync
    const categories = unique(state.products.map(p=>p.category)).sort((a,b)=>a.localeCompare(b));
    buildChips(categories);
    render();
  });

  // ESC fecha modal/sheet
  window.addEventListener("keydown", (e)=>{
    if (e.key === "Escape"){
      if (!$("#modal").hidden) closeModal();
      if (!$("#sheetFilters").hidden) closeSheet();
    }
  });
}

setupNav();
setupControls();
loadProducts();
