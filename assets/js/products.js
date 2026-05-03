import { getProducts } from "./api.js";
import { addToCart } from "./cart.js";

export async function renderProducts() {
  const products = await getProducts();
  const container = document.getElementById("products");

  container.innerHTML = "";

  products.forEach(p => {
    const el = document.createElement("div");
    el.className = "product";

    el.innerHTML = `
      <img src="${p.images[0]}" class="product-img" />
      <h3>${p.name}</h3>
      <p>R$ ${p.price}</p>
      <button class="add-btn">Adicionar</button>
    `;

    el.querySelector(".add-btn").onclick = () => {
      addToCart(p);
      alert("Adicionado ao carrinho");
    };

    // swipe
    let i = 0;
    const img = el.querySelector("img");

    let startX = 0;
    el.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    el.addEventListener("touchend", e => {
      let dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 30) {
        i = dx > 0 ? i - 1 : i + 1;
        if (i < 0) i = p.images.length - 1;
        if (i >= p.images.length) i = 0;
        img.src = p.images[i];
      }
    });

    container.appendChild(el);
  });
}
