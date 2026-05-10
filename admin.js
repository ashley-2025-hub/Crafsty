// admin.js

import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ===== ELEMENT =====

const productList =
  document.getElementById("productList");

// ===== ADD PRODUCT =====

async function addProduct() {

  try {

    const name =
      document.getElementById("name")
      .value
      .trim();

    const price =
      Number(
        document.getElementById("price")
        .value
      );

    const emoji =
      document.getElementById("emoji")
      .value
      .trim();

    const coverImage =
      document.getElementById("coverImage")
      .value
      .trim();

    const description =
      document.getElementById("description")
      .value
      .trim();

    // DISPLAY IMAGES

    const displayImages =
      document.getElementById("displayImages")
      .value
      .split("\n")
      .map(img => img.trim())
      .filter(Boolean);

    // VALIDATION

    if (
      !name ||
      !price ||
      !coverImage
    ) {

      alert(
        "Please fill required fields"
      );

      return;
    }

    // FIREBASE

    await addDoc(
      collection(db, "products"),
      {
        name,
        price,
        emoji,
        coverImage,
        description,
        displayImages,
        createdAt: Date.now()
      }
    );

    // CLEAR FORM

    document.getElementById("name")
      .value = "";

    document.getElementById("price")
      .value = "";

    document.getElementById("emoji")
      .value = "";

    document.getElementById("coverImage")
      .value = "";

    document.getElementById("description")
      .value = "";

    document.getElementById("displayImages")
      .value = "";

    alert("Product Added 🧶");

  } catch (error) {

    console.error(error);

    alert("Failed to add product");
  }
}

// ===== LIVE PRODUCTS =====

onSnapshot(
  collection(db, "products"),
  (snapshot) => {

    productList.innerHTML = "";

    snapshot.forEach((docSnap) => {

      const product =
        docSnap.data();

      const card =
        document.createElement("div");

      card.className =
        "product-card";

      card.innerHTML = `

        <img
          src="${
            product.coverImage
          }"
          alt="${
            product.name
          }"
        >

        <h3>
          ${
            product.emoji || "🧶"
          }
          ${product.name}
        </h3>

        <p>
          ${Number(product.price)
            .toLocaleString()}
          VND
        </p>

        <p>
          ${
            product.displayImages
              ?.length || 0
          }
          display images
        </p>

        <button
          onclick="deleteProduct(
            '${docSnap.id}'
          )"
        >
          Delete
        </button>
      `;

      productList.appendChild(card);
    });
  }
);

// ===== DELETE =====

async function deleteProduct(id) {

  const confirmDelete =
    confirm(
      "Delete this product?"
    );

  if (!confirmDelete) return;

  try {

    await deleteDoc(
      doc(db, "products", id)
    );

  } catch (error) {

    console.error(error);

    alert("Delete failed");
  }
}

// ===== WINDOW =====

window.addProduct =
  addProduct;

window.deleteProduct =
  deleteProduct;
