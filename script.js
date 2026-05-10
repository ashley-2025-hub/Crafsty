import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================================
   GLOBALS
========================================= */

const cart = [];

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

  try {

    catalog.innerHTML = "";

    const snapshot =
      await getDocs(
        collection(db, "products")
      );

    if (snapshot.empty) {

      catalog.innerHTML = `
        <p style="color:white;">
          No products found 🧶
        </p>
      `;

      return;
    }

    snapshot.forEach((doc) => {

      const product = doc.data();

      const card =
        document.createElement("div");

      card.className =
        "catalog-card";

      card.innerHTML = `

        <img
          src="${product.coverImage}"
          alt="${product.name}">

        <div class="catalog-info">

          <h3>
            ${product.name}
          </h3>

          <p>
            ${product.price} VND
          </p>

          <button class="add-btn">
            Add To Cart
          </button>

        </div>
      `;

      card
        .querySelector(".add-btn")
        .addEventListener(
          "click",
          () => addToCart(product)
        );

      catalog.appendChild(card);
    });

  } catch (error) {

    console.error(error);

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

    total += Number(item.price);

    const li =
      document.createElement("li");

    li.innerHTML = `

      <div class="cart-left">

        <img
          class="cart-img"
          src="${item.coverImage}">

        <span>
          ${item.name}
        </span>

      </div>

      <div class="cart-controls">

        <span>
          ${item.price}
        </span>

        <button
          onclick="removeFromCart(${index})">

          ✕
        </button>

      </div>
    `;

    cartElement.appendChild(li);
  });

  totalElement.textContent =
    total;

  orderData.value =
    JSON.stringify(cart);
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
   COLOR PICKER
========================================= */

window.changeSelectedColor =
  function(color) {

    alert(
      `Selected color: ${color}`
    );
  };

/* =========================================
   START
========================================= */

loadProducts();
