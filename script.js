import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const productContainer = document.getElementById("productContainer");
const totalElement = document.getElementById("total");

let total = 0;

/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

  if (!productContainer) return;

  productContainer.innerHTML = "";

  try {

    const snapshot = await getDocs(
      collection(db, "products")
    );

    snapshot.forEach((docSnap) => {

      const product = docSnap.data();

      const card = document.createElement("div");
      card.className = "catalog-card";

      card.innerHTML = `
        <img 
          src="${product.coverImage || '1.png'}"
          class="catalog-image"
        >

        <h3>
          ${product.emoji || "🧸"} 
          ${product.name || "Unnamed"}
        </h3>

        <p>
          ${(product.price || 0).toLocaleString()} VND
        </p>

        <button class="add-btn">
          Add to Cart
        </button>
      `;

      const addButton = card.querySelector(".add-btn");

      addButton.addEventListener("click", () => {
        addToCart(product);
      });

      productContainer.appendChild(card);

    });

  } catch (error) {

    console.error("Catalog error:", error);

    productContainer.innerHTML = `
      <h2>Something went wrong</h2>
    `;
  }
}

/* =========================
   CART
========================= */

function addToCart(product) {

  total += Number(product.price || 0);

  if (totalElement) {
    totalElement.textContent =
      total.toLocaleString() + " VND";
  }

  alert(`${product.name} added to cart!`);
}

/* =========================
   START
========================= */

loadProducts();
