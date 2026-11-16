const SUPABASE_URL = "https://yhzmlbzcgxmfnepuklda.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inloem1sYnpjZ3htZm5lcHVrbGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4NDkyNjAsImV4cCI6MjExMDQyNTI2MH0.cnZtZX1Iq_4s0hCeQUCtljLvNx8UEYRtjN2Jnx88xDY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// Get products from Supabase
async function loadProducts() {
  const productList = document.getElementById("product-list");
  const featured = document.getElementById("featured-products");

  if (!productList && !featured) return;

  const container = productList || featured;
  container.textContent = "Loading products...";

  const { data, error } = await supabaseClient
  .from("product")
  .select("*");

  if (error) {
    console.error(error);
    container.textContent = "Error loading products.";
    return;
  }

  renderProducts(data || [], container);
}

// Display product cards
function renderProducts(products, container) {
  container.replaceChildren();

  if (products.length === 0) {
    container.textContent = "No products found.";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    if (product.image_url) {
      const img = document.createElement("img");
      img.src = product.image_url;
      img.alt = product.name;
      card.appendChild(img);
    }

    const name = document.createElement("h3");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.textContent = `AED ${Number(product.price).toFixed(2)}`;

    const stock = document.createElement("p");
    stock.textContent = `Stock: ${product.stock}`;

    const description = document.createElement("p");
    description.textContent = product.description || "";

    const link = document.createElement("a");
    link.href = `product-detail.html?id=${encodeURIComponent(product.product_id)}`;
    link.textContent = "View Details";

    card.append(name, price, stock, description, link);
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadProducts);
// Search products by name
async function searchProducts() {
  const productList = document.getElementById("product-list");
  if (!productList) return;

  const searchText = document.getElementById("search-box").value.trim();
  const category = document.getElementById("category-filter").value;
  const sort = document.getElementById("sort-select").value;

  let query = supabaseClient
    .from("product")
    .select("*");

  // Search by name
  if (searchText) {
    query = query.ilike("name", `%${searchText}%`);
  }

  // Filter by category
  if (category) {
    const { data: categories, error: categoryError } =
      await supabaseClient
        .from("category")
        .select("category_id")
        .eq("category_name", category);

    if (categoryError) {
      console.error(categoryError);
      productList.textContent = "Error loading categories.";
      return;
    }

    if (!categories || categories.length === 0) {
      renderProducts([], productList);
      return;
    }

    query = query.eq("category_id", categories[0].category_id);
  }

  // Sort by price
  if (sort === "asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "desc") {
    query = query.order("price", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    productList.textContent = "Error loading products.";
    return;
  }

  renderProducts(data || [], productList);
}
// Activate search when typing
document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.getElementById("search-box");

  if (searchBox) {
    searchBox.addEventListener("input", searchProducts);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const categoryFilter = document.getElementById("category-filter");
  const sortSelect = document.getElementById("sort-select");

  if (categoryFilter) {
    categoryFilter.addEventListener("change", searchProducts);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", searchProducts);
  }
});
async function smartSearch() {
  const productList = document.getElementById("product-list");
  if (!productList) return;

  const minPrice = document.getElementById("min-price").value;
  const maxPrice = document.getElementById("max-price").value;
  const inStock = document.getElementById("in-stock").checked;

  // Reuse name search, category filter and price sorting
  const searchText = document.getElementById("search-box").value.trim();
  const category = document.getElementById("category-filter").value;
  const sort = document.getElementById("sort-select").value;

  let query = supabaseClient.from("product").select("*");

  if (searchText) {
    query = query.ilike("name", `%${searchText}%`);
  }

  if (minPrice !== "") {
    query = query.gte("price", Number(minPrice));
  }

  if (maxPrice !== "") {
    query = query.lte("price", Number(maxPrice));
  }

  if (minPrice !== "" && maxPrice !== "" &&
      Number(minPrice) > Number(maxPrice)) {
    productList.textContent = "Minimum price cannot exceed maximum price.";
    return;
  }

  if (inStock) {
    query = query.gt("stock", 0);
  }

  if (category) {
    const { data: categories, error: categoryError } =
      await supabaseClient
        .from("category")
        .select("category_id")
        .eq("category_name", category);

    if (categoryError) {
      console.error(categoryError);
      productList.textContent = "Error loading categories.";
      return;
    }

    if (!categories || categories.length === 0) {
      renderProducts([], productList);
      return;
    }

    query = query.eq("category_id", categories[0].category_id);
  }

  if (sort === "asc" || sort === "desc") {
    query = query.order("price", {
      ascending: sort === "asc"
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    productList.textContent = "Error performing smart search.";
    return;
  }

  renderProducts(data || [], productList);
}

document.addEventListener("DOMContentLoaded", () => {
  const smartSearchBtn = document.getElementById("smart-search-btn");

  if (smartSearchBtn) {
    smartSearchBtn.addEventListener("click", smartSearch);
  }
});