// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Catalog, Carousel, Advanced Filtering, Product Modal & Reviews
// ═══════════════════════════════════════════════════════════════════════════
import { store } from '../config/store.js';
import { viewer3D, toRawUrl } from './viewer3d.js';
import { addToCart } from './cart.js';
import { showToast } from './ui.js';
import { dbService } from '../services/db.js';

let currentFilter = 'todos';
let currentSort = 'featured';
let maxPriceFilter = 200;
let compactGrid = false;
let currentModalProduct = null;
let currentGalleryIdx = 0;
let currentGalleryImages = [];
let selectedColors = {}; // productId -> array of {name, hex}
let carouselIdx = 0;
let carouselTimer = null;

export function getProductColors(p) {
  if (p.colors && p.colors.length) return p.colors;
  if (p.colorSections) return p.colorSections.flatMap(s => s.colors || []);
  return [];
}

export function isLiked(pid) {
  return (store.state.wishlist || []).some(id => String(id) === String(pid));
}

export function toggleWishlist(pid, ev) {
  if (ev) ev.stopPropagation();
  const list = [...(store.state.wishlist || [])];
  const idx = list.findIndex(id => String(id) === String(pid));
  const prod = store.state.products.find(p => String(p.id) === String(pid));
  if (idx >= 0) {
    list.splice(idx, 1);
    showToast(`💔 Removido dos favoritos`);
  } else {
    list.push(pid);
    showToast(`❤️ ${prod ? prod.name : 'Produto'} salvo nos favoritos!`, 'success');
  }
  store.update('wishlist', list, 'maker3d_wishlist');
  renderProducts();
  renderWishlistDrawer();
}

export function renderWishlistDrawer() {
  const badge = document.getElementById('wishlistBadgeCount');
  const container = document.getElementById('wishlistDrawerItems');
  const list = store.state.wishlist || [];
  if (badge) {
    badge.textContent = list.length;
    badge.style.display = list.length > 0 ? 'flex' : 'none';
  }
  if (!container) return;

  const favProducts = store.state.products.filter(p => list.some(id => String(id) === String(p.id)));
  if (!favProducts.length) {
    container.innerHTML = `<div style="text-align:center;padding:48px 16px;color:var(--text-muted)">
      <div style="font-size:3rem;margin-bottom:10px">🤍</div>
      <p>Sua lista de favoritos está vazia.<br>Clique no coração nos produtos para salvar!</p>
    </div>`;
    return;
  }

  container.innerHTML = favProducts.map(p => {
    const rawImg = toRawUrl(p.image);
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-subtle)">
        <div style="width:54px;height:54px;border-radius:10px;background:var(--brand-pale);overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;cursor:pointer" onclick="window.makerApp.openModal('${p.id}')">
          ${rawImg ? `<img src="${rawImg}" style="width:100%;height:100%;object-fit:cover">` : (p.emoji || '📦')}
        </div>
        <div style="flex:1;min-width:0;cursor:pointer" onclick="window.makerApp.openModal('${p.id}')">
          <strong style="display:block;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</strong>
          <span style="color:var(--brand-primary);font-weight:700;font-size:0.84rem">${p.price ? 'R$ ' + Number(p.price).toFixed(2).replace('.', ',') : 'Sob Consulta'}</span>
        </div>
        <button class="btn-primary btn-sm" onclick="window.makerApp.addToCart('${p.id}')">+ 🛒</button>
        <button class="icon-btn" style="width:32px;height:32px;font-size:0.8rem" onclick="window.makerApp.toggleWishlist('${p.id}', event)">✕</button>
      </div>
    `;
  }).join('');
}

export function renderCarousel() {
  const track = document.getElementById('carouselTrack');
  const dots = document.getElementById('carouselDots');
  if (!track || !dots) return;

  const list = store.state.products.filter(p => !p.custom).slice(0, 8);
  const grads = [
    'linear-gradient(135deg,#ffe0b2,#ffcc80)',
    'linear-gradient(135deg,#fff3e0,#ffe0b2)',
    'linear-gradient(135deg,#fbe9e7,#ffccbc)',
    'linear-gradient(135deg,#fff8e1,#ffe082)',
    'linear-gradient(135deg,#f3e5f5,#e1bee7)',
    'linear-gradient(135deg,#e8f5e9,#c8e6c9)'
  ];

  track.innerHTML = list.map((p, i) => {
    const img = toRawUrl(p.image);
    const disc = p.discount > 0 ? `<div class="discount-badge">-${p.discount}%</div>` : '';
    const has3D = p.model3d ? `<div class="model3d-badge">🔲 3D Interativo</div>` : '';
    return `
      <div class="carousel-card" onclick="window.makerApp.openModal('${p.id}')">
        <div class="carousel-card-img" style="background:${grads[i % grads.length]}">
          ${img ? `<img src="${img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">` : `<span style="font-size:4rem">${p.emoji || '📦'}</span>`}
          ${disc}
          ${has3D}
        </div>
        <div class="carousel-card-body">
          <h3>${p.name}</h3>
          <p>${(p.desc || '').substring(0, 68)}…</p>
          <div class="carousel-card-price">
            <span>${p.price ? 'R$ ' + Number(p.price).toFixed(2).replace('.', ',') : 'Sob Consulta'}</span>
            <span style="font-size:0.78rem;color:#f59e0b">★ ${p.rating || '4.9'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  dots.innerHTML = list.map((_, i) => `<button class="dot ${i === 0 ? 'active' : ''}" onclick="window.makerApp.goSlide(${i})" aria-label="Slide ${i + 1}"></button>`).join('');

  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => nextSlide(list.length), 4200);
}

export function goSlide(i) {
  const listLen = store.state.products.filter(p => !p.custom).slice(0, 8).length || 1;
  carouselIdx = Math.max(0, Math.min(i, listLen - 1));
  const track = document.getElementById('carouselTrack');
  const card = document.querySelector('.carousel-card');
  const w = card ? card.offsetWidth + 24 : 304;
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

  cats.forEach(cat => {
    const count = products.filter(p => p.category === cat).length;
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
    html += `<button class="filter-pill ${currentFilter === cat ? 'active' : ''}" onclick="window.makerApp.setFilter('${cat}')">
      ${label} <span class="pill-count">${count}</span>
    </button>`;
  });
  container.innerHTML = html;
}

export function setFilter(cat) {
  currentFilter = cat;
  renderFilters();
  renderProducts();
}

export function setSort(sortBy) {
  currentSort = sortBy;
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

  const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  let filtered = (store.state.products || []).filter(p => {
    const matchCat = currentFilter === 'todos' || p.category === currentFilter;
    const matchQuery = !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.desc || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q);
    const effectivePrice = p.price ? p.price * (1 - (p.discount || 0) / 100) : 0;
    const matchPrice = maxPriceFilter >= 200 || !p.price || effectivePrice <= maxPriceFilter;
    return matchCat && matchQuery && matchPrice;
  });

  // Sort
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
  if (countEl) {
    countEl.textContent = `${filtered.length} produto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`;
  }

  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:56px 20px;color:var(--text-secondary)">
      <div style="font-size:3rem;margin-bottom:10px">🔍</div>
      <p>Nenhum produto encontrado com esses filtros.</p>
      <button class="btn-secondary" style="margin-top:14px" onclick="window.makerApp.resetCatalogFilters()">Limpar Filtros</button>
    </div>`;
    return;
  }

  const grads = [
    'linear-gradient(135deg,#ffe0b2,#ffcc80)',
    'linear-gradient(135deg,#fff3e0,#ffe0b2)',
    'linear-gradient(135deg,#fbe9e7,#ffccbc)',
    'linear-gradient(135deg,#fff8e1,#ffe082)',
    'linear-gradient(135deg,#f0e6ff,#e1bee7)',
    'linear-gradient(135deg,#e8f5e9,#c8e6c9)'
  ];

  grid.innerHTML = filtered.map((p, i) => {
    const rawImg = toRawUrl(p.image);
    const disc = p.discount || 0;
    const cols = getProductColors(p);
    const uniqueCols = cols.filter((c, idx, arr) => arr.findIndex(x => x.hex === c.hex) === idx);
    const selColor = selectedColors[p.id] ? selectedColors[p.id][0] : (uniqueCols[0] || null);
    const liked = isLiked(p.id);

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
      priceHtml = `<div class="product-price">Sob Consulta</div>`;
    }

    return `
      <div class="product-card ${p.custom ? 'custom-card' : ''}" onclick="window.makerApp.openModal('${p.id}')">
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        <button class="wishlist-card-btn ${liked ? 'liked' : ''}" onclick="window.makerApp.toggleWishlist('${p.id}', event)" title="Favoritar" type="button">
          ${liked ? '❤️' : '🤍'}
        </button>
        <div class="product-img" style="background:${p.custom ? 'linear-gradient(135deg,var(--brand-primary),var(--brand-deep))' : grads[i % grads.length]}">
          ${rawImg ? `<img src="${rawImg}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">` : `<div class="product-img-emoji">${p.emoji || '📦'}</div>`}
          ${disc > 0 ? `<div class="discount-badge">-${disc}% OFF</div>` : ''}
          ${p.model3d ? `<div class="model3d-badge">🔲 3D</div>` : ''}
        </div>
        <div class="product-body">
          <div class="product-cat-tag">
            <span>${p.category || '3D'}</span>
            <span class="product-rating-inline">★ ${p.rating || '4.9'} (${p.reviewsCount || 15})</span>
          </div>
          <div class="product-title-row">
            <h3>${p.name}</h3>
          </div>
          <p>${(p.desc || '').substring(0, 82)}…</p>
          ${uniqueCols.length ? `
            <div class="color-dots">
              ${colDotsHtml}
              <span class="color-label" id="clabel-${p.id}">${selColor ? selColor.name : ''}</span>
            </div>
          ` : ''}
          <div class="product-footer">
            ${priceHtml}
            <button class="add-cart-btn" onclick="event.stopPropagation(); window.makerApp.addToCart('${p.id}')" type="button">
              ${p.custom ? 'Orçar STL' : '+ Carrinho'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
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
 * Product Detail Modal + Multi-Section Colors + 3D GLTF Viewer + Customer Reviews
 */
export function openModal(pid) {
  const p = store.state.products.find(x => String(x.id) === String(pid));
  if (!p) return;
  currentModalProduct = p;
  currentGalleryIdx = 0;

  document.getElementById('modalTitle').textContent = p.name;

  const pr = document.getElementById('modalPriceRow');
  if (p.price) {
    if (p.discount > 0) {
      const dp = (p.price * (1 - p.discount / 100)).toFixed(2).replace('.', ',');
      pr.innerHTML = `<span class="product-price-original" style="font-size:1rem">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</span>
                      <span class="modal-price">R$ ${dp}</span>
                      <span class="section-eyebrow" style="margin:0">-${p.discount}% OFF</span>`;
    } else {
      pr.innerHTML = `<span class="modal-price">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</span>`;
    }
  } else {
    pr.innerHTML = `<span class="modal-price">Preço sob consulta</span>`;
  }

  document.getElementById('modalPrintInfo').innerHTML = `
    <div class="print-info-item"><strong>~${Math.max(1, Math.round((p.price || 35) / 7))}h</strong>Impressão 3D</div>
    <div class="print-info-item"><strong>PLA Premium</strong>Material Biodegradável</div>
    <div class="print-info-item"><strong>0,12 mm</strong>Alta Precisão</div>
  `;

  document.getElementById('modalDesc').textContent = p.desc || '';

  // Multi-section colors
  let sections = p.colorSections || [];
  if (!sections.length && p.colors && p.colors.length) {
    sections = [{ name: 'Cores disponíveis', colors: p.colors }];
  }
  if (!selectedColors[p.id] || !Array.isArray(selectedColors[p.id])) {
    selectedColors[p.id] = sections.map(s => (s.colors && s.colors[0]) ? s.colors[0] : null);
  }

  const colorsContainer = document.getElementById('modalColors');
  if (sections.length && sections[0].colors && sections[0].colors.length) {
    colorsContainer.innerHTML = sections.map((sec, sIdx) => {
      const sel = selectedColors[p.id][sIdx] || sec.colors[0];
      selectedColors[p.id][sIdx] = sel;
      return `
        <div style="margin-bottom:14px">
          <div style="font-size:0.82rem;font-weight:700;color:var(--text-secondary);margin-bottom:6px">${sec.name}: <span id="modalSecColorLbl-${sIdx}" style="color:var(--brand-primary)">${sel ? sel.name : ''}</span></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${sec.colors.map(c => `
              <button class="color-dot ${sel && c.hex === sel.hex ? 'selected' : ''}"
                style="background:${c.hex};width:26px;height:26px"
                onclick="window.makerApp.selectModalSectionColor('${p.id}', ${sIdx}, '${c.name}', '${c.hex}', this)"
                title="${c.name}" type="button"></button>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  } else {
    colorsContainer.innerHTML = '';
  }

  // Gallery setup
  const rawImg = toRawUrl(p.image);
  const imgs = [];
  if (rawImg) imgs.push(rawImg);
  (p.gallery || []).forEach(g => {
    const r = toRawUrl(g);
    if (r && !imgs.includes(r)) imgs.push(r);
  });
  currentGalleryImages = imgs;
  buildGallery(p);

  // 3D Tab availability (Always allow 3D preview! Uses real GLB or interactive procedural 3D preview)
  const modelTab = document.getElementById('tab-model');
  if (modelTab) modelTab.style.display = '';

  switchMedia('gallery');
  renderModalReviews(p.id);

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
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
    main.innerHTML = `<img id="galleryMainImg" src="${currentGalleryImages[0]}" alt="${p.name}" onerror="this.style.display='none'">`;
    thumbs.innerHTML = currentGalleryImages.map((url, i) => `
      <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="window.makerApp.setGalleryImg(${i})">
        <img src="${url}" alt="Miniatura ${i + 1}" loading="lazy">
      </div>
    `).join('');
  } else {
    main.innerHTML = `<div style="font-size:5.5rem;display:flex;align-items:center;justify-content:center;height:100%">${p.emoji || '📦'}</div>`;
    thumbs.innerHTML = '';
  }
}

export function setGalleryImg(i) {
  if (!currentGalleryImages.length) return;
  currentGalleryIdx = (i + currentGalleryImages.length) % currentGalleryImages.length;
  const img = document.getElementById('galleryMainImg');
  if (img) img.src = currentGalleryImages[currentGalleryIdx];
  document.querySelectorAll('.gallery-thumb').forEach((t, idx) => t.classList.toggle('active', idx === currentGalleryIdx));
}

export function switchMedia(type) {
  document.querySelectorAll('.media-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.media-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + type)?.classList.add('active');
  document.getElementById('panel-' + type)?.classList.add('active');

  if (type === 'model' && currentModalProduct) {
    const firstColor = (selectedColors[currentModalProduct.id] && selectedColors[currentModalProduct.id][0]?.hex) || '#ff9e1b';
    viewer3D.initModal3D(currentModalProduct.model3d, firstColor);
  } else {
    viewer3D.destroyModal3D();
  }
}

export function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
  viewer3D.destroyModal3D();
}

export function addToCartFromModal() {
  if (currentModalProduct) {
    addToCart(currentModalProduct.id);
    closeModal();
  }
}

export function shareCurrentProduct() {
  if (!currentModalProduct) return;
  const url = `${window.location.origin}${window.location.pathname}?product=${currentModalProduct.id}`;
  navigator.clipboard?.writeText(url);
  showToast('🔗 Link do produto copiado!', 'success');
}

function renderModalReviews(pid) {
  const container = document.getElementById('modalReviewsList');
  if (!container) return;
  const reviews = (store.state.reviews && store.state.reviews[pid]) || [
    { author: 'Cliente Verificado', rating: 5, text: 'Acabamento impecável e cores super vivas! Chegou muito bem embalado.', date: 'Recente' }
  ];
  container.innerHTML = reviews.map(r => `
    <div class="review-item">
      <div class="review-item-header">
        <strong>${r.author}</strong>
        <span style="color:#f59e0b">${'★'.repeat(r.rating || 5)} <small style="color:var(--text-muted)">${r.date}</small></span>
      </div>
      <p style="font-size:0.84rem;margin:0;color:var(--text-secondary)">${r.text}</p>
    </div>
  `).join('');
}

export async function submitModalReview() {
  if (!currentModalProduct) return;
  const txtEl = document.getElementById('newReviewText');
  const starsEl = document.getElementById('newReviewStars');
  const text = txtEl?.value.trim();
  if (!text) {
    showToast('❗ Escreva seu comentário antes de enviar.', 'error');
    return;
  }
  const author = store.state.currentUser ? store.state.currentUser.displayName : 'Cliente Maker3D';
  const rating = parseInt(starsEl?.value || '5', 10);
  await dbService.addReview(currentModalProduct.id, { author, rating, text });
  if (txtEl) txtEl.value = '';
  renderModalReviews(currentModalProduct.id);
  showToast('⭐ Avaliação publicada com sucesso!', 'success');
}
