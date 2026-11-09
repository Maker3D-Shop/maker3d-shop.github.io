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

        // Real-time listener on main store document
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

        // Load orders & users if available
        const ordersSnap = await getDoc(doc(this.firestore, 'maker3d_store', 'orders'));
        if (ordersSnap.exists() && ordersSnap.data().list) {
          store.update('orders', ordersSnap.data().list, 'maker3d_orders');
        }
      } catch (err) {
        console.warn('Firebase Cloud init fallback to Local/GitHub DB:', err);
        this.isCloudActive = false;
      }
    }

    // Load from local data.json or GitHub raw if local storage was not customized by Admin
    await this.syncCatalogFromRepo();
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
    // Only overwrite if admin hasn't locally modified products in this browser session
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
      // Enhance repo products with local 3D models & ratings if missing
      const modelMap = {
        1779035132088: 'assets/products/models/p5.glb',
        1779036803058: 'assets/products/models/p1.glb',
        1779036994512: 'assets/products/models/p5.glb',
        1779041587144: 'assets/products/models/p3.glb',
        1779042797608: 'assets/products/models/p4.glb',
        1779043350679: 'assets/products/models/p4.glb'
      };

      const enriched = data.products.map(p => ({
        ...p,
        rating: p.rating || 4.9,
        reviewsCount: p.reviewsCount || Math.floor(Math.random() * 25) + 12,
        model3d: p.model3d || modelMap[p.id] || ''
      }));

      // Append extra local 3D products from FALLBACK_PRODUCTS if not already present
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

  /**
   * Persist full catalog & settings to LocalStorage, BroadcastChannel, Firestore, and optionally GitHub
   */
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

    // Save to Firestore if active
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

    // Save to GitHub repo if requested
    if (syncGitHub && ghToken) {
      await this.pushDataJsonToGitHub(ghToken);
    }
  }

  /**
   * Record user login/profile in database
   */
  async saveUserRecord(userProfile) {
    const users = [...store.state.users];
    const idx = users.findIndex(u => u.email === userProfile.email || u.uid === userProfile.uid);
    const record = {
      ...userProfile,
      lastLoginAt: new Date().toISOString(),
      wishlistCount: store.state.wishlist.length,
      cartCount: store.state.cart.length
    };
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...record };
    } else {
      record.createdAt = new Date().toISOString();
      users.unshift(record);
    }
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

  /**
   * Save an Order (WhatsApp checkout or Custom STL request) to Database
   */
  async createOrder(orderPayload) {
    const order = {
      id: 'PED-' + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString(),
      status: 'pending', // pending | printing | shipped | done
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

  /**
   * Add a product review to Database
   */
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

  /**
   * GitHub API synchronization for data.json and images
   */
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
    const jsonString = JSON.stringify(payload, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(jsonString)));
    return await this.uploadFileToGitHub('data.json', base64Content, '⚡ Atualização via Painel Admin Maker3D', token);
  }
}

export const dbService = new DatabaseService();
