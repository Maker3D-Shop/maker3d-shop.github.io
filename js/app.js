// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Main Application Orchestrator (ES Module Entrypoint)
// ═══════════════════════════════════════════════════════════════════════════
import { store } from './config/store.js';
import { dbService } from './services/db.js';
import { authService } from './services/auth.js';
import {
  showToast,
  hideSiteLoadscreen,
  applyBrandSettings,
  showPage,
  initReveal,
  initParticlesAndScroll,
  renderFAQs
} from './components/ui.js';
import { viewer3D, toRawUrl } from './components/viewer3d.js';
import {
  renderCarousel,
  goSlide,
  nextSlide,
  prevSlide,
  renderFilters,
  setFilter,
  setSort,
  setMaxPrice,
  toggleGridDensity,
  renderProducts,
  selectCardColor,
  openModal,
  selectModalSectionColor,
  selectProductPolymer,
  getGalleryIdx,
  setGalleryImg,
  switchMedia,
  closeModal,
  addToCartFromModal,
  shareCurrentProduct,
  submitModalReview,
  toggleWishlist,
  toggleSaveToCollection,
  createNewCollection,
  toggleCurrentDetailLike,
  toggleCurrentDetailCollection,
  renderWishlistDrawer
} from './components/catalog.js';
import {
  addToCart,
  changeCartQty,
  removeFromCart,
  applyCouponCode,
  updateCartUI,
  checkoutCart,
  toggleDrawer
} from './components/cart.js';
import {
  initStlEstimator,
  setStlMaterial,
  updateStlParams,
  sendStlQuoteToWhatsApp
} from './components/stl-estimator.js';
import {
  initSecretAdminTriggers,
  openAdminVault,
  closeAdminVault,
  verifyAdminPin,
  loginAdminWithGoogle,
  switchAdminTab,
  openAdminProductEditor,
  saveAdminProduct,
  deleteAdminProduct,
  saveCmsSettings,
  updateOrderStatus,
  addAdminCoupon,
  removeAdminCoupon,
  addAdminFilament,
  removeAdminFilament,
  runAdminCalculator,
  saveAdminFirebaseConfig,
  syncEverythingToCloud,
  exportDatabaseJson
} from './components/admin-vault.js';

function renderUserNavbarState() {
  const user = store.state.currentUser;
  const authBtn = document.getElementById('navGoogleAuthBtn');
  const profileBody = document.getElementById('userProfileDrawerBody');

  if (authBtn) {
    if (user) {
      authBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="user-silhouette-icon">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      `;
      authBtn.title = user.displayName || 'Minha Conta';
    } else {
      authBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="user-silhouette-icon">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      `;
      authBtn.title = 'Entrar / Conta';
    }
  }

  if (profileBody) {
    if (!user) {
      profileBody.innerHTML = `
        <div style="text-align:center;padding:32px 12px">
          <h3 style="margin-bottom:8px;font-size:1.15rem">Acesse ou Registre sua Conta</h3>
          <p style="font-size:0.86rem;color:var(--text-secondary);margin-bottom:20px">
            Entre com Google ou crie sua conta manual para sincronizar coleções, peças curtidas, carrinho e objetos comprados no banco de dados.
          </p>
          <button class="btn-primary" style="width:100%;margin-bottom:10px" onclick="window.makerApp.toggleDrawer('profileDrawer', false); window.makerApp.openAuthModal('login')">
            Entrar na Conta
          </button>
          <button class="btn-secondary" style="width:100%" onclick="window.makerApp.toggleDrawer('profileDrawer', false); window.makerApp.openAuthModal('register')">
            Registrar Nova Conta
          </button>
        </div>
      `;
    } else {
      const myOrders = (store.state.orders || []).filter(
        o => (o.user?.email || '').toLowerCase() === (user.email || '').toLowerCase()
      );
      const likedIds = store.state.wishlist || [];
      const likedProds = (store.state.products || []).filter(p => likedIds.some(id => String(id) === String(p.id)));
      const cols = store.state.collections || [];
      const colIds = cols.flatMap(c => c.items || []);
      const colProds = (store.state.products || []).filter(p => colIds.some(id => String(id) === String(p.id)));
      const cartItems = store.state.cart || [];

      profileBody.innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--bg-tertiary);border:1px solid var(--border-subtle);border-radius:12px;margin-bottom:18px">
          <img src="${user.photoURL}" style="width:48px;height:48px;border-radius:50%;object-fit:cover" onerror="this.style.display='none'">
          <div style="flex:1;min-width:0">
            <strong style="display:block;font-size:0.98rem">${user.displayName}</strong>
            <span style="font-size:0.78rem;color:var(--text-secondary);display:block">${user.email}</span>
            <span class="status-pill done" style="margin-top:4px;font-size:0.7rem">Sincronizado no Database (${user.provider === 'google' ? 'Google OAuth' : 'Conta Registrada'})</span>
          </div>
        </div>

        <!-- Stats Strip -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:18px;text-align:center">
          <div style="background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:10px;padding:8px 4px">
            <strong style="display:block;font-size:1rem;color:var(--brand-primary)">${colProds.length}</strong>
            <small style="font-size:0.68rem;color:var(--text-muted)">Coleções</small>
          </div>
          <div style="background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:10px;padding:8px 4px">
            <strong style="display:block;font-size:1rem;color:var(--brand-primary)">${likedProds.length}</strong>
            <small style="font-size:0.68rem;color:var(--text-muted)">Curtidas</small>
          </div>
          <div style="background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:10px;padding:8px 4px">
            <strong style="display:block;font-size:1rem;color:var(--brand-primary)">${cartItems.reduce((s, c) => s + (c.qty || 1), 0)}</strong>
            <small style="font-size:0.68rem;color:var(--text-muted)">Carrinho</small>
          </div>
          <div style="background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:10px;padding:8px 4px">
            <strong style="display:block;font-size:1rem;color:var(--brand-primary)">${myOrders.length}</strong>
            <small style="font-size:0.68rem;color:var(--text-muted)">Compras</small>
          </div>
        </div>

        <h4 style="margin-bottom:8px;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted)">
          Coleções & Curtidas Salvas (${colProds.length + likedProds.length})
        </h4>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px">
          ${[...colProds, ...likedProds].slice(0, 4).map(p => {
            const img = toRawUrl(p.image);
            return `
              <div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;border:1px solid var(--border-subtle);background:var(--bg-primary);cursor:pointer" onclick="window.makerApp.toggleDrawer('profileDrawer', false); window.makerApp.openModal('${p.id}')">
                <img src="${img}" style="width:36px;height:36px;border-radius:6px;object-fit:cover" onerror="this.style.display='none'">
                <div style="flex:1;min-width:0">
                  <strong style="display:block;font-size:0.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</strong>
                  <span style="font-size:0.74rem;color:var(--text-muted)">${p.category || '3D'}</span>
                </div>
              </div>
            `;
          }).join('') || `<p style="font-size:0.8rem;color:var(--text-muted)">Nenhuma peça salva em coleções ou curtidas ainda.</p>`}
        </div>

        <h4 style="margin-bottom:8px;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted)">
          Itens no Carrinho Vinculados (${cartItems.length})
        </h4>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px">
          ${cartItems.length ? cartItems.map(c => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:10px;border:1px solid var(--border-subtle);background:var(--bg-primary);font-size:0.82rem">
              <span><strong>${c.qty}x</strong> ${c.name}</span>
              <span style="color:var(--brand-primary);font-weight:700">${c.price ? 'R$ ' + Number(c.price * c.qty).toFixed(2).replace('.', ',') : 'Sob Demanda'}</span>
            </div>
          `).join('') : `<p style="font-size:0.8rem;color:var(--text-muted)">Seu carrinho vinculado está vazio.</p>`}
        </div>

        <h4 style="margin-bottom:8px;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted)">
          Objetos Comprados & Pedidos (${myOrders.length})
        </h4>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:22px">
          ${myOrders.length ? myOrders.map(o => `
            <div style="padding:12px;border-radius:10px;border:1px solid var(--border-subtle);background:var(--bg-primary)">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <strong>#${o.id}</strong>
                <span class="status-pill ${o.status}">${o.status === 'printing' ? 'Imprimindo' : (o.status === 'done' ? 'Concluído' : 'Recebido')}</span>
              </div>
              <div style="font-size:0.8rem;color:var(--text-secondary)">${(o.items || []).map(i => `${i.qty}x ${i.name}`).join(', ')}</div>
              <div style="font-size:0.84rem;font-weight:700;color:var(--brand-primary);margin-top:4px">Total: R$ ${Number(o.total || 0).toFixed(2).replace('.', ',')}</div>
            </div>
          `).join('') : `<p style="font-size:0.8rem;color:var(--text-muted)">Nenhum objeto comprado registrado nesta conta ainda.</p>`}
        </div>

        <button class="btn-secondary btn-sm" style="width:100%;border-color:var(--danger);color:var(--danger)" onclick="window.makerApp.signOutGoogle()">
          Sair da Conta
        </button>
      `;
    }
  }
}

async function handleGoogleButtonClick() {
  if (store.state.currentUser) {
    renderUserNavbarState();
    toggleDrawer('profileDrawer', true);
  } else {
    authService.openAuthModal('login');
  }
}

async function signOutGoogle() {
  await authService.signOut();
  renderUserNavbarState();
  toggleDrawer('profileDrawer', false);
}

function resetCatalogFilters() {
  const s = document.getElementById('searchInput');
  if (s) s.value = '';
  setMaxPrice(999999);
  setFilter('todos');
}

function submitContactForm() {
  const name = document.getElementById('formName')?.value.trim();
  const contact = document.getElementById('formContact')?.value.trim();
  const subject = document.getElementById('formSubject')?.value.trim() || 'Contato via Site';
  const msg = document.getElementById('formMsg')?.value.trim();

  if (!name || !contact) {
    showToast('Preencha seu nome e forma de contato.', 'error');
    return;
  }

  const phone = store.state.settings.whatsappNumber || '5531984566047';
  const text = `Olá Maker3D!\n\n*Nome:* ${name}\n*Contato:* ${contact}\n*Assunto:* ${subject}\n*Mensagem:* ${msg}`;
  showToast('Redirecionando para atendimento...', 'success');
  setTimeout(() => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  }, 500);
}

function openCollectionCategory(catName) {
  showPage('produtos');
  setFilter(catName);
}

// Expose global API for inline HTML event handlers
window.makerApp = {
  showPage,
  openCollectionCategory,
  openModal,
  closeModal,
  switchMedia,
  getGalleryIdx,
  setGalleryImg,
  selectCardColor,
  selectModalSectionColor,
  selectProductPolymer,
  addToCart,
  addToCartFromModal,
  changeCartQty,
  removeFromCart,
  applyCouponCode,
  checkoutCart,
  toggleDrawer,
  toggleWishlist,
  toggleSaveToCollection,
  createNewCollection,
  toggleCurrentDetailLike,
  toggleCurrentDetailCollection,
  setFilter,
  setSort,
  setMaxPrice,
  toggleGridDensity,
  resetCatalogFilters,
  goSlide,
  nextSlide,
  prevSlide,
  shareCurrentProduct,
  submitModalReview,
  setStlMaterial,
  updateStlParams,
  sendStlQuoteToWhatsApp,
  handleGoogleButtonClick,
  openAuthModal: (mode) => authService.openAuthModal(mode),
  closeAuthModal: () => authService.closeAuthModal(),
  switchAuthModalTab: (mode) => authService.switchAuthModalTab(mode),
  checkEmailDuringRegistration: (emailVal) => authService.checkEmailDuringRegistration(emailVal),
  triggerRealGoogleSignIn: async () => {
    await authService.triggerRealGoogleSignIn();
    renderUserNavbarState();
    updateCartUI();
    renderWishlistDrawer();
    renderProducts();
  },
  submitManualLogin: async () => {
    await authService.submitManualLogin();
    renderUserNavbarState();
    updateCartUI();
    renderWishlistDrawer();
    renderProducts();
  },
  submitAccountRegistration: async () => {
    await authService.submitAccountRegistration();
    renderUserNavbarState();
    updateCartUI();
    renderWishlistDrawer();
    renderProducts();
  },
  signOutGoogle,
  submitContactForm,
  toggleModalWireframe: () => {
    const active = viewer3D.toggleModalWireframe();
    document.getElementById('ctrl-wireframe')?.classList.toggle('active', active);
  },
  resetModalCamera: () => viewer3D.resetModalCamera(),
  // Interactive 3D Hero Studio & Gears 3D Customizer methods
  switchHeroShowcaseMode: (mode) => {
    const tab3d = document.getElementById('heroModeTab3D');
    const tabPoster = document.getElementById('heroModeTabPoster');
    const panel3d = document.getElementById('heroStage3DWrap');
    const panelPoster = document.getElementById('heroStagePosterWrap');
    if (tab3d) tab3d.classList.toggle('active', mode === '3d');
    if (tabPoster) tabPoster.classList.toggle('active', mode === 'poster');
    if (panel3d) panel3d.style.display = mode === '3d' ? 'flex' : 'none';
    if (panelPoster) panelPoster.style.display = mode === 'poster' ? 'block' : 'none';
  },
  selectHero3DPreset: (preset, btnEl) => {
    document.querySelectorAll('.hero-3d-preset-pill').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    viewer3D.setHeroPreset(preset);
  },
  selectHero3DColor: (hex, btnEl) => {
    document.querySelectorAll('.hero-3d-swatch').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    viewer3D.setHeroFilamentColor(hex);
  },
  toggleHeroExplode: (btnEl) => {
    const exploded = viewer3D.toggleHeroExplodeView();
    if (btnEl) btnEl.classList.toggle('active', exploded);
  },
  toggleHeroWireframe: (btnEl) => {
    const wf = viewer3D.toggleHeroWireframe();
    if (btnEl) btnEl.classList.toggle('active', wf);
  },
  selectGears3DColor: (hex, btnEl) => {
    document.querySelectorAll('.gears-3d-swatch').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    viewer3D.setGearsBraceletColor(hex);
  },
  handleCardSpatial3D: (ev, cardEl) => {
    if (!cardEl || window.innerWidth <= 640) return;
    const rect = cardEl.getBoundingClientRect();
    const nx = ((ev.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
    const ny = ((ev.clientY - rect.top) / (rect.height || 1)) * 2 - 1;
    cardEl.style.transform = `perspective(900px) rotateX(${(-ny * 6.5).toFixed(2)}deg) rotateY(${(nx * 6.5).toFixed(2)}deg) translateY(-6px)`;
  },
  resetCardSpatial3D: (cardEl) => {
    if (!cardEl) return;
    cardEl.style.transform = '';
  },
  // Newsletter "Fique por dentro" Popup (Item 11)
  openNewsletterModal: () => {
    const modal = document.getElementById('newsletterModal');
    if (modal) modal.classList.add('open');
  },
  closeNewsletterModal: () => {
    const modal = document.getElementById('newsletterModal');
    if (modal) modal.classList.remove('open');
    try {
      localStorage.setItem('maker3d_newsletter_closed', String(Date.now()));
    } catch (_) {}
  },
  submitNewsletterModal: (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const inp = document.getElementById('popupNewsletterEmail');
    const email = inp?.value?.trim();
    if (!email || !email.includes('@')) {
      showToast('Por favor, informe um e-mail válido.', 'error');
      return;
    }
    try {
      const subs = JSON.parse(localStorage.getItem('maker3d_subscribers') || '[]');
      if (!subs.includes(email)) subs.push(email);
      localStorage.setItem('maker3d_subscribers', JSON.stringify(subs));
      localStorage.setItem('maker3d_newsletter_closed', String(Date.now()));
    } catch (_) {}
    const modal = document.getElementById('newsletterModal');
    if (modal) modal.classList.remove('open');
    showToast('Inscrição confirmada! Bem-vindo(a) à Maker 3D.', 'success');
  },
  handleBottomNavSearch: () => {
    showPage('produtos');
    setTimeout(() => {
      const inp = document.getElementById('searchInput');
      if (inp) {
        inp.focus();
        inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  },
  // Secret Admin Vault methods (triggered ONLY via URL /admin or #admin)
  openAdminVault,
  closeAdminVault,
  verifyAdminPin,
  loginAdminWithGoogle,
  switchAdminTab,
  openAdminProductEditor,
  saveAdminProduct,
  deleteAdminProduct,
  saveCmsSettings,
  updateOrderStatus,
  addAdminCoupon,
  removeAdminCoupon,
  addAdminFilament,
  removeAdminFilament,
  runAdminCalculator,
  saveAdminFirebaseConfig,
  syncEverythingToCloud,
  exportDatabaseJson
};

window.addEventListener('DOMContentLoaded', async () => {
  initParticlesAndScroll();
  initSecretAdminTriggers();

  await dbService.init();

  applyBrandSettings();
  renderCarousel();
  renderFilters();
  renderProducts();
  renderFAQs();
  updateCartUI();
  renderWishlistDrawer();
  renderUserNavbarState();
  initReveal();

  // Initialize STL Lab for Custom Orders & Estimator
  setTimeout(() => {
    viewer3D.initStlLab();
    initStlEstimator();
    hideSiteLoadscreen();
  }, 200);

  // Auto-trigger Newsletter "Fique por dentro" Popup after 6s on first visit
  try {
    const closed = localStorage.getItem('maker3d_newsletter_closed');
    // Cooldown 7 days (604800000ms)
    if (!closed || (Date.now() - Number(closed) > 604800000)) {
      setTimeout(() => {
        const modal = document.getElementById('newsletterModal');
        if (modal) modal.classList.add('open');
      }, 5500);
    }
  } catch (_) {}

  // Check URL deep link (?id=ID or ?product=ID) or Subdirectory Route
  const params = new URLSearchParams(window.location.search);
  const pid = params.get('id') || params.get('product');
  const pathStr = (window.location.pathname || '').toLowerCase();
  const initialPage = window.__MAKER3D_INITIAL_PAGE || (
    pathStr.includes('/catalogo') ? 'produtos' :
    pathStr.includes('/produto') ? 'produto' :
    pathStr.includes('/gears') ? 'gears' :
    pathStr.includes('/laboratorio-stl') ? 'orcamento' :
    pathStr.includes('/sobre') ? 'sobre' :
    pathStr.includes('/contato') ? 'contato' : null
  );

  if (pid) {
    setTimeout(() => openModal(pid), 260);
  } else if (initialPage === 'produto') {
    const firstProd = (store.state.products || [])[0];
    if (firstProd) {
      setTimeout(() => openModal(firstProd.id), 260);
    } else {
      showPage('produtos', false);
    }
  } else if (initialPage) {
    showPage(initialPage, false);
  }

  window.addEventListener('popstate', (ev) => {
    const st = ev.state;
    const curParams = new URLSearchParams(window.location.search);
    const curPid = curParams.get('id') || curParams.get('product');
    if (curPid) {
      openModal(curPid);
    } else if (st && st.page) {
      showPage(st.page, false);
    }
  });

  // Subscribe to store updates
  store.subscribe((_, key) => {
    if (key === 'products') {
      renderCarousel();
      renderFilters();
      renderProducts();
    }
    if (key === 'settings') {
      applyBrandSettings();
    }
    if (key === 'currentUser' || key === 'wishlist' || key === 'collections' || key === 'cart' || key === 'orders') {
      renderUserNavbarState();
    }
  });
});
