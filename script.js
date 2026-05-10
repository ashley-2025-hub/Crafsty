import { db } from "./firebase-config.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ===== DATA =====

let products = [];

let cart = [];

let selectedItem = null;

// ===== FIREBASE =====

onSnapshot(
  collection(db, "products"),
  (snapshot) => {

    products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderLiveCatalog();

    renderSuggestions();
  }
);

// ===== CART =====

function addItem(name, price) {

  const existing =
    cart.find(item => item.name === name);

  const newSticker = {
    color: "None",
    x: Math.random() * 100 + 20,
    y: Math.random() * 100 + 20,
    hidden: false
  };

  if (existing) {

    existing.quantity += 1;

    existing.stickers.push(newSticker);

  } else {

    cart.push({
      name,
      price,
      quantity: 1,
      stickers: [newSticker]
    });
  }

  selectedItem = newSticker;

  renderCart();
}

function removeItem(name) {

  const item =
    cart.find(i => i.name === name);

  if (!item) return;

  item.quantity -= 1;

  const removedSticker =
    item.stickers.pop();

  if (selectedItem === removedSticker) {
    selectedItem = null;
  }

  if (item.quantity <= 0) {

    cart =
      cart.filter(i => i.name !== name);
  }

  renderCart();
}

function clearCart() {

  cart = [];

  selectedItem = null;

  renderCart();
}

// ===== CATALOG =====

function renderLiveCatalog() {

  const catalog =
    document.querySelector(".catalog");

  if (!catalog) return;

  catalog.innerHTML = "";

  products.forEach(product => {

    const card =
      document.createElement("div");

    card.className = "card";

    // OPEN PRODUCT PAGE

    card.onclick = () => {

      window.location.href =
        `product.html?id=${product.id}`;
    };

    const image =
      product.coverImage ||
      product.image ||
      "images/placeholder.png";

    card.innerHTML = `
      <div class="card-glow"></div>

      <img
        src="${image}"
        alt="${product.name}"
      >

      <h3>
        ${product.emoji || "🧶"}
        ${product.name}
      </h3>

      <p>
        ${Number(product.price)
          .toLocaleString()} VND
      </p>

      <div class="catalog-controls">

        <button
          type="button"
          class="minus-btn">
          −
        </button>

        <div
          class="catalog-count"
          id="catalog-${product.name}">
          In cart: 0
        </div>

        <button
          type="button"
          class="plus-btn">
          +
        </button>

      </div>
    `;

    // BUTTON EVENTS

    const minusBtn =
      card.querySelector(".minus-btn");

    const plusBtn =
      card.querySelector(".plus-btn");

    minusBtn.onclick = (event) => {

      event.stopPropagation();

      removeItem(product.name);
    };

    plusBtn.onclick = (event) => {

      event.stopPropagation();

      addItem(
        product.name,
        product.price
      );
    };

    catalog.appendChild(card);
  });

  updateTotal();
}

// ===== SUGGESTIONS =====

function renderSuggestions() {

  const suggestionList =
    document.getElementById(
      "suggestionList"
    );

  if (!suggestionList) return;

  suggestionList.innerHTML = "";

  products.forEach(product => {

    const isInCart =
      cart.some(
        item => item.name === product.name
      );

    if (isInCart) return;

    const card =
      document.createElement("div");

    card.className = "suggest-card";

    card.onclick = () => {

      addItem(
        product.name,
        product.price
      );
    };

    card.innerHTML = `
      <img
        src="${
          product.coverImage ||
          product.image ||
          "images/placeholder.png"
        }"
        alt="${product.name}"
      >

      <p>
        ${product.emoji || "🧶"}
        ${product.name}
      </p>
    `;

    suggestionList.appendChild(card);
  });
}

// ===== CART RENDER =====

function renderCart() {

  const cartList =
    document.getElementById("cart");

  const canvas =
    document.getElementById("canvas");

  if (!cartList || !canvas) return;

  cartList.innerHTML = "";

  canvas.innerHTML = "";

  renderSuggestions();

  const empty =
    document.getElementById("empty");

  if (empty) {

    empty.style.display =
      cart.length === 0
        ? "block"
        : "none";
  }

  cart.forEach(item => {

    const li =
      document.createElement("li");

    li.innerHTML = `
      <div class="cart-left">

        <img
          src="${getItemImage(item.name)}"
          class="cart-img"
          alt="${item.name}"
        >

        <span>
          🧶 ${item.name}
        </span>

      </div>

      <div class="cart-controls">

        <button
          type="button"
          class="cart-minus">
          −
        </button>

        <span class="cart-number">
          ${item.quantity}
        </span>

        <button
          type="button"
          class="cart-plus">
          +
        </button>

      </div>
    `;

    li.querySelector(".cart-minus")
      .onclick = () => {
        removeItem(item.name);
      };

    li.querySelector(".cart-plus")
      .onclick = () => {
        addItem(
          item.name,
          item.price
        );
      };

    cartList.appendChild(li);

    // ===== STICKERS =====

    item.stickers.forEach(stickerData => {

      const sticker =
        document.createElement("div");

      sticker.className = "sticker";

      sticker.innerHTML =
        getEmoji(item.name);

      sticker.style.left =
        `${stickerData.x}px`;

      sticker.style.top =
        `${stickerData.y}px`;

      // COLORS

      if (stickerData.color === "Pink") {
        sticker.style.filter =
          "hue-rotate(-20deg)";
      }

      if (stickerData.color === "Blue") {
        sticker.style.filter =
          "hue-rotate(160deg)";
      }

      if (stickerData.color === "Brown") {
        sticker.style.filter =
          "sepia(60%)";
      }

      if (stickerData.color === "White") {
        sticker.style.filter =
          "grayscale(80%) brightness(1.5)";
      }

      if (selectedItem === stickerData) {

        sticker.classList.add(
          "selected"
        );
      }

      enableDragging(
        sticker,
        stickerData,
        item
      );

      canvas.appendChild(sticker);
    });
  });

  updateTotal();
}

// ===== HELPERS =====

function getEmoji(name) {

  const found =
    products.find(
      p => p.name === name
    );

  return found
    ? found.emoji
    : "🧸";
}

function getItemImage(name) {

  const found =
    products.find(
      p => p.name === name
    );

  return found
    ? (
      found.coverImage ||
      found.image
    )
    : "images/placeholder.png";
}

// ===== DRAGGING =====

function enableDragging(
  element,
  stickerData,
  item
) {

  let offsetX;
  let offsetY;
  let dragging = false;

  element.onpointerdown =
    function (e) {

      e.preventDefault();

      dragging = true;

      selectedItem = stickerData;

      offsetX =
        e.clientX -
        element.offsetLeft;

      offsetY =
        e.clientY -
        element.offsetTop;

      document.onpointermove =
        function (e) {

          if (!dragging) return;

          const x =
            e.clientX - offsetX;

          const y =
            e.clientY - offsetY;

          element.style.left =
            `${x}px`;

          element.style.top =
            `${y}px`;

          stickerData.x = x;
          stickerData.y = y;
        };

      document.onpointerup =
        function () {

          dragging = false;

          document.onpointermove =
            null;

          document.onpointerup =
            null;

          const canvasRect =
            document
              .getElementById("canvas")
              .getBoundingClientRect();

          const stickerRect =
            element.getBoundingClientRect();

          const outside =

            stickerRect.right <
              canvasRect.left ||

            stickerRect.left >
              canvasRect.right ||

            stickerRect.bottom <
              canvasRect.top ||

            stickerRect.top >
              canvasRect.bottom;

          if (outside) {

            removeItem(item.name);
          }
        };
    };
}

// ===== TOTAL =====

function updateTotal() {

  let total = 0;

  document
    .querySelectorAll(".catalog-count")
    .forEach(el => {

      el.innerHTML =
        "In cart: 0";
    });

  cart.forEach(item => {

    total +=
      item.price * item.quantity;

    const count =
      document.getElementById(
        `catalog-${item.name}`
      );

    if (count) {

      count.innerHTML =
        `In cart: ${item.quantity}`;
    }
  });

  const totalElement =
    document.getElementById("total");

  if (totalElement) {

    totalElement.innerText =
      total.toLocaleString();
  }
}

// ===== UI =====

function showSection(section) {

  document
    .getElementById("shopSection")
    .style.display =

    section === "shop"
      ? "block"
      : "none";

  document
    .getElementById("catalogSection")
    .style.display =

    section === "catalog"
      ? "block"
      : "none";
}

function changeBackground(c1, c2) {

  document.body.style.background =
    `linear-gradient(
      135deg,
      ${c1},
      ${c2}
    )`;
}

function changeSelectedColor(color) {

  if (!selectedItem) return;

  selectedItem.color = color;

  renderCart();
}

// ===== ORDER =====

const orderForm =
  document.getElementById("orderForm");

if (orderForm) {

  orderForm.onsubmit = function () {

    const orderData =
      document.getElementById("orderData");

    if (orderData) {

      orderData.value =
        cart.map(item =>
          `${item.name} x${item.quantity}`
        ).join(", ");
    }
  };
}

// ===== START =====

renderCart();

// ===== WINDOW =====

window.addItem = addItem;

window.removeItem = removeItem;

window.clearCart = clearCart;

window.showSection = showSection;

window.changeBackground =
  changeBackground;

window.changeSelectedColor =
  changeSelectedColor;