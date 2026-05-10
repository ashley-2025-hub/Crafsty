import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================================
   CART (PERSISTENT)
========================================= */

const cart =
  JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================================
   ELEMENTS
========================================= */

const catalog = document.getElementById("products");
const cartElement = document.getElementById("cart");
const totalElement = document.getElementById("total");
const emptyText = document.getElementById("empty");
const orderData = document.getElementById("orderData");

/* =========================================
   SECTION SWITCH
========================================= */

window.showSection = function(section) {

  const shop = document.getElementById("shopSection");
  const catalogSection = document.getElementById("catalogSection");

  if (section === "shop") {
    shop.style.display = "block";
    catalogSection.style.display = "none";

    renderCart(); // refresh when opening
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

    catalog.innerHTML = `<p style="color:white;">Loading...</p>`;

    const snapshot = await getDocs(collection(db, "products"));

    catalog.innerHTML = "";

    snapshot.forEach((docSnap) => {

      const product = docSnap.data();

      const card = document.createElement("div");
      card.className = "catalog-card";

      card.innerHTML = `
        <img src="${product.coverImage || ""}">
        <div class="catalog-info">
          <h3>${product.emoji || "🧶"} ${product.name}</h3>
          <p>${Number(product.price || 0).toLocaleString()} VND</p>
          <button class="add-btn">Add To Cart</button>
        </div>
      `;

      const btn = card.querySelector(".add-btn");

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(product);
      });

      card.addEventListener("click", (e) => {
        if (e.target.closest(".add-btn")) return;

        window.location.href = `product.html?id=${docSnap.id}`;
      });

      catalog.appendChild(card);
    });

  } catch (err) {
    console.error(err);
  }
}

/* =========================================
   CART LOGIC
========================================= */

function addToCart(product) {
  cart.push(product);
  saveCart();
  renderCart();
}

function renderCart() {

  if (!cartElement) return;

  cartElement.innerHTML = "";

  if (emptyText) {
    emptyText.style.display =
      cart.length === 0 ? "block" : "none";
  }

  let total = 0;

  cart.forEach((item, index) => {

    total += Number(item.price || 0);

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="cart-left">
        <img class="cart-img" src="${item.coverImage || ""}">
        <span>${item.name}</span>
      </div>

      <div class="cart-controls">
        <span>${Number(item.price).toLocaleString()}</span>
        <button onclick="removeFromCart(${index})">✕</button>
      </div>
    `;

    cartElement.appendChild(li);
  });

  if (totalElement) {
    totalElement.textContent = total.toLocaleString();
  }

  if (orderData) {
    orderData.value = JSON.stringify(cart);
  }

  // 🔥 LOAD SUGGESTIONS AFTER CART RENDER
  loadSuggestions();
}

/* =========================================
   SUGGESTIONS (FIXED)
========================================= */

async function loadSuggestions() {

  const suggestionList =
    document.getElementById("suggestionList");

  if (!suggestionList) return;

  try {

    const snapshot =
      await getDocs(collection(db, "products"));

    suggestionList.innerHTML = "";

    // compare using names
    const cartNames =
      cart.map(item => item.name);

    snapshot.forEach((docSnap) => {

      const product = docSnap.data();

      // skip if already in cart
      if (cartNames.includes(product.name)) return;

      const card =
        document.createElement("div");

      card.className = "suggest-card";

      card.innerHTML = `
        <img src="${product.coverImage || ""}">
        <h4>${product.emoji || "🧶"} ${product.name}</h4>
        <p>${Number(product.price || 0).toLocaleString()} VND</p>
        <button class="suggest-add">+ Add</button>
      `;

      // go to product page
      card.addEventListener("click", () => {
        window.location.href =
          `product.html?id=${docSnap.id}`;
      });

      // add to cart button
      const addBtn = card.querySelector(".suggest-add");

      addBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent redirect
        addToCart(product);
      });

      suggestionList.appendChild(card);

    });

  } catch (error) {
    console.error("Suggestion error:", error);
  }
}

/* =========================================
   REMOVE / CLEAR
========================================= */

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
};

window.clearCart = function() {
  cart.length = 0;
  saveCart();
  renderCart();
};

/* =========================================
   START
========================================= */

loadProducts();
renderCart();
