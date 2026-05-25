import { db } from "./firebase-config.js";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* ========================================= ELEMENTS ========================================= */
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const productTagsInput = document.getElementById("productTags"); // Tag input element

/* ========================================= ADD PRODUCT ========================================= */
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    // 1. Grab values from the inputs securely
    const name = document.getElementById("name").value.trim();
    const folder = document.getElementById("folder").value.trim();
    const price = Number(document.getElementById("price").value);
    const description = document.getElementById("description").value.trim();
    
    // 2. Process the raw tags string into a clean array: ["bear", "cute", "brown"]
    const tagsRaw = productTagsInput ? productTagsInput.value : "";
    const tagsArray = tagsRaw
      ? tagsRaw.split(",").map(tag => tag.trim().toLowerCase()).filter(tag => tag !== "")
      : [];

    /* VALIDATION */
    if (!name || !folder || !price) {
      alert("Please fill all required fields (Name, Folder, Price)");
      return;
    }

    /* FIREBASE UPLOAD */
    await addDoc(collection(db, "products"), {
      name,
      folder,
      price,
      description,
      tags: tagsArray, // Saves your keywords array cleanly to Firestore
      createdAt: Date.now()
    });

    /* RESET FORM */
    productForm.reset();
    alert("Product Added 🧶");
  } catch (error) {
    console.error("Error adding product:", error);
    alert("Failed To Add Product");
  }
});

/* ========================================= LIVE PRODUCTS ========================================= */
onSnapshot(collection(db, "products"), (snapshot) => {
  productList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const product = docSnap.data();
    const cover = `assets/products/${product.folder}/cover.png`;
    const card = document.createElement("div");
    card.className = "product-card";
    
    card.innerHTML = `
      <img src="${cover}" alt="${product.name}" >
      <h3> ${product.name} </h3>
      <p> Folder: ${product.folder} </p>
      <p> Tags: ${product.tags ? product.tags.join(", ") : "None"} </p>
      <p> ${Number(product.price).toLocaleString()} VND </p>
      <button class="delete-btn" data-id="${docSnap.id}"> Delete </button>
    `;

    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.onclick = () => {
      deleteProduct(docSnap.id);
    };

    productList.appendChild(card);
  });
});

/* ========================================= DELETE ========================================= */
async function deleteProduct(id) {
  const confirmDelete = confirm("Delete this product?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "products", id));
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Delete failed");
  }
}
