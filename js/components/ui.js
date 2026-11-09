// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — UI Utilities: Theme, Particles, Scroll Progress, Navigation & Toasts
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

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('maker3d_theme', theme);
  store.state.theme = theme;
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro';
  }
}

export function toggleTheme() {
  const next = store.state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  showToast(next === 'dark' ? '🌙 Modo Escuro ativado' : '☀️ Modo Claro ativado');
}

export function applyBrandSettings() {
  const s = store.state.settings;
  if (!s) return;

  // Apply primary accent color dynamically
  if (s.primaryColor) {
    document.documentElement.style.setProperty('--brand-primary', s.primaryColor);
  }

  // Update promo bar
  const promoBar = document.getElementById('promoBar');
  const promoText = document.getElementById('promoBarText');
  const promoPill = document.getElementById('promoBarPill');
  if (promoBar) {
    promoBar.style.display = s.promoBarActive ? 'flex' : 'none';
    if (promoText) promoText.textContent = s.promoBarText || '';
    if (promoPill) promoPill.textContent = s.promoPill || 'OFERTA';
  }

  // Update Hero Texts
  const heroBadge = document.getElementById('heroBadgeText');
  const heroTitle = document.getElementById('heroTitleText');
  const heroSub = document.getElementById('heroSubtitleText');
  if (heroBadge && s.heroBadge) heroBadge.textContent = s.heroBadge;
  if (heroTitle && s.heroTitleHtml) heroTitle.innerHTML = s.heroTitleHtml;
  if (heroSub && s.heroSubtitle) heroSub.textContent = s.heroSubtitle;

  // Update Brand Name
  document.querySelectorAll('.dynamic-brand-name').forEach(el => {
    el.textContent = s.brandName || 'Maker3D';
  });
}

export function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const nav = document.getElementById('nav-' + id);
  if (nav) nav.classList.add('active');

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
  // Particle Canvas
  const c = document.getElementById('particleCanvas');
  if (c) {
    const ctx = c.getContext('2d');
    let W, H;
    const pts = [];
    const resize = () => {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 45; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.1 + 0.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.35 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 158, 27, ${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    draw();
  }

  // Mouse Ambient Light
  document.addEventListener('mousemove', e => {
    const ml = document.getElementById('mouseLight');
    if (ml) {
      ml.style.left = e.clientX + 'px';
      ml.style.top = e.clientY + 'px';
    }
  });

  // Scroll Progress Bar & Sticky Nav
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    const bt = document.getElementById('backTop');
    const prog = document.getElementById('scrollProgress');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    if (bt) bt.classList.toggle('visible', window.scrollY > 380);
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
