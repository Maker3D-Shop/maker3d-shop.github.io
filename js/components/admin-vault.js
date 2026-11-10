// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Hidden Admin Vault Console ("Site Admin Escondido")
// Accessible ONLY when navigating to /admin or #\admin or #/admin
// ═══════════════════════════════════════════════════════════════════════════
import { store } from '../config/store.js';
import { dbService } from '../services/db.js';
import { authService } from '../services/auth.js';
import { showToast, applyBrandSettings } from './ui.js';
import { renderProducts, renderFilters, renderCarousel } from './catalog.js';
import { toRawUrl } from './viewer3d.js';

let adminAuthenticated = sessionStorage.getItem('maker3d_admin_auth') === '1';
let activeAdminTab = 'dashboard';
let editingProductId = null;
let editingProductImages = [];

export function initSecretAdminTriggers() {
  const checkAdminUrl = () => {
    const path = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();

    const isAdminRoute =
      path.endsWith('/admin') ||
      path.endsWith('/admin/') ||
      path.endsWith('/admin/index.html') ||
      hash === '#admin' ||
      hash === '#/admin' ||
      hash === '#\\admin' ||
      search.includes('admin=1');

    if (isAdminRoute) {
      openAdminVault();
    }
  };

  window.addEventListener('hashchange', checkAdminUrl);
  window.addEventListener('popstate', checkAdminUrl);
  setTimeout(checkAdminUrl, 200);
}

export function openAdminVault() {
  const overlay = document.getElementById('adminVaultOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  const currUser = store.state.currentUser;
  if (currUser && authService.checkIsAdmin(currUser.email)) {
    adminAuthenticated = true;
    sessionStorage.setItem('maker3d_admin_auth', '1');
  }

  renderAdminVaultView();
}

export function closeAdminVault() {
  const overlay = document.getElementById('adminVaultOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  const path = (window.location.pathname || '').toLowerCase();
  if (path.endsWith('/admin') || path.endsWith('/admin/') || path.endsWith('/admin/index.html')) {
    window.location.href = '../index.html';
    return;
  }
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
  }
}

export function verifyAdminPin() {
  const pinInput = document.getElementById('adminVaultPinInput');
  const pin = (pinInput?.value || '').trim();
  const validPin = store.state.settings.adminPin || 'maker3d2026';

  if (pin === validPin) {
    adminAuthenticated = true;
    sessionStorage.setItem('maker3d_admin_auth', '1');
    showToast('Acesso Administrativo liberado.', 'success');
    renderAdminVaultView();
  } else {
    showToast('Senha/PIN incorreto.', 'error');
  }
}

export async function loginAdminWithGoogle() {
  const profile = await authService.triggerRealGoogleSignIn();
  if (profile) {
    adminAuthenticated = true;
    sessionStorage.setItem('maker3d_admin_auth', '1');
    showToast(`Painel Admin desbloqueado por ${profile.displayName}`, 'success');
    renderAdminVaultView();
  }
}

export function switchAdminTab(tabId) {
  activeAdminTab = tabId;
  renderAdminVaultView();
}

export function renderAdminVaultView() {
  const gate = document.getElementById('adminAuthGate');
  const workspace = document.getElementById('adminVaultWorkspace');
  if (!gate || !workspace) return;

  if (!adminAuthenticated) {
    gate.style.display = 'flex';
    workspace.style.display = 'none';
    return;
  }

  gate.style.display = 'none';
  workspace.style.display = 'flex';

  document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === activeAdminTab);
  });

  const main = document.getElementById('adminVaultContent');
  if (!main) return;

  if (activeAdminTab === 'dashboard') {
    main.innerHTML = renderDashboardTab();
  } else if (activeAdminTab === 'products') {
    main.innerHTML = renderProductsTab();
  } else if (activeAdminTab === 'cms') {
    main.innerHTML = renderCmsTab();
  } else if (activeAdminTab === 'orders') {
    main.innerHTML = renderOrdersTab();
  } else if (activeAdminTab === 'coupons') {
    main.innerHTML = renderCouponsAndColorsTab();
  } else if (activeAdminTab === 'calc') {
    main.innerHTML = renderCalcTab();
    setTimeout(runAdminCalculator, 30);
  } else if (activeAdminTab === 'cloud') {
    main.innerHTML = renderCloudDatabaseTab();
  }
}

function renderDashboardTab() {
  const products = store.state.products || [];
  const orders = store.state.orders || [];
  const users = store.state.users || [];
  const revenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  return `
    <div class="admin-top-bar">
      <div>
        <h2 style="font-size:1.65rem;font-weight:800">Console Administrativo Maker3D</h2>
        <p style="color:var(--text-secondary);font-size:0.88rem">Gerencie catálogo, banco de dados, pedidos e parâmetros de filamento em tempo real</p>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn-secondary btn-sm" onclick="window.makerApp.exportDatabaseJson()">Exportar JSON</button>
        <button class="btn-primary btn-sm" onclick="window.makerApp.syncEverythingToCloud()">Publicar Alterações</button>
      </div>
    </div>

    <div class="admin-kpi-grid">
      <div class="admin-kpi-card">
        <small>Produtos no Catálogo</small>
        <div class="kpi-val">${products.length}</div>
        <span style="font-size:0.78rem;color:var(--success)">Sincronizado</span>
      </div>
      <div class="admin-kpi-card">
        <small>Pedidos Registrados</small>
        <div class="kpi-val">${orders.length}</div>
        <span style="font-size:0.78rem;color:var(--text-muted)">Carrinho & STL Lab</span>
      </div>
      <div class="admin-kpi-card">
        <small>Receita Estimada</small>
        <div class="kpi-val">R$ ${revenue.toFixed(2).replace('.', ',')}</div>
        <span style="font-size:0.78rem;color:var(--brand-primary)">Acumulado</span>
      </div>
      <div class="admin-kpi-card">
        <small>Contas Registradas no DB</small>
        <div class="kpi-val">${users.length}</div>
        <span style="font-size:0.78rem;color:var(--info)">Google & Manual</span>
      </div>
    </div>

    <div class="admin-panel-card">
      <div class="admin-panel-header">
        <h3>Ações Rápidas</h3>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <button class="btn-primary btn-sm" onclick="window.makerApp.switchAdminTab('products'); window.makerApp.openAdminProductEditor()">+ Novo Produto</button>
        <button class="btn-secondary btn-sm" onclick="window.makerApp.switchAdminTab('cms')">Editar Textos & Identidade</button>
        <button class="btn-secondary btn-sm" onclick="window.makerApp.switchAdminTab('coupons')">Cupons & Filamentos</button>
        <button class="btn-secondary btn-sm" onclick="window.makerApp.switchAdminTab('cloud')">Firebase / Google OAuth / GitHub</button>
      </div>
    </div>

    <div class="admin-panel-card">
      <div class="admin-panel-header">
        <h3>Contas Registradas no Database (Coleções, Curtidas, Carrinho e Compras)</h3>
      </div>
      ${users.length ? `
        <table class="admin-table">
          <thead>
            <tr><th>Cliente</th><th>E-mail</th><th>Origem</th><th>Curtidas</th><th>Carrinho</th><th>Compras</th><th>Último Acesso</th></tr>
          </thead>
          <tbody>
            ${users.slice(0, 12).map(u => `
              <tr>
                <td style="display:flex;align-items:center;gap:8px">
                  <img src="${u.photoURL || ''}" style="width:26px;height:26px;border-radius:50%" onerror="this.style.display='none'">
                  <strong>${u.displayName || 'Usuário'}</strong>
                </td>
                <td>${u.email}</td>
                <td><span class="status-pill done">${u.provider || 'manual'}</span></td>
                <td>${(u.wishlist || []).length}</td>
                <td>${(u.cart || []).length}</td>
                <td>${(u.purchasedObjects || []).length}</td>
                <td>${u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('pt-BR') : 'Agora'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `<p style="color:var(--text-muted);font-size:0.88rem">Nenhuma conta registrada ainda.</p>`}
    </div>
  `;
}

function renderProductsTab() {
  const products = store.state.products || [];
  return `
    <div class="admin-top-bar">
      <div>
        <h2 style="font-size:1.65rem;font-weight:800">Gerenciador de Produtos & Perfis 3D</h2>
        <p style="color:var(--text-secondary);font-size:0.88rem">Edite preços, descontos, fotos, especificações técnicas e modelos 3D (.glb)</p>
      </div>
      <button class="btn-primary btn-sm" onclick="window.makerApp.openAdminProductEditor()">+ Novo Produto</button>
    </div>

    <div id="adminProductEditorBox" class="admin-panel-card" style="display:none;border:2px solid var(--brand-primary)"></div>

    <div class="admin-panel-card">
      <table class="admin-table">
        <thead>
          <tr><th>Produto</th><th>Categoria</th><th>Material</th><th>Preço</th><th>Desconto</th><th>3D</th><th>Ações</th></tr>
        </thead>
        <tbody>
          ${products.map(p => {
            const rawImg = toRawUrl(p.image);
            return `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:42px;height:42px;border-radius:8px;background:var(--bg-tertiary);overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:1.2rem">
                      ${rawImg ? `<img src="${rawImg}" style="width:100%;height:100%;object-fit:cover">` : (p.emoji || '📦')}
                    </div>
                    <div>
                      <strong>${p.name}</strong>
                      ${p.badge ? `<span style="font-size:0.7rem;background:var(--brand-pale);color:var(--brand-deep);padding:2px 7px;border-radius:6px;margin-left:6px">${p.badge}</span>` : ''}
                    </div>
                  </div>
                </td>
                <td>${p.category || '-'}</td>
                <td>${p.material || 'PLA Premium'}</td>
                <td><strong>${p.price ? 'R$ ' + Number(p.price).toFixed(2).replace('.', ',') : 'Sob Demanda'}</strong></td>
                <td>${p.discount > 0 ? `<span class="status-pill done">-${p.discount}%</span>` : '0%'}</td>
                <td>${p.model3d ? 'Sim' : '—'}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="btn-secondary btn-sm" onclick="window.makerApp.openAdminProductEditor('${p.id}')">Editar</button>
                    <button class="btn-secondary btn-sm" style="border-color:var(--danger);color:var(--danger)" onclick="window.makerApp.deleteAdminProduct('${p.id}')">Excluir</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function openAdminProductEditor(pid = null) {
  const box = document.getElementById('adminProductEditorBox');
  if (!box) return;
  const prod = pid ? store.state.products.find(p => String(p.id) === String(pid)) : null;
  editingProductId = prod ? prod.id : null;
  editingProductImages = [];
  if (prod) {
    if (prod.image) editingProductImages.push(prod.image);
    (prod.gallery || []).forEach(g => {
      if (g && !editingProductImages.includes(g)) editingProductImages.push(g);
    });
  }

  box.style.display = 'block';
  box.innerHTML = `
    <div class="admin-panel-header">
      <h3>${prod ? 'Editando: ' + prod.name : 'Novo Modelo / Produto'}</h3>
      <button class="icon-btn" onclick="document.getElementById('adminProductEditorBox').style.display='none'">✕</button>
    </div>
    <div class="admin-form-grid">
      <div class="admin-input-group">
        <label>Nome do Produto *</label>
        <input type="text" id="adm_p_name" value="${prod ? prod.name : ''}" placeholder="Ex: Dragão de Cristal Articulado">
      </div>
      <div class="admin-input-group">
        <label>Categoria</label>
        <input type="text" id="adm_p_category" value="${prod ? (prod.category || 'Articulado') : 'Articulado'}">
      </div>
      <div class="admin-input-group">
        <label>Preço (R$) — vazio para Sob Demanda</label>
        <input type="number" id="adm_p_price" step="0.01" value="${prod && prod.price !== null ? prod.price : ''}">
      </div>
      <div class="admin-input-group">
        <label>Selo Técnico (Badge)</label>
        <input type="text" id="adm_p_badge" value="${prod ? (prod.badge || '') : ''}" placeholder="Ex: Verificado, AMS Multicor">
      </div>
      <div class="admin-input-group">
        <label>Desconto (%)</label>
        <input type="number" id="adm_p_discount" min="0" max="90" value="${prod ? (prod.discount || 0) : 0}">
      </div>
      <div class="admin-input-group">
        <label>Material Padrão</label>
        <input type="text" id="adm_p_material" value="${prod ? (prod.material || 'PLA Premium') : 'PLA Premium'}">
      </div>
    </div>
    <div class="admin-input-group">
      <label>Descrição Técnica Completa *</label>
      <textarea id="adm_p_desc" rows="3">${prod ? (prod.desc || '') : ''}</textarea>
    </div>
    <div class="admin-form-grid">
      <div class="admin-input-group">
        <label>URL da Imagem Principal (Capa)</label>
        <input type="text" id="adm_p_image" value="${prod ? (prod.image || '') : ''}" placeholder="https://... ou assets/...">
      </div>
      <div class="admin-input-group">
        <label>URL do Modelo 3D (.glb / .gltf)</label>
        <input type="text" id="adm_p_model3d" value="${prod ? (prod.model3d || '') : ''}" placeholder="assets/products/models/p1.glb">
      </div>
    </div>
    <div class="admin-input-group">
      <label>URLs da Galeria Extra (separadas por vírgula)</label>
      <input type="text" id="adm_p_gallery" value="${prod && prod.gallery ? prod.gallery.join(', ') : ''}" placeholder="https://img1.webp, https://img2.webp">
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:12px">
      <button class="btn-secondary btn-sm" onclick="document.getElementById('adminProductEditorBox').style.display='none'">Cancelar</button>
      <button class="btn-primary btn-sm" onclick="window.makerApp.saveAdminProduct()">Salvar no Site & Database</button>
    </div>
  `;
  box.scrollIntoView({ behavior: 'smooth' });
}

export async function saveAdminProduct() {
  const name = document.getElementById('adm_p_name')?.value.trim();
  const desc = document.getElementById('adm_p_desc')?.value.trim();
  if (!name || !desc) {
    showToast('Preencha nome e descrição do produto.', 'error');
    return;
  }

  const priceRaw = document.getElementById('adm_p_price')?.value;
  const price = priceRaw !== '' ? parseFloat(priceRaw) : null;
  const galleryRaw = document.getElementById('adm_p_gallery')?.value || '';
  const gallery = galleryRaw.split(',').map(s => s.trim()).filter(Boolean);
  const globalCols = store.state.globalColors.slice(0, 4).map(c => ({ name: c.name, hex: c.hex }));

  const products = [...store.state.products];
  if (editingProductId !== null) {
    const idx = products.findIndex(p => String(p.id) === String(editingProductId));
    if (idx >= 0) {
      products[idx] = {
        ...products[idx],
        name,
        category: document.getElementById('adm_p_category')?.value.trim() || 'Articulado',
        material: document.getElementById('adm_p_material')?.value.trim() || 'PLA Premium',
        price,
        badge: document.getElementById('adm_p_badge')?.value.trim() || '',
        discount: parseInt(document.getElementById('adm_p_discount')?.value || '0', 10),
        desc,
        image: document.getElementById('adm_p_image')?.value.trim() || '',
        model3d: document.getElementById('adm_p_model3d')?.value.trim() || '',
        gallery
      };
    }
  } else {
    products.unshift({
      id: Date.now(),
      name,
      emoji: '📦',
      category: document.getElementById('adm_p_category')?.value.trim() || 'Articulado',
      material: document.getElementById('adm_p_material')?.value.trim() || 'PLA Premium',
      price,
      badge: document.getElementById('adm_p_badge')?.value.trim() || 'Novo',
      discount: parseInt(document.getElementById('adm_p_discount')?.value || '0', 10),
      rating: 5.0,
      reviewsCount: 1,
      downloadsCount: 120,
      printsCount: 85,
      layerHeight: '0.12 mm',
      infill: '15% Gyroid',
      nozzle: '0.4 mm',
      desc,
      image: document.getElementById('adm_p_image')?.value.trim() || '',
      model3d: document.getElementById('adm_p_model3d')?.value.trim() || '',
      gallery,
      colorSections: [{ name: 'Cores disponíveis', colors: globalCols }],
      colors: globalCols
    });
  }

  store.update('products', products, 'maker3d_products');
  await dbService.saveStoreData();
  renderProducts();
  renderFilters();
  renderCarousel();
  renderAdminVaultView();
  showToast('Produto atualizado ao vivo no site!', 'success');
}

export async function deleteAdminProduct(pid) {
  if (!confirm('Deseja realmente excluir este produto do catálogo?')) return;
  const products = store.state.products.filter(p => String(p.id) !== String(pid));
  store.update('products', products, 'maker3d_products');
  await dbService.saveStoreData();
  renderProducts();
  renderFilters();
  renderCarousel();
  renderAdminVaultView();
  showToast('Produto removido com sucesso.');
}

function renderCmsTab() {
  const s = store.state.settings;
  return `
    <div class="admin-top-bar">
      <div>
        <h2 style="font-size:1.65rem;font-weight:800">Editor Visual do Site (CMS)</h2>
        <p style="color:var(--text-secondary);font-size:0.88rem">Altere textos, cores e configurações globais da loja</p>
      </div>
      <button class="btn-primary btn-sm" onclick="window.makerApp.saveCmsSettings()">Aplicar Alterações</button>
    </div>

    <div class="admin-panel-card">
      <h3 style="margin-bottom:16px">Identidade Visual & Barra de Promoção</h3>
      <div class="admin-form-grid">
        <div class="admin-input-group">
          <label>Nome da Marca</label>
          <input type="text" id="cms_brandName" value="${s.brandName || 'Maker3D'}">
        </div>
        <div class="admin-input-group">
          <label>Cor Principal do Tema (Hex)</label>
          <input type="color" id="cms_primaryColor" value="${s.primaryColor || '#ff9e1b'}" style="height:42px;cursor:pointer">
        </div>
        <div class="admin-input-group">
          <label>Texto da Barra de Anúncio Topo</label>
          <input type="text" id="cms_promoBarText" value="${s.promoBarText || ''}">
        </div>
        <div class="admin-input-group">
          <label>Meta para Frete Grátis (R$)</label>
          <input type="number" id="cms_freeShip" value="${s.freeShippingThreshold || 120}">
        </div>
      </div>
    </div>

    <div class="admin-panel-card">
      <h3 style="margin-bottom:16px">Textos da Página Inicial & Credenciais</h3>
      <div class="admin-form-grid">
        <div class="admin-input-group">
          <label>Selo Superior (Hero Badge)</label>
          <input type="text" id="cms_heroBadge" value="${s.heroBadge || ''}">
        </div>
        <div class="admin-input-group">
          <label>WhatsApp Oficial (apenas números com DDI+DDD)</label>
          <input type="text" id="cms_whatsapp" value="${s.whatsappNumber || '5531984566047'}">
        </div>
      </div>
      <div class="admin-input-group">
        <label>Título Principal do Hero</label>
        <input type="text" id="cms_heroTitle" value="${(s.heroTitleHtml || '').replace(/"/g, '&quot;')}">
      </div>
      <div class="admin-input-group">
        <label>Subtítulo do Hero</label>
        <textarea id="cms_heroSubtitle" rows="2">${s.heroSubtitle || ''}</textarea>
      </div>
      <div class="admin-form-grid">
        <div class="admin-input-group">
          <label>E-mails Administradores (separados por vírgula)</label>
          <input type="text" id="cms_adminEmails" value="${(s.adminEmails || []).join(', ')}">
        </div>
        <div class="admin-input-group">
          <label>PIN Secreto do Painel Admin</label>
          <input type="text" id="cms_adminPin" value="${s.adminPin || 'maker3d2026'}">
        </div>
      </div>
    </div>
  `;
}

export async function saveCmsSettings() {
  const next = {
    ...store.state.settings,
    brandName: document.getElementById('cms_brandName')?.value.trim() || 'Maker3D',
    primaryColor: document.getElementById('cms_primaryColor')?.value || '#ff9e1b',
    promoBarText: document.getElementById('cms_promoBarText')?.value.trim() || '',
    freeShippingThreshold: parseFloat(document.getElementById('cms_freeShip')?.value || '120'),
    heroBadge: document.getElementById('cms_heroBadge')?.value.trim() || '',
    whatsappNumber: document.getElementById('cms_whatsapp')?.value.trim() || '5531984566047',
    heroTitleHtml: document.getElementById('cms_heroTitle')?.value || '',
    heroSubtitle: document.getElementById('cms_heroSubtitle')?.value.trim() || '',
    adminEmails: (document.getElementById('cms_adminEmails')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
    adminPin: document.getElementById('cms_adminPin')?.value.trim() || 'maker3d2026'
  };

  store.update('settings', next, 'maker3d_settings');
  applyBrandSettings();
  await dbService.saveStoreData();
  showToast('Configurações do site atualizadas em tempo real!', 'success');
}

function renderOrdersTab() {
  const orders = store.state.orders || [];
  return `
    <div class="admin-top-bar">
      <div>
        <h2 style="font-size:1.65rem;font-weight:800">Pedidos & Orçamentos</h2>
        <p style="color:var(--text-secondary);font-size:0.88rem">Acompanhe e altere o status de produção das peças</p>
      </div>
    </div>
    <div class="admin-panel-card">
      ${orders.length ? `
        <table class="admin-table">
          <thead>
            <tr><th>ID</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Status</th><th>Data</th></tr>
          </thead>
          <tbody>
            ${orders.map((o, idx) => `
              <tr>
                <td><strong>#${o.id}</strong></td>
                <td>${o.user?.name || 'Visitante'}<br><small style="color:var(--text-muted)">${o.user?.email || ''}</small></td>
                <td>${(o.items || []).map(i => `${i.qty}x ${i.name}`).join('<br>')}</td>
                <td><strong>R$ ${Number(o.total || 0).toFixed(2).replace('.', ',')}</strong></td>
                <td>
                  <select onchange="window.makerApp.updateOrderStatus(${idx}, this.value)" style="padding:5px 8px;border-radius:8px">
                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pendente</option>
                    <option value="printing" ${o.status === 'printing' ? 'selected' : ''}>Imprimindo 3D</option>
                    <option value="done" ${o.status === 'done' ? 'selected' : ''}>Enviado / Concluído</option>
                  </select>
                </td>
                <td>${new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `<p style="color:var(--text-muted)">Nenhum pedido registrado ainda.</p>`}
    </div>
  `;
}

export async function updateOrderStatus(idx, status) {
  const orders = [...store.state.orders];
  if (orders[idx]) {
    orders[idx].status = status;
    store.update('orders', orders, 'maker3d_orders');
    showToast('Status do pedido atualizado!', 'success');
  }
}

function renderCouponsAndColorsTab() {
  const coupons = store.state.coupons || [];
  const colors = store.state.globalColors || [];
  return `
    <div class="admin-top-bar">
      <h2 style="font-size:1.65rem;font-weight:800">Cupons de Desconto & Filamentos</h2>
    </div>

    <div class="admin-panel-card">
      <div class="admin-panel-header">
        <h3>Cupons Ativos</h3>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
        <input type="text" id="newCouponCode" placeholder="Código (ex: NATAL25)" style="padding:8px 12px;border-radius:8px;border:1px solid var(--border-subtle)">
        <input type="number" id="newCouponPct" placeholder="% Desconto" style="width:130px;padding:8px 12px;border-radius:8px;border:1px solid var(--border-subtle)">
        <button class="btn-primary btn-sm" onclick="window.makerApp.addAdminCoupon()">+ Criar Cupom</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${coupons.map((c, i) => `
          <div style="background:var(--brand-pale);border:1px solid var(--border-strong);padding:10px 14px;border-radius:10px;display:flex;align-items:center;gap:10px">
            <strong>${c.code}</strong>
            <span class="status-pill done">-${c.discountPct}%</span>
            <button style="background:none;border:none;color:var(--danger);cursor:pointer" onclick="window.makerApp.removeAdminCoupon(${i})">✕</button>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="admin-panel-card">
      <div class="admin-panel-header">
        <h3>Paleta Global de Filamentos</h3>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
        <input type="text" id="newFilName" placeholder="Nome da cor (ex: Azul Silk)" style="padding:8px 12px;border-radius:8px;border:1px solid var(--border-subtle)">
        <input type="color" id="newFilHex" value="#ff9e1b" style="height:38px;width:60px">
        <button class="btn-primary btn-sm" onclick="window.makerApp.addAdminFilament()">+ Adicionar Filamento</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${colors.map((c, i) => `
          <div style="background:var(--bg-primary);border:1px solid var(--border-subtle);padding:8px 12px;border-radius:99px;display:flex;align-items:center;gap:8px">
            <span style="width:18px;height:18px;border-radius:50%;background:${c.hex};display:inline-block;border:1px solid rgba(0,0,0,0.2)"></span>
            <strong style="font-size:0.84rem">${c.name}</strong>
            <button style="background:none;border:none;color:var(--danger);cursor:pointer" onclick="window.makerApp.removeAdminFilament(${i})">✕</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export async function addAdminCoupon() {
  const code = document.getElementById('newCouponCode')?.value.trim().toUpperCase();
  const pct = parseInt(document.getElementById('newCouponPct')?.value || '10', 10);
  if (!code) return;
  const coupons = [...store.state.coupons, { code, discountPct: pct, minOrder: 0, active: true }];
  store.update('coupons', coupons, 'maker3d_coupons');
  await dbService.saveStoreData();
  renderAdminVaultView();
  showToast(`Cupom ${code} criado!`, 'success');
}

export async function removeAdminCoupon(idx) {
  const coupons = [...store.state.coupons];
  coupons.splice(idx, 1);
  store.update('coupons', coupons, 'maker3d_coupons');
  await dbService.saveStoreData();
  renderAdminVaultView();
}

export async function addAdminFilament() {
  const name = document.getElementById('newFilName')?.value.trim();
  const hex = document.getElementById('newFilHex')?.value || '#ff9e1b';
  if (!name) return;
  const colors = [...store.state.globalColors, { name, hex, priceAdd: 0 }];
  store.update('globalColors', colors, 'maker3d_global_colors');
  await dbService.saveStoreData();
  renderAdminVaultView();
  showToast(`Filamento ${name} adicionado!`, 'success');
}

export async function removeAdminFilament(idx) {
  const colors = [...store.state.globalColors];
  colors.splice(idx, 1);
  store.update('globalColors', colors, 'maker3d_global_colors');
  await dbService.saveStoreData();
  renderAdminVaultView();
}

function renderCalcTab() {
  return `
    <div class="admin-top-bar">
      <h2 style="font-size:1.65rem;font-weight:800">Calculadora Industrial de Precificação 3D</h2>
    </div>
    <div class="admin-panel-card">
      <div class="admin-form-grid">
        <div>
          <div class="admin-input-group">
            <label>Material (Tabela Oficial Maker3D)</label>
            <select id="ac_mat_preset" class="sort-select" style="width:100%;border-radius:8px" onchange="document.getElementById('ac_fila').value=this.value; window.makerApp.runAdminCalculator()">
              <option value="150">PLA Premium — R$ 150,00 / kg</option>
              <option value="120">PETG Estrutural — R$ 120,00 / kg</option>
              <option value="200">TPU / Trust Flex — R$ 200,00 / kg</option>
            </select>
          </div>
          <div class="admin-input-group"><label>Tempo de impressão (horas)</label><input type="number" id="ac_horas" value="3" step="0.5" oninput="window.makerApp.runAdminCalculator()"></div>
          <div class="admin-input-group"><label>Filamento usado (gramas)</label><input type="number" id="ac_gramas" value="65" oninput="window.makerApp.runAdminCalculator()"></div>
          <div class="admin-input-group"><label>Preço do filamento (R$/kg)</label><input type="number" id="ac_fila" value="150" oninput="window.makerApp.runAdminCalculator()"></div>
          <div class="admin-input-group"><label>Potência da Impressora (Watts)</label><input type="number" id="ac_watts" value="200" oninput="window.makerApp.runAdminCalculator()"></div>
          <div class="admin-input-group"><label>Margem de Lucro (%)</label><input type="number" id="ac_margem" value="60" oninput="window.makerApp.runAdminCalculator()"></div>
        </div>
        <div style="background:linear-gradient(135deg,#111827,#1f2937);border-radius:16px;padding:32px;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
          <span style="font-size:0.9rem;opacity:0.8">Preço de Venda Sugerido</span>
          <div id="ac_resultPrice" style="font-size:3rem;font-weight:800;color:#ff9e1b;margin:8px 0">R$ 0,00</div>
          <small id="ac_resultBase" style="opacity:0.8">Custo de produção: R$ 0,00</small>
        </div>
      </div>
    </div>
  `;
}

export function runAdminCalculator() {
  const v = id => parseFloat(document.getElementById(id)?.value) || 0;
  const h = v('ac_horas');
  const g = v('ac_gramas');
  const pf = v('ac_fila');
  const w = v('ac_watts');
  const m = v('ac_margem');

  const cFila = (g / 1000) * pf;
  const cEner = ((w / 1000) * h) * 0.85;
  const cManut = h * 2.5;
  const base = cFila + cEner + cManut + 2.0;
  const finalP = base * (1 + m / 100);

  const pEl = document.getElementById('ac_resultPrice');
  const bEl = document.getElementById('ac_resultBase');
  if (pEl) pEl.textContent = 'R$ ' + finalP.toFixed(2).replace('.', ',');
  if (bEl) bEl.textContent = 'Custo base de produção: R$ ' + base.toFixed(2).replace('.', ',');
}

function renderCloudDatabaseTab() {
  const fb = dbService.getFirebaseConfig() || {};
  const googleClientId = store.state.settings.googleClientId || localStorage.getItem('maker3d_google_client_id') || '';
  const ghToken = sessionStorage.getItem('gh_token') || '';
  return `
    <div class="admin-top-bar">
      <div>
        <h2 style="font-size:1.65rem;font-weight:800">Google OAuth, Firebase Firestore & GitHub Sync</h2>
        <p style="color:var(--text-secondary);font-size:0.88rem">Conecte Google Client ID, Firebase ou GitHub para sincronização em nuvem</p>
      </div>
    </div>

    <div class="admin-panel-card">
      <h3 style="margin-bottom:12px">Google OAuth Client ID (Google Identity Services)</h3>
      <div class="admin-input-group">
        <label>Google OAuth 2.0 Client ID</label>
        <input type="text" id="adm_google_client_id" value="${googleClientId}" placeholder="1234567890-abcdef.apps.googleusercontent.com">
      </div>
    </div>

    <div class="admin-panel-card">
      <h3 style="margin-bottom:12px">Configuração do Firebase (Auth Google + Firestore Database)</h3>
      <div class="admin-form-grid">
        <div class="admin-input-group"><label>apiKey</label><input type="text" id="fb_apiKey" value="${fb.apiKey || ''}" placeholder="AIzaSy..."></div>
        <div class="admin-input-group"><label>authDomain</label><input type="text" id="fb_authDomain" value="${fb.authDomain || ''}" placeholder="seu-projeto.firebaseapp.com"></div>
        <div class="admin-input-group"><label>projectId</label><input type="text" id="fb_projectId" value="${fb.projectId || ''}" placeholder="seu-projeto"></div>
        <div class="admin-input-group"><label>appId</label><input type="text" id="fb_appId" value="${fb.appId || ''}" placeholder="1:123456:web:abcdef"></div>
      </div>
      <button class="btn-primary btn-sm" onclick="window.makerApp.saveAdminFirebaseConfig()">Salvar Credenciais Google & Firebase</button>
    </div>

    <div class="admin-panel-card">
      <h3 style="margin-bottom:12px">Sincronização Direta com GitHub (data.json)</h3>
      <div class="admin-input-group">
        <label>Personal Access Token do GitHub (escopo repo)</label>
        <input type="password" id="adm_gh_token" value="${ghToken}" placeholder="ghp_...">
      </div>
      <button class="btn-primary btn-sm" onclick="window.makerApp.syncEverythingToCloud()">Enviar Catálogo para GitHub & Cloud Agora</button>
    </div>
  `;
}

export async function saveAdminFirebaseConfig() {
  const gClientId = document.getElementById('adm_google_client_id')?.value.trim() || '';
  if (gClientId) {
    localStorage.setItem('maker3d_google_client_id', gClientId);
    store.update('settings', { ...store.state.settings, googleClientId: gClientId }, 'maker3d_settings');
  }
  const cfg = {
    apiKey: document.getElementById('fb_apiKey')?.value.trim() || '',
    authDomain: document.getElementById('fb_authDomain')?.value.trim() || '',
    projectId: document.getElementById('fb_projectId')?.value.trim() || '',
    appId: document.getElementById('fb_appId')?.value.trim() || ''
  };
  dbService.saveFirebaseConfig(cfg);
  await dbService.init();
  showToast('Configurações de Google OAuth & Firebase salvas!', 'success');
}

export async function syncEverythingToCloud() {
  const tokenInput = document.getElementById('adm_gh_token');
  if (tokenInput && tokenInput.value.trim()) {
    sessionStorage.setItem('gh_token', tokenInput.value.trim());
  }
  const ghToken = sessionStorage.getItem('gh_token') || '';
  try {
    await dbService.saveStoreData({ syncGitHub: !!ghToken, ghToken });
    showToast(ghToken ? 'Sincronizado com GitHub + Database!' : 'Salvo no Database Local/Cloud!', 'success');
  } catch (err) {
    showToast('Erro ao enviar para GitHub: ' + err.message, 'error');
  }
}

export function exportDatabaseJson() {
  const data = {
    products: store.state.products,
    settings: store.state.settings,
    coupons: store.state.coupons,
    faqs: store.state.faqs,
    globalColors: store.state.globalColors,
    orders: store.state.orders,
    users: store.state.users
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'maker3d-database-backup.json';
  a.click();
  showToast('Backup JSON baixado!');
}
