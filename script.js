import { db } from "./firebase-config.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================================
   DATA
========================================= */

let products = [];

let cart =
  JSON.parse(localStorage.getItem("cart")) || [];

let selectedItem = null;

/* =========================================
   ELEMENTS
========================================= */

const catalog =
  document.querySelector(".catalog");

const cartList =
  document.getElementById("cart");

const totalEl =
  document.getElementById("total");

const suggestionList =
  document.getElementById("suggestionList");

const emptyText =
  document.getElementById("empty");

/* =========================================
   SAVE CART
========================================= */

function saveCart() {

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );
}

/* =========================================
   BACKGROUND
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
   SECTION SWITCH
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
    ) return;

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
   FIREBASE LIVE
========================================= */

onSnapshot(
  collection(db, "products"),
  (snapshot) => {

    products =
      snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()
      }));

    renderCatalog();

    renderSuggestions();

    renderCart();
  }
);

/* =========================================
   ADD ITEM
========================================= */

function addItem(product, button = null) {

  const existing =
    cart.find(
      item => item.id === product.id
    );

  const sticker = {

    color: "None",

    x: Math.random() * 120,

    y: Math.random() * 120
  };

  if (existing) {

    existing.quantity += 1;

    existing.stickers.push(sticker);

  } else {

    cart.push({

      id: product.id,

      name:
        product.name || "Unnamed",

      price:
        Number(product.price) || 0,

      coverImage:
        product.coverImage || "",

      quantity: 1,

      stickers: [sticker]
    });
  }

  selectedItem = sticker;

  saveCart();

  renderCart();

  renderSuggestions();

  /* BUTTON TEXT */

  if (button) {

    const original =
      button.innerText;

    button.innerText =
      "Added To Cart ✓";

    button.disabled = true;

    setTimeout(() => {

      button.innerText =
        original;

      button.disabled = false;

    }, 1200);
  }
}

/* =========================================
   REMOVE ITEM
========================================= */

function removeItem(id) {

  const item =
    cart.find(
      i => i.id === id
    );

  if (!item) return;

  item.quantity -= 1;

  item.stickers.pop();

  if (item.quantity <= 0) {

    cart =
      cart.filter(
        i => i.id !== id
      );
  }

  saveCart();

  renderCart();

  renderSuggestions();
}

/* =========================================
   CLEAR CART
========================================= */

window.clearCart =
  function() {

    cart = [];

    saveCart();

    renderCart();

    renderSuggestions();
  };

/* =========================================
   RENDER CATALOG
========================================= */

function renderCatalog() {

  if (!catalog) return;

  catalog.innerHTML = "";

  if (products.length === 0) {

    catalog.innerHTML = `

      <p style="color:white;">
        No products found 🧶
      </p>
    `;

    return;
  }

  products.forEach(product => {

    const card =
      document.createElement("div");

    card.className =
      "catalog-card";

    const price =
      Number(product.price) || 0;

    card.innerHTML = `

      <img
        src="${product.coverImage || ""}"
        alt="${product.name || ""}"
      >

      <div class="catalog-info">

        <h3>
          ${product.emoji || "🧶"}
          ${product.name || "Unnamed"}
        </h3>

        <p>
          ${price.toLocaleString()} VND
        </p>

        <button class="add-btn">
          Add To Cart
        </button>

      </div>
    `;

    const addBtn =
      card.querySelector(".add-btn");

    addBtn.onclick = (e) => {

      e.stopPropagation();

      addItem(product, addBtn);
    };

    card.onclick = () => {

      window.location.href =
        `product.html?id=${product.id}`;
    };

    catalog.appendChild(card);
  });
}

/* =========================================
   SUGGESTIONS
========================================= */

function renderSuggestions() {

  if (!suggestionList) return;

  suggestionList.innerHTML = "";

  const filtered =
    products.filter(product => {

      return !cart.some(
        item => item.id === product.id
      );
    });

  filtered.slice(0, 4).forEach(product => {

    const card =
      document.createElement("div");

    card.className =
      "suggest-card";

    card.innerHTML = `

      <img
        src="${product.coverImage || ""}"
        alt="${product.name || ""}"
      >

      <p>
        ${product.emoji || "🧶"}
        ${product.name || ""}
      </p>
    `;

    card.onclick = () => {

      addItem(product);
    };

    suggestionList.appendChild(card);
  });
}

/* =========================================
   RENDER CART
========================================= */

function renderCart() {

  if (!cartList) return;

  cartList.innerHTML = "";

  let total = 0;

  if (cart.length === 0) {

    if (emptyText) {

      emptyText.style.display =
        "block";
    }

  } else {

    if (emptyText) {

      emptyText.style.display =
        "none";
    }
  }

  cart.forEach(item => {

    const itemPrice =
      Number(item.price) || 0;

    const itemQuantity =
      Number(item.quantity) || 0;

    total +=
      itemPrice * itemQuantity;

    const li =
      document.createElement("li");

    li.innerHTML = `

      <div class="cart-left">

        <img
          class="cart-img"
          src="${item.coverImage || ""}"
          alt="${item.name || ""}"
        >

        <span>
          ${item.name || "Unnamed"}
        </span>

      </div>

      <div class="cart-controls">

        <button class="minus-btn">
          −
        </button>

        <span>
          ${itemQuantity}
        </span>

        <button class="plus-btn">
          +
        </button>

      </div>
    `;

    const minusBtn =
      li.querySelector(".minus-btn");

    const plusBtn =
      li.querySelector(".plus-btn");

    minusBtn.onclick = () => {

      removeItem(item.id);
    };

    plusBtn.onclick = () => {

      addItem(item);
    };

    cartList.appendChild(li);
  });

  if (totalEl) {

    totalEl.innerText =
      `${total.toLocaleString()}`;
  }
}

/* =========================================
   COLOR SELECT
========================================= */

window.changeSelectedColor =
  function(color) {

    const canvas =
      document.getElementById("canvas");

    if (!canvas) return;

    const colors = {

      Pink: "#ffd1dc",

      Blue: "#8ec5ff",

      White: "#ffffff",

      Brown: "#9c6b3d"
    };

    canvas.style.background =
      colors[color] ||
      "#f0d0a1";
  };

/* =========================================
   START
========================================= */

renderCart();
renderSuggestions();
