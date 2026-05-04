// ===== STATE =====
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" aria-label="Fechar notificação">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

// ===== UTILS =====
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  showToast('Carrinho atualizado!', 'success');
}

function formatPrice(v) {
  return "R$ " + v.toFixed(2);
}

// ===== CART =====
function addToCart(id) {
  const product = window.allProducts.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(p => p.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    product.qty = 1;
    cart.push(product);
  }
  saveCart();
  showToast(`${product.name} adicionado ao carrinho!`, 'success');
}

function removeFromCart(id) {
  cart = cart.filter(p => p.id !== id);
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(p => p.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  saveCart();
}

function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  container.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.setAttribute("role", "listitem");

    div.innerHTML = `
      <span>${item.name}</span>
      <div class="cart-controls">
        <button onclick="changeQty(${item.id}, -1)" aria-label="Diminuir quantidade de ${item.name}" title="Diminuir">-</button>
        <span aria-label="Quantidade atual: ${item.qty}">${item.qty}</span>
        <button onclick="changeQty(${item.id}, 1)" aria-label="Aumentar quantidade de ${item.name}" title="Aumentar">+</button>
        <button onclick="removeFromCart(${item.id})" aria-label="Remover ${item.name} do carrinho" title="Remover">🗑</button>
      </div>
    `;

    container.appendChild(div);
  });

  const totalEl = document.getElementById("cart-total");
  if (totalEl) {
    totalEl.innerText = formatPrice(total);
    totalEl.setAttribute("aria-label", `Total do carrinho: ${formatPrice(total)}`);
  }
}

// ===== SEARCH =====
let allProducts = [];
let filteredProducts = [];

function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const clearButton = document.getElementById('clear-search');
  
  if (!searchInput) return;
  
  const performSearch = () => {
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
      filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
      clearButton.style.display = 'block';
    } else {
      filteredProducts = [...allProducts];
      clearButton.style.display = 'none';
    }
    renderProducts(filteredProducts);
    showToast(query ? `Encontrados ${filteredProducts.length} produtos` : 'Busca limpa', 'success');
  };
  
  searchInput.addEventListener('input', performSearch);
  searchButton?.addEventListener('click', performSearch);
  clearButton?.addEventListener('click', () => {
    searchInput.value = '';
    performSearch();
  });
  
  // Enter key support
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
}

function renderProducts(productsToRender) {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";

  productsToRender.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";

    div.innerHTML = `
      <img src="${p.images[0]}" class="product-img" alt="${p.name} - Imagem principal" loading="lazy" />
      <h3>${p.name}</h3>
      <p>${formatPrice(p.price)}</p>
      <button onclick="addToCart(${p.id})" aria-label="Adicionar ${p.name} ao carrinho">Adicionar</button>
    `;

    // ===== swipe support =====
    let index = 0;
    div.querySelector("img").addEventListener("click", () => {
      index = (index + 1) % p.images.length;
      div.querySelector("img").src = p.images[index];
    });

    // touch swipe
    let startX = 0;
    div.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    div.addEventListener("touchend", e => {
      let dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 30) {
        index = dx > 0
          ? (index - 1 + p.images.length) % p.images.length
          : (index + 1) % p.images.length;
        div.querySelector("img").src = p.images[index];
      }
    });

    container.appendChild(div);
  });
}

// ===== PRODUCTS =====
async function loadProducts() {
  const container = document.getElementById("products");
  if (!container) return;
  
  // Show loading state
  container.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando produtos...</p>
    </div>
  `;
  
  try {
    const res = await fetch("assets/products.json");
    allProducts = await res.json();
    window.allProducts = allProducts; // Make products globally accessible
    filteredProducts = [...allProducts];
    
    renderProducts(filteredProducts);
  } catch (error) {
    container.innerHTML = `
      <div class="error-state">
        <p>Erro ao carregar produtos. Tente novamente.</p>
        <button onclick="loadProducts()">Tentar novamente</button>
      </div>
    `;
    showToast('Erro ao carregar produtos', 'error');
  }
}

// ===== THEME TOGGLE =====
function initTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeButton(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
  
  showToast(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado!`, 'success');
}

function updateThemeButton(theme) {
  const button = document.getElementById('theme-toggle');
  if (button) {
    button.textContent = theme === 'dark' ? '☀️' : '🌙';
    button.setAttribute('aria-label', `Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`);
  }
}

// ===== SERVICE WORKER =====
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration);
      })
      .catch(error => {
        console.log('Falha ao registrar Service Worker:', error);
      });
  }
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const button = document.getElementById('back-to-top');
  if (!button) return;
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      button.classList.add('show');
    } else {
      button.classList.remove('show');
    }
  });
  
  // Scroll to top when clicked
  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  renderCart();
  initTheme();
  initSearch();
  registerServiceWorker();
  initBackToTop();
  
  // Add theme toggle listener
  const themeButton = document.getElementById('theme-toggle');
  if (themeButton) {
    themeButton.addEventListener('click', toggleTheme);
  }
});
