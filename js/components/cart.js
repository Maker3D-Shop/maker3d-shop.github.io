// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Smart Cart, Coupons, Free Shipping Progress & Database Order Sync
// ═══════════════════════════════════════════════════════════════════════════
import { store } from '../config/store.js';
import { getSelectedColorsForProduct, getProductColors, openModal } from './catalog.js';
import { toRawUrl } from './viewer3d.js';
import { showToast, showPage } from './ui.js';
import { dbService } from '../services/db.js';

export function addToCart(pid, filamentPolymer = 'PLA') {
  const p = store.state.products.find(x => String(x.id) === String(pid));
  if (!p) return;

  if (p.custom) {
    openModal(p.id);
    return;
  }

  let chosenColors = getSelectedColorsForProduct(p.id).filter(Boolean);
  if (!chosenColors.length) {
    const defCols = getProductColors(p);
    if (defCols.length) chosenColors = [defCols[0]];
  }

  const matMultipliers = { PLA: 1.0, PETG: 0.92, TPU: 1.25 };
  const mult = matMultipliers[filamentPolymer] || 1.0;
  const adjustedPrice = p.price ? parseFloat((p.price * mult).toFixed(2)) : null;

  const cart = [...store.state.cart];
  const existing = cart.find(
    c => String(c.id) === String(p.id) &&
         (c.filamentPolymer || 'PLA') === filamentPolymer &&
         JSON.stringify(c.selectedColors) === JSON.stringify(chosenColors)
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      emoji: p.emoji || '📦',
      price: adjustedPrice,
      discount: p.discount || 0,
      image: p.image,
      qty: 1,
      filamentPolymer,
      selectedColors: chosenColors
    });
  }

  store.update('cart', cart, 'maker3d_cart');
  updateCartUI();

  const cc = document.getElementById('cartCount');
  if (cc) {
    cc.classList.remove('bump');
    void cc.offsetWidth;
    cc.classList.add('bump');
  }
  showToast(`✅ ${p.name} adicionado ao carrinho!`, 'success');
}

export function changeCartQty(idx, delta) {
  const cart = [...store.state.cart];
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  store.update('cart', cart, 'maker3d_cart');
  updateCartUI();
}

export function removeFromCart(idx) {
  const cart = [...store.state.cart];
  cart.splice(idx, 1);
  store.update('cart', cart, 'maker3d_cart');
  updateCartUI();
}

export function applyCouponCode() {
  const input = document.getElementById('couponInput');
  const code = (input?.value || '').trim().toUpperCase();
  if (!code) return;

  const found = (store.state.coupons || []).find(c => c.code.toUpperCase() === code && c.active);
  if (!found) {
    showToast('❌ Cupom inválido ou expirado.', 'error');
    return;
  }

  const subtotal = getCartSubtotal();
  if (found.minOrder && subtotal < found.minOrder) {
    showToast(`❗ Pedido mínimo de R$ ${found.minOrder},00 para o cupom ${found.code}`, 'error');
    return;
  }

  store.state.activeCoupon = found;
  updateCartUI();
  showToast(`🎉 Cupom ${found.code} (-${found.discountPct}%) aplicado!`, 'success');
}

export function getCartSubtotal() {
  return (store.state.cart || []).reduce((sum, item) => {
    const unit = (item.price || 0) * (item.discount > 0 ? (1 - item.discount / 100) : 1);
    return sum + unit * item.qty;
  }, 0);
}

const SVG_SHOPPING_BAG_LARGE = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:var(--brand-primary);opacity:0.75"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
const SVG_TRASH_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
const SVG_CUBE_ICON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--brand-primary)"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;

export function updateCartUI() {
  const cart = store.state.cart || [];
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = getCartSubtotal();

  const coupon = store.state.activeCoupon;
  const couponDisc = coupon ? subtotal * (coupon.discountPct / 100) : 0;
  const finalTotal = Math.max(0, subtotal - couponDisc);

  const countEl = document.getElementById('cartCount');
  const navCountEl = document.getElementById('navCartCount');
  const mobCountEl = document.getElementById('mobNavCartCount');
  if (countEl) countEl.textContent = count;
  if (navCountEl) {
    navCountEl.textContent = count;
    navCountEl.style.display = count > 0 ? 'flex' : 'none';
  }
  if (mobCountEl) {
    mobCountEl.textContent = count;
    mobCountEl.style.display = count > 0 ? 'flex' : 'none';
  }

  // Free shipping progress bar
  const threshold = store.state.settings.freeShippingThreshold || 120;
  const shipText = document.getElementById('shippingProgressText');
  const shipFill = document.getElementById('shippingProgressBarFill');
  if (shipText && shipFill) {
    const pct = Math.min(100, (finalTotal / threshold) * 100);
    shipFill.style.width = pct + '%';
    if (finalTotal >= threshold) {
      shipText.innerHTML = 'Parabéns! Você ganhou <strong>FRETE GRÁTIS</strong>!';
    } else {
      const diff = (threshold - finalTotal).toFixed(2).replace('.', ',');
      shipText.innerHTML = `Faltam <strong>R$ ${diff}</strong> para ganhar <strong>Frete Grátis</strong>!`;
    }
  }

  const itemsContainer = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!itemsContainer || !footer) return;

  if (!cart.length) {
    itemsContainer.innerHTML = `<div style="text-align:center;padding:52px 16px;color:var(--text-muted)">
      <div style="margin-bottom:12px;display:flex;justify-content:center">${SVG_SHOPPING_BAG_LARGE}</div>
      <p>Sua sacola está vazia.<br>Explore nossas peças em 3D!</p>
    </div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) {
    totalEl.innerHTML = coupon
      ? `<small style="text-decoration:line-through;color:var(--text-muted);font-size:0.85rem;margin-right:6px">R$ ${subtotal.toFixed(2).replace('.', ',')}</small>R$ ${finalTotal.toFixed(2).replace('.', ',')}`
      : `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
  }

  itemsContainer.innerHTML = cart.map((item, i) => {
    const rawImg = toRawUrl(item.image);
    const unit = (item.price || 0) * (item.discount > 0 ? (1 - item.discount / 100) : 1);
    const colorsHtml = (item.selectedColors || []).map(sc => `
      <span style="display:inline-flex;align-items:center;gap:4px;font-size:0.74rem;color:var(--text-secondary);margin-right:6px">
        <span style="width:9px;height:9px;border-radius:50%;background:${sc.hex};display:inline-block;border:1px solid rgba(0,0,0,0.2)"></span>${sc.name}
      </span>
    `).join('');

    return `
      <div style="display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-subtle)">
        <div style="width:54px;height:54px;border-radius:10px;background:var(--brand-pale);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
          ${rawImg ? `<img src="${rawImg}" style="width:100%;height:100%;object-fit:cover">` : SVG_CUBE_ICON}
        </div>
        <div style="flex:1;min-width:0">
          <strong style="display:block;font-size:0.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</strong>
          <div>${colorsHtml}</div>
          <span style="font-size:0.84rem;color:var(--brand-primary);font-weight:700">${item.price ? 'R$ ' + unit.toFixed(2).replace('.', ',') : 'Sob consulta'}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="icon-btn" style="width:26px;height:26px;font-size:0.85rem" onclick="window.makerApp.changeCartQty(${i}, -1)">−</button>
          <strong style="font-size:0.88rem;min-width:18px;text-align:center">${item.qty}</strong>
          <button class="icon-btn" style="width:26px;height:26px;font-size:0.85rem" onclick="window.makerApp.changeCartQty(${i}, 1)">+</button>
        </div>
        <button class="icon-btn" style="width:28px;height:28px;color:var(--danger)" onclick="window.makerApp.removeFromCart(${i})" aria-label="Remover item">${SVG_TRASH_ICON}</button>
      </div>
    `;
  }).join('');
}

export async function checkoutCart() {
  const cart = store.state.cart || [];
  if (!cart.length) return;

  const notes = document.getElementById('cartOrderNotes')?.value.trim() || '';
  const subtotal = getCartSubtotal();
  const coupon = store.state.activeCoupon;
  const discountVal = coupon ? subtotal * (coupon.discountPct / 100) : 0;
  const total = Math.max(0, subtotal - discountVal);

  // Record order in Database (Firestore + Local)
  const savedOrder = await dbService.createOrder({
    items: cart,
    subtotal,
    couponCode: coupon ? coupon.code : null,
    total,
    notes
  });

  const lines = cart.map(c => {
    const unit = (c.price || 0) * (c.discount > 0 ? (1 - c.discount / 100) : 1);
    const colStr = (c.selectedColors && c.selectedColors.length)
      ? ` [${c.selectedColors.map(sc => sc.name).join(' + ')}]`
      : '';
    return `• ${c.qty}x ${c.name}${colStr} — R$ ${(unit * c.qty).toFixed(2).replace('.', ',')}`;
  });

  const userStr = store.state.currentUser ? `\n👤 Cliente: ${store.state.currentUser.displayName} (${store.state.currentUser.email})` : '';
  const couponStr = coupon ? `\n🎟️ Cupom aplicado: ${coupon.code} (-${coupon.discountPct}%)` : '';
  const notesStr = notes ? `\n📝 Obs: ${notes}` : '';

  const msg = `Olá Maker3D! 🎉 Gostaria de finalizar meu pedido *#${savedOrder.id}*:${userStr}\n\n${lines.join('\n')}${couponStr}${notesStr}\n\n💰 *Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\nAguardo confirmação para pagamento (PIX/Cartão)!`;

  const phone = store.state.settings.whatsappNumber || '5531984566047';
  store.update('cart', [], 'maker3d_cart');
  store.state.activeCoupon = null;
  updateCartUI();
  toggleDrawer('cartDrawer', false);
  showToast(`🚀 Pedido #${savedOrder.id} registrado! Abrindo WhatsApp...`, 'success');

  setTimeout(() => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }, 650);
}

export function toggleDrawer(drawerId, forceState) {
  const dr = document.getElementById(drawerId);
  const ov = document.getElementById('drawerOverlay');
  if (!dr || !ov) return;
  const isOpen = forceState !== undefined ? forceState : !dr.classList.contains('open');
  document.querySelectorAll('.side-drawer').forEach(d => d.classList.remove('open'));
  if (isOpen) {
    dr.classList.add('open');
    ov.classList.add('open');
  } else {
    dr.classList.remove('open');
    ov.classList.remove('open');
  }
}
