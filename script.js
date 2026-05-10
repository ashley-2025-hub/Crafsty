import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================================
   FIREBASE
========================================= */

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_AUTH_DOMAIN",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_STORAGE_BUCKET",

  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

  appId: "YOUR_APP_ID"
};

const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);

/* =========================================
   GLOBALS
========================================= */

const cart = [];

const catalog =
  document.querySelector(".catalog");

const cartElement =
  document.getElementById("cart");

const totalElement =
  document.getElementById("total");

const emptyText =
  document.getElementById("empty");

const orderData =
  document.getElementById("orderData");

/* =========================================
   BACKGROUND THEMES
========================================= */

window.changeBackground =
  function(color1, color2) {

    document.body.style.background =
      `linear-gradient(
        135deg,
        ${color1},
        ${color2}
      )`;
  };

/* =========================================
   SECTION SWITCHING
========================================= */

window.showSection =
  function(section) {

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
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

  catalog.innerHTML = "";

  const querySnapshot =
    await getDocs(
      collection(db, "products")
    );

  querySnapshot.forEach((doc) => {

    const product = doc.data();

    const card =
      document.createElement("div");

    card.className =
      "catalog-card";

    card.innerHTML = `

      <img
        src="${product.coverImage}"
        alt="${product.name}">

      <div class="catalog-info">

        <h3>
          ${product.name}
        </h3>

        <p>
          ${product.price} VND
        </p>

        <button
          class="add-btn">

          Add To Cart

        </button>

      </div>
    `;

    const addButton =
      card.querySelector(".add-btn");

    addButton.addEventListener(
      "click",
      () => addToCart(product)
    );

    catalog.appendChild(card);
  });
}

/* =========================================
   ADD TO CART
========================================= */

function addToCart(product) {

  cart.push(product);

  renderCart();
}

/* =========================================
   RENDER CART
========================================= */

function renderCart() {

  cartElement.innerHTML = "";

  if (cart.length === 0) {

    emptyText.style.display =
      "block";

  } else {

    emptyText.style.display =
      "none";
  }

  let total = 0;

  cart.forEach((item, index) => {

    total += Number(item.price);

    const li =
      document.createElement("li");

    li.innerHTML = `

      <div class="cart-left">

        <img
          class="cart-img"
          src="${item.coverImage}">

        <span>
          ${item.name}
        </span>

      </div>

      <div class="cart-controls">

        <span>
          ${item.price}
        </span>

        <button
          onclick="removeFromCart(${index})">

          ✕
        </button>

      </div>
    `;

    cartElement.appendChild(li);
  });

  totalElement.textContent =
    total;

  orderData.value =
    JSON.stringify(cart);
}

/* =========================================
   REMOVE ITEM
========================================= */

window.removeFromCart =
  function(index) {

    cart.splice(index, 1);

    renderCart();
  };

/* =========================================
   CLEAR CART
========================================= */

window.clearCart =
  function() {

    cart.length = 0;

    renderCart();
  };

/* =========================================
   COLOR CHANGER
========================================= */

window.changeSelectedColor =
  function(color) {

    alert(
      "Selected color: " + color
    );
  };

/* =========================================
   LOAD EVERYTHING
========================================= */

loadProducts();
