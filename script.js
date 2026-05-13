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
   SAVE
========================================= */

function saveCart() {

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );
}

/* =========================================
   UI
========================================= */

window.showSection = function(section) {

  const shop =
    document.getElementById("shopSection");

  const catalogSec =
    document.getElementById("catalogSection");

  if (section === "shop") {

    shop.style.display = "block";
    catalogSec.style.display = "none";

  } else {

    shop.style.display = "none";
    catalogSec.style.display = "block";
  }
};

/* =========================================
   BACKGROUND FIXED
========================================= */

window.changeBackground = function(c1, c2) {

  document.body.style.backgroundImage =
    `linear-gradient(135deg, ${c1}, ${c2})`;

  document.body.style.backgroundSize =
    "cover";

  document.body.style.backgroundRepeat =
    "no-repeat";

  document.body.style.backgroundAttachment =
    "fixed";
};

/* =========================================
   BOX COLOR
========================================= */

window.changeSelectedColor = function(color) {

  const colors = {

    Pink:
      "linear-gradient(180deg,#ffd4e5,#ffb7d2)",

    Blue:
      "linear-gradient(180deg,#cfe7ff,#9bc7ff)",

    White:
      "linear-gradient(180deg,#ffffff,#ececec)",

    Brown:
      "linear-gradient(180deg,#c99662,#9c6b3d)"
  };

  canvas.style.background =
    colors[color];
};

/* =========================================
   FIREBASE
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

function addItem(product) {

  const existing =
    cart.find(i => i.id === product.id);

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

/* =========================================
   REMOVE ITEM
========================================= */

function removeItem(id) {

  const item =
    cart.find(i => i.id === id);

  if (!item) return;

  item.quantity--;

  item.stickers.pop();

  if (item.quantity <= 0) {

    cart =
      cart.filter(i => i.id !== id);
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

  catalog.innerHTML = "";

  products.forEach(product => {

    const card =
      document.createElement("div");

    card.className =
      "catalog-card";

    card.innerHTML = `

      <img src="${product.coverImage}">

      <div class="catalog-info">

        <h3>
          ${product.emoji || "🧶"}
          ${product.name}
        </h3>

        <p>
          ${Number(product.price)
            .toLocaleString()} VND
        </p>

      </div>
    `;

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

  suggestionList.innerHTML = "";

  products
    .filter(product =>
      !cart.some(c => c.id === product.id)
    )
    .slice(0, 4)
    .forEach(product => {

      const div =
        document.createElement("div");

      div.className =
        "suggest-card";

      div.innerHTML = `

        <img src="${product.coverImage}">

        <p>
          ${product.emoji || "🧶"}
          ${product.name}
        </p>
      `;

      div.onclick =
        () => addItem(product);

      suggestionList.appendChild(div);
    });
}

/* =========================================
   CART
========================================= */

function renderCart() {

  cartList.innerHTML = "";

  emptyText.style.display =

    cart.length === 0
      ? "block"
      : "none";

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

      <div>

        <button class="minus">
          −
        </button>

        <span>
          ${item.quantity}
        </span>

        <button class="plus">
          +
        </button>

      </div>
    `;

    li.querySelector(".minus").onclick =
      () => removeItem(item.id);

    li.querySelector(".plus").onclick =
      () => addItem(item);

    cartList.appendChild(li);
  });

  totalEl.innerText =
    total.toLocaleString();

  orderData.value =
    JSON.stringify(cart);
}

/* =========================================
   BOX
========================================= */

function renderBox() {

  canvas.innerHTML = "";

  cart.forEach(item => {

    item.stickers.forEach(sticker => {

      const el =
        document.createElement("div");

      el.className =
        "sticker";

      el.innerText =
        item.emoji;

      el.style.left =
        sticker.x + "px";

      el.style.top =
        sticker.y + "px";

      enableDragging(
        el,
        sticker
      );

      canvas.appendChild(el);
    });
  });
}

/* =========================================
   DRAGGING
========================================= */

function enableDragging(
  el,
  sticker
) {

  let isDragging = false;

  let startX = 0;
  let startY = 0;

  let initialX = 0;
  let initialY = 0;

  el.addEventListener(
    "pointerdown",
    (e) => {

      e.preventDefault();

      isDragging = true;

      startX = e.clientX;
      startY = e.clientY;

      initialX = sticker.x;
      initialY = sticker.y;

      el.setPointerCapture(
        e.pointerId
      );
    }
  );

  el.addEventListener(
    "pointermove",
    (e) => {

      if (!isDragging) return;

      const dx =
        e.clientX - startX;

      const dy =
        e.clientY - startY;

      let newX =
        initialX + dx;

      let newY =
        initialY + dy;

      const padding = 24;

      const maxX =
        canvas.clientWidth - padding;

      const maxY =
        canvas.clientHeight - padding;

      newX = Math.max(
        padding,
        Math.min(maxX, newX)
      );

      newY = Math.max(
        padding,
        Math.min(maxY, newY)
      );

      sticker.x = newX;
      sticker.y = newY;

      el.style.left =
        newX + "px";

      el.style.top =
        newY + "px";
    }
  );

  el.addEventListener(
    "pointerup",
    () => {

      isDragging = false;

      saveCart();
    }
  );

  el.addEventListener(
    "pointercancel",
    () => {

      isDragging = false;
    }
  );
}

/* =========================================
   START
========================================= */

renderCart();

renderSuggestions();

renderBox();
