import { db } from "./firebase-config.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let selectedItem = null;

onSnapshot(collection(db, "products"), (snapshot) => {
  products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderLiveCatalog();
  renderCart();
});

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addItem(name, price) {
  const existing = cart.find(item => item.name === name);
  const newSticker = { color: "None", x: 50, y: 50 };
  
  if (existing) {
    existing.quantity += 1;
    existing.stickers.push(newSticker);
  } else {
    cart.push({ name, price, quantity: 1, stickers: [newSticker] });
  }
  selectedItem = newSticker;
  saveCart();
  renderCart();
}

function removeItem(name) {
  const idx = cart.findIndex(i => i.name === name);
  if (idx === -1) return;
  cart[idx].quantity -= 1;
  cart[idx].stickers.pop();
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cart");
  const canvas = document.getElementById("canvas");
  if (!cartList || !canvas) return;

  cartList.innerHTML = "";
  canvas.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.name}</span> 
                    <button onclick="removeItem('${item.name}')">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="addItem('${item.name}', ${item.price})">+</button>`;
    cartList.appendChild(li);

    item.stickers.forEach(s => {
      const sticker = document.createElement("div");
      sticker.className = "sticker";
      sticker.innerHTML = "🧶"; // Simplified for logic
      sticker.style.left = s.x + "px";
      sticker.style.top = s.y + "px";
      canvas.appendChild(sticker);
    });
  });
  document.getElementById("total").innerText = total.toLocaleString();
}

// EXPOSE TO HTML
window.addItem = addItem;
window.removeItem = removeItem;
window.clearCart = () => { cart = []; saveCart(); renderCart(); };
window.changeBackground = (c1, c2) => { document.body.style.background = `linear-gradient(135deg, ${c1}, ${c2})`; };
window.showSection = (s) => {
  document.getElementById("shopSection").style.display = s === "shop" ? "block" : "none";
  document.getElementById("catalogSection").style.display = s === "catalog" ? "block" : "none";
};
window.changeSelectedColor = (color) => { if(selectedItem) { selectedItem.color = color; saveCart(); renderCart(); }};
