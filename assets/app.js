// ===== STATE =====
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ===== UTILS =====
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
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

    div.innerHTML = `
      <span>${item.name}</span>
      <div>
        <button onclick="changeQty(${item.id}, -1)">-</button>
        ${item.qty}
        <button onclick="changeQty(${item.id}, 1)">+</button>
        <button onclick="removeFromCart(${item.id})">🗑</button>
      </div>
    `;

    container.appendChild(div);
  });

  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.innerText = formatPrice(total);
}

// ===== PRODUCTS =====
async function loadProducts() {
  const res = await fetch("assets/products.json");
  const products = await res.json();
  window.allProducts = products; // Make products globally accessible

  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";

    div.innerHTML = `
      <img src="${p.images[0]}" class="product-img" />
      <h3>${p.name}</h3>
      <p>${formatPrice(p.price)}</p>
      <button onclick="addToCart(${p.id})">Adicionar</button>
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

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  renderCart();
});
