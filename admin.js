import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("productForm");

const productList = document.getElementById("productList");

/* =========================
   ADD PRODUCT
========================= */

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name =
    document.getElementById("name").value;

  const price =
    Number(document.getElementById("price").value);

  const emoji =
    document.getElementById("emoji").value;

  const coverImage =
    document.getElementById("coverImage").value;

  const displayImages =
    document.getElementById("displayImages")
      .value
      .split("\n")
      .map(img => img.trim())
      .filter(img => img !== "");

  const description =
    document.getElementById("description").value;

  try {

    await addDoc(collection(db, "products"), {

      name,
      price,
      emoji,
      coverImage,
      displayImages,
      description

    });

    alert("Product added!");

    form.reset();

    loadProducts();

  } catch (error) {

    console.error(error);

    alert("Failed to add product");

  }

});

/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

  if (!productList) return;

  productList.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "products")
  );

  snapshot.forEach((docSnap) => {

    const product = docSnap.data();

    const card = document.createElement("div");

    card.className = "product-card";

    card.innerHTML = `

      <img
        src="${product.coverImage || '1.png'}"
        class="product-cover"
      >

      <h3>
        ${product.emoji || "🧸"}
        ${product.name}
      </h3>

      <p>
        ${(product.price || 0).toLocaleString()} VND
      </p>

      <p>
        ${(product.displayImages || []).length}
        display images
      </p>

      <button class="delete-btn">
        Delete
      </button>

    `;

    const deleteBtn =
      card.querySelector(".delete-btn");

    deleteBtn.addEventListener("click", async () => {

      await deleteDoc(
        doc(db, "products", docSnap.id)
      );

      loadProducts();

    });

    productList.appendChild(card);

  });

}

loadProducts();
