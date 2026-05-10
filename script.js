import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================================
   FIREBASE
========================================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyDDuQmK13GmmTLFu09GVSghOXjPLJTvS7c",

  authDomain:
    "crafsty.firebaseapp.com",

  projectId:
    "crafsty",

  storageBucket:
    "crafsty.firebasestorage.app",

  messagingSenderId:
    "147789746977",

  appId:
    "1:147789746977:web:307f39520d85f242c56460",

  measurementId:
    "G-CPPGL2H68W"
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
  document.getElementById("products");

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

    const shopSection =
      document.getElementById("shopSection");

    const catalogSection =
      document.getElementById("catalogSection");

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
  };

/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

  try {

    catalog.innerHTML = `

      <p style="color:white;">

        Loading products...

      </p>
    `;

    const snapshot =
      await getDocs(
        collection(db, "products")
      );

    catalog.innerHTML = "";

    if (snapshot.empty) {

      catalog.innerHTML = `

        <p style="color:white;">

          No products found.

        </p>
      `;

      return;
    }

    snapshot.forEach((doc) => {

      const product =
        doc.data();

      const card =
        document.createElement("div");

      card.className =
        "catalog-card";

      card.innerHTML = `

        <img
          src="${
            product.coverImage ||
            'https://placehold.co/500x500?text=No+Image'
          }"
          alt="${product.name}">

        <div class="catalog-info">

          <h3>

            ${product.name || "Unnamed Product"}

          </h3>

          <p>

            ${
              Number(product.price || 0)
              .toLocaleString()
            } VND

          </p>

          <button class="add-btn">

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

  } catch (error) {

    console.error(
      "Firestore error:",
      error
    );

    catalog.innerHTML = `

      <p style="color:white;">

        Failed to load products.

      </p>
    `;
  }
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

    total += Number(item.price || 0);

    const li =
      document.createElement("li");

    li.innerHTML = `

      <div class="cart-left">

        <img
          class="cart-img"
          src="${
            item.coverImage ||
            'https://placehold.co/100x100?text=?'
          }">

        <span>

          ${item.name || "Product"}

        </span>

      </div>

      <div class="cart-controls">

        <span>

          ${
            Number(item.price || 0)
            .toLocaleString()
          }

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
    total.toLocaleString();

  orderData.value =
    JSON.stringify(cart);
}

/* =========================================
   REMOVE FROM CART
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
   COLOR SELECTOR
========================================= */

window.changeSelectedColor =
  function(color) {

    alert(
      "Selected color: " + color
    );
  };

/* =========================================
   START
========================================= */

loadProducts();
