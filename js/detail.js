async function loadProductDetails() {
  const container = document.getElementById("product-details");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId || !/^\d+$/.test(productId)) {
    container.textContent = "Invalid product ID.";
    return;
  }

  const { data: product, error } = await supabaseClient
    .from("product")
    .select("*")
    .eq("product_id", productId)
    .single();

  if (error || !product) {
    console.error(error);
    container.textContent = "Product not found.";
    return;
  }

  container.replaceChildren();

  const img = document.createElement("img");
  img.src = product.image_url || "";
  img.alt = product.name;

  const info = document.createElement("div");
  info.className = "product-info";

  const name = document.createElement("h3");
  name.textContent = product.name;

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = `AED ${Number(product.price).toFixed(2)}`;

  const description = document.createElement("p");
  description.textContent = product.description || "No description available.";

  const stock = document.createElement("p");
  stock.className = "product-stock";
  stock.textContent = `Available Stock: ${product.stock}`;

  info.append(name, price, description, stock);
  container.append(img, info);
}

document.addEventListener("DOMContentLoaded", loadProductDetails); 