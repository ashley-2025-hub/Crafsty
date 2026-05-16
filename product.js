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
   LOAD SAVED THEME
========================= */

function loadSavedTheme() {

  const savedTheme =
    JSON.parse(
      localStorage.getItem("theme")
    );

  if (!savedTheme) return;

  const root =
    document.documentElement;

  /* IMPORTANT */

  root.style.setProperty(
    "--main-bg",
    savedTheme.main
  );

  root.style.setProperty(
    "--sub-bg",
    savedTheme.sub
  );

  document.body.style.background =
    savedTheme.main;

  /* BACK BUTTON */

  const backBtn =
    document.querySelector(".back-btn");

  if (backBtn) {

    backBtn.style.background =
      savedTheme.sub;

    backBtn.style.color =
      "#5d4358";
  }

  /* PRODUCT BUTTON */

  if (addToCartBtn) {

    addToCartBtn.style.background =
      savedTheme.main;

    addToCartBtn.style.color =
      "white";
  }
}

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

    const product = snapshot.data();

    /* =========================
       TEXT
    ========================= */

    productTitle.textContent =
      product.name || "Unnamed Product";

    productName.textContent =
      `${product.emoji || "🧶"} ${product.name || ""}`;

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

    if (images.length > 0) {

      mainImage.src =
        images[0];

      thumbnailRow.innerHTML =
        "";

      images.forEach((imageUrl) => {

        const img =
          document.createElement("img");

        img.src =
          imageUrl;

        img.className =
          "thumbnail-image";

        img.addEventListener(
          "click",
          () => {

            mainImage.src =
              imageUrl;
          }
        );

        thumbnailRow.appendChild(img);

      });

    }

    /* =========================
       ADD TO CART
    ========================= */

    addToCartBtn.onclick =
      () => {

        const cart =
          JSON.parse(
            localStorage.getItem("cart")
          ) || [];

        const existing =
          cart.find(
            item =>
              item.id === productId
          );

        if (existing) {

          existing.quantity++;

          existing.stickers.push({

            x:
              40 + Math.random() * 110,

            y:
              40 + Math.random() * 110
          });

        } else {

          cart.push({

            id: productId,

            name:
              product.name,

            price:
              Number(
                product.price || 0
              ),

            coverImage:
              product.coverImage || "",

            emoji:
              product.emoji || "🧶",

            quantity: 1,

            stickers: [{

              x: 50,

              y: 50
            }]
          });
        }

        localStorage.setItem(

          "cart",

          JSON.stringify(cart)
        );

        addToCartBtn.textContent =
          "Added 🛒";

        setTimeout(() => {

          addToCartBtn.textContent =
            "Add To Cart";

        }, 1200);
      };

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
   LOAD SUGGESTIONS
========================= */

async function loadSuggestions(currentId) {

  try {

    const snapshot =
      await getDocs(
        collection(db, "products")
      );

    suggestionList.innerHTML =
      "";

    snapshot.forEach((docSnap) => {

      if (
        docSnap.id === currentId
      ) return;

      const product =
        docSnap.data();

      const card =
        document.createElement("div");

      card.className =
        "catalog-card";

      card.innerHTML = `

        <img
          src="${product.coverImage || ""}"
          alt="${product.name || ""}"
          class="catalog-image"
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

        </div>
      `;

      card.onclick =
        () => {

          window.location.href =
            `product.html?id=${docSnap.id}`;
        };

      suggestionList.appendChild(
        card
      );

    });

  } catch (error) {

    console.error(error);
  }
}

/* =========================
   START
========================= */

loadSavedTheme();

loadProduct();
