import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */

const form = document.getElementById("productForm");

const productList =
  document.getElementById("productList");

/* =========================
   ADD PRODUCT
========================= */

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name =
    document.getElementById("name").value.trim();

  const price =
    Number(
      document.getElementById("price").value
    );

  const emoji =
    document.getElementById("emoji").value.trim();

  const coverImage =
    document.getElementById("coverImage").value.trim();

  const description =
    document.getElementById("description").value.trim();

  const displayImagesText =
    document.getElementById("displayImages").value;

  const displayImages =
    displayImagesText
      .split("\n")
      .map(url => url.trim())
      .filter(url => url !== "");

  /* VALIDATION */

  if (!name || !price) {
    alert("Please fill required fields");
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
        description,
        displayImages,
        createdAt: Date.now()
      }
    );

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

  try {

    const snapshot = await getDocs(
      collection(db, "products")
    );

    snapshot.forEach((productDoc) => {

      const product = productDoc.data();

      const card = document.createElement("div");

      card.className = "product-card";

      card.innerHTML = `
        <img
          src="${product.coverImage || '1.png'}"
          class="product-image"
        >

        <h3>
          ${product.emoji || "🧸"}
          ${product.name || "Unnamed"}
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

      deleteBtn.addEventListener(
        "click",
        async () => {

          const confirmDelete =
            confirm("Delete product?");

          if (!confirmDelete) return;

          try {

            await deleteDoc(
              doc(
                db,
                "products",
                productDoc.id
              )
            );

            loadProducts();

          } catch (error) {

            console.error(error);

            alert("Delete failed");
          }

        }
      );

      productList.appendChild(card);

    });

  } catch (error) {

    console.error(error);

    productList.innerHTML = `
      <h2>Failed to load products</h2>
    `;
  }

}

/* =========================
   START
========================= */

loadProducts();
