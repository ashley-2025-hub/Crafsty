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

async function addProduct() {

  const name =
    document.getElementById("name").value;

  const price =
    Number(document.getElementById("price").value);

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
      .filter(img => img !== "");

  if (!name || !price || !coverImage) {
    alert("Please fill all required fields");
    return;
  }

  await addDoc(collection(db, "products"), {
    name,
    price,
    emoji,
    coverImage,
    description,
    displayImages
  });

  document.getElementById("productForm").reset();
}

window.addProduct = addProduct;

async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

window.deleteProduct = deleteProduct;

onSnapshot(collection(db, "products"), (snapshot) => {

  productList.innerHTML = "";

  snapshot.forEach((docSnap) => {
});
