// product.js

import { db } from "./firebase-config.js";

import {
  doc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ===== URL PARAM =====

const params =
  new URLSearchParams(
    window.location.search
  );

const productId =
  params.get("id");

// ===== LOAD PRODUCT =====

async function loadProduct() {

  try {

    // NO ID

    if (!productId) {

      document.body.innerHTML = `
        <h1>
          Product not found
        </h1>
      `;

      return;
    }

    // FIREBASE

    const productRef =
      doc(db, "products", productId);

    const productSnap =
      await getDoc(productRef);

    // NOT FOUND

    if (!productSnap.exists()) {

      document.body.innerHTML = `
        <h1>
          Product not found
        </h1>
      `;

      return;
    }

    // PRODUCT DATA

    const product =
      productSnap.data();

    // ===== TITLE =====

    document.getElementById(
      "productTitle"
    ).innerText =
      `${product.emoji || "🧶"} ${product.name}`;

    document.getElementById(
      "productName"
    ).innerText =
      product.name || "";

    // ===== PRICE =====

    document.getElementById(
      "productPrice"
    ).innerText =
      `${Number(product.price)
        .toLocaleString()} VND`;

    // ===== DESCRIPTION =====

    document.getElementById(
      "productDescription"
    ).innerText =
      product.description ||
      "No description yet.";

    // ===== IMAGES =====

    const imageList = [];

    // COVER IMAGE

    if (product.coverImage) {

      imageList.push(
        product.coverImage
      );
    }

    // DISPLAY IMAGES

    if (
      product.displayImages &&
      product.displayImages.length > 0
    ) {

      product.displayImages.forEach(
        img => {

          if (
            img &&
            !imageList.includes(img)
          ) {

            imageList.push(img);
          }
        }
      );
    }

    // FALLBACK

    if (imageList.length === 0) {

      imageList.push(
        "https://placehold.co/600x600?text=No+Image"
      );
    }

    // ===== MAIN IMAGE =====

    const mainImage =
      document.getElementById(
        "mainImage"
      );

    mainImage.src =
      imageList[0];

    // ===== THUMBNAILS =====

    const thumbnailRow =
      document.getElementById(
        "thumbnailRow"
      );

    thumbnailRow.innerHTML = "";

    imageList.forEach((image, index) => {

      const img =
        document.createElement("img");

      img.src = image;

      img.className =
        "thumbnail-image";

      // ACTIVE

      if (index === 0) {

        img.style.border =
          "3px solid #ffb6d3";
      }

      // CHANGE MAIN IMAGE

      img.onclick = () => {

        mainImage.src = image;

        // RESET

        document
          .querySelectorAll(
            ".thumbnail-image"
          )
          .forEach(el => {

            el.style.border =
              "3px solid transparent";
          });

        // ACTIVE BORDER

        img.style.border =
          "3px solid #ffb6d3";
      };

      // IMAGE ERROR

      img.onerror = () => {

        img.src =
          "https://placehold.co/200x200?text=Image";
      };

      thumbnailRow.appendChild(img);
    });

    // ===== MAIN IMAGE ERROR =====

    mainImage.onerror = () => {

      mainImage.src =
        "https://placehold.co/600x600?text=Image";
    };

    // ===== ADD TO CART =====

    document.getElementById(
      "addToCartBtn"
    ).onclick = () => {

      // LOCAL STORAGE CART

      let cart =
        JSON.parse(
          localStorage.getItem("cart")
        ) || [];

      // EXISTING ITEM

      const existing =
        cart.find(
          item => item.id === productId
        );

      if (existing) {

        existing.quantity += 1;

      } else {

        cart.push({

          id: productId,

          name: product.name,

          price: product.price,

          image:
            product.coverImage ||
            imageList[0],

          quantity: 1
        });
      }

      // SAVE

      localStorage.setItem(
        "cart",
        JSON.stringify(cart)
      );

      // FEEDBACK

      document.getElementById(
        "addToCartBtn"
      ).innerText =
        "Added 🧶";

      setTimeout(() => {

        document.getElementById(
          "addToCartBtn"
        ).innerText =
          "Add To Cart 🧶";

      }, 1200);
    };

  } catch (error) {

    console.error(error);

    document.body.innerHTML = `
      <h1>
        Something went wrong
      </h1>
    `;
  }
}

// ===== BACK BUTTON =====

window.goBackToCatalog =
  function () {

    window.location.href =
      "index.html";
  };

// ===== START =====

loadProduct();