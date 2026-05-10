import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("catalog.js loaded");

const productContainer =
  document.getElementById("productContainer");

const totalElement =
  document.getElementById("total");

let total = 0;

/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

  if (!productContainer) {
    console.error("productContainer not found");
    return;
  }

  productContainer.innerHTML = `
    <p>Loading products...</p>
  `;

  try {

    console.log("Fetching products...");

    const snapshot = await getDocs(
      collection(db, "products")
    );

    console.log("Docs:", snapshot.size);

    productContainer.innerHTML = "";

    if (snapshot.empty) {

      productContainer.innerHTML = `
        <h2>No products found</h2>
      `;

      return;
    }

    snapshot.forEach((docSnap) => {

      const product = docSnap.data();

      console.log(product);

      const card = document.createElement("div");

      card.className = "catalog-card";

      const image =
        product.coverImage || "1.png";

      const emoji =
        product.emoji || "🧶";

      const name =
        product.name || "Unnamed";

      const price =
        Number(product.price || 0);

      card.innerHTML = `
        <img
          src="${image}"
          class="catalog-image"
          alt="${name}"
        >

        <h3>
          ${emoji} ${name}
        </h3>

        <p>
          ${price.toLocaleString()} VND
        </p>

        <button class="add-btn">
          Add to Cart
        </button>
      `;

      const addButton =
        card.querySelector(".add-btn");

      addButton.addEventListener(
        "click",
        () => addToCart(product)
      );

      productContainer.appendChild(card);

    });

  } catch (error) {

    console.error(
      "Catalog error:",
      error
    );

    productContainer.innerHTML = `
      <h2>Failed to load products</h2>
      <p>${error.message}</p>
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

  alert(
    `${product.name} added to cart!`
  );
}

/* =========================
   START
========================= */

loadProducts();
