import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const productList = document.getElementById("productList");

async function addProduct() {
  try {
    const name = document.getElementById("name").value.trim();
    const price = Number(document.getElementById("price").value);
    const emoji = document.getElementById("emoji").value.trim();
    const coverImage = document.getElementById("coverImage").value.trim();
    const description = document.getElementById("description").value.trim();
    const displayImages = document.getElementById("displayImages").value.split("\n").map(img => img.trim()).filter(Boolean);

    if (!name || !price || !coverImage) {
      alert("Please fill in Name, Price, and Cover Image!");
      return;
    }

    await addDoc(collection(db, "products"), {
      name,
      price,
      emoji,
      coverImage,
      description,
      displayImages,
      createdAt: Date.now()
    });

    document.getElementById("productForm").reset();
    alert("Product added successfully! 🧶");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

async function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    await deleteDoc(doc(db, "products", id));
  }
}

onSnapshot(collection(db, "products"), (snapshot) => {
  productList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const product = docSnap.data();
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.coverImage}" alt="${product.name}">
      <h3>${product.emoji || "🧶"} ${product.name}</h3>
      <p>${Number(product.price).toLocaleString()} VND</p>
      <button onclick="deleteProduct('${docSnap.id}')">Delete</button>
    `;
    productList.appendChild(card);
  });
});

// EXPOSE TO HTML
window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
