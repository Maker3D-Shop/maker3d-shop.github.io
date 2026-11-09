// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Main Application Orchestrator (ES Module Entrypoint)
// ═══════════════════════════════════════════════════════════════════════════
import { store } from './config/store.js';
import { dbService } from './services/db.js';
import { authService } from './services/auth.js';
import {
  showToast,
  applyTheme,
  toggleTheme,
  applyBrandSettings,
  showPage,
  initReveal,
  initParticlesAndScroll,
  renderFAQs
} from './components/ui.js';
import { viewer3D } from './components/viewer3d.js';
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
  setGalleryImg,
  switchMedia,
  closeModal,
  addToCartFromModal,
  shareCurrentProduct,
  submitModalReview,
  toggleWishlist,
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
        <span class="user-name-label">Entrar com Google</span>
      `;
    }
  }

  if (profileBody) {
    if (!user) {
      profileBody.innerHTML = `
        <div style="text-align:center;padding:32px 12px">
          <div style="font-size:3rem;margin-bottom:12px">🔐</div>
          <h3 style="margin-bottom:8px">Conecte sua Conta Google</h3>
          <p style="font-size:0.86rem;color:var(--text-secondary);margin-bottom:20px">
            Salve seus favoritos, acompanhe seus pedidos em produção 3D e sincronize seu carrinho em qualquer dispositivo.
          </p>
          <button class="btn-primary" style="width:100%" onclick="window.makerApp.handleGoogleButtonClick()">
            Continuar com Google
          </button>
        </div>
      `;
    } else {
      const myOrders = (store.state.orders || []).filter(o => o.user?.email === user.email);
      profileBody.innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--brand-pale);border-radius:16px;margin-bottom:20px">
          <img src="${user.photoURL}" style="width:52px;height:52px;border-radius:50%;object-fit:cover" onerror="this.style.display='none'">
          <div style="flex:1;min-width:0">
            <strong style="display:block;font-size:1rem">${user.displayName}</strong>
            <span style="font-size:0.8rem;color:var(--text-secondary)">${user.email}</span>
            <span class="status-pill done" style="margin-top:4px">Conta Google Conectada</span>
          </div>
        </div>

        ${user.isAdmin ? `
          <button class="btn-primary btn-sm" style="width:100%;margin-bottom:16px" onclick="window.makerApp.toggleDrawer('profileDrawer', false); window.makerApp.openAdminVault()">
            ⚡ Abrir Painel Admin Secreto
          </button>
        ` : ''}

        <h4 style="margin-bottom:10px;font-size:0.9rem">📦 Meus Pedidos Recentes (${myOrders.length})</h4>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:22px">
          ${myOrders.length ? myOrders.map(o => `
            <div style="padding:12px;border-radius:12px;border:1px solid var(--border-subtle);background:var(--bg-primary)">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <strong>#${o.id}</strong>
                <span class="status-pill ${o.status}">${o.status === 'printing' ? '🖨️ Imprimindo' : (o.status === 'done' ? '✅ Concluído' : '⏳ Recebido')}</span>
              </div>
              <div style="font-size:0.8rem;color:var(--text-secondary)">${(o.items || []).map(i => `${i.qty}x ${i.name}`).join(', ')}</div>
              <div style="font-size:0.84rem;font-weight:700;color:var(--brand-primary);margin-top:4px">Total: R$ ${Number(o.total || 0).toFixed(2).replace('.', ',')}</div>
            </div>
          `).join('') : `<p style="font-size:0.83rem;color:var(--text-muted)">Você ainda não realizou pedidos com esta conta.</p>`}
        </div>

        <button class="btn-secondary btn-sm" style="width:100%;border-color:var(--danger);color:var(--danger)" onclick="window.makerApp.signOutGoogle()">
          🚪 Sair da Conta
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
    await authService.signInWithGoogle();
    renderUserNavbarState();
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
    showToast('❗ Preencha seu nome e forma de contato.', 'error');
    return;
  }

  const phone = store.state.settings.whatsappNumber || '5531984566047';
  const text = `Olá Maker3D! 👋\n\n*Nome:* ${name}\n*Contato:* ${contact}\n*Assunto:* ${subject}\n*Mensagem:* ${msg}`;
  showToast('✅ Redirecionando para atendimento...', 'success');
  setTimeout(() => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  }, 500);
}

// Expose global API for inline HTML event handlers
window.makerApp = {
  showPage,
  toggleTheme,
  openModal,
  closeModal,
  switchMedia,
  setGalleryImg,
  selectCardColor,
  selectModalSectionColor,
  addToCart,
  addToCartFromModal,
  changeCartQty,
  removeFromCart,
  applyCouponCode,
  checkoutCart,
  toggleDrawer,
  toggleWishlist,
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
  signOutGoogle,
  submitContactForm,
  setHeroColor: (hex, el) => {
    document.querySelectorAll('.hero-swatch').forEach(s => s.classList.remove('active'));
    if (el) el.classList.add('active');
    viewer3D.setHeroFilamentColor(hex);
  },
  toggleModalWireframe: () => {
    const active = viewer3D.toggleModalWireframe();
    document.getElementById('ctrl-wireframe')?.classList.toggle('active', active);
  },
  resetModalCamera: () => viewer3D.resetModalCamera(),
  // Secret Admin Vault methods
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
  applyTheme(store.state.theme);
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

  // Initialize 3D Hero & STL Lab
  setTimeout(() => {
    viewer3D.initHero3D();
    viewer3D.initStlLab();
    initStlEstimator();
  }, 150);

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
    if (key === 'currentUser') {
      renderUserNavbarState();
    }
  });
});
