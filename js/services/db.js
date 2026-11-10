// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Hybrid Database & Cloud Sync Service (Firebase Firestore + GitHub + IndexedDB/Local)
// ═══════════════════════════════════════════════════════════════════════════
import { store, FALLBACK_PRODUCTS } from '../config/store.js';

const GITHUB_RAW_DATA = 'https://raw.githubusercontent.com/Maker3D-Shop/maker3d-shop.github.io/main/data.json';

class DatabaseService {
  constructor() {
    this.firestore = null;
    this.firebaseApp = null;
    this.isCloudActive = false;
    this.broadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('maker3d_realtime_sync') : null;

    if (this.broadcast) {
      this.broadcast.onmessage = (event) => {
        const { key, value } = event.data || {};
        if (key && value !== undefined) {
          store.state[key] = value;
          store.notify(key);
        }
      };
    }
  }

  /**
   * Initializes Firebase App & Firestore if credentials are configured in settings or localStorage
   */
  async init() {
    const fbConfig = this.getFirebaseConfig();
    if (fbConfig && fbConfig.apiKey && fbConfig.projectId) {
      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        const { getFirestore, doc, getDoc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

        this.firebaseApp = initializeApp(fbConfig);
        this.firestore = getFirestore(this.firebaseApp);
        this.isCloudActive = true;

        onSnapshot(doc(this.firestore, 'maker3d_store', 'catalog'), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.products) store.update('products', data.products, 'maker3d_products');
            if (data.settings) store.update('settings', { ...store.state.settings, ...data.settings }, 'maker3d_settings');
            if (data.coupons) store.update('coupons', data.coupons, 'maker3d_coupons');
            if (data.faqs) store.update('faqs', data.faqs, 'maker3d_faqs');
            if (data.globalColors) store.update('globalColors', data.globalColors, 'maker3d_global_colors');
          }
        });

        const ordersSnap = await getDoc(doc(this.firestore, 'maker3d_store', 'orders'));
        if (ordersSnap.exists() && ordersSnap.data().list) {
          store.update('orders', ordersSnap.data().list, 'maker3d_orders');
        }
      } catch (err) {
        console.warn('Firebase Cloud init fallback to Local/GitHub DB:', err);
        this.isCloudActive = false;
      }
    }

    await this.syncCatalogFromRepo();

    // Auto-sync user data (cart, wishlist, collections, orders) to currentUser profile in DB
    store.subscribe((state, key) => {
      if (state.currentUser && ['cart', 'wishlist', 'collections', 'orders'].includes(key)) {
        this.syncCurrentUserStateToDB();
      }
    });
  }

  getFirebaseConfig() {
    try {
      const saved = localStorage.getItem('maker3d_firebase_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  }

  saveFirebaseConfig(configObj) {
    localStorage.setItem('maker3d_firebase_config', JSON.stringify(configObj));
  }

  async syncCatalogFromRepo() {
    const hasAdminOverride = localStorage.getItem('maker3d_admin_modified') === '1';
    if (hasAdminOverride) return;

    try {
      const res = await fetch('./data.json?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        this.mergeRepoData(data);
        return;
      }
    } catch (e) {}

    try {
      const ghRes = await fetch(GITHUB_RAW_DATA + '?t=' + Date.now(), { cache: 'no-store' });
      if (ghRes.ok) {
        const data = await ghRes.json();
        this.mergeRepoData(data);
      }
    } catch (e) {}
  }

  mergeRepoData(data) {
    if (data && Array.isArray(data.products) && data.products.length > 0) {
      const modelMap = {
        1779035132088: 'assets/products/models/p5.glb',
        1779036803058: 'assets/products/models/p1.glb',
        1779036994512: 'assets/products/models/p5.glb',
        1779041587144: 'assets/products/models/p3.glb',
        1779042797608: 'assets/products/models/p4.glb',
        1779043350679: 'assets/products/models/p4.glb'
      };

      const enriched = data.products.map(p => {
        const fbMatch = FALLBACK_PRODUCTS.find(fp => String(fp.id) === String(p.id));
        return {
          ...(fbMatch || {}),
          ...p,
          image: p.image || (fbMatch ? fbMatch.image : ''),
          gallery: (p.gallery && p.gallery.length) ? p.gallery : (fbMatch ? fbMatch.gallery : []),
          rating: p.rating || (fbMatch ? fbMatch.rating : 4.9),
          reviewsCount: p.reviewsCount || (fbMatch ? fbMatch.reviewsCount : 18),
          downloadsCount: p.downloadsCount || (fbMatch ? fbMatch.downloadsCount : 640),
          printsCount: p.printsCount || (fbMatch ? fbMatch.printsCount : 390),
          layerHeight: p.layerHeight || (fbMatch ? fbMatch.layerHeight : '0.12 mm'),
          infill: p.infill || (fbMatch ? fbMatch.infill : '15% Gyroid'),
          nozzle: p.nozzle || (fbMatch ? fbMatch.nozzle : '0.4 mm'),
          material: p.material || (fbMatch ? fbMatch.material : 'PLA Premium'),
          model3d: p.model3d || modelMap[p.id] || (fbMatch ? fbMatch.model3d : '')
        };
      });

      FALLBACK_PRODUCTS.forEach(fp => {
        if (!enriched.some(ep => String(ep.id) === String(fp.id))) {
          enriched.push(fp);
        }
      });

      store.update('products', enriched, 'maker3d_products');
    }
    if (data && data.settings) {
      store.update('settings', { ...store.state.settings, ...data.settings }, 'maker3d_settings');
    }
  }

  async saveStoreData({ syncGitHub = false, ghToken = '' } = {}) {
    localStorage.setItem('maker3d_admin_modified', '1');
    store.saveLocal('maker3d_products', store.state.products);
    store.saveLocal('maker3d_settings', store.state.settings);
    store.saveLocal('maker3d_coupons', store.state.coupons);
    store.saveLocal('maker3d_faqs', store.state.faqs);
    store.saveLocal('maker3d_global_colors', store.state.globalColors);

    if (this.broadcast) {
      this.broadcast.postMessage({ key: 'products', value: store.state.products });
      this.broadcast.postMessage({ key: 'settings', value: store.state.settings });
      this.broadcast.postMessage({ key: 'coupons', value: store.state.coupons });
      this.broadcast.postMessage({ key: 'faqs', value: store.state.faqs });
    }

    if (this.isCloudActive && this.firestore) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        await setDoc(doc(this.firestore, 'maker3d_store', 'catalog'), {
          products: store.state.products,
          settings: store.state.settings,
          coupons: store.state.coupons,
          faqs: store.state.faqs,
          globalColors: store.state.globalColors,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Firestore sync error:', e);
      }
    }

    if (syncGitHub && ghToken) {
      await this.pushDataJsonToGitHub(ghToken);
    }
  }

  /**
   * Synchronize current user's liked items, collections, cart, and purchased objects into their DB record
   */
  async syncCurrentUserStateToDB() {
    const curr = store.state.currentUser;
    if (!curr || !curr.email) return;

    const users = [...(store.state.users || [])];
    const idx = users.findIndex(u => (u.email || '').toLowerCase() === curr.email.toLowerCase());

    const myOrders = (store.state.orders || []).filter(
      o => (o.user?.email || '').toLowerCase() === curr.email.toLowerCase()
    );
    const purchasedObjects = myOrders.flatMap(o => (o.items || []).map(it => ({
      orderId: o.id,
      date: o.createdAt,
      status: o.status,
      id: it.id,
      name: it.name,
      qty: it.qty,
      price: it.price,
      image: it.image,
      selectedColors: it.selectedColors || []
    })));

    const updatedProfile = {
      ...curr,
      wishlist: [...(store.state.wishlist || [])],
      collections: [...(store.state.collections || [])],
      cart: [...(store.state.cart || [])],
      purchasedObjects,
      wishlistCount: (store.state.wishlist || []).length,
      cartCount: (store.state.cart || []).reduce((s, c) => s + (c.qty || 1), 0),
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updatedProfile };
    } else {
      users.unshift(updatedProfile);
    }

    store.state.users = users;
    store.state.currentUser = updatedProfile;
    store.saveLocal('maker3d_users', users);
    store.saveLocal('maker3d_current_user', updatedProfile);

    if (this.isCloudActive && this.firestore) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        await setDoc(doc(this.firestore, 'maker3d_users', updatedProfile.uid || updatedProfile.email), updatedProfile, { merge: true });
      } catch (e) {}
    }
  }

  /**
   * Record user login/registration in database & restore their saved collections, likes, cart & purchases
   */
  async saveUserRecord(userProfile) {
    const users = [...(store.state.users || [])];
    const idx = users.findIndex(u => (u.email || '').toLowerCase() === (userProfile.email || '').toLowerCase());
    const existing = idx >= 0 ? users[idx] : null;

    // Merge guest cart/wishlist/collections with account's saved data
    const mergedWishlist = Array.from(new Set([
      ...(existing?.wishlist || []),
      ...(store.state.wishlist || [])
    ]));

    const existingCart = existing?.cart || [];
    const currentCart = store.state.cart || [];
    const mergedCart = [...existingCart];
    currentCart.forEach(item => {
      const match = mergedCart.find(
        c => String(c.id) === String(item.id) && JSON.stringify(c.selectedColors) === JSON.stringify(item.selectedColors)
      );
      if (match) {
        match.qty = Math.max(match.qty, item.qty);
      } else {
        mergedCart.push(item);
      }
    });

    const mergedCollections = existing?.collections && existing.collections.length
      ? existing.collections
      : (store.state.collections || [{ id: 'col-default', name: 'Meus Modelos Salvos', items: [] }]);

    const myOrders = (store.state.orders || []).filter(
      o => (o.user?.email || '').toLowerCase() === (userProfile.email || '').toLowerCase()
    );
    const purchasedObjects = myOrders.flatMap(o => (o.items || []).map(it => ({
      orderId: o.id,
      date: o.createdAt,
      status: o.status,
      id: it.id,
      name: it.name,
      qty: it.qty,
      price: it.price,
      image: it.image,
      selectedColors: it.selectedColors || []
    })));

    const record = {
      ...(existing || {}),
      ...userProfile,
      registered: true,
      lastLoginAt: new Date().toISOString(),
      wishlist: mergedWishlist,
      collections: mergedCollections,
      cart: mergedCart,
      purchasedObjects,
      wishlistCount: mergedWishlist.length,
      cartCount: mergedCart.reduce((s, c) => s + (c.qty || 1), 0)
    };

    if (idx >= 0) {
      users[idx] = record;
    } else {
      record.createdAt = new Date().toISOString();
      users.unshift(record);
    }

    store.update('wishlist', mergedWishlist, 'maker3d_wishlist');
    store.update('collections', mergedCollections, 'maker3d_collections');
    store.update('cart', mergedCart, 'maker3d_cart');
    store.update('users', users, 'maker3d_users');
    store.update('currentUser', record, 'maker3d_current_user');

    if (this.isCloudActive && this.firestore) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        await setDoc(doc(this.firestore, 'maker3d_users', record.uid || record.email), record, { merge: true });
      } catch (e) {
        console.warn('Firestore user sync warning:', e);
      }
    }
    return record;
  }

  findUserByEmail(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    return (store.state.users || []).find(u => (u.email || '').toLowerCase() === clean) || null;
  }

  /**
   * Save an Order (WhatsApp checkout or Custom STL request) to Database
   */
  async createOrder(orderPayload) {
    const order = {
      id: 'PED-' + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString(),
      status: 'pending',
      user: store.state.currentUser
        ? {
            name: store.state.currentUser.displayName,
            email: store.state.currentUser.email,
            photoURL: store.state.currentUser.photoURL
          }
        : { name: orderPayload.customerName || 'Visitante', email: orderPayload.customerContact || '' },
      ...orderPayload
    };

    const orders = [order, ...store.state.orders];
    store.update('orders', orders, 'maker3d_orders');

    if (store.state.currentUser) {
      await this.syncCurrentUserStateToDB();
    }

    if (this.broadcast) {
      this.broadcast.postMessage({ key: 'orders', value: orders });
    }

    if (this.isCloudActive && this.firestore) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        await setDoc(doc(this.firestore, 'maker3d_store', 'orders'), { list: orders }, { merge: true });
      } catch (e) {}
    }

    return order;
  }

  async addReview(productId, reviewObj) {
    const allReviews = { ...store.state.reviews };
    const list = allReviews[productId] || [];
    const entry = {
      id: 'rev-' + Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
      ...reviewObj
    };
    allReviews[productId] = [entry, ...list];
    store.update('reviews', allReviews, 'maker3d_reviews');
    return entry;
  }

  async uploadFileToGitHub(path, contentBase64, commitMessage, token) {
    const { githubOwner, githubRepo, githubBranch } = store.state.settings;
    const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${path}`;
    let sha = null;
    try {
      const getRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (getRes.ok) {
        const fd = await getRes.json();
        sha = fd.sha;
      }
    } catch (e) {}

    const body = { message: commitMessage, content: contentBase64, branch: githubBranch };
    if (sha) body.sha = sha;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Erro desconhecido no GitHub' }));
      throw new Error(err.message || 'Falha no upload para o GitHub');
    }
    return await response.json();
  }

  async pushDataJsonToGitHub(token) {
    const payload = {
      products: store.state.products,
      settings: store.state.settings,
      coupons: store.state.coupons,
      faqs: store.state.faqs,
      globalColors: store.state.globalColors,
      updatedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return await this.uploadFileToGitHub('data.json', base64, 'chore(cms): update store catalog via Maker3D Admin Vault', token);
  }
}

export const dbService = new DatabaseService();
