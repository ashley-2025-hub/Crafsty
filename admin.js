import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const productList =
  document.getElementById("productList");

// ===== ADD PRODUCT =====

async function addProduct() {

  const name =
    document.getElementById("name").value;

  const price =
    Number(
      document.getElementById("price").value
    );

  const emoji =
    document.getElementById("emoji").value;

  const coverImage =
    document.getElementById("coverImage").value;

  const description =
    document.getElementById("description").value;

  const displayImages =
    document.getElementById("displayImages")
      .value
      .split("\n")
      .filter(Boolean);

  if (!name || !price) {

    alert("Missing product info");

    return;
  }

  try {

    await addDoc(
      collection(db, "products"),
      {
        name,
        price,
        emoji,
        coverImage,
        image: coverImage,
        description,
        displayImages
      }
    );

    document
      .getElementById("productForm")
      .reset();

  } catch (error) {

    console.error(error);

    alert("Failed to add product");
  }
}

// ===== DELETE =====

async function deleteProduct(id) {

  try {

    await deleteDoc(
      doc(db, "products", id)
    );

  } catch (error) {

    console.error(error);

    alert("Delete failed");
  }
}

// ===== LIVE PRODUCTS =====

onSnapshot(
  collection(db, "products"),
  (snapshot) => {

    productList.innerHTML = "";

    snapshot.forEach(docSnap => {

      const product = {
        id: docSnap.id,
        ...docSnap.data()
      };

      const card =
        document.createElement("div");

      card.className =
        "product-card";

      card.innerHTML = `

        <img
          src="${
            product.coverImage
          }"
        >

        <h3>
          ${product.emoji || "🧶"}
          ${product.name}
        </h3>

        <p>
          ${Number(product.price)
            .toLocaleString()}
          VND
        </p>

        <button
          onclick="
            deleteProduct(
              '${product.id}'
            )
          ">
          Delete
        </button>
      `;

      productList.appendChild(card);
    });
  }
);

// ===== WINDOW =====

window.addProduct = addProduct;

window.deleteProduct = deleteProduct;
