import { db } from "./firebase-config.js";

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

    document.body.style.backgroundAttachment =
      "fixed";
  };

/* =========================================
   SECTION SWITCHING
========================================= */

window.showSection =
  function(section) {

    const shop =
      document.getElementById("shopSection");

    const catalogSection =
      document.getElementById("catalogSection");

    if (section === "shop") {

      shop.style.display = "block";

      catalogSection.style.display = "none";

    } else {

      shop.style.display = "none";

      catalogSection.style.display = "block";
    }
  };

/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

  if (!catalog) return;

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

    querySnapshot.forEach((docSnap) => {

      const product =
        docSnap.data();

      const card =
        document.createElement("div");

      card.className =
        "catalog-card";

      card.innerHTML = `

        <img
          src="${product.coverImage || ""}"
          alt="${product.name || "Product"}"
        >

        <div class="catalog-info">

          <h3>
            ${product.emoji || "🧶"}
            ${product.name || "Unnamed Product"}
          </h3>

          <p>
            ${Number(product.price || 0)
              .toLocaleString()} VND
          </p>

          <button class="add-btn">
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

      card.addEventListener(
        "click",
        (event) => {

          if (
            event.target.classList.contains("add-btn")
          ) return;

          window.location.href =
            `product.html?id=${docSnap.id}`;
        }
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
      Number(item.price || 0);

    const li =
      document.createElement("li");

    li.innerHTML = `

      <div class="cart-left">

        <img
          class="cart-img"
          src="${item.coverImage || ""}"
        >

        <span>
          ${item.name || "Product"}
        </span>

      </div>

      <div class="cart-controls">

        <span>
          ${Number(item.price || 0)
            .toLocaleString()}
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
    total.toLocaleString();

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

loadProducts();
