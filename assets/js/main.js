import { renderProducts } from "./products.js";
import { renderCart } from "./ui.js";

window.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCart();
});

