// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Catalog, Dedicated Product Page (#page-produto), Collections & Reviews
// ═══════════════════════════════════════════════════════════════════════════
import { store } from '../config/store.js';
import { viewer3D, toRawUrl } from './viewer3d.js';
import { addToCart } from './cart.js';
import { showToast, showPage } from './ui.js';
import { dbService } from '../services/db.js';

let currentFilter = 'todos';
let currentSort = 'featured';
let maxPriceFilter = 200;
let compactGrid = false;
let currentDetailProduct = null;
let currentGalleryIdx = 0;
let currentGalleryImages = [];
let selectedColors = {}; // productId -> array of {name, hex}
let selectedFilamentMaterial = 'PLA'; // PLA (150) | PETG (120) | TPU (200)
let carouselIdx = 0;
let carouselTimer = null;

const SVG_HEART_OUTLINE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const SVG_HEART_FILLED = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const SVG_BOOKMARK_OUTLINE = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
const SVG_BOOKMARK_FILLED = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
const SVG_DOWNLOAD_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const SVG_LAYERS_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;

export function getProductColors(p) {
  if (p.colors && p.colors.length) return p.colors;
  if (p.colorSections) return p.colorSections.flatMap(s => s.colors || []);
  return [];
}

export function isLiked(pid) {
  return (store.state.wishlist || []).some(id => String(id) === String(pid));
}

export function isSavedInCollection(pid) {
  const cols = store.state.collections || [];
  return cols.some(c => (c.items || []).some(id => String(id) === String(pid)));
}

export function toggleWishlist(pid, ev) {
  if (ev) ev.stopPropagation();
  const list = [...(store.state.wishlist || [])];
  const idx = list.findIndex(id => String(id) === String(pid));
  const prod = store.state.products.find(p => String(p.id) === String(pid));
  if (idx >= 0) {
    list.splice(idx, 1);
    showToast('Removido das curtidas.');
  } else {
    list.push(pid);
    showToast(`${prod ? prod.name : 'Modelo'} adicionado às suas curtidas!`, 'success');
  }
  store.update('wishlist', list, 'maker3d_wishlist');
  renderProducts();
  renderWishlistDrawer();
  if (currentDetailProduct && String(currentDetailProduct.id) === String(pid)) {
    const likeBtn = document.getElementById('detailLikeBtn');
    if (likeBtn) {
      const liked = isLiked(pid);
      likeBtn.classList.toggle('active', liked);
      likeBtn.innerHTML = `${liked ? SVG_HEART_FILLED : SVG_HEART_OUTLINE} <span>${liked ? 'Curtido' : 'Curtir'}</span>`;
    }
  }
}

export function toggleSaveToCollection(pid, ev) {
  if (ev) ev.stopPropagation();
  const cols = [...(store.state.collections || [{ id: 'col-default', name: 'Meus Modelos Salvos', items: [] }])];
  if (!cols.length) {
    cols.push({ id: 'col-default', name: 'Meus Modelos Salvos', items: [] });
  }
  const targetCol = cols[0];
  const items = [...(targetCol.items || [])];
  const idx = items.findIndex(id => String(id) === String(pid));
  const prod = store.state.products.find(p => String(p.id) === String(pid));

  if (idx >= 0) {
    items.splice(idx, 1);
    showToast('Removido da coleção.');
  } else {
    items.push(pid);
    showToast(`${prod ? prod.name : 'Modelo'} salvo na coleção "${targetCol.name}"!`, 'success');
  }
  targetCol.items = items;
  store.update('collections', cols, 'maker3d_collections');
  renderProducts();
  renderWishlistDrawer();

  if (currentDetailProduct && String(currentDetailProduct.id) === String(pid)) {
    const colBtn = document.getElementById('detailCollectBtn');
    if (colBtn) {
      const saved = isSavedInCollection(pid);
      colBtn.classList.toggle('active', saved);
      colBtn.innerHTML = `${saved ? SVG_BOOKMARK_FILLED : SVG_BOOKMARK_OUTLINE} <span>${saved ? 'Na Coleção' : 'Salvar na Coleção'}</span>`;
    }
  }
}

export function createNewCollection(nameStr) {
  const name = (nameStr || '').trim();
  if (!name) return;
  const cols = [...(store.state.collections || [])];
  cols.push({ id: 'col-' + Date.now(), name, items: [] });
  store.update('collections', cols, 'maker3d_collections');
  showToast(`Coleção "${name}" criada!`, 'success');
  renderWishlistDrawer();
}

export function renderWishlistDrawer() {
  const badge = document.getElementById('wishlistBadgeCount');
  const container = document.getElementById('wishlistDrawerItems');
  const list = store.state.wishlist || [];
  const cols = store.state.collections || [];
  const colItems = cols.flatMap(c => c.items || []);
  const totalCount = new Set([...list.map(String), ...colItems.map(String)]).size;

  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  }
  if (!container) return;

  const favProducts = store.state.products.filter(p => list.some(id => String(id) === String(p.id)));
  const colProducts = store.state.products.filter(p => colItems.some(id => String(id) === String(p.id)));

  let html = `
    <div style="margin-bottom:20px">
      <div style="font-size:0.78rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);margin-bottom:10px">
        Curtidas (${favProducts.length})
      </div>
      ${favProducts.length ? favProducts.map(p => {
        const rawImg = toRawUrl(p.image);
        return `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle)">
            <div class="img-loader-wrap loaded" style="width:52px;height:52px;border-radius:8px;background:var(--bg-tertiary);overflow:hidden;flex-shrink:0;cursor:pointer" onclick="window.makerApp.toggleDrawer('wishlistDrawer', false); window.makerApp.openModal('${p.id}')">
              ${rawImg ? `<img src="${rawImg}" style="width:100%;height:100%;object-fit:cover;opacity:1">` : ''}
            </div>
            <div style="flex:1;min-width:0;cursor:pointer" onclick="window.makerApp.toggleDrawer('wishlistDrawer', false); window.makerApp.openModal('${p.id}')">
              <strong style="display:block;font-size:0.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</strong>
              <span style="color:var(--brand-primary);font-weight:700;font-size:0.82rem">${p.price ? 'R$ ' + Number(p.price).toFixed(2).replace('.', ',') : 'Sob Demanda'}</span>
            </div>
            <button class="btn-primary btn-sm" onclick="window.makerApp.addToCart('${p.id}')">+ Carrinho</button>
            <button class="icon-btn" style="width:30px;height:30px;font-size:0.75rem" onclick="window.makerApp.toggleWishlist('${p.id}', event)">✕</button>
          </div>
        `;
      }).join('') : `<p style="font-size:0.84rem;color:var(--text-muted);padding:10px 0">Nenhum modelo curtido ainda.</p>`}
    </div>

    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:0.78rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted)">
          Coleções Salvas (${colProducts.length})
        </span>
      </div>
      ${colProducts.length ? colProducts.map(p => {
        const rawImg = toRawUrl(p.image);
        return `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle)">
            <div class="img-loader-wrap loaded" style="width:52px;height:52px;border-radius:8px;background:var(--bg-tertiary);overflow:hidden;flex-shrink:0;cursor:pointer" onclick="window.makerApp.toggleDrawer('wishlistDrawer', false); window.makerApp.openModal('${p.id}')">
              ${rawImg ? `<img src="${rawImg}" style="width:100%;height:100%;object-fit:cover;opacity:1">` : ''}
            </div>
            <div style="flex:1;min-width:0;cursor:pointer" onclick="window.makerApp.toggleDrawer('wishlistDrawer', false); window.makerApp.openModal('${p.id}')">
              <strong style="display:block;font-size:0.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</strong>
              <span style="color:var(--text-muted);font-size:0.76rem">Perfil ${p.layerHeight || '0.12 mm'} • ${p.material || 'PLA'}</span>
            </div>
            <button class="icon-btn" style="width:30px;height:30px;font-size:0.75rem" onclick="window.makerApp.toggleSaveToCollection('${p.id}', event)">✕</button>
          </div>
        `;
      }).join('') : `<p style="font-size:0.84rem;color:var(--text-muted);padding:10px 0">Salve modelos nas suas coleções clicando em ★ nos cards.</p>`}
    </div>
  `;

  container.innerHTML = html;
}

export function renderCarousel() {
  const track = document.getElementById('carouselTrack');
  const dots = document.getElementById('carouselDots');
  if (!track || !dots) return;

  const list = store.state.products.filter(p => !p.custom).slice(0, 8);

  track.innerHTML = list.map((p) => {
    const img = toRawUrl(p.image);
    const disc = p.discount > 0 ? `<div class="discount-badge">-${p.discount}%</div>` : '';
    const has3D = p.model3d ? `<div class="model3d-badge">3D GLB</div>` : '';
    return `
      <div class="carousel-card" onclick="window.makerApp.openModal('${p.id}')">
        <div class="carousel-card-img img-loader-wrap">
          <div class="img-spinner"></div>
          ${img ? `<img src="${img}" alt="${p.name}" loading="lazy" onload="this.parentElement.classList.add('loaded')" onerror="this.parentElement.classList.add('loaded');this.style.display='none'">` : ''}
          ${disc}
          ${has3D}
        </div>
        <div class="carousel-card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;font-weight:700;text-transform:uppercase">
            <span>${p.category || 'Modelo 3D'}</span>
            <span>${p.layerHeight || '0.12 mm'}</span>
          </div>
          <h3>${p.name}</h3>
          <p>${(p.desc || '').substring(0, 68)}…</p>
          <div class="carousel-card-price">
            <span>${p.price ? 'R$ ' + Number(p.price).toFixed(2).replace('.', ',') : 'Sob Demanda'}</span>
            <span style="font-size:0.78rem;color:var(--text-secondary)">★ ${p.rating || '4.9'} (${p.printsCount || 320})</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  dots.innerHTML = list.map((_, i) => `<button class="dot ${i === 0 ? 'active' : ''}" onclick="window.makerApp.goSlide(${i})" aria-label="Slide ${i + 1}"></button>`).join('');

  if (!track.dataset.touchBound) {
    track.dataset.touchBound = '1';
    let startX = 0;
    let curX = 0;
    let dragging = false;
    track.addEventListener('touchstart', e => {
      if (!e.touches.length) return;
      dragging = true;
      startX = e.touches[0].clientX;
      curX = startX;
    }, { passive: true });
    track.addEventListener('touchmove', e => {
      if (dragging && e.touches.length) curX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', () => {
      if (!dragging) return;
      const diff = startX - curX;
      if (Math.abs(diff) > 36) {
        diff > 0 ? nextSlide(list.length) : prevSlide();
      }
      dragging = false;
    });
  }

  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => nextSlide(list.length), 4800);
}

export function goSlide(i) {
  const listLen = store.state.products.filter(p => !p.custom).slice(0, 8).length || 1;
  carouselIdx = Math.max(0, Math.min(i, listLen - 1));
  const track = document.getElementById('carouselTrack');
  const card = document.querySelector('.carousel-card');
  const w = card ? card.offsetWidth + 20 : 300;
  if (track) track.style.transform = `translateX(-${carouselIdx * w}px)`;
  document.querySelectorAll('#carouselDots .dot').forEach((d, idx) => d.classList.toggle('active', idx === carouselIdx));
}

export function nextSlide(len) {
  const total = len || store.state.products.filter(p => !p.custom).slice(0, 8).length || 1;
  goSlide(carouselIdx < total - 1 ? carouselIdx + 1 : 0);
}
export function prevSlide() {
  const total = store.state.products.filter(p => !p.custom).slice(0, 8).length || 1;
  goSlide(carouselIdx > 0 ? carouselIdx - 1 : total - 1);
}

export function renderFilters() {
  const container = document.getElementById('filterPills');
  if (!container) return;
  const products = store.state.products || [];
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];

  let html = `<button class="filter-pill ${currentFilter === 'todos' ? 'active' : ''}" onclick="window.makerApp.setFilter('todos')">
    Todos <span class="pill-count">${products.length}</span>
  </button>`;

  cats.forEach(c => {
    const count = products.filter(p => p.category === c).length;
    html += `<button class="filter-pill ${currentFilter === c ? 'active' : ''}" onclick="window.makerApp.setFilter('${c}')">
      ${c} <span class="pill-count">${count}</span>
    </button>`;
  });

  container.innerHTML = html;
}

export function setFilter(cat) {
  currentFilter = cat;
  renderFilters();
  renderProducts();
}

export function setSort(val) {
  currentSort = val;
  renderProducts();
}

export function setMaxPrice(val) {
  maxPriceFilter = parseFloat(val) || 200;
  const lbl = document.getElementById('priceFilterVal');
  if (lbl) lbl.textContent = maxPriceFilter >= 200 ? 'Todos' : `Até R$ ${maxPriceFilter}`;
  renderProducts();
}

export function toggleGridDensity() {
  compactGrid = !compactGrid;
  const grid = document.getElementById('productsGrid');
  if (grid) grid.classList.toggle('compact-view', compactGrid);
}

export function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const searchInput = document.getElementById('searchInput');
  const q = (searchInput?.value || '').trim().toLowerCase();
  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) clearBtn.classList.toggle('visible', q.length > 0);

  let filtered = (store.state.products || []).filter(p => {
    const matchCat = currentFilter === 'todos' || p.category === currentFilter;
    const matchSearch = !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.desc || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q);
    const effectivePrice = p.price ? p.price * (1 - (p.discount || 0) / 100) : 0;
    const matchPrice = maxPriceFilter >= 200 || !p.price || effectivePrice <= maxPriceFilter;
    return matchCat && matchSearch && matchPrice;
  });

  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => (a.price || 999) - (b.price || 999));
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (currentSort === 'discount') {
    filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  } else if (currentSort === 'name') {
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  const countEl = document.getElementById('productsCount');
  if (countEl) countEl.textContent = `${filtered.length} peça${filtered.length === 1 ? '' : 's'} na curadoria`;

  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:64px 20px;color:var(--text-muted)">
      <p style="font-size:1.05rem;font-weight:600;margin-bottom:12px">Nenhum modelo encontrado com esses critérios.</p>
      <button class="btn-secondary btn-sm" onclick="window.makerApp.resetCatalogFilters()">Limpar Filtros</button>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map((p) => {
    const rawImg = toRawUrl(p.image);
    const disc = p.discount || 0;
    const cols = getProductColors(p);
    const uniqueCols = cols.filter((c, idx, arr) => arr.findIndex(x => x.hex === c.hex) === idx);
    const selColor = selectedColors[p.id] ? selectedColors[p.id][0] : (uniqueCols[0] || null);
    const liked = isLiked(p.id);
    const inCol = isSavedInCollection(p.id);

    const colDotsHtml = uniqueCols.slice(0, 6).map(c => {
      const isSel = selColor && c.hex === selColor.hex;
      return `<button class="color-dot ${isSel ? 'selected' : ''}" style="background:${c.hex}"
        onclick="window.makerApp.selectCardColor(event, '${p.id}', '${c.name}', '${c.hex}')"
        title="${c.name}" type="button"></button>`;
    }).join('');

    let priceHtml = '';
    if (p.price) {
      if (disc > 0) {
        const dp = (p.price * (1 - disc / 100)).toFixed(2).replace('.', ',');
        priceHtml = `<div><span class="product-price-original">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</span><div class="product-price">R$ ${dp}</div></div>`;
      } else {
        priceHtml = `<div class="product-price">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</div>`;
      }
    } else {
      priceHtml = `<div class="product-price">Sob Demanda</div>`;
    }

    return `
      <article class="product-card ${p.custom ? 'custom-card' : ''}" onclick="window.makerApp.openModal('${p.id}')">
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        <div class="card-top-actions">
          <button class="wishlist-card-btn ${inCol ? 'liked' : ''}" onclick="window.makerApp.toggleSaveToCollection('${p.id}', event)" title="Salvar na Coleção" type="button">
            ${inCol ? SVG_BOOKMARK_FILLED : SVG_BOOKMARK_OUTLINE}
          </button>
          <button class="wishlist-card-btn ${liked ? 'liked' : ''}" onclick="window.makerApp.toggleWishlist('${p.id}', event)" title="Curtir modelo" type="button">
            ${liked ? SVG_HEART_FILLED : SVG_HEART_OUTLINE}
          </button>
        </div>
        <div class="product-img img-loader-wrap">
          <div class="img-spinner"></div>
          ${rawImg
            ? `<img src="${rawImg}" alt="${p.name}" loading="lazy" onload="this.parentElement.classList.add('loaded')" onerror="this.parentElement.classList.add('loaded');this.style.display='none'">`
            : `<div class="product-img-fallback" onload="this.parentElement.classList.add('loaded')">3D MODEL</div>`}
          ${disc > 0 ? `<div class="discount-badge">-${disc}% OFF</div>` : ''}
          ${p.model3d ? `<div class="model3d-badge">3D GLB</div>` : ''}
        </div>
        <div class="product-body">
          <div class="product-cat-tag">
            <span>${p.category || '3D'} • ${p.layerHeight || '0.12 mm'}</span>
            <span class="product-rating-inline">★ ${p.rating || '4.9'} (${p.reviewsCount || 15})</span>
          </div>
          <div class="product-title-row">
            <h3>${p.name}</h3>
          </div>
          <p>${(p.desc || '').substring(0, 82)}…</p>
          <div class="makerworld-card-metrics">
            <span style="display:inline-flex;align-items:center;gap:4px">${SVG_DOWNLOAD_ICON} ${p.downloadsCount || 420}</span>
            <span style="display:inline-flex;align-items:center;gap:4px">${SVG_LAYERS_ICON} ${p.printsCount || 260}</span>
            <span>${p.material || 'PLA'}</span>
          </div>
          ${uniqueCols.length ? `
            <div class="color-dots">
              ${colDotsHtml}
              <span class="color-label" id="clabel-${p.id}">${selColor ? selColor.name : ''}</span>
            </div>
          ` : ''}
          <div class="product-footer">
            ${priceHtml}
            <button class="add-cart-btn" onclick="event.stopPropagation(); window.makerApp.openModal('${p.id}')" type="button">
              ${p.custom ? 'Personalizar' : 'Ver Peça →'}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Ensure any fallback cards without images mark their loader as loaded
  grid.querySelectorAll('.img-loader-wrap').forEach(wrap => {
    const img = wrap.querySelector('img');
    if (!img) {
      wrap.classList.add('loaded');
    } else if (img.complete) {
      wrap.classList.add('loaded');
    }
  });
}

export function selectCardColor(ev, pid, name, hex) {
  ev.stopPropagation();
  if (!Array.isArray(selectedColors[pid])) {
    selectedColors[pid] = [{ name, hex }];
  } else {
    selectedColors[pid][0] = { name, hex };
  }
  renderProducts();
}

export function getSelectedColorsForProduct(pid) {
  return selectedColors[pid] || [];
}

/**
 * Opens Dedicated Product Page (#page-produto) instead of a popup
 * (Keeps function name openModal for backward compatibility with all handlers)
 */
export function openModal(pid) {
  const p = store.state.products.find(x => String(x.id) === String(pid));
  if (!p) return;
  currentDetailProduct = p;
  currentGalleryIdx = 0;
  selectedFilamentMaterial = 'PLA';

  // Switch SPA to dedicated product page (#page-produto) and update subdirectory URL (/produto/?id=...)
  showPage('produto', true, `?id=${encodeURIComponent(p.id)}`);

  // Update Breadcrumb & Header
  const breadCat = document.getElementById('detailBreadcrumbCat');
  const breadName = document.getElementById('detailBreadcrumbName');
  if (breadCat) breadCat.textContent = p.category || 'Catálogo 3D';
  if (breadName) breadName.textContent = p.name;

  document.getElementById('modalTitle').textContent = p.name;

  // Update Like & Collection buttons on Product Page
  const likeBtn = document.getElementById('detailLikeBtn');
  const colBtn = document.getElementById('detailCollectBtn');
  if (likeBtn) {
    const liked = isLiked(p.id);
    likeBtn.classList.toggle('active', liked);
    likeBtn.innerHTML = `${liked ? SVG_HEART_FILLED : SVG_HEART_OUTLINE} <span>${liked ? 'Curtido' : 'Curtir'}</span>`;
  }
  if (colBtn) {
    const saved = isSavedInCollection(p.id);
    colBtn.classList.toggle('active', saved);
    colBtn.innerHTML = `${saved ? SVG_BOOKMARK_FILLED : SVG_BOOKMARK_OUTLINE} <span>${saved ? 'Na Coleção' : 'Salvar na Coleção'}</span>`;
  }

  updateDetailPriceDisplay();

  // MakerWorld Technical Print Profile Specs
  document.getElementById('modalPrintInfo').innerHTML = p.custom
    ? `
      <div class="print-info-item"><strong>STL / 3MF / STEP</strong>Geometria Sob Medida</div>
      <div class="print-info-item"><strong>0.08 – 0.24 mm</strong>Altura de Camada</div>
      <div class="print-info-item"><strong>PLA • PETG • Trust</strong>Tabela por Kg</div>
      <div class="print-info-item"><strong>Bambu Studio</strong>Fatiamento Verificado</div>
    `
    : `
      <div class="print-info-item"><strong>${p.layerHeight || '0.12 mm'}</strong>Altura de Camada</div>
      <div class="print-info-item"><strong>${p.infill || '15% Gyroid'}</strong>Preenchimento</div>
      <div class="print-info-item"><strong>${p.nozzle || '0.4 mm'}</strong>Bico Calibrado</div>
      <div class="print-info-item"><strong>${p.printTime || ('~' + Math.max(1, Math.round((p.price || 35) / 8)) + 'h')}</strong>Tempo Estimado</div>
    `;

  document.getElementById('modalDesc').textContent = p.desc || '';

  // Multi-section colors or Custom Piece Configurator
  let sections = p.colorSections || [];
  if (!sections.length && p.colors && p.colors.length) {
    sections = [{ name: 'Cores de Filamento Disponíveis', colors: p.colors }];
  }
  if (!selectedColors[p.id] || !Array.isArray(selectedColors[p.id])) {
    selectedColors[p.id] = sections.map(s => (s.colors && s.colors[0]) ? s.colors[0] : null);
  }

  const colorsContainer = document.getElementById('modalColors');
  const modalActionBtn = document.getElementById('modalPrimaryActionBtn');

  // MakerWorld Filament Polymer Selector (PLA R$ 150/kg, PETG R$ 120/kg, TPU/Trust R$ 200/kg)
  const filamentPolymerHtml = `
    <div style="margin-bottom:18px">
      <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:8px">
        Polímero / Perfil de Material (Tabela MakerWorld)
      </div>
      <div class="polymer-selector-grid">
        <button type="button" class="polymer-option-card active" data-mat="PLA" onclick="window.makerApp.selectProductPolymer('PLA', this)">
          <strong>PLA Premium</strong>
          <span>R$ 150,00 / kg</span>
          <small>Detalhamento & Silk</small>
        </button>
        <button type="button" class="polymer-option-card" data-mat="PETG" onclick="window.makerApp.selectProductPolymer('PETG', this)">
          <strong>PETG</strong>
          <span>R$ 120,00 / kg</span>
          <small>Resistência Mecânica</small>
        </button>
        <button type="button" class="polymer-option-card" data-mat="TPU" onclick="window.makerApp.selectProductPolymer('TPU', this)">
          <strong>TPU / Trust</strong>
          <span>R$ 200,00 / kg</span>
          <small>Flexível Industrial</small>
        </button>
      </div>
    </div>
  `;

  if (p.custom) {
    colorsContainer.innerHTML = `
      ${filamentPolymerHtml}
      <div style="background:var(--bg-primary);border:1px solid var(--border-strong);border-radius:14px;padding:18px;margin-top:8px">
        <div style="font-size:0.88rem;font-weight:700;color:var(--text-primary);margin-bottom:12px">Especificações do Projeto Sob Medida</div>
        <div class="admin-input-group" style="margin-bottom:12px">
          <label>Link do Modelo (MakerWorld, Printables, Thingiverse) ou Nome do Arquivo STL</label>
          <input type="text" id="customModalLink" placeholder="Ex: https://makerworld.com/en/models/... ou Peca_Tecnica.stl">
        </div>
        <div class="admin-input-group" style="margin-bottom:4px">
          <label>Dimensões, Tolerâncias e Observações Técnicas</label>
          <textarea id="customModalNotes" rows="3" placeholder="Descreva dimensões desejadas, aplicação mecânica ou acabamento..."></textarea>
        </div>
      </div>
    `;
    if (modalActionBtn) {
      modalActionBtn.innerHTML = 'Solicitar Fatiamento & Orçamento no WhatsApp →';
    }
  } else if (sections.length && sections[0].colors && sections[0].colors.length) {
    colorsContainer.innerHTML = filamentPolymerHtml + sections.map((sec, sIdx) => {
      const sel = selectedColors[p.id][sIdx] || sec.colors[0];
      selectedColors[p.id][sIdx] = sel;
      return `
        <div style="margin-bottom:16px">
          <div style="font-size:0.82rem;font-weight:700;color:var(--text-secondary);margin-bottom:8px">${sec.name}: <span id="modalSecColorLbl-${sIdx}" style="color:var(--brand-primary)">${sel ? sel.name : ''}</span></div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            ${sec.colors.map(c => `
              <button class="color-dot ${sel && c.hex === sel.hex ? 'selected' : ''}"
                style="background:${c.hex};width:28px;height:28px"
                onclick="window.makerApp.selectModalSectionColor('${p.id}', ${sIdx}, '${c.name}', '${c.hex}', this)"
                title="${c.name}" type="button"></button>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    if (modalActionBtn) {
      modalActionBtn.innerHTML = 'Adicionar ao Carrinho';
    }
  } else {
    colorsContainer.innerHTML = filamentPolymerHtml;
    if (modalActionBtn) {
      modalActionBtn.innerHTML = 'Adicionar ao Carrinho';
    }
  }

  // Gallery setup with image loader
  const rawImg = toRawUrl(p.image);
  const imgs = [];
  if (rawImg) imgs.push(rawImg);
  (p.gallery || []).forEach(g => {
    const r = toRawUrl(g);
    if (r && !imgs.includes(r)) imgs.push(r);
  });
  currentGalleryImages = imgs;
  buildGallery(p);

  const modelTab = document.getElementById('tab-model');
  if (modelTab) modelTab.style.display = '';

  switchMedia('gallery');
  renderModalReviews(p.id);
}

export function selectProductPolymer(mat, btnEl) {
  selectedFilamentMaterial = mat;
  document.querySelectorAll('.polymer-option-card').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  updateDetailPriceDisplay();
}

function updateDetailPriceDisplay() {
  const p = currentDetailProduct;
  const pr = document.getElementById('modalPriceRow');
  const mobStickyPrice = document.getElementById('mobStickyPrice');
  const mobStickyName = document.getElementById('mobStickyName');
  const mobStickyBtn = document.getElementById('mobStickyBtn');
  if (!p || !pr) return;

  if (mobStickyName) mobStickyName.textContent = p.name;
  if (mobStickyBtn) mobStickyBtn.textContent = p.custom ? 'Orçar no WhatsApp →' : 'Adicionar à Sacola';

  const matMultipliers = { PLA: 1.0, PETG: 0.92, TPU: 1.25 };
  const matRates = { PLA: 'R$ 150/kg', PETG: 'R$ 120/kg', TPU: 'R$ 200/kg' };
  const mult = matMultipliers[selectedFilamentMaterial] || 1.0;

  if (p.price) {
    const basePrice = p.price * mult;
    if (p.discount > 0) {
      const dp = (basePrice * (1 - p.discount / 100)).toFixed(2).replace('.', ',');
      pr.innerHTML = `<span class="product-price-original" style="font-size:1.05rem">R$ ${basePrice.toFixed(2).replace('.', ',')}</span>
                      <span class="modal-price">R$ ${dp}</span>
                      <span class="section-eyebrow" style="margin:0">-${p.discount}% OFF</span>
                      <span class="polymer-rate-tag">${selectedFilamentMaterial === 'TPU' ? 'Trust / TPU' : selectedFilamentMaterial} (${matRates[selectedFilamentMaterial]})</span>`;
      if (mobStickyPrice) mobStickyPrice.textContent = `R$ ${dp}`;
    } else {
      const fp = basePrice.toFixed(2).replace('.', ',');
      pr.innerHTML = `<span class="modal-price">R$ ${fp}</span>
                      <span class="polymer-rate-tag">${selectedFilamentMaterial === 'TPU' ? 'Trust / TPU' : selectedFilamentMaterial} (${matRates[selectedFilamentMaterial]})</span>`;
      if (mobStickyPrice) mobStickyPrice.textContent = `R$ ${fp}`;
    }
  } else {
    pr.innerHTML = `<span class="modal-price">Orçamento Sob Medida</span>
                    <span class="polymer-rate-tag">${selectedFilamentMaterial === 'TPU' ? 'Trust / TPU' : selectedFilamentMaterial} (${matRates[selectedFilamentMaterial]})</span>`;
    if (mobStickyPrice) mobStickyPrice.textContent = 'Sob Medida';
  }
}

export function selectModalSectionColor(pid, sIdx, name, hex, btnEl) {
  if (!Array.isArray(selectedColors[pid])) selectedColors[pid] = [];
  selectedColors[pid][sIdx] = { name, hex };
  const parent = btnEl.parentElement;
  parent.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
  btnEl.classList.add('selected');
  const lbl = document.getElementById('modalSecColorLbl-' + sIdx);
  if (lbl) lbl.textContent = name;
}

function buildGallery(p) {
  const main = document.getElementById('galleryMain');
  const thumbs = document.getElementById('galleryThumbs');
  if (!main || !thumbs) return;

  if (currentGalleryImages.length) {
    const hasMany = currentGalleryImages.length > 1;
    main.className = 'gallery-main img-loader-wrap';
    main.innerHTML = `
      <div class="img-spinner"></div>
      <img id="galleryMainImg" src="${currentGalleryImages[0]}" alt="${p.name}" onload="this.parentElement.classList.add('loaded')" onerror="this.parentElement.classList.add('loaded');this.style.display='none'">
      ${hasMany ? `
        <div class="gallery-nav">
          <button class="gallery-nav-btn" onclick="event.stopPropagation(); window.makerApp.setGalleryImg(window.makerApp.getGalleryIdx() - 1)" aria-label="Foto anterior" type="button">‹</button>
          <button class="gallery-nav-btn" onclick="event.stopPropagation(); window.makerApp.setGalleryImg(window.makerApp.getGalleryIdx() + 1)" aria-label="Próxima foto" type="button">›</button>
        </div>
        <div id="galleryCounterBadge" style="position:absolute;bottom:12px;right:14px;background:rgba(255,253,249,0.92);color:var(--text-primary);border:1px solid var(--border-strong);padding:4px 12px;border-radius:99px;font-size:0.75rem;font-weight:800;backdrop-filter:blur(4px)">1 / ${currentGalleryImages.length}</div>
      ` : ''}
    `;
    thumbs.style.display = hasMany ? 'flex' : 'none';
    thumbs.innerHTML = currentGalleryImages.map((url, i) => `
      <div class="gallery-thumb img-loader-wrap ${i === 0 ? 'active' : ''}" onclick="window.makerApp.setGalleryImg(${i})">
        <div class="img-spinner"></div>
        <img src="${url}" alt="Miniatura ${i + 1}" loading="lazy" onload="this.parentElement.classList.add('loaded')" onerror="this.parentElement.classList.add('loaded')">
      </div>
    `).join('');
  } else {
    main.className = 'gallery-main';
    main.innerHTML = `<div style="font-size:1.2rem;font-weight:700;color:var(--text-muted);display:flex;align-items:center;justify-content:center;height:100%">Sem imagem disponível</div>`;
    thumbs.style.display = 'none';
    thumbs.innerHTML = '';
  }
}

export function getGalleryIdx() {
  return currentGalleryIdx;
}

export function setGalleryImg(i) {
  if (!currentGalleryImages.length) return;
  currentGalleryIdx = (i + currentGalleryImages.length) % currentGalleryImages.length;
  const main = document.getElementById('galleryMain');
  const img = document.getElementById('galleryMainImg');
  if (img && main) {
    main.classList.remove('loaded');
    img.src = currentGalleryImages[currentGalleryIdx];
  }
  const counter = document.getElementById('galleryCounterBadge');
  if (counter) counter.textContent = `${currentGalleryIdx + 1} / ${currentGalleryImages.length}`;
  document.querySelectorAll('.gallery-thumb').forEach((t, idx) => t.classList.toggle('active', idx === currentGalleryIdx));
}

export function switchMedia(type) {
  document.querySelectorAll('.media-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.media-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + type)?.classList.add('active');
  document.getElementById('panel-' + type)?.classList.add('active');

  if (type === 'model' && currentDetailProduct) {
    const firstColor = (selectedColors[currentDetailProduct.id] && selectedColors[currentDetailProduct.id][0]?.hex) || '#b08d6e';
    viewer3D.initModal3D(currentDetailProduct.model3d, firstColor);
  } else {
    viewer3D.destroyModal3D();
  }
}

export function closeModal() {
  viewer3D.destroyModal3D();
  showPage('produtos');
}

export function addToCartFromModal() {
  if (!currentDetailProduct) return;

  if (currentDetailProduct.custom) {
    const matRates = { PLA: 'PLA (R$ 150/kg)', PETG: 'PETG (R$ 120/kg)', TPU: 'TPU / Trust (R$ 200/kg)' };
    const matLabel = matRates[selectedFilamentMaterial] || 'PLA (R$ 150/kg)';
    const link = document.getElementById('customModalLink')?.value.trim() || 'Não informado';
    const notes = document.getElementById('customModalNotes')?.value.trim() || 'Projeto sob medida';
    const phone = store.state.settings?.whatsappNumber || '5531984566047';
    const msg = `Olá Maker3D!\n\nGostaria de orçar um *Projeto Sob Medida / STL*:\n\n• *Material:* ${matLabel}\n• *Modelo / Link / STL:* ${link}\n• *Especificações:* ${notes}`;
    showToast('Abrindo WhatsApp com os dados do projeto...', 'success');
    setTimeout(() => {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }, 350);
    return;
  }

  addToCart(currentDetailProduct.id, selectedFilamentMaterial);
}

export function shareCurrentProduct() {
  if (!currentDetailProduct) return;
  const baseEl = document.querySelector('base');
  const baseHref = (baseEl && baseEl.href) ? baseEl.href : (window.location.origin + '/');
  const url = new URL(`produto/?id=${encodeURIComponent(currentDetailProduct.id)}`, baseHref).href;
  navigator.clipboard?.writeText(url);
  showToast('Link da página dedicada do produto copiado!', 'success');
}

export function toggleCurrentDetailLike() {
  if (!currentDetailProduct) return;
  toggleWishlist(currentDetailProduct.id);
}

export function toggleCurrentDetailCollection() {
  if (!currentDetailProduct) return;
  toggleSaveToCollection(currentDetailProduct.id);
}

function renderModalReviews(pid) {
  const container = document.getElementById('modalReviewsList');
  if (!container) return;
  const reviews = (store.state.reviews && store.state.reviews[pid]) || [
    { author: 'Cliente Verificado', rating: 5, text: 'Precisão dimensional excelente, camadas super uniformes e encaixe perfeito.', date: 'Verificado' }
  ];
  container.innerHTML = reviews.map(r => `
    <div class="review-item">
      <div class="review-item-header">
        <strong>${r.author}</strong>
        <span style="color:#f59e0b">${'★'.repeat(r.rating || 5)} <small style="color:var(--text-muted)">${r.date}</small></span>
      </div>
      <p style="font-size:0.86rem;margin:0;color:var(--text-secondary)">${r.text}</p>
    </div>
  `).join('');
}

export async function submitModalReview() {
  if (!currentDetailProduct) return;
  const txtEl = document.getElementById('newReviewText');
  const starsEl = document.getElementById('newReviewStars');
  const text = txtEl?.value.trim();
  if (!text) {
    showToast('Escreva sua avaliação antes de publicar.', 'error');
    return;
  }
  const author = store.state.currentUser ? store.state.currentUser.displayName : 'Cliente Maker3D';
  const rating = parseInt(starsEl?.value || '5', 10);
  await dbService.addReview(currentDetailProduct.id, { author, rating, text });
  if (txtEl) txtEl.value = '';
  renderModalReviews(currentDetailProduct.id);
  showToast('Avaliação publicada!', 'success');
}
