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

const productsCollection = collection(db, "products");

/* =========================
   LOAD PRODUCTS
========================= */
async function loadProducts() {
  productList.innerHTML = "";

  try {
    const snapshot = await getDocs(productsCollection);

    snapshot.forEach((docSnap) => {
      const product = docSnap.data();

      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${product.coverImage}" class="product-cover">

        <h3>${product.emoji || ""} ${product.name}</h3>

        <p>${product.price.toLocaleString()} VND</p>

        <p>${product.displayImages?.length || 0} display images</p>

        <button class="delete-btn" data-id="${docSnap.id}">
          Delete
        </button>
      `;

      productList.appendChild(card);
    });

    addDeleteEvents();

  } catch (error) {
    console.error("Load error:", error);
  }
}

/* =========================
   ADD PRODUCT
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();

  const price = Number(
    document.getElementById("price").value
  );

  const emoji = document.getElementById("emoji").value.trim();

  const coverImage = document
    .getElementById("coverImage")
    .value.trim();

  const description = document
    .getElementById("description")
    .value.trim();

  const displayImagesRaw = document
    .getElementById("displayImages")
    .value;

  const displayImages = displayImagesRaw
    .split("\n")
    .map((img) => img.trim())
    .filter((img) => img !== "");

  if (!name || !price || !coverImage) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    await addDoc(productsCollection, {
      name,
      price,
      emoji,
      coverImage,
      description,
      displayImages,
      createdAt: Date.now()
    });

    alert("Product added!");

    form.reset();

    loadProducts();

  } catch (error) {
    console.error("Add product error:", error);
    alert("Failed to add product.");
  }
});

/* =========================
   DELETE PRODUCT
========================= */
function addDeleteEvents() {
  const deleteButtons =
    document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;

      try {
        await deleteDoc(doc(db, "products", id));

        loadProducts();

      } catch (error) {
        console.error("Delete error:", error);
      }
    });
  });
}

/* =========================
   START
========================= */
loadProducts();
