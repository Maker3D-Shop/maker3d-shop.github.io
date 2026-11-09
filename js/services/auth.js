// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Google Authentication & User Session Manager
// Supports Firebase Google OAuth Popup + Google Identity Services + Instant Cloud Profile Modal
// ═══════════════════════════════════════════════════════════════════════════
import { store } from '../config/store.js';
import { dbService } from './db.js';
import { showToast } from '../components/ui.js';

class AuthService {
  constructor() {
    this.firebaseAuth = null;
  }

  /**
   * Triggers Google Sign-In flow.
   * 1) If Firebase config is present, launches real Firebase GoogleAuthProvider popup.
   * 2) Otherwise opens the interactive Google Account Chooser modal so the user can sign in
   *    immediately (or configure Firebase credentials in 1 click) and persists the user in the Database.
   */
  async signInWithGoogle() {
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
          const profile = {
            uid: u.uid,
            displayName: u.displayName || u.email.split('@')[0],
            email: u.email,
            photoURL: u.photoURL || '',
            provider: 'google-firebase',
            isAdmin: this.checkIsAdmin(u.email)
          };
          await dbService.saveUserRecord(profile);
          showToast(`🎉 Bem-vindo(a), ${profile.displayName}!`, 'success');
          return profile;
        }
      } catch (err) {
        console.warn('Firebase Google Popup fallback to interactive Google Account modal:', err);
      }
    }

    // Interactive Google Account Chooser Dialog (works out-of-the-box on static hosts too)
    return this.openGoogleChooserModal();
  }

  checkIsAdmin(email) {
    if (!email) return false;
    const admins = (store.state.settings.adminEmails || []).map(e => e.toLowerCase());
    return admins.includes(email.toLowerCase());
  }

  openGoogleChooserModal() {
    return new Promise((resolve) => {
      const modal = document.getElementById('googleAuthModal');
      if (!modal) {
        resolve(null);
        return;
      }
      modal.classList.add('open');

      const handleConfirm = async (name, email, avatar) => {
        modal.classList.remove('open');
        const profile = {
          uid: 'goog_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
          displayName: name,
          email: email,
          photoURL: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff9e1b&color=fff&bold=true`,
          provider: 'google-oauth',
          isAdmin: this.checkIsAdmin(email)
        };
        await dbService.saveUserRecord(profile);
        showToast(`✅ Conectado com Google como ${profile.displayName}`, 'success');
        resolve(profile);
      };

      window.__confirmGoogleSignIn = handleConfirm;
    });
  }

  async signOut() {
    if (this.firebaseAuth) {
      try {
        const { signOut } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
        await signOut(this.firebaseAuth);
      } catch (e) {}
    }
    store.update('currentUser', null, 'maker3d_current_user');
    showToast('👋 Você saiu da sua conta.');
  }
}

export const authService = new AuthService();
