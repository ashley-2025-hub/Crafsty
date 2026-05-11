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

const orderData =
  document.getElementById("orderData");

const canvas =
  document.getElementById("canvas");

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
   BACKGROUND CHANGE
========================================= */

window.changeBackground =
  function(color1, color2) {

    document.body.style.background =
      `linear-gradient(135deg, ${color1}, ${color2})`;

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

    if (!shopSection || !catalogSection) return;

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
    renderBox();
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

    x: Math.random() * 170,
    y: Math.random() * 170
  };

  if (existing) {

    existing.quantity += 1;

    existing.stickers.push(sticker);

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: Number(product.price) || 0,

      coverImage:
        product.coverImage || "",

      emoji:
        product.emoji || "🧶",

      quantity: 1,

      stickers: [sticker]
    });
  }

  saveCart();

  renderCart();

  renderSuggestions();

  renderBox();

  /* BUTTON TEXT */

  if (button) {

    const originalText =
      button.innerText;

    button.innerText =
      "Added To Cart ✓";

    button.disabled = true;

    setTimeout(() => {

      button.innerText =
        originalText;

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

  renderBox();
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

    renderBox();
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
          ${Number(product.price || 0).toLocaleString()} VND
        </p>

        <button class="add-btn">
          Add To Cart
        </button>

      </div>
    `;

    const addBtn =
      card.querySelector(".add-btn");

    /* BUTTON CLICK */

    addBtn.onclick = (e) => {

      e.stopPropagation();

      addItem(product, addBtn);
    };

    /* WHOLE CARD CLICK */

    card.style.cursor =
      "pointer";

    card.onclick = () => {

      addItem(product);

      window.showSection("shop");
    };

    catalog.appendChild(card);
  });
}

/* =========================================
   RENDER SUGGESTIONS
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

  filtered
    .slice(0, 4)
    .forEach(product => {

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

  let total = 0;

  cart.forEach(item => {

    total +=
      item.price * item.quantity;

    const li =
      document.createElement("li");

    li.innerHTML = `

      <div class="cart-left">

        <img
          class="cart-img"
          src="${item.coverImage}"
        >

        <span>
          ${item.name}
        </span>

      </div>

      <div class="cart-controls">

        <button class="minus-btn">
          −
        </button>

        <span>
          ${item.quantity}
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

    minusBtn.onclick = () =>
      removeItem(item.id);

    plusBtn.onclick = () =>
      addItem(item);

    cartList.appendChild(li);
  });

  if (totalEl) {

    totalEl.innerText =
      total.toLocaleString();
  }

  if (orderData) {

    orderData.value =
      JSON.stringify(cart);
  }
}

/* =========================================
   RENDER BOX
========================================= */

function renderBox() {

  if (!canvas) return;

  canvas.innerHTML = "";

  cart.forEach(item => {

    item.stickers.forEach(sticker => {

      const div =
        document.createElement("div");

      div.className =
        "sticker";

      div.innerText =
        item.emoji || "🧶";

      div.style.left =
        sticker.x + "px";

      div.style.top =
        sticker.y + "px";

      canvas.appendChild(div);
    });
  });
}

/* =========================================
   COLOR CHANGE
========================================= */

window.changeSelectedColor =
  function(color) {

    if (!canvas) return;

    const colors = {

      Pink:
        "linear-gradient(180deg,#ffd1dc,#ffb6c1)",

      Blue:
        "linear-gradient(180deg,#8ec5ff,#6ea8ff)",

      White:
        "linear-gradient(180deg,#ffffff,#eeeeee)",

      Brown:
        "linear-gradient(180deg,#c28d4f,#9c6b3d)"
    };

    canvas.style.background =
      colors[color];
  };

/* =========================================
   START
========================================= */

renderCart();

renderSuggestions();

renderBox();
