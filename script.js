import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================================
   ELEMENTS
========================================= */

const catalog =
  document.getElementById("products");

const cartElement =
  document.getElementById("cart");

const totalElement =
  document.getElementById("total");

const emptyText =
  document.getElementById("empty");

const orderData =
  document.getElementById("orderData");

/* =========================================
   STATE
========================================= */

const cart = [];

/* =========================================
   BACKGROUND THEMES
========================================= */

window.changeBackground =
  function(color1, color2) {

    document.body.style.background =
      `linear-gradient(
        135deg,
        ${color1},
        ${color2}
      )`;

    document.body.style.backgroundAttachment =
      "fixed";
  };

/* =========================================
   SECTION SWITCHING
========================================= */

window.showSection =
  function(section) {

    const shopSection =
      document.getElementById("shopSection");

    const catalogSection =
      document.getElementById("catalogSection");

    if (
      !shopSection ||
      !catalogSection
    ) {
      return;
    }

    if (section === "shop") {

      shopSection.style.display =
        "block";

      catalogSection.style.display =
        "none";

    } else {

      shopSection.style.display =
        "none";

      catalogSection.style.display =
        "block";
    }
  };

/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

  if (!catalog) {
    console.error(
      "Missing #products element"
    );
    return;
  }

  try {

    catalog.innerHTML = `
      <p style="color:white;">
        Loading products...
      </p>
    `;

    const querySnapshot =
      await getDocs(
        collection(db, "products")
      );

    catalog.innerHTML = "";

    if (querySnapshot.empty) {

      catalog.innerHTML = `
        <p style="color:white;">
          No products found 🧶
        </p>
      `;

      return;
    }

    querySnapshot.forEach((doc) => {

      const product =
        doc.data();

      const card =
        document.createElement("div");

      card.className =
        "catalog-card";

      card.innerHTML = `

        <img
          src="${
            product.coverImage ||
            "https://placehold.co/600x600?text=No+Image"
          }"
          alt="${product.name || "Product"}">

        <div class="catalog-info">

          <h3>
            ${product.name || "Unnamed Product"}
          </h3>

          <p>
            ${product.price || 0} VND
          </p>

          <button
            class="add-btn"
            type="button">

            Add To Cart

          </button>

        </div>
      `;

      const addButton =
        card.querySelector(".add-btn");

      addButton.addEventListener(
        "click",
        () => addToCart(product)
      );

      catalog.appendChild(card);
    });

  } catch (error) {

    console.error(
      "LOAD PRODUCT ERROR:",
      error
    );

    catalog.innerHTML = `
      <p style="color:white;">
        Failed to load products ❌
      </p>
    `;
  }
}

/* =========================================
   ADD TO CART
========================================= */

function addToCart(product) {

  cart.push(product);

  renderCart();
}

/* =========================================
   RENDER CART
========================================= */

function renderCart() {

  if (
    !cartElement ||
    !totalElement ||
    !emptyText
  ) {
    return;
  }

  cartElement.innerHTML = "";

  if (cart.length === 0) {

    emptyText.style.display =
      "block";

  } else {

    emptyText.style.display =
      "none";
  }

  let total = 0;

  cart.forEach((item, index) => {

    total +=
      Number(item.price) || 0;

    const li =
      document.createElement("li");

    li.innerHTML = `

      <div class="cart-left">

        <img
          class="cart-img"
          src="${
            item.coverImage ||
            "https://placehold.co/100x100"
          }"
          alt="${item.name}">

        <span>
          ${item.name}
        </span>

      </div>

      <div class="cart-controls">

        <span>
          ${item.price} VND
        </span>

        <button
          type="button"
          onclick="removeFromCart(${index})">

          ✕
        </button>

      </div>
    `;

    cartElement.appendChild(li);
  });

  totalElement.textContent =
    total;

  if (orderData) {

    orderData.value =
      JSON.stringify(cart);
  }
}

/* =========================================
   REMOVE ITEM
========================================= */

window.removeFromCart =
  function(index) {

    cart.splice(index, 1);

    renderCart();
  };

/* =========================================
   CLEAR CART
========================================= */

window.clearCart =
  function() {

    cart.length = 0;

    renderCart();
  };

/* =========================================
   COLOR SELECT
========================================= */

window.changeSelectedColor =
  function(color) {

    console.log(
      "Selected color:",
      color
    );
  };

/* =========================================
   START
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderCart();

    loadProducts();
  }
);
