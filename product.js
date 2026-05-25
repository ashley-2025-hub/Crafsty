import { db } from "./firebase-config.js";

import {
  doc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================================
   ELEMENTS
========================================= */

const productTitle =
  document.getElementById(
    "productTitle"
  );

const productName =
  document.getElementById(
    "productName"
  );

const productPrice =
  document.getElementById(
    "productPrice"
  );

const productDescription =
  document.getElementById(
    "productDescription"
  );

const mainImage =
  document.getElementById(
    "mainImage"
  );

const thumbnailRow =
  document.getElementById(
    "thumbnailRow"
  );

const suggestionList =
  document.getElementById(
    "suggestionList"
  );

const addToCartBtn =
  document.getElementById(
    "addToCartBtn"
  );

/* =========================================
   PRODUCT ID
========================================= */

const params =
  new URLSearchParams(
    window.location.search
  );

const productId =
  params.get("id");

/* =========================================
   LOAD THEME
========================================= */

function loadSavedTheme() {

  const savedTheme =
    JSON.parse(
      localStorage.getItem(
        "theme"
      )
    );

  if (!savedTheme)
    return;

  const root =
    document.documentElement;

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
}

/* =========================================
   IMAGE EXISTS
========================================= */

function imageExists(src) {

  return new Promise(
    (resolve) => {

      const img =
        new Image();

      img.onload =
        () => resolve(true);

      img.onerror =
        () => resolve(false);

      img.src = src;
    }
  );
}

/* =========================================
   LOAD NUMBERED IMAGES
========================================= */

async function loadImages(
  folder
) {

  const images = [];

  const cover =
    `assets/products/${folder}/cover.png`;

  images.push(cover);

  for (
    let i = 1;
    i <= 20;
    i++
  ) {

    const path =
      `assets/products/${folder}/${i}.png`;

    const exists =
      await imageExists(path);

    if (exists) {

      images.push(path);

    } else {

      break;
    }
  }

  return images;
}

/* =========================================
   LOAD PRODUCT
========================================= */

async function loadProduct() {

  if (!productId) {

    productTitle.textContent =
      "Missing Product";

    return;
  }

  try {

    const productRef =
      doc(
        db,
        "products",
        productId
      );

    const snapshot =
      await getDoc(
        productRef
      );

    if (
      !snapshot.exists()
    ) {

      productTitle.textContent =
        "Product Not Found";

      return;
    }

    const product =
      snapshot.data();

    const folder =
      product.folder;

    /* INFO */

    productTitle.textContent =
      product.name;

    productName.textContent =
      product.name;

    productPrice.textContent =
      `${Number(product.price)
        .toLocaleString()} VND`;

    productDescription.textContent =
      product.description ||
      "";

    /* IMAGES */

    const images =
      await loadImages(
        folder
      );

    if (
      images.length > 0
    ) {

      mainImage.src =
        images[0];

      thumbnailRow.innerHTML =
        "";

      images.forEach(
        (imageUrl) => {

          const img =
            document.createElement(
              "img"
            );

          img.src =
            imageUrl;

          img.className =
            "thumbnail-image";

          img.onclick =
            () => {

              mainImage.src =
                imageUrl;
            };

          thumbnailRow.appendChild(
            img
          );
        }
      );
    }

    /* ADD TO CART */

    addToCartBtn.onclick =
      () => {

        const cart =
          JSON.parse(
            localStorage.getItem(
              "cart"
            )
          ) || [];

        const existing =
          cart.find(
            item =>
              item.id ===
              productId
          );

        const sticker = {

          x:
            40 +
            Math.random() *
              120,

          y:
            40 +
            Math.random() *
              120
        };

        if (existing) {

          existing.quantity++;

          existing.stickers.push(
            sticker
          );

        } else {

          cart.push({

            id: productId,

            name:
              product.name,

            folder,

            price:
              Number(
                product.price
              ),

            coverImage:
              `assets/products/${folder}/cover.png`,

            emojiImage:
              `assets/products/${folder}/emoji.png`,

            quantity: 1,

            stickers: [
              sticker
            ]
          });
        }

        localStorage.setItem(

          "cart",

          JSON.stringify(cart)
        );

        alert(
          "Added To Cart 🧶"
        );
      };

  } catch (error) {

    console.error(error);

    productTitle.textContent =
      "Failed To Load";
  }
}

/* =========================================
   START
========================================= */

loadSavedTheme();

loadProduct();
