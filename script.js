import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ===== DATA =====
let products = [];
let cart = [];
let selectedSticker = null;

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

  const sticker = {
    x: Math.random() * 120 + 20,
    y: Math.random() * 120 + 20,
    color: "none"
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

  selectedSticker = sticker;

  renderCart();
}

// ===== REMOVE ITEM =====
function removeItem(name) {

  const item = cart.find(i => i.name === name);
  if (!item) return;

  item.quantity--;
  item.stickers.pop();

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

    card.querySelector("button").onclick = (e) => {
      e.stopPropagation();
      addItem(product.name, product.price);
    };

    catalog.appendChild(card);
  });
}

// ===== CART + BOX =====
function renderCart() {

  const cartList = document.getElementById("cart");
  const canvas = document.getElementById("canvas");
  const empty = document.getElementById("empty");

  if (!cartList || !canvas) return;

  cartList.innerHTML = "";
  canvas.innerHTML = "";

  if (empty) {
    empty.style.display = cart.length === 0 ? "block" : "none";
  }

  cart.forEach(item => {

    // CART LIST
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

    // STICKERS IN BOX
    item.stickers.forEach(stickerData => {

      const sticker = document.createElement("div");
      sticker.className = "sticker";
      sticker.innerText = getEmoji(item.name);

      sticker.style.left = stickerData.x + "px";
      sticker.style.top = stickerData.y + "px";

      enableDrag(sticker, stickerData, item);

      canvas.appendChild(sticker);
    });
  });

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

// ===== DRAG =====
function enableDrag(el, data, item) {

  let offsetX, offsetY;

  el.onpointerdown = (e) => {

    selectedSticker = data;

    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;

    document.onpointermove = (e) => {

      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;

      el.style.left = x + "px";
      el.style.top = y + "px";

      data.x = x;
      data.y = y;
    };

    document.onpointerup = () => {
      document.onpointermove = null;
      document.onpointerup = null;
    };
  };
}

// ===== HELPERS =====
function getEmoji(name) {
  const p = products.find(p => p.name === name);
  return p ? p.emoji || "🧶" : "🧸";
}

// ===== TOTAL =====
function updateTotal() {

  let total = cart.reduce((sum, i) =>
    sum + i.price * i.quantity, 0);

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

window.changeSelectedColor = function(color) {

  if (!selectedSticker) return;

  selectedSticker.color = color;

  renderCart();
};

// ===== START =====
renderCart();
