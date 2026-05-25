import { db } from "./firebase-config.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* ========================================= ELEMENTS ========================================= */
const catalog = document.getElementById("catalog");
const searchInput = document.getElementById("searchInput");

/* ========================================= GLOBAL VARIABLES ========================================= */
let products = [];

/* ========================================= GET COVER ========================================= */
function getCover(folder) {
  return `assets/products/${folder}/cover.png`;
}

/* ========================================= RENDER CATALOG ========================================= */
function renderCatalog() {
  if (!catalog) return;
  catalog.innerHTML = "";

  // Get current typed value safely
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  // Dynamic Filtering Logic (Queries names, folders, or individual array tags)
  const filteredProducts = products.filter(product => {
    const matchesName = product.name && product.name.toLowerCase().includes(query);
    const matchesFolder = product.folder && product.folder.toLowerCase().includes(query);
    const matchesTags = product.tags && product.tags.some(tag => tag.toLowerCase().includes(query));

    return matchesName || matchesFolder || matchesTags;
  });

  // Display message if zero entries correspond with query
  if (filteredProducts.length === 0) {
    catalog.innerHTML = "<p class='no-results'>No matching products found.</p>";
    return;
  }

  // Generate Catalog Display Grid
  filteredProducts.forEach(product => {
    const card = document.createElement("div");
    card.className = "catalog-card";
    card.innerHTML = `
      <img src="${getCover(product.folder)}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
      <div class="catalog-info">
        <h3> ${product.name} </h3>
        <p> ${Number(product.price).toLocaleString()} VND </p>
      </div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `product.html?id=${product.id}`;
    });
    catalog.appendChild(card);
  });
}

/* ========================================= FETCH PRODUCTS ========================================= */
onSnapshot(collection(db, "products"), (snapshot) => {
  products = [];
  snapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });
  renderCatalog();
});

/* ========================================= EXTRA PLACEHOLDER LOGIC ========================================= */
function renderCart() { console.log("Cart loaded"); }
function renderSuggestions() { console.log("Suggestions loaded"); }
function renderBox() { console.log("Box loaded"); }
function loadSavedTheme() { console.log("Theme loaded"); }

/* ========================================= INIT & LIVE EVENT LISTENER ========================================= */
loadSavedTheme();
renderCart();
renderSuggestions();
renderBox();

// Listens to immediate keystrokes to update the shop grid automatically
if (searchInput) {
  searchInput.addEventListener("input", () => {
    renderCatalog();
  });
}
