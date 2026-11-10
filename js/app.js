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
        <img src="${user.photoURL}" class="user-avatar" alt="${user.displayName}" onerror="this.style.display='none'">
        <span class="user-name-label">${user.displayName.split(' ')[0]}</span>
      `;
    } else {
      authBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"/><path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 21.4 7.4 24 12 24z"/></svg>
        <span class="user-name-label">Entrar / Conta</span>
      `;
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
  const pr = document.getElementById('priceFilterRange');
  if (pr) pr.value = '200';
  setMaxPrice(200);
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

// Expose global API for inline HTML event handlers
window.makerApp = {
  showPage,
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

  // Initialize STL Lab 3D (Hero 3D removed per user request)
  setTimeout(() => {
    viewer3D.initStlLab();
    initStlEstimator();
    hideSiteLoadscreen();
  }, 380);

  // Check URL deep link (?product=ID)
  const params = new URLSearchParams(window.location.search);
  const pid = params.get('product');
  if (pid) {
    setTimeout(() => openModal(pid), 350);
  }

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
