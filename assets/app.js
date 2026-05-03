<!-- Vou te entregar uma base refatorada mantendo aparência, mas corrigindo bugs e estruturando melhor -->

<!-- ======================= assets/app.js (NOVO COMPLETO) ======================= -->
<script>
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
function addToCart(product) {
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
      <button onclick='addToCart(${JSON.stringify(p)})'>Adicionar</button>
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
</script>


<!-- ======================= FIX CARRINHO VISÍVEL (catalogo.html) ======================= -->
<!-- Adicione isso dentro do body -->
<div id="cart">
  <h2>Carrinho</h2>
  <div id="cart-items"></div>
  <strong>Total: <span id="cart-total"></span></strong>
</div>


<!-- ======================= FIX CONTATO (contato.html) ======================= -->
<!-- Substitua a parte bugada por isso -->
<footer>
  <div class="footer-info">
    <img src="assets/brand/logo.png" style="height:60px" />
    <p>Email: contato@maker3d.com</p>
    <p>WhatsApp: (31) 99999-9999</p>
  </div>
</footer>


<!-- ======================= CSS FIXES ======================= -->
<style>
#cart {
  position: fixed;
  right: 0;
  top: 0;
  width: 300px;
  height: 100%;
  background: #111;
  color: #fff;
  overflow-y: auto;
  padding: 10px;
  z-index: 999;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.product-img {
  width: 100%;
  cursor: pointer;
}
</style>


<!-- ======================= MELHORIAS IMPLEMENTADAS ======================= -->
<!--
✔ Carrinho funcional (add/remove/quantidade)
✔ Persistência com localStorage
✔ Swipe nas imagens
✔ Correção footer contato
✔ Carrinho visível no catálogo
✔ Código modularizado
-->


<!-- ======================= PRÓXIMOS PASSOS (RECOMENDADO) ======================= -->
<!--
1. Migrar para React (Vite)
2. Backend (Firebase ou Node)
3. Sistema de login
4. Checkout com Stripe/MercadoPago
5. Lazy loading imagens
6. SEO meta tags
7. Acessibilidade (aria-label)
-->
