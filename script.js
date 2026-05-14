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

  const catalogSection =
    document.getElementById("catalogSection");

  if (section === "shop") {

    shop.style.display = "block";
    catalogSection.style.display = "none";

  } else {

    shop.style.display = "none";
    catalogSection.style.display = "block";
  }
};

/* =========================================
   THEME
========================================= */

window.changeTheme = function(main, sub) {

  const root =
    document.documentElement;

  root.style.setProperty(
    "--main-bg",
    main
  );

  root.style.setProperty(
    "--card-bg",
    sub
  );

  document.body.style.background =
    main;

  document.querySelectorAll(
    ".nav button"
  ).forEach(btn => {

    btn.style.background =
      main;
  });

  const bin =
    document.getElementById("bin");

  if (bin) {

    bin.style.background =
      main;
  }
};

/* =========================================
   CANVAS COLOR
========================================= */

window.changeSelectedColor =
  function(color) {

    const colors = {

      Pink: "#ffd4e5",

      Blue: "#cfe7ff",

      White: "#ffffff",

      Brown: "#c99662"
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
   CART
========================================= */

function addItem(product) {

  const existing =
    cart.find(
      i => i.id === product.id
    );

  const sticker = {

    x: 70 + Math.random() * 80,

    y: 70 + Math.random() * 80
  };

  if (existing) {

    existing.quantity++;

    existing.stickers.push(
      sticker
    );

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: Number(product.price),

      coverImage:
        product.coverImage,

      emoji:
        product.emoji || "🧶",

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

  const item =
    cart.find(i => i.id === id);

  if (!item) return;

  item.quantity--;

  item.stickers.pop();

  if (item.quantity <= 0) {

    cart =
      cart.filter(
        i => i.id !== id
      );
  }

  saveCart();

  renderCart();

  renderSuggestions();

  renderBox();
}

window.addItemById = function(id) {

  const product =
    products.find(
      p => p.id === id
    );

  if (product) {

    addItem(product);
  }
};

window.removeItemById =
  function(id) {

    removeItem(id);
  };

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

    const card =
      document.createElement("div");

    card.className =
      "catalog-card";

    card.innerHTML = `

      <img
        src="${product.coverImage}"
        alt="${product.name}"
      >

      <div class="catalog-info">

        <h3>
          ${product.emoji || "🧶"}
          ${product.name}
        </h3>

        <p>
          ${Number(product.price)
            .toLocaleString()}
          VND
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

  if (!suggestionList) return;

  suggestionList.innerHTML = "";

  products
    .filter(product =>
      !cart.some(
        c => c.id === product.id
      )
    )
    .slice(0, 4)
    .forEach(product => {

      const div =
        document.createElement("div");

      div.className =
        "suggest-card";

      div.innerHTML = `

        <img
          src="${product.coverImage}"
          alt="${product.name}"
        >

        <p>
          ${product.emoji || "🧶"}
          ${product.name}
        </p>
      `;

      div.onclick = () =>
        addItem(product);

      suggestionList.appendChild(div);
    });
}

/* =========================================
   CART RENDER
========================================= */

function renderCart() {

  if (!cartList) return;

  cartList.innerHTML = "";

  emptyText.style.display =

    cart.length === 0
      ? "block"
      : "none";

  let total = 0;

  cart.forEach(item => {

    total +=
      item.price *
      item.quantity;

    const li =
      document.createElement("li");

    li.innerHTML = `

      <div class="cart-left">

        <img
          class="cart-img"
          src="${item.coverImage}"
          alt="${item.name}"
        >

        <span>
          ${item.name}
        </span>

      </div>

      <div class="cart-controls">

        <button
          class="minus-btn"
        >
          −
        </button>

        <span>
          ${item.quantity}
        </span>

        <button
          class="plus-btn"
        >
          +
        </button>

      </div>
    `;

    li.querySelector(
      ".minus-btn"
    ).onclick = () =>
      removeItem(item.id);

    li.querySelector(
      ".plus-btn"
    ).onclick = () =>
      addItem(item);

    cartList.appendChild(li);
  });

  totalEl.innerText =
    total.toLocaleString();

  if (orderData) {

    orderData.value =
      JSON.stringify(cart);
  }
}

/* =========================================
   BOX
========================================= */

function renderBox() {

  if (!canvas) return;

  canvas.innerHTML = "";

  cart.forEach(item => {

    item.stickers.forEach(sticker => {

      const el =
        document.createElement("div");

      el.className =
        "sticker";

      el.innerText =
        item.emoji || "🧶";

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

  let dragging = false;

  let startX = 0;
  let startY = 0;

  let initialX = 0;
  let initialY = 0;

  el.addEventListener(
    "pointerdown",
    (e) => {

      dragging = true;

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

      if (!dragging) return;

      const dx =
        e.clientX - startX;

      const dy =
        e.clientY - startY;

      let newX =
        initialX + dx;

      let newY =
        initialY + dy;

      const maxX =
        canvas.clientWidth - 40;

      const maxY =
        canvas.clientHeight - 40;

      newX = Math.max(
        0,
        Math.min(maxX, newX)
      );

      newY = Math.max(
        0,
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

      dragging = false;

      saveCart();
    }
  );

  el.addEventListener(
    "pointercancel",
    () => {

      dragging = false;
    }
  );
}

/* =========================================
   START
========================================= */

renderCart();

renderSuggestions();

renderBox();
