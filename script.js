import { db } from "./firebase-config.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* ================= DATA ================= */

let products = [];

let cart =
  JSON.parse(localStorage.getItem("cart")) || [];

/* ================= ELEMENTS ================= */

const catalog = document.querySelector(".catalog");
const cartList = document.getElementById("cart");
const totalEl = document.getElementById("total");
const suggestionList = document.getElementById("suggestionList");
const emptyText = document.getElementById("empty");
const orderData = document.getElementById("orderData");
const canvas = document.getElementById("canvas");

/* ================= SAVE ================= */

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ================= UI ================= */

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

/* ================= FIREBASE ================= */

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

/* ================= ADD ================= */

function addItem(product) {

  const existing =
    cart.find(i => i.id === product.id);

  const sticker = {
    x: 50 + Math.random() * 120,
    y: 50 + Math.random() * 120
  };

  if (existing) {
    existing.quantity++;
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
}

/* ================= REMOVE ================= */

function removeItem(id) {

  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity--;
  item.stickers.pop();

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart();
  renderCart();
  renderSuggestions();
  renderBox();
}

/* ================= CLEAR ================= */

window.clearCart = function() {
  cart = [];
  saveCart();
  renderCart();
  renderSuggestions();
  renderBox();
};

/* ================= CATALOG ================= */

function renderCatalog() {

  catalog.innerHTML = "";

  products.forEach(product => {

    const card = document.createElement("div");

    card.className = "catalog-card";

    card.innerHTML = `
      <img src="${product.coverImage}">
      <h3>${product.emoji || "🧶"} ${product.name}</h3>
      <p>${Number(product.price).toLocaleString()} VND</p>
    `;

    card.onclick = () => {
      addItem(product);
      showSection("shop");
    };

    catalog.appendChild(card);
  });
}

/* ================= SUGGESTIONS ================= */

function renderSuggestions() {

  suggestionList.innerHTML = "";

  products
    .filter(p =>
      !cart.some(c => c.id === p.id)
    )
    .slice(0, 4)
    .forEach(product => {

      const div = document.createElement("div");

      div.className = "suggest-card";

      div.innerHTML = `
        <img src="${product.coverImage}">
        <p>${product.emoji || "🧶"} ${product.name}</p>
      `;

      div.onclick = () => addItem(product);

      suggestionList.appendChild(div);
    });
}

/* ================= CART ================= */

function renderCart() {

  cartList.innerHTML = "";

  emptyText.style.display =
    cart.length === 0 ? "block" : "none";

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

/* ================= BOX ================= */

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

/* ================= DRAG FIXED ================= */

function enableDragging(el, sticker, item) {

  let offsetX, offsetY;

  el.onpointerdown = function(e) {

    e.preventDefault();

    el.setPointerCapture(e.pointerId);

    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;

    function move(e) {

      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;

      el.style.left = x + "px";
      el.style.top = y + "px";

      sticker.x = x;
      sticker.y = y;
    }

    function up(e) {

      el.releasePointerCapture(e.pointerId);

      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);

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
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };
}

/* ================= START ================= */

renderCart();
renderSuggestions();
renderBox();
