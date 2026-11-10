// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — UI Utilities: Loadscreen, Scroll Progress, Navigation & Toasts
// ═══════════════════════════════════════════════════════════════════════════
import { store } from '../config/store.js';

export function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + (type || '');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

export function hideSiteLoadscreen() {
  const loader = document.getElementById('siteLoadscreen');
  if (!loader) return;
  loader.classList.add('fade-out');
  setTimeout(() => {
    loader.style.display = 'none';
  }, 450);
}

export function applyBrandSettings() {
  const s = store.state.settings;
  if (!s) return;

  const pColor = (!s.primaryColor || s.primaryColor === '#00ae42' || s.primaryColor === '#ff7a00') ? '#ff9e1b' : s.primaryColor;
  document.documentElement.style.setProperty('--brand-primary', pColor);

  const heroBadge = document.getElementById('heroBadgeText');
  const heroTitle = document.getElementById('heroTitleText');
  const heroSub = document.getElementById('heroSubtitleText');
  if (heroBadge && s.heroBadge) heroBadge.textContent = s.heroBadge;
  if (heroTitle && s.heroTitleHtml) heroTitle.innerHTML = s.heroTitleHtml;
  if (heroSub && s.heroSubtitle) heroSub.textContent = s.heroSubtitle;

  document.querySelectorAll('.dynamic-brand-name').forEach(el => {
    el.textContent = s.brandName || 'Maker3D';
  });
}

const PAGE_ROUTE_MAP = {
  inicio: '',
  produtos: 'catalogo/',
  produto: 'produto/',
  orcamento: 'laboratorio-stl/',
  parceiros: 'parceiros/',
  sobre: 'sobre/',
  contato: 'contato/'
};

function getRepoBaseUrl() {
  const baseEl = document.querySelector('base');
  if (baseEl && baseEl.href) return baseEl.href;
  return window.location.origin + '/';
}

export function showPage(id, pushRoute = true, queryParams = '') {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navId = id === 'produto' ? 'produtos' : id;
  const nav = document.getElementById('nav-' + navId);
  if (nav) nav.classList.add('active');

  if (pushRoute && window.history && window.history.pushState) {
    try {
      const subPath = PAGE_ROUTE_MAP[id] !== undefined ? PAGE_ROUTE_MAP[id] : '';
      const base = getRepoBaseUrl();
      const targetUrl = new URL(subPath + (queryParams || ''), base);
      if (window.location.href !== targetUrl.href) {
        window.history.pushState({ page: id, queryParams }, '', targetUrl.href);
      }
    } catch (_) {
      // Fallback if running on file:// protocol
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('navLinks')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');

  initReveal();
  window.dispatchEvent(new CustomEvent('maker3d:pagechange', { detail: { page: id } }));
}

export function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

export function initParticlesAndScroll() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    const bt = document.getElementById('backTop');
    const prog = document.getElementById('scrollProgress');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    if (bt) bt.classList.toggle('visible', window.scrollY > 320);
    if (prog) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? Math.min(100, (window.scrollY / docH) * 100) : 0;
      prog.style.width = pct + '%';
    }
  });
}

export function renderFAQs() {
  const container = document.getElementById('faqListContainer');
  if (!container) return;
  const faqs = store.state.faqs || [];
  container.innerHTML = faqs.map((f, idx) => `
    <div class="faq-item ${idx === 0 ? 'open' : ''}">
      <button class="faq-question" onclick="this.parentElement.classList.toggle('open')">
        <span>${f.q}</span>
        <span>▾</span>
      </button>
      <div class="faq-answer">${f.a}</div>
    </div>
  `).join('');
}
