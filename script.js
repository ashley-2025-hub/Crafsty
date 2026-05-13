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

const catalog = document.querySelector(".catalog");
const cartList = document.getElementById("cart");
const totalEl = document.getElementById("total");
const suggestionList = document.getElementById("suggestionList");
const emptyText = document.getElementById("empty");
const orderData = document.getElementById("orderData");
const canvas = document.getElementById("canvas");

/* =========================================
   SAVE CART
========================================= */

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================================
   BACKGROUND
========================================= */

window.changeBackground = function(c1, c2) {
  document.body.style.background =
    `linear-gradient(135deg, ${c1}, ${c2})`;
};

/* =========================================
   SECTION SWITCH
========================================= */

window.showSection = function(section) {

  const shop = document.getElementById("shopSection");
  const catalogSec = document.getElementById("catalogSection");

  if (section === "shop") {
    shop.style.display = "block";
    catalogSec.style.display = "none";
  } else {
    shop.style.display = "none";
    catalogSec.style.display = "block";
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
    cart.find(item => item.id === product.id);

  const sticker = {
    x: Math.random() * 150,
    y: Math.random() * 150
  };

  if (existing) {

    existing.quantity += 1;
    existing.stickers.push(sticker);

  } else {

    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      coverImage: product.coverImage,
      emoji: product.emoji || "🧶",
      quantity: 1,
      stickers: [sticker]
    });
  }

  saveCart();

  renderCart();
  renderSuggestions();
  renderBox();

  if (button) {
    const txt = button.innerText;
    button.innerText = "Added ✓";
    button.disabled = true;

    setTimeout(() => {
      button.innerText = txt;
      button.disabled = false;
    }, 1000);
  }
}

/* =========================================
   REMOVE ITEM
========================================= */

function removeItem(id) {

  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity -= 1;
  item.stickers.pop();

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart();

  renderCart();
  renderSuggestions();
  renderBox();
}

/* =========================================
   CLEAR CART
========================================= */

window.clearCart = function() {
  cart = [];
  saveCart();
  renderCart();
  renderSuggestions();
  renderBox();
};

/* =========================================
   CATALOG
========================================= */

function renderCatalog() {

  if (!catalog) return;

  catalog.innerHTML = "";

  products.forEach(product => {

    const card = document.createElement("div");
    card.className = "catalog-card";

    card.innerHTML = `
      <img src="${product.coverImage}">
      <h3>${product.emoji || "🧶"} ${product.name}</h3>
      <p>${Number(product.price).toLocaleString()} VND</p>
      <button class="add-btn">Add</button>
    `;

    const btn = card.querySelector(".add-btn");

    btn.onclick = (e) => {
      e.stopPropagation();
      addItem(product, btn);
    };

    card.onclick = () => {
      addItem(product);
      showSection("shop");
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
    products.filter(p =>
      !cart.some(c => c.id === p.id)
    );

  filtered.slice(0, 4).forEach(product => {

    const card = document.createElement("div");
    card.className = "suggest-card";

    card.innerHTML = `
      <img src="${product.coverImage}">
      <p>${product.emoji || "🧶"} ${product.name}</p>
    `;

    card.onclick = () => addItem(product);

    suggestionList.appendChild(card);
  });
}

/* =========================================
   CART
========================================= */

function renderCart() {

  cartList.innerHTML = "";

  if (cart.length === 0) {
    emptyText.style.display = "block";
  } else {
    emptyText.style.display = "none";
  }

  let total = 0;

  cart.forEach(item => {

    total += item.price * item.quantity;

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="cart-left">
        <img class="cart-img" src="${item.coverImage}">
        <span>${item.name}</span>
      </div>

      <div>
        <button class="minus">−</button>
        <span>${item.quantity}</span>
        <button class="plus">+</button>
      </div>
    `;

    li.querySelector(".minus").onclick =
      () => removeItem(item.id);

    li.querySelector(".plus").onclick =
      () => addItem(item);

    cartList.appendChild(li);
  });

  totalEl.innerText = total.toLocaleString();

  orderData.value = JSON.stringify(cart);
}

/* =========================================
   BOX (WITH DRAG)
========================================= */

function renderBox() {

  canvas.innerHTML = "";

  cart.forEach(item => {

    item.stickers.forEach(sticker => {

      const el = document.createElement("div");

      el.className = "sticker";
      el.innerText = item.emoji;

      el.style.left = sticker.x + "px";
      el.style.top = sticker.y + "px";

      enableDragging(el, sticker, item);

      canvas.appendChild(el);
    });
  });
}

/* =========================================
   DRAG SYSTEM
========================================= */

function enableDragging(el, sticker, item) {

  let offsetX, offsetY, dragging = false;

  el.onpointerdown = function(e) {

    dragging = true;

    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;

    document.onpointermove = function(e) {

      if (!dragging) return;

      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;

      el.style.left = x + "px";
      el.style.top = y + "px";

      sticker.x = x;
      sticker.y = y;
    };

    document.onpointerup = function() {

      dragging = false;

      document.onpointermove = null;
      document.onpointerup = null;

      const box = canvas.getBoundingClientRect();
      const rect = el.getBoundingClientRect();

      const outside =
        rect.right < box.left ||
        rect.left > box.right ||
        rect.bottom < box.top ||
        rect.top > box.bottom;

      if (outside) {
        removeItem(item.id);
      }
    };
  };
}

/* =========================================
   BOX COLOR
========================================= */

window.changeSelectedColor = function(color) {

  const map = {
    Pink: "linear-gradient(#ffd1dc,#ffb6c1)",
    Blue: "linear-gradient(#8ec5ff,#6ea8ff)",
    White: "linear-gradient(#fff,#eee)",
    Brown: "linear-gradient(#c28d4f,#9c6b3d)"
  };

  canvas.style.background =
    map[color] || canvas.style.background;
};

/* =========================================
   START
========================================= */

renderCart();
renderSuggestions();
renderBox();
