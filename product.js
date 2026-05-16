import { db } from "./firebase-config.js";

import {

  doc,
  getDoc,
  collection,
  getDocs

} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */

const productTitle =
  document.getElementById("productTitle");

const productName =
  document.getElementById("productName");

const productPrice =
  document.getElementById("productPrice");

const productDescription =
  document.getElementById("productDescription");

const mainImage =
  document.getElementById("mainImage");

const thumbnailRow =
  document.getElementById("thumbnailRow");

const suggestionList =
  document.getElementById("suggestionList");

const addToCartBtn =
  document.getElementById("addToCartBtn");

/* =========================
   GET PRODUCT ID
========================= */

const params =
  new URLSearchParams(window.location.search);

const productId =
  params.get("id");

console.log("PRODUCT ID:", productId);

/* =========================
   LOAD PRODUCT
========================= */

async function loadProduct() {

  if (!productId) {

    productTitle.textContent =
      "Missing Product ID";

    return;
  }

  try {

    const productRef =
      doc(db, "products", productId);

    const snapshot =
      await getDoc(productRef);

    if (!snapshot.exists()) {

      productTitle.textContent =
        "Product Not Found";

      return;
    }

    const product = {

      id: snapshot.id,

      ...snapshot.data()

    };

    /* =========================
       TEXT
    ========================= */

    productTitle.textContent =
      product.name || "Unnamed Product";

    productName.textContent =
      `${product.emoji || "🧶"} ${product.name || "Unnamed Product"}`;

    productPrice.textContent =
      `${Number(product.price || 0)
        .toLocaleString()} VND`;

    productDescription.textContent =
      product.description ||
      "No description yet.";

    /* =========================
       IMAGES
    ========================= */

    const images = [

      product.coverImage,

      ...(product.displayImages || [])

    ].filter(Boolean);

    thumbnailRow.innerHTML = "";

    if (images.length > 0) {

      mainImage.src = images[0];

      images.forEach((imageUrl) => {

        const img =
          document.createElement("img");

        img.src = imageUrl;

        img.className =
          "thumbnail-image";

        img.onclick = () => {

          mainImage.src =
            imageUrl;

        };

        thumbnailRow.appendChild(img);

      });

    } else {

      mainImage.src =
        "https://placehold.co/600x600?text=No+Image";

    }

    /* =========================
       ADD TO CART
    ========================= */

    addToCartBtn.onclick = () => {

      let cart =
        JSON.parse(
          localStorage.getItem("cart")
        ) || [];

      const existing =
        cart.find(
          item => item.id === product.id
        );

      if (existing) {

        existing.quantity++;

      } else {

        cart.push({

          id: product.id,

          name: product.name,

          price: Number(product.price || 0),

          coverImage:
            product.coverImage || "",

          emoji:
            product.emoji || "🧶",

          quantity: 1,

          stickers: []

        });

      }

      localStorage.setItem(
        "cart",
        JSON.stringify(cart)
      );

      alert("Added To Cart 🛒");

    };

    /* =========================
       SUGGESTIONS
    ========================= */

    loadSuggestions(product.id);

  } catch (error) {

    console.error(error);

    productTitle.textContent =
      "Failed To Load Product";

  }

}

/* =========================
   LOAD SUGGESTIONS
========================= */

async function loadSuggestions(currentId) {

  if (!suggestionList) return;

  try {

    const snapshot =
      await getDocs(
        collection(db, "products")
      );

    suggestionList.innerHTML = "";

    snapshot.forEach((docSnap) => {

      if (docSnap.id === currentId)
        return;

      const product =
        docSnap.data();

      const card =
        document.createElement("div");

      card.className =
        "catalog-card";

      card.innerHTML = `

        <img
          src="${product.coverImage || ""}"
          class="catalog-image"
        >

        <div class="catalog-info">

          <h3>
            ${product.emoji || "🧶"}
            ${product.name || "Unnamed"}
          </h3>

        </div>

      `;

      card.onclick = () => {

        window.location.href =
          `product.html?id=${docSnap.id}`;

      };

      suggestionList.appendChild(card);

    });

  } catch (error) {

    console.error(error);

  }

}

/* =========================
   START
========================= */

loadProduct();
