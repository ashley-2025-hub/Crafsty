id="m5x2qj"
import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================================
   ELEMENTS
========================================= */

const productList =
  document.getElementById("productList");

/* =========================================
   ADD PRODUCT
========================================= */

async function addProduct() {

  try {

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
        .map(img => img.trim())
        .filter(Boolean);

    /* VALIDATION */

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

    /* SAVE TO FIREBASE */

    await addDoc(
      collection(db, "products"),
      {
        name,
        price,
        emoji,
        coverImage,
        displayImages,
        description
      }
    );

    /* CLEAR FORM */

    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("emoji").value = "";
    document.getElementById("coverImage").value = "";
    document.getElementById("description").value = "";
    document.getElementById("displayImages").value = "";

  }

  catch (error) {

    console.error(error);

    alert(
      "Error adding product"
    );
  }
}

/* =========================================
   DELETE PRODUCT
========================================= */

async function deleteProduct(id) {

  try {

    await deleteDoc(
      doc(db, "products", id)
    );

  }

  catch (error) {

    console.error(error);

    alert(
      "Error deleting product"
    );
  }
}

/* =========================================
   REALTIME PRODUCTS
========================================= */

onSnapshot(

  collection(db, "products"),

  (snapshot) => {

    productList.innerHTML = "";

    snapshot.forEach((docSnap) => {

      const product =
        docSnap.data();

      const productCard =
        document.createElement("div");

      productCard.className =
        "product-card";

      productCard.innerHTML = `

        <img
          src="${product.coverImage}"
          alt="${product.name}">

        <h3>
          ${product.emoji || "🧶"}
          ${product.name}
        </h3>

        <p>
          ${product.price.toLocaleString()}
          VND
        </p>

        <p>
          ${product.displayImages?.length || 0}
          display images
        </p>

        <button
          onclick="deleteProduct('${docSnap.id}')">
          Delete
        </button>
      `;

      productList.appendChild(
        productCard
      );
    });
  }
);

/* =========================================
   GLOBAL
========================================= */

window.addProduct =
  addProduct;

window.deleteProduct =
  deleteProduct;
