import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================================
   DATA & STATE
========================================= */

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

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
   SAVE DATA
========================================= */

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================================
   THEME & UI CONTROLS
========================================= */

/**
 * Switch between Order and Catalog views
 */
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

/**
 * FIXED THEME SWITCHER
 * Updates the CSS variables for both background and cards.
 */
window.changeTheme = function(mainColor, subColor) {
  const root = document.documentElement;
  
  // Set the CSS variables defined in your style.css
  root.style.setProperty('--main-bg', mainColor);
  root.style.setProperty('--card-bg', subColor);
  
  // Update the body background directly for instant feedback
  document.body.style.background = mainColor;

  // Sync the trash bin background to match the theme
  const bin = document.getElementById("bin");
  if (bin) {
    bin.style.background = mainColor;
  }
};

/**
 * Change the background color of the customization box (canvas)
 */
window.changeSelectedColor = function(color) {
  const colors = {
    Pink: "#d4acb4",
    Blue: "#bbc8d8",
    White: "#ffffff",
    Brown: "#9e7e67"
  };

  if (canvas) {
    canvas.style.background = colors[color];
  }
};

/* =========================================
   FIREBASE REAL-TIME SYNC
========================================= */

onSnapshot(collection(db, "products"), (snapshot) => {
  products = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  renderCatalog();
  renderSuggestions();
  renderCart();
  renderBox();
});

/* =========================================
   CART LOGIC (Add/Remove/Clear)
========================================= */

function addItem(product) {
  const existing = cart.find(i => i.id === product.id);
  
  // Random starting position for the sticker in the box
  const sticker = {
    x: 80 + Math.random() * 60,
    y: 80 + Math.random() * 60
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

window.clearCart = function() {
  cart = [];
  saveCart();
  renderCart();
  renderSuggestions();
  renderBox();
};

/* =========================================
   RENDERING FUNCTIONS
========================================= */

function renderCatalog() {
  if (!catalog) return;
  catalog.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "catalog-card";
    card.innerHTML = `
      <img src="${product.coverImage}">
      <div class="catalog-info">
        <h3>${product.emoji || "🧶"} ${product.name}</h3>
        <p>${Number(product.price).toLocaleString()} VND</p>
      </div>
    `;
    card.onclick = () => {
      addItem(product);
      showSection("shop");
    };
    catalog.appendChild(card);
  });
}

function renderSuggestions() {
  if (!suggestionList) return;
  suggestionList.innerHTML = "";

  products
    .filter(product => !cart.some(c => c.id === product.id))
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

function renderCart() {
  if (!cartList) return;
  cartList.innerHTML = "";

  // Show/Hide "Empty" text
  emptyText.style.display = cart.length === 0 ? "block" : "none";

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="cart-left">
        <img class="cart-img" src="${item.coverImage}">
        <span>${item.name}</span>
      </div>
      <div class="cart-controls">
        <button type="button" class="minus">−</button>
        <span>${item.quantity}</span>
        <button type="button" class="plus">+</button>
      </div>
    `;

    li.querySelector(".minus").onclick = () => removeItem(item.id);
    li.querySelector(".plus").onclick = () => addItem(item);
    cartList.appendChild(li);
  });

  totalEl.innerText = total.toLocaleString();
  if (orderData) {
    orderData.value = JSON.stringify(cart);
  }
}

function renderBox() {
  if (!canvas) return;
  canvas.innerHTML = "";

  cart.forEach(item => {
    item.stickers.forEach(sticker => {
      const el = document.createElement("div");
      el.className = "sticker";
      el.innerText = item.emoji;
      el.style.left = sticker.x + "px";
      el.style.top = sticker.y + "px";

      enableDragging(el, sticker);
      canvas.appendChild(el);
    });
  });
}

/* =========================================
   STICKER DRAGGING LOGIC
========================================= */

function enableDragging(el, sticker) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialX = 0, initialY = 0;

  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = sticker.x;
    initialY = sticker.y;
    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newX = initialX + dx;
    let newY = initialY + dy;

    // Boundaries within the canvas
    const padding = 24;
    const maxX = canvas.clientWidth - padding;
    const maxY = canvas.clientHeight - padding;

    newX = Math.max(0, Math.min(maxX, newX));
    newY = Math.max(0, Math.min(maxY, newY));

    sticker.x = newX;
    sticker.y = newY;
    el.style.left = newX + "px";
    el.style.top = newY + "px";
  });

  el.addEventListener("pointerup", () => {
    isDragging = false;
    saveCart();
  });

  el.addEventListener("pointercancel", () => {
    isDragging = false;
  });
}

/* =========================================
   INITIALIZATION
========================================= */

renderCart();
renderSuggestions();
renderBox();
