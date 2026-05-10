import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const productContainer =
  document.getElementById("productContainer");

const totalElement =
  document.getElementById("total");

let total = 0;

/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

  if (!productContainer) return;

  productContainer.innerHTML =
    "<p>Loading products...</p>";

  try {

    const snapshot = await getDocs(
      collection(db, "products")
    );

    productContainer.innerHTML = "";

    if (snapshot.empty) {

      productContainer.innerHTML = `
        <h2>No products found</h2>
      `;

      return;
    }

    snapshot.forEach((docSnap) => {

      const product = docSnap.data();

      const card =
        document.createElement("div");

      card.className = "catalog-card";

      card.innerHTML = `
        <img
          src="${product.coverImage || 'https://placehold.co/500'}"
          class="catalog-image"
        >

        <h3>
          ${product.emoji || "🧶"}
          ${product.name || "Unnamed"}
        </h3>

        <p>
          ${Number(product.price || 0).toLocaleString()}
          VND
        </p>

        <button class="add-btn">
          Add To Cart
        </button>
      `;

      /* =========================
         ADD TO CART
      ========================= */

      const addButton =
        card.querySelector(".add-btn");

      addButton.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          total += Number(product.price || 0);

          if (totalElement) {

            totalElement.textContent =
              total.toLocaleString() +
              " VND";
          }

          alert(
            `${product.name} added to cart!`
          );
        }
      );

      /* =========================
         OPEN PRODUCT PAGE
      ========================= */

      card.addEventListener(
        "click",
        () => {

          window.location.href =
            `product.html?id=${docSnap.id}`;
        }
      );

      productContainer.appendChild(card);

    });

  } catch (error) {

    console.error(
      "Load products error:",
      error
    );

    productContainer.innerHTML = `
      <h2>Failed to load products</h2>
    `;
  }
}

/* =========================
   START
========================= */

loadProducts();
