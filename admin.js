import { db } from "./firebase-config.js";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* ========================================= ELEMENTS ========================================= */
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const productTagsInput = document.getElementById("productTags");

/* ========================================= ADD PRODUCT ========================================= */
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const nameInput = document.getElementById("name");
    const folderInput = document.getElementById("folder");
    const priceInput = document.getElementById("price");
    const descriptionInput = document.getElementById("description");

    // Grab values securely
    const name = nameInput ? nameInput.value.trim() : "";
    const folder = folderInput ? folderInput.value.trim() : "";
    const price = priceInput ? Number(priceInput.value) : 0;
    const description = descriptionInput ? descriptionInput.value.trim() : "";
    
    // Process tags safely
    const tagsRaw = productTagsInput ? productTagsInput.value : "";
    const tagsArray = tagsRaw
      ? tagsRaw.split(",").map(tag => tag.trim().toLowerCase()).filter(tag => tag !== "")
      : [];

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
      tags: tagsArray,
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
  if (!productList) return;
  productList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const product = docSnap.data();
    const cover = `assets/products/${product.folder}/cover.png`;
    const card = document.createElement("div");
    card.className = "product-card";
    
    card.innerHTML = `
      <img src="${cover}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
      <h3> ${product.name} </h3>
      <p> Folder: ${product.folder} </p>
      <p> Tags: ${product.tags ? product.tags.join(", ") : "None"} </p>
      <p> ${Number(product.price).toLocaleString()} VND </p>
      <button class="delete-btn" data-id="${docSnap.id}"> Delete </button>
    `;

    const deleteBtn = card.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.onclick = () => deleteProduct(docSnap.id);
    }

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
