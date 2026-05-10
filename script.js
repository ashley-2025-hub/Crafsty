import { db } from "./firebase-config.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ===== DATA =====
let products = [];
let cart = [];

// ===== FIREBASE =====
onSnapshot(collection(db, "products"), (snapshot) => {

  products = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  renderCatalog();
  renderSuggestions();
});

// ===== ADD ITEM =====
function addItem(name, price) {

  const existing = cart.find(i => i.name === name);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      name,
      price,
      quantity: 1
    });
  }

  renderCart();
}

// ===== REMOVE ITEM =====
function removeItem(name) {

  const item = cart.find(i => i.name === name);

  if (!item) return;

  item.quantity--;

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.name !== name);
  }

  renderCart();
}

// ===== CATALOG =====
function renderCatalog() {

  const catalog = document.querySelector(".catalog");

  if (!catalog) return;

  catalog.innerHTML = "";

  products.forEach(product => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${product.coverImage}">
      <h3>${product.emoji || "🧶"} ${product.name}</h3>
      <p>${Number(product.price).toLocaleString()} VND</p>

      <button>+</button>
    `;

    card.querySelector("button").onclick = () => {
      addItem(product.name, product.price);
    };

    catalog.appendChild(card);
  });
}

// ===== CART =====
function renderCart() {

  const cartList = document.getElementById("cart");
  const empty = document.getElementById("empty");

  if (!cartList) return;

  cartList.innerHTML = "";

  cart.forEach(item => {

    const li = document.createElement("li");

    li.innerHTML = `
      ${item.name} x${item.quantity}
      <button>-</button>
      <button>+</button>
    `;

    li.querySelector("button:nth-child(1)").onclick = () => {
      removeItem(item.name);
    };

    li.querySelector("button:nth-child(2)").onclick = () => {
      addItem(item.name, item.price);
    };

    cartList.appendChild(li);
  });

  if (empty) {
    empty.style.display = cart.length === 0 ? "block" : "none";
  }

  renderSuggestions();
  updateTotal();
}

// ===== SUGGESTIONS =====
function renderSuggestions() {

  const list = document.getElementById("suggestionList");

  if (!list) return;

  list.innerHTML = "";

  products.forEach(product => {

    const inCart = cart.some(i => i.name === product.name);

    if (inCart) return;

    const div = document.createElement("div");
    div.className = "suggest-card";

    div.innerHTML = `
      <img src="${product.coverImage}">
      <p>${product.name}</p>
    `;

    div.onclick = () => {
      addItem(product.name, product.price);
    };

    list.appendChild(div);
  });
}

// ===== TOTAL =====
function updateTotal() {

  let total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const el = document.getElementById("total");

  if (el) el.innerText = total.toLocaleString();
}

// ===== UI =====
window.showSection = function(section) {

  document.getElementById("shopSection").style.display =
    section === "shop" ? "block" : "none";

  document.getElementById("catalogSection").style.display =
    section === "catalog" ? "block" : "none";
};

window.clearCart = function() {
  cart = [];
  renderCart();
};

// ===== START =====
renderCart();
