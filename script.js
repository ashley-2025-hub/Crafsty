import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */

const productContainer =
  document.getElementById("productContainer");

const totalElement =
  document.getElementById("total");

const cartElement =
  document.getElementById("cart");

const emptyElement =
  document.getElementById("empty");

const canvas =
  document.getElementById("canvas");

/* =========================
   STATE
========================= */

let total = 0;

let cart = [];

/* =========================
   SHOW SECTIONS
========================= */

window.showSection = function(section){

  const shopSection =
    document.getElementById("shopSection");

  const catalogSection =
    document.getElementById("catalogSection");

  if(!shopSection || !catalogSection) return;

  if(section === "catalog"){

    shopSection.style.display = "none";
    catalogSection.style.display = "block";

  } else {

    shopSection.style.display = "block";
    catalogSection.style.display = "none";
  }
};

/* =========================
   BACKGROUND
========================= */

window.changeBackground = function(color1, color2){

  document.body.style.background =
    `linear-gradient(135deg, ${color1}, ${color2})`;
};

/* =========================
   CLEAR CART
========================= */

window.clearCart = function(){

  cart = [];
  total = 0;

  renderCart();
};

/* =========================
   RENDER CART
========================= */

function renderCart(){

  if(cartElement){

    cartElement.innerHTML = "";

    cart.forEach((item)=>{

      const li =
        document.createElement("li");

      li.textContent =
        `${item.emoji || "🧸"} ${item.name}`;

      cartElement.appendChild(li);
    });
  }

  if(emptyElement){

    emptyElement.style.display =
      cart.length === 0
        ? "block"
        : "none";
  }

  if(totalElement){

    totalElement.textContent =
      total.toLocaleString();
  }

  if(canvas){

    canvas.innerHTML = "";

    cart.forEach((item)=>{

      const img =
        document.createElement("img");

      img.src =
        item.coverImage || "1.png";

      img.className =
        "canvas-item";

      canvas.appendChild(img);
    });
  }
}

/* =========================
   ADD TO CART
========================= */

function addToCart(product){

  cart.push(product);

  total += Number(product.price || 0);

  renderCart();
}

/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts(){

  if(!productContainer) return;

  productContainer.innerHTML = "";

  try {

    const snapshot = await getDocs(
      collection(db, "products")
    );

    if(snapshot.empty){

      productContainer.innerHTML = `
        <h2>No products yet 🧸</h2>
      `;

      return;
    }

    snapshot.forEach((docSnap)=>{

      const product = docSnap.data();

      const card =
        document.createElement("div");

      card.className =
        "catalog-card";

      card.innerHTML = `

        <img
          src="${product.coverImage || '1.png'}"
          class="catalog-image"
          alt="${product.name || 'Product'}">

        <h3>
          ${product.emoji || "🧸"}
          ${product.name || "Unnamed"}
        </h3>

        <p>
          ${(product.price || 0).toLocaleString()} VND
        </p>

        <button class="add-btn">
          Add to Cart
        </button>
      `;

      const addButton =
        card.querySelector(".add-btn");

      addButton.addEventListener("click", ()=>{

        addToCart(product);
      });

      productContainer.appendChild(card);
    });

  } catch(error){

    console.error("Catalog error:", error);

    productContainer.innerHTML = `
      <h2>Something went wrong</h2>
    `;
  }
}

/* =========================
   ORDER FORM
========================= */

const orderForm =
  document.getElementById("orderForm");

if(orderForm){

  orderForm.addEventListener("submit", ()=>{

    const orderData =
      document.getElementById("orderData");

    if(orderData){

      orderData.value =
        JSON.stringify(cart);
    }
  });
}

/* =========================
   START
========================= */

loadProducts();

renderCart();
