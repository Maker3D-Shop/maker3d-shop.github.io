let cart = JSON.parse(localStorage.getItem("cart")) || [];

export function getCart() {
  return cart;
}

export function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(product) {
  const item = cart.find(p => p.id === product.id);
  if (item) item.qty++;
  else cart.push({ ...product, qty: 1 });
  saveCart();
}

export function removeFromCart(id) {
  cart = cart.filter(p => p.id !== id);
  saveCart();
}

export function changeQty(id, delta) {
  const item = cart.find(p => p.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  saveCart();
}

