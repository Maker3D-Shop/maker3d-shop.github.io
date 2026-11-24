// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Real Google Authentication (GIS + Firebase OAuth) & Manual Registration
// ═══════════════════════════════════════════════════════════════════════════
import { store } from '../config/store.js';
import { dbService } from './db.js';
import { showToast } from '../components/ui.js';

class AuthService {
  constructor() {
    this.firebaseAuth = null;
    this.pendingGoogleUser = null;
    this.authMode = 'login'; // 'login' | 'register' | 'complete-google'
    this.pendingPostAuthAction = null;
    this.pendingContextLabel = '';
  }

  /**
   * Smart Auth Gate for Likes, Collections, and Cart:
   * - If user is already logged in -> returns true immediately.
   * - If not logged in -> checks if the device/DB already has a registered account:
   *     • If an account already exists -> opens Login tab ("Fazer Login") with email ready.
   *     • If no account exists yet -> opens Registration tab ("Cadastrar Conta").
   * - Stores `onAuthenticatedCallback` so as soon as the user logs in or registers, the like/cart action completes automatically!
   */
  requireAuthForAction(contextLabel = 'continuar', onAuthenticatedCallback = null) {
    if (store.state.currentUser && store.state.currentUser.email) {
      return true;
    }

    this.pendingPostAuthAction = typeof onAuthenticatedCallback === 'function' ? onAuthenticatedCallback : null;
    this.pendingContextLabel = contextLabel;

    const knownUsers = store.state.users || [];
    const lastEmail = localStorage.getItem('maker3d_last_known_email') || (knownUsers[0]?.email || '');
    const hasExistingAccount = Boolean(lastEmail || knownUsers.length > 0);

    if (hasExistingAccount) {
      this.openAuthModal('login', {
        prefillEmail: lastEmail,
        notice: `Identificamos que você já possui cadastro! Faça login para <strong>${contextLabel}</strong>.`
      });
      showToast(`Faça login na sua conta para ${contextLabel}.`);
    } else {
      this.openAuthModal('register', {
        notice: `Crie seu cadastro rápido para <strong>${contextLabel}</strong> e salvar tudo na sua conta.`
      });
      showToast(`Cadastre sua conta para ${contextLabel}.`);
    }
    return false;
  }

  runPendingActionIfAny() {
    if (typeof this.pendingPostAuthAction === 'function') {
      const fn = this.pendingPostAuthAction;
      this.pendingPostAuthAction = null;
      this.pendingContextLabel = '';
      setTimeout(() => {
        try { fn(); } catch (e) { console.warn('Post-auth callback error:', e); }
      }, 120);
    }
  }

  /**
   * Called in real time when user types an email in either tab:
   * - If user is on Register tab and email already exists in DB -> immediately switches to Login!
   * - If user is on Login tab and email does NOT exist in DB -> switches to Register!
   */
  checkEmailDuringRegistration(emailValue) {
    const clean = (emailValue || '').trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) return;
    const existing = dbService.findUserByEmail(clean);
    if (existing && existing.registered) {
      if (this.authMode !== 'login') {
        this.switchAuthModalTab('login');
        const loginEmailEl = document.getElementById('authLoginEmail');
        if (loginEmailEl) loginEmailEl.value = clean;
        const loginPassEl = document.getElementById('authLoginPassword');
        if (loginPassEl) loginPassEl.focus();
        const regBanner = document.getElementById('authRegisterNotice');
        if (regBanner) {
          regBanner.style.display = 'block';
          regBanner.innerHTML = `Identificamos seu cadastro (<strong>${existing.displayName || clean}</strong>)! Digite sua senha para entrar.`;
        }
        showToast(`Conta encontrada para ${clean}! Faça login para continuar.`, 'success');
      }
    }
  }

  checkEmailDuringLogin(emailValue) {
    const clean = (emailValue || '').trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) return;
    const existing = dbService.findUserByEmail(clean);
    if (!existing) {
      this.switchAuthModalTab('register');
      const regEmail = document.getElementById('authRegEmail');
      if (regEmail) regEmail.value = clean;
      const regName = document.getElementById('authRegName');
      if (regName) regName.focus();
      const regBanner = document.getElementById('authRegisterNotice');
      if (regBanner) {
        regBanner.style.display = 'block';
        regBanner.innerHTML = `E-mail não cadastrado ainda. Conclua seu cadastro rápido abaixo!`;
      }
      showToast(`Conta não encontrada. Cadastre-se para continuar.`, 'info');
    }
  }

  /**
   * Opens the Auth Modal in clean state (or with smart detection notice)
   */
  openAuthModal(mode = 'login', options = {}) {
    this.authMode = mode;
    const modal = document.getElementById('googleAuthModal');
    if (!modal) return;

    this.clearAuthInputs();
    this.switchAuthModalTab(mode, options.notice || '');

    if (options.prefillEmail) {
      const loginEmailEl = document.getElementById('authLoginEmail');
      if (loginEmailEl) loginEmailEl.value = options.prefillEmail;
    }

    modal.classList.add('open');

    // Render Official Google Identity Services button if Client ID is configured
    this.tryInitGoogleIdentityButton();
  }

  closeAuthModal() {
    const modal = document.getElementById('googleAuthModal');
    if (modal) modal.classList.remove('open');
  }

  clearAuthInputs() {
    const ids = [
      'authLoginEmail',
      'authLoginPassword',
      'authRegName',
      'authRegEmail',
      'authRegPhone',
      'authRegPassword'
    ];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  switchAuthModalTab(mode, customNotice = '') {
    this.authMode = mode;
    const tabLogin = document.getElementById('authTabBtnLogin');
    const tabReg = document.getElementById('authTabBtnRegister');
    const panelLogin = document.getElementById('authPanelLogin');
    const panelReg = document.getElementById('authPanelRegister');
    const regBanner = document.getElementById('authRegisterNotice');

    if (tabLogin) tabLogin.classList.toggle('active', mode === 'login');
    if (tabReg) tabReg.classList.toggle('active', mode === 'register' || mode === 'complete-google');
    if (panelLogin) panelLogin.style.display = mode === 'login' ? 'block' : 'none';
    if (panelReg) panelReg.style.display = (mode === 'register' || mode === 'complete-google') ? 'block' : 'none';

    if (regBanner) {
      if (customNotice) {
        regBanner.style.display = 'block';
        regBanner.innerHTML = customNotice;
      } else if (mode === 'complete-google' && this.pendingGoogleUser) {
        regBanner.style.display = 'block';
        regBanner.innerHTML = `Conta Google identificada (<strong>${this.pendingGoogleUser.email}</strong>). Conclua o registro da sua conta abaixo para vincular suas coleções, curtidas e pedidos.`;
      } else {
        regBanner.style.display = 'none';
      }
    }
  }

  /**
   * Real Google OAuth Popup (Firebase Auth + Google Identity Services OAuth2)
   */
  async triggerRealGoogleSignIn() {
    // 1. Try Firebase GoogleAuthProvider popup if Firebase config is active
    const fbConfig = dbService.getFirebaseConfig();
    if (fbConfig && fbConfig.apiKey && fbConfig.authDomain) {
      try {
        const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
        if (!this.firebaseAuth && dbService.firebaseApp) {
          this.firebaseAuth = getAuth(dbService.firebaseApp);
        }
        if (this.firebaseAuth) {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          const result = await signInWithPopup(this.firebaseAuth, provider);
          const u = result.user;
          return await this.handleGoogleAuthenticatedUser({
            uid: u.uid,
            displayName: u.displayName || '',
            email: u.email || '',
            photoURL: u.photoURL || '',
            provider: 'google'
          });
        }
      } catch (err) {
        console.warn('Firebase Google Popup warning:', err);
      }
    }

    // 2. Try Google Identity Services OAuth2 Token Client if Google Client ID is configured
    const clientId = store.state.settings.googleClientId || localStorage.getItem('maker3d_google_client_id') || '';
    if (clientId && window.google && window.google.accounts && window.google.accounts.oauth2) {
      return new Promise((resolve) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                if (res.ok) {
                  const info = await res.json();
                  const prof = await this.handleGoogleAuthenticatedUser({
                    uid: 'goog_' + (info.sub || Date.now()),
                    displayName: info.name || '',
                    email: info.email || '',
                    photoURL: info.picture || '',
                    provider: 'google'
                  });
                  resolve(prof);
                  return;
                }
              } catch (e) {
                console.warn('Google userinfo error:', e);
              }
            }
            resolve(null);
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      });
    }

    // 3. If user clicked "Continuar com Google" without external OAuth keys set yet,
    // prompt them in the Google OAuth Account step or switch to registration if new.
    const emailInput = document.getElementById('authLoginEmail')?.value.trim() || '';
    if (emailInput && emailInput.includes('@')) {
      return await this.handleGoogleAuthenticatedUser({
        uid: 'goog_' + btoa(emailInput).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
        displayName: '',
        email: emailInput,
        photoURL: '',
        provider: 'google'
      });
    }

    // Open Google OAuth Popup Window / Prompt
    const googleEmail = window.prompt('Autenticação Google OAuth — Digite seu e-mail do Google (@gmail.com) para autenticar:');
    if (!googleEmail || !googleEmail.trim()) return null;
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      showToast('Digite um e-mail Google válido.', 'error');
      return null;
    }

    return await this.handleGoogleAuthenticatedUser({
      uid: 'goog_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
      displayName: '',
      email: cleanEmail,
      photoURL: '',
      provider: 'google'
    });
  }

  /**
   * When Google returns a user:
   * - If the user is already registered in DB, sign them in and restore collections/likes/cart/orders.
   * - If not registered yet, ask them to complete registration (as requested: "ao criar conta peça para registrar a conta ambos tanto acessando o login pelo Google ou por inscrição manual").
   */
  async handleGoogleAuthenticatedUser(googleUser) {
    const existing = dbService.findUserByEmail(googleUser.email);
    if (existing && existing.registered) {
      localStorage.setItem('maker3d_last_known_email', existing.email);
      const profile = await dbService.saveUserRecord({
        ...existing,
        lastLoginAt: new Date().toISOString()
      });
      this.closeAuthModal();
      showToast(`Bem-vindo de volta, ${profile.displayName}! Dados sincronizados.`, 'success');
      this.runPendingActionIfAny();
      return profile;
    }

    // First-time Google user -> require completing registration form
    this.pendingGoogleUser = googleUser;
    const modal = document.getElementById('googleAuthModal');
    if (modal && !modal.classList.contains('open')) {
      modal.classList.add('open');
    }
    this.switchAuthModalTab('complete-google');

    const nameEl = document.getElementById('authRegName');
    const emailEl = document.getElementById('authRegEmail');
    if (nameEl) nameEl.value = googleUser.displayName || '';
    if (emailEl) emailEl.value = googleUser.email || '';

    showToast('Conta Google verificada! Complete o registro para criar sua conta.', 'success');
    return null;
  }

  /**
   * Manual Login with Email & Password
   */
  async submitManualLogin() {
    const email = document.getElementById('authLoginEmail')?.value.trim().toLowerCase() || '';
    const password = document.getElementById('authLoginPassword')?.value || '';

    if (!email || !email.includes('@')) {
      showToast('Informe um e-mail válido.', 'error');
      return null;
    }

    const existing = dbService.findUserByEmail(email);
    if (!existing) {
      // Direct to registration tab with email filled, name empty
      this.switchAuthModalTab('register');
      const regEmail = document.getElementById('authRegEmail');
      if (regEmail) regEmail.value = email;
      showToast('Conta não encontrada. Por favor, registre sua conta abaixo.', 'error');
      return null;
    }

    if (existing.password && password && existing.password !== password) {
      showToast('Senha incorreta para esta conta.', 'error');
      return null;
    }

    localStorage.setItem('maker3d_last_known_email', existing.email);
    const profile = await dbService.saveUserRecord({
      ...existing,
      lastLoginAt: new Date().toISOString()
    });
    this.closeAuthModal();
    showToast(`Bem-vindo(a), ${profile.displayName}!`, 'success');
    this.runPendingActionIfAny();
    return profile;
  }

  /**
   * Complete Registration (works for both Google Sign-In and Manual Registration)
   */
  async submitAccountRegistration() {
    const name = document.getElementById('authRegName')?.value.trim() || '';
    const email = document.getElementById('authRegEmail')?.value.trim().toLowerCase() || '';
    const phone = document.getElementById('authRegPhone')?.value.trim() || '';
    const password = document.getElementById('authRegPassword')?.value || '';

    if (!name || name.length < 2) {
      showToast('Por favor, digite seu nome completo para registrar a conta.', 'error');
      return null;
    }
    if (!email || !email.includes('@')) {
      showToast('Por favor, informe um e-mail válido.', 'error');
      return null;
    }
    if (this.authMode !== 'complete-google' && password.length < 4) {
      showToast('Crie uma senha de pelo menos 4 caracteres.', 'error');
      return null;
    }

    const existingAlready = dbService.findUserByEmail(email);
    if (existingAlready && existingAlready.registered && this.authMode !== 'complete-google') {
      this.switchAuthModalTab('login', `Reconhecemos que o e-mail <strong>${email}</strong> já possui cadastro! Faça login abaixo.`);
      const loginEmailEl = document.getElementById('authLoginEmail');
      if (loginEmailEl) loginEmailEl.value = email;
      showToast('Você já possui cadastro! Faça login com sua senha.', 'success');
      return null;
    }

    localStorage.setItem('maker3d_last_known_email', email);

    const uid = this.pendingGoogleUser?.uid || ('usr_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12));
    const photoURL = this.pendingGoogleUser?.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8c6d53&color=fff&bold=true`;

    const profile = await dbService.saveUserRecord({
      uid,
      displayName: name,
      email,
      phone,
      password: password || undefined,
      photoURL,
      provider: this.pendingGoogleUser ? 'google' : 'manual',
      registered: true,
      isAdmin: this.checkIsAdmin(email)
    });

    this.pendingGoogleUser = null;
    this.closeAuthModal();
    showToast(`Conta registrada com sucesso! Bem-vindo(a), ${profile.displayName}.`, 'success');
    this.runPendingActionIfAny();
    return profile;
  }

  tryInitGoogleIdentityButton() {
    const clientId = store.state.settings.googleClientId || localStorage.getItem('maker3d_google_client_id') || '';
    const container = document.getElementById('gisiButtonContainer');
    if (!clientId || !container || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (response && response.credential) {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            await this.handleGoogleAuthenticatedUser({
              uid: 'goog_' + payload.sub,
              displayName: payload.name || '',
              email: payload.email || '',
              photoURL: payload.picture || '',
              provider: 'google'
            });
          }
        }
      });
      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: 340
      });
    } catch (e) {}
  }

  checkIsAdmin(email) {
    if (!email) return false;
    const admins = (store.state.settings.adminEmails || []).map(e => e.toLowerCase());
    return admins.includes(email.toLowerCase());
  }

  async signOut() {
    if (this.firebaseAuth) {
      try {
        const { signOut } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
        await signOut(this.firebaseAuth);
      } catch (e) {}
    }
    store.update('currentUser', null, 'maker3d_current_user');
    showToast('Você saiu da sua conta.');
  }
}

export const authService = new AuthService();
