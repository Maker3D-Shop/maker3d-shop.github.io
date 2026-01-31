const $ = (sel) => document.querySelector(sel);

function formatBRL(v){
  if(v === 0) return "Sob consulta";
  return v.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

async function loadProducts(){
  const res = await fetch("./assets/products.json");
  return await res.json();
}

function uniqueCategories(products){
  const set = new Set(products.map(p => p.categoria));
  return ["Todas", ...Array.from(set)];
}

function renderCategories(selectEl, cats){
  selectEl.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join("");
}

function applyFilters(products, q, categoria, maxPreco){
  const query = (q || "").trim().toLowerCase();
  return products.filter(p => {
    const matchesQuery = !query || p.nome.toLowerCase().includes(query);
    const matchesCat = (categoria === "Todas" || !categoria) ? true : p.categoria === categoria;
    const price = Number(p.preco || 0);
    const matchesPrice = Number.isFinite(maxPreco) ? price <= maxPreco || price === 0 : true;
    return matchesQuery && matchesCat && matchesPrice;
  });
}

function renderGrid(gridEl, products){
  if(!products.length){
    gridEl.innerHTML = `<div class="card"><div class="pad">
      <h3>Nenhum produto encontrado</h3>
      <div class="small">Tente mudar os filtros ou a busca.</div>
    </div></div>`;
    return;
  }

  gridEl.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.imagem}" alt="${p.nome}">
      <div class="pad">
        <h3>${p.nome}</h3>
        <div class="meta">
          <span>${p.categoria}</span>
          <span class="price">${formatBRL(Number(p.preco || 0))}</span>
        </div>
        <div style="height:10px"></div>
        <div class="row">
          <a class="btn btn-primary" href="./contato.html">Pedir orçamento</a>
          <span class="chip">ID: ${p.id}</span>
        </div>
      </div>
    </div>
  `).join("");
}

function setupDrawer(){
  const panel = $("#panel");
  const openBtn = $("#openFilters");
  const closeBtn = $("#closeFilters");

  if(!panel || !openBtn || !closeBtn) return;

  openBtn.addEventListener("click", () => panel.classList.add("open"));
  closeBtn.addEventListener("click", () => panel.classList.remove("open"));
  panel.addEventListener("click", (e) => {
    if(e.target === panel) panel.classList.remove("open");
  });
}

async function initCatalog(){
  const searchInput = $("#searchInput");
  const grid = $("#grid");
  const catSelect = $("#catSelect");
  const priceRange = $("#priceRange");
  const priceLabel = $("#priceLabel");
  const drawerCat = $("#drawerCat");
  const drawerRange = $("#drawerRange");
  const drawerPriceLabel = $("#drawerPriceLabel");

  if(!grid) return;

  const products = await loadProducts();

  const cats = uniqueCategories(products);
  renderCategories(catSelect, cats);
  if(drawerCat) renderCategories(drawerCat, cats);

  // preço máximo baseado no maior preço (ignora 0)
  const max = Math.max(...products.map(p => Number(p.preco || 0)));
  const rangeMax = Math.max(50, Math.ceil(max / 10) * 10);
  priceRange.max = String(rangeMax);
  priceRange.value = String(rangeMax);
  priceLabel.textContent = formatBRL(rangeMax);

  if(drawerRange){
    drawerRange.max = String(rangeMax);
    drawerRange.value = String(rangeMax);
    drawerPriceLabel.textContent = formatBRL(rangeMax);
  }

  function syncAndRender(){
    const q = searchInput?.value || "";
    const c = drawerCat ? drawerCat.value : catSelect.value;
    const m = drawerRange ? Number(drawerRange.value) : Number(priceRange.value);

    // sincroniza UI topo
    catSelect.value = c;
    priceRange.value = String(m);
    priceLabel.textContent = formatBRL(m);

    // sincroniza drawer
    if(drawerCat) drawerCat.value = c;
    if(drawerRange){
      drawerRange.value = String(m);
      drawerPriceLabel.textContent = formatBRL(m);
    }

    const filtered = applyFilters(products, q, c, m);
    renderGrid(grid, filtered);
  }

  [searchInput, catSelect, priceRange, drawerCat, drawerRange].forEach(el => {
    if(!el) return;
    el.addEventListener("input", syncAndRender);
    el.addEventListener("change", syncAndRender);
  });

  syncAndRender();
  setupDrawer();
}

document.addEventListener("DOMContentLoaded", () => {
  initCatalog();
});
