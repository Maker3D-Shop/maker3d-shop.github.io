export async function getProducts() {
  const res = await fetch("assets/products.json");
  return await res.json();
}
