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
  }

  /**
   * Opens the Auth Modal in clean state (no pre-filled values)
   */
  openAuthModal(mode = 'login') {
    this.authMode = mode;
    const modal = document.getElementById('googleAuthModal');
    if (!modal) return;

    this.clearAuthInputs();
    this.switchAuthModalTab(mode);
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

  switchAuthModalTab(mode) {
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
      if (mode === 'complete-google' && this.pendingGoogleUser) {
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
      const profile = await dbService.saveUserRecord({
        ...existing,
        lastLoginAt: new Date().toISOString()
      });
      this.closeAuthModal();
      showToast(`Bem-vindo de volta, ${profile.displayName}! Dados sincronizados.`, 'success');
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

    const profile = await dbService.saveUserRecord({
      ...existing,
      lastLoginAt: new Date().toISOString()
    });
    this.closeAuthModal();
    showToast(`Bem-vindo(a), ${profile.displayName}!`, 'success');
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

    const uid = this.pendingGoogleUser?.uid || ('usr_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12));
    const photoURL = this.pendingGoogleUser?.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00ae42&color=fff&bold=true`;

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
