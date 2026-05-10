import { db } from "./firebase-config.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================================
   DATA
========================================= */

let products = [];

let cart = [];

let selectedItem = null;

/* =========================================
   FIREBASE
========================================= */

onSnapshot(
  collection(db, "products"),
  (snapshot) => {

    products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderCatalog();

    renderSuggestions();
  }
);

/* =========================================
   CATALOG
========================================= */

function renderCatalog() {

  const catalog =
    document.getElementById("products");

  if (!catalog) return;

  catalog.innerHTML = "";

  products.forEach(product => {

    const card =
      document.createElement("div");

    card.className =
      "catalog-card";

    const image =
      product.coverImage ||
      product.image ||
      "images/placeholder.png";

    card.innerHTML = `

      <img
        src="${image}"
        alt="${product.name}">

      <div class="catalog-info">

        <h3>
          ${product.emoji || "🧶"}
          ${product.name}
        </h3>

        <p>
          ${Number(product.price)
            .toLocaleString()} VND
        </p>

        <button class="add-btn">
          Add To Cart
        </button>

      </div>
    `;

    card
      .querySelector(".add-btn")
      .onclick = () => {

        addItem(
          product.name,
          Number(product.price)
        );
      };

    catalog.appendChild(card);
  });
}

/* =========================================
   CART
========================================= */

function addItem(name, price) {

  const existing =
    cart.find(
      item => item.name === name
    );

  const sticker = {

    color: "None",

    x: Math.random() * 140,

    y: Math.random() * 140
  };

  if (existing) {

    existing.quantity++;

    existing.stickers.push(sticker);

  } else {

    cart.push({

      name,

      price,

      quantity: 1,

      stickers: [sticker]
    });
  }

  selectedItem = sticker;

  renderCart();
}

function removeItem(name) {

  const item =
    cart.find(
      i => i.name === name
    );

  if (!item) return;

  item.quantity--;

  item.stickers.pop();

  if (item.quantity <= 0) {

    cart =
      cart.filter(
        i => i.name !== name
      );
  }

  renderCart();
}

window.clearCart =
  function() {

    cart = [];

    renderCart();
  };

/* =========================================
   CART RENDER
========================================= */

function renderCart() {

  const cartList =
    document.getElementById("cart");

  const canvas =
    document.getElementById("canvas");

  cartList.innerHTML = "";

  canvas.innerHTML = "";

  let total = 0;

  if (cart.length === 0) {

    document.getElementById("empty")
      .style.display = "block";

  } else {

    document.getElementById("empty")
      .style.display = "none";
  }

  cart.forEach(item => {

    total +=
      item.price * item.quantity;

    const li =
      document.createElement("li");

    li.innerHTML = `

      <div class="cart-left">

        <span>
          🧶 ${item.name}
        </span>

      </div>

      <div class="cart-controls">

        <button onclick="removeItem('${item.name}')">
          −
        </button>

        <span>
          ${item.quantity}
        </span>

        <button onclick="addItem('${item.name}', ${item.price})">
          +
        </button>

      </div>
    `;

    cartList.appendChild(li);

    item.stickers.forEach(sticker => {

      const div =
        document.createElement("div");

      div.className =
        "sticker";

      div.innerHTML = "🧸";

      div.style.left =
        `${sticker.x}px`;

      div.style.top =
        `${sticker.y}px`;

      canvas.appendChild(div);
    });
  });

  document.getElementById("total")
    .innerText =
      total.toLocaleString();

  document.getElementById("orderData")
    .value =
      cart.map(item =>
        `${item.name} x${item.quantity}`
      ).join(", ");

  renderSuggestions();
}

/* =========================================
   SUGGESTIONS
========================================= */

function renderSuggestions() {

  const suggestionList =
    document.getElementById(
      "suggestionList"
    );

  suggestionList.innerHTML = "";

  products.forEach(product => {

    const exists =
      cart.some(
        item => item.name === product.name
      );

    if (exists) return;

    const card =
      document.createElement("div");

    card.className =
      "suggest-card";

    card.innerHTML = `

      <img
        src="${
          product.coverImage ||
          product.image
        }">

      <p>
        ${product.name}
      </p>
    `;

    card.onclick = () => {

      addItem(
        product.name,
        Number(product.price)
      );
    };

    suggestionList.appendChild(card);
  });
}

/* =========================================
   UI
========================================= */

window.showSection =
  function(section) {

    document.getElementById(
      "catalogSection"
    ).style.display =

      section === "catalog"
        ? "block"
        : "none";

    document.getElementById(
      "shopSection"
    ).style.display =

      section === "shop"
        ? "block"
        : "none";
  };

window.changeBackground =
  function(c1, c2) {

    document.body.style.background =
      `linear-gradient(
        135deg,
        ${c1},
        ${c2}
      )`;
  };

window.changeSelectedColor =
  function(color) {

    if (!selectedItem) return;

    selectedItem.color = color;

    renderCart();
  };

window.addItem = addItem;

window.removeItem = removeItem;

/* =========================================
   START
========================================= */

renderCart();
