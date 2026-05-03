import { getCart, changeQty, removeFromCart } from "./cart.js";

export function renderCart() {
  const cart = getCart();
  const el = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!el) return;

  el.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <span>${item.name}</span>
      <div>
        <button class="minus">-</button>
        ${item.qty}
        <button class="plus">+</button>
        <button class="remove">🗑</button>
      </div>
    `;

    div.querySelector(".minus").onclick = () => changeQty(item.id, -1);
    div.querySelector(".plus").onclick = () => changeQty(item.id, 1);
    div.querySelector(".remove").onclick = () => removeFromCart(item.id);

    el.appendChild(div);
  });

  totalEl.innerText = "R$ " + total.toFixed(2);
}
