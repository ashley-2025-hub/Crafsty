import { db } from "./firebase-config.js";

import {
  doc,
  getDoc,
  collection,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const params =
  new URLSearchParams(window.location.search);

const productId =
  params.get("id");

async function loadProduct() {

  try {

    if (!productId) {

      document.body.innerHTML = `
        <h1>Product not found</h1>
      `;

      return;
    }

    const productRef =
      doc(db, "products", productId);

    const productSnap =
      await getDoc(productRef);

    if (!productSnap.exists()) {

      document.body.innerHTML = `
        <h1>Product not found</h1>
      `;

      return;
    }

    const product = productSnap.data();

    document.getElementById("productTitle")
      .textContent = product.name;

    document.getElementById("productName")
      .textContent = `${product.emoji || "🧸"} ${product.name}`;

    document.getElementById("productPrice")
      .textContent = `${product.price.toLocaleString()} VND`;

    document.getElementById("productDescription")
      .textContent = product.description;

    const mainImage =
      document.getElementById("mainImage");

    mainImage.src =
      product.displayImages?.[0]
loadProduct();
