import { db } from "./firebase-config.js";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* ========================================= ELEMENTS ========================================= */
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");

/* ========================================= ADD PRODUCT ========================================= */
if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // Securely grab elements matching the fixed HTML layout
      const nameVal = document.getElementById("productName").value.trim();
      const folderVal = document.getElementById("productFolder").value.trim();
      const priceVal = Number(document.getElementById("productPrice").value);
      
      const descriptionInput = document.getElementById("productDescription");
      const descriptionVal = descriptionInput ? descriptionInput.value.trim() : "";
      
      const productTagsInput = document.getElementById("productTags");
      const tagsRaw = productTagsInput ? productTagsInput.value : "";
      
      // Split raw keywords string ("bear, cute") into database array (["bear", "cute"])
      const tagsArray = tagsRaw
        ? tagsRaw.split(",").map(tag => tag.trim().toLowerCase()).filter(tag => tag !== "")
        : [];

      /* FIREBASE UPLOAD */
      await addDoc(collection(db, "products"), {
        name: nameVal,
        folder: folderVal,
        price: priceVal,
        description: descriptionVal,
        tags: tagsArray,
        createdAt: Date.now()
      });

      /* RESET FORM */
      productForm.reset();
      alert("Product Added Successfully! 🧶");
    } catch (error) {
      console.error("Firebase Add Error:", error);
      alert("Failed To Add Product. Check your internet connection or browser console.");
    }
  });
}

/* ========================================= LIVE PRODUCTS MONITOR ========================================= */
if (productList) {
  onSnapshot(collection(db, "products"), (snapshot) => {
    productList.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const product = docSnap.data();
      const cover = `assets/products/${product.folder}/cover.png`;
      const card = document.createElement("div");
      card.className = "product-card";
      
      card.innerHTML = `
        <img src="${cover}" alt="${product.name || 'Product Image'}" onerror="this.src='images/placeholder.png'">
        <h3> ${product.name || 'Unnamed Item'} </h3>
        <p> Folder: ${product.folder || 'none'} </p>
        <p> Tags: ${product.tags && product.tags.length > 0 ? product.tags.join(", ") : "None"} </p>
        <p> ${product.price ? Number(product.price).toLocaleString() : 0} VND </p>
        <button class="delete-btn" data-id="${docSnap.id}"> Delete </button>
      `;

      const deleteBtn = card.querySelector(".delete-btn");
      if (deleteBtn) {
        deleteBtn.onclick = () => deleteProduct(docSnap.id);
      }

      productList.appendChild(card);
    });
  });
}

/* ========================================= DELETE PRODUCT ========================================= */
async function deleteProduct(id) {
  const confirmDelete = confirm("Delete this product permanently?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "products", id));
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Delete failed");
  }
}
