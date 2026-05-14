import { db } from "./firebase-config.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* DATA */
let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* ELEMENTS */
const catalog = document.querySelector(".catalog");
const cartList = document.getElementById("cart");
const totalEl = document.getElementById("total");
const suggestionList = document.getElementById("suggestionList");
const emptyText = document.getElementById("empty");
const orderData = document.getElementById("orderData");
const canvas = document.getElementById("canvas");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* UI & THEME LOGIC */
window.showSection = function(section) {
  document.getElementById("shopSection").style.display = section === "shop" ? "block" : "none";
  document.getElementById("catalogSection").style.display = section === "catalog" ? "block" : "none";
};

/**
 * Updates CSS Variables and Body Background
 */
window.changeTheme = function(mainColor, subColor) {
  const root = document.documentElement;
  root.style.setProperty('--main-bg', mainColor);
  root.style.setProperty('--card-bg', subColor);
  
  // Directly update body and bin for performance
  document.body.style.background = mainColor;
  const bin = document.getElementById("bin");
  if (bin) bin.style.background = mainColor;
};

window.changeSelectedColor = function(color) {
  const colors = { Pink: "#d4acb4", Blue: "#bbc8d8", White: "#ffffff", Brown: "#9e7e67" };
  if (canvas) canvas.style.background = colors[color];
};

/* FIREBASE SYNC */
onSnapshot(collection(db, "products"), (snapshot) => {
  products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderCatalog();
  renderSuggestions();
  renderCart();
  renderBox();
});

/* CART ACTIONS */
function addItem(product) {
  const existing = cart.find(i => i.id === product.id);
  const sticker = { x: 50 + Math.random() * 100, y: 50 + Math.random() * 100 };

  if (existing) {
    existing.quantity++;
    existing.stickers.push(sticker);
  } else {
    cart.push({ ...product, quantity: 1, stickers: [sticker], price: Number(product.price) });
  }
  saveCart(); renderCart(); renderSuggestions(); renderBox();
}

function removeItem(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity--;
  item.stickers.pop();
  if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(); renderCart(); renderSuggestions(); renderBox();
}

window.clearCart = function() {
  cart = []; saveCart(); renderCart(); renderSuggestions(); renderBox();
};

/* RENDERING */
function renderCart() {
  if (!cartList) return;
  cartList.innerHTML = "";
  emptyText.style.display = cart.length === 0 ? "block" : "none";

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.marginBottom = "10px";
    li.innerHTML = `
      <span>${item.name} x${item.quantity}</span>
      <div>
        <button type="button" onclick="addItemById('${item.id}')" style="background:none; border:none; cursor:pointer;">➕</button>
        <button type="button" onclick="removeItem('${item.id}')" style="background:none; border:none; cursor:pointer;">➖</button>
      </div>
    `;
    cartList.appendChild(li);
  });
  totalEl.innerText = total.toLocaleString();
  if (orderData) orderData.value = JSON.stringify(cart);
}

window.addItemById = (id) => {
  const p = products.find(p => p.id === id);
  if (p) addItem(p);
};

function renderBox() {
  if (!canvas) return;
  canvas.innerHTML = "";
  cart.forEach(item => {
    item.stickers.forEach(sticker => {
      const el = document.createElement("div");
      el.innerText = item.emoji || "🧶";
      el.style.position = "absolute";
      el.style.left = sticker.x + "px";
      el.style.top = sticker.y + "px";
      el.style.fontSize = "30px";
      canvas.appendChild(el);
    });
  });
}

function renderCatalog() {
  if (!catalog) return;
  catalog.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "catalog-card";
    card.style.cursor = "pointer";
    card.innerHTML = `<h3>${p.name}</h3><p>${Number(p.price).toLocaleString()} VND</p>`;
    card.onclick = () => addItem(p);
    catalog.appendChild(card);
  });
}

function renderSuggestions() {
  if (!suggestionList) return;
  suggestionList.innerHTML = "";
  products.slice(0, 3).forEach(p => {
    const div = document.createElement("div");
    div.style.cursor = "pointer";
    div.innerHTML = `<p>${p.emoji || "🧶"} ${p.name}</p>`;
    div.onclick = () => addItem(p);
    suggestionList.appendChild(div);
  });
}

renderCart(); renderSuggestions(); renderBox();
