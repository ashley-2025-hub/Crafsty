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

/* =========================
   GET PRODUCT ID
========================= */

const params =
  new URLSearchParams(window.location.search);

const productId =
  params.get("id");

/* =========================
   LOAD PRODUCT
========================= */

async function loadProduct() {

  if (!productId) return;

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

    const product = snapshot.data();

    /* =========================
       TEXT
    ========================= */

    productTitle.textContent =
      product.name;

    productName.textContent =
      `${product.emoji || "🧶"} ${product.name}`;

    productPrice.textContent =
      `${Number(product.price || 0)
        .toLocaleString()} VND`;

    productDescription.textContent =
      product.description || "";

    /* =========================
       IMAGES
    ========================= */

    const images = [

      product.coverImage,

      ...(product.displayImages || [])

    ].filter(Boolean);

    if (images.length > 0) {

      mainImage.src = images[0];

      thumbnailRow.innerHTML = "";

      images.forEach((imageUrl) => {

        const img =
          document.createElement("img");

        img.src = imageUrl;

        img.className =
          "thumbnail-image";

        img.addEventListener(
          "click",
          () => {

            mainImage.src = imageUrl;
          }
        );

        thumbnailRow.appendChild(img);

      });

    }

    /* =========================
       SUGGESTIONS
    ========================= */

    loadSuggestions(productId);

  } catch (error) {

    console.error(error);

    productTitle.textContent =
      "Failed To Load Product";
  }
}

/* =========================
   SUGGESTIONS
========================= */

async function loadSuggestions(currentId) {

  if (!suggestionList) return;

  try {

    const snapshot = await getDocs(
      collection(db, "products")
    );

    suggestionList.innerHTML = "";

    snapshot.forEach((docSnap) => {

      if (docSnap.id === currentId) return;

      const product = docSnap.data();

      const card =
        document.createElement("div");

      card.className =
        "catalog-card";

      card.innerHTML = `
        <img
          src="${product.coverImage || ''}"
          class="catalog-image"
        >

        <h3>
          ${product.emoji || "🧶"}
          ${product.name}
        </h3>
      `;

      card.addEventListener(
        "click",
        () => {

          window.location.href =
            `product.html?id=${docSnap.id}`;
        }
      );

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
