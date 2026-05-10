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
  JSON.parse(
    localStorage.getItem("cart")
  ) || [];

/* =========================================
   SAVE CART
========================================= */

function saveCart() {

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );
}

/* =========================================
   TOAST MESSAGE
========================================= */

function showToast(message) {

  const toast =
    document.createElement("div");

  toast.className =
    "toast-message";

  toast.innerText =
    message;

  document.body.appendChild(toast);

  setTimeout(() => {

    toast.style.opacity = "0";

    setTimeout(() => {

      toast.remove();

    }, 300);

  }, 1500);
}

/* =========================================
   FIREBASE LIVE
========================================= */

onSnapshot(
  collection(db, "products"),
  (snapshot) => {

    products = snapshot.docs.map(doc => ({

      id: doc.id,

      ...doc.data()
    }));

    renderCatalog();

    renderSuggestions();

    renderCart();
  }
);

/* =========================================
   ADD ITEM
========================================= */

function addItem(product) {

  if (!product) return;

  const existing =
    cart.find(
      item => item.id === product.id
    );

  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({

      id: product.id,

      name:
        product.name || "",

      price:
        Number(product.price) || 0,

      coverImage:
        product.coverImage || "",

      quantity: 1
    });
  }

  saveCart();

  renderCart();

  renderSuggestions();

  showToast("Added to cart 🧶");
}

/* =========================================
   REMOVE ITEM
========================================= */

function removeItem(id) {

  const item =
    cart.find(
      i => i.id === id
    );

  if (!item) return;

  item.quantity--;

  if (item.quantity <= 0) {

    cart =
      cart.filter(
        i => i.id !== id
      );
  }

  saveCart();

  renderCart();

  renderSuggestions();
}

/* =========================================
   CATALOG
========================================= */

function renderCatalog() {

  const catalog =
    document.getElementById(
      "products"
    );

  if (!catalog) return;

  catalog.innerHTML = "";

  products.forEach(product => {

    const card =
      document.createElement("div");

    card.className =
      "catalog-card";

    card.innerHTML = `

      <img
        src="${product.coverImage || ""}"
        alt="${product.name || ""}"
      >

      <div class="catalog-info">

        <h3>
          ${product.emoji || "🧶"}
          ${product.name || ""}
        </h3>

        <p>
          ${Number(product.price || 0)
            .toLocaleString()} VND
        </p>

        <button class="add-btn">
          Add To Cart
        </button>

      </div>
    `;

    const addBtn =
      card.querySelector(".add-btn");

    addBtn.onclick = (e) => {

      e.stopPropagation();

      addItem(product);
    };

    card.onclick = () => {

      window.location.href =
        `product.html?id=${product.id}`;
    };

    catalog.appendChild(card);
  });
}

/* =========================================
   SUGGESTIONS
========================================= */

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
        item => item.id === product.id
      );

    if (isInCart) return;

    const card =
      document.createElement("div");

    card.className =
      "suggest-card";

    card.innerHTML = `

      <img
        src="${product.coverImage || ""}"
      >

      <p>
        ${product.emoji || "🧶"}
        ${product.name || ""}
      </p>
    `;

    card.onclick = () => {

      addItem(product);
    };

    suggestionList.appendChild(card);
  });
}

/* =========================================
   CART
========================================= */

function renderCart() {

  const cartList =
    document.getElementById("cart");

  const totalEl =
    document.getElementById("total");

  const emptyText =
    document.getElementById("empty");

  const orderData =
    document.getElementById("orderData");

  if (!cartList) return;

  cartList.innerHTML = "";

  let total = 0;

  if (cart.length === 0) {

    emptyText.style.display =
      "block";

  } else {

    emptyText.style.display =
      "none";
  }

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
        >

        <span>
          ${item.name}
        </span>

      </div>

      <div class="cart-controls">

        <button class="minus-btn">
          −
        </button>

        <span>
          ${item.quantity}
        </span>

        <button class="plus-btn">
          +
        </button>

      </div>
    `;

    const minusBtn =
      li.querySelector(".minus-btn");

    const plusBtn =
      li.querySelector(".plus-btn");

    minusBtn.onclick = () => {

      removeItem(item.id);
    };

    plusBtn.onclick = () => {

      const realProduct =
        products.find(
          p => p.id === item.id
        );

      addItem(realProduct);
    };

    cartList.appendChild(li);
  });

  totalEl.innerText =
    total.toLocaleString();

  orderData.value =
    JSON.stringify(cart);

  saveCart();
}

/* =========================================
   CLEAR CART
========================================= */

window.clearCart = function() {

  cart = [];

  saveCart();

  renderCart();

  renderSuggestions();
};

/* =========================================
   BACKGROUND
========================================= */

window.changeBackground =
  function(color1, color2) {

    document.body.style.background =
      `linear-gradient(
        135deg,
        ${color1},
        ${color2}
      )`;

    document.body.style.backgroundAttachment =
      "fixed";
  };

/* =========================================
   SECTION SWITCHING
========================================= */

window.showSection =
  function(section) {

    const shopSection =
      document.getElementById(
        "shopSection"
      );

    const catalogSection =
      document.getElementById(
        "catalogSection"
      );

    if (section === "shop") {

      shopSection.style.display =
        "block";

      catalogSection.style.display =
        "none";

    } else {

      shopSection.style.display =
        "none";

      catalogSection.style.display =
        "block";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

/* =========================================
   COLOR SELECT
========================================= */

window.changeSelectedColor =
  function(color) {

    showToast(
      `Selected color: ${color}`
    );
  };

/* =========================================
   START
========================================= */

renderCart();

renderSuggestions();
