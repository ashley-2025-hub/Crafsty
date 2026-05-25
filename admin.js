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

const productForm =
  document.getElementById(
    "productForm"
  );

const productList =
  document.getElementById(
    "productList"
  );

/* =========================================
   ADD PRODUCT
========================================= */

productForm.addEventListener(

  "submit",

  async (e) => {

    e.preventDefault();

    try {

      // 1. Get the raw string from the input (e.g., "bear, cute, brown")
const tagsRaw = productTagsInput ? productTagsInput.value : "";

// 2. Convert the string into a clean array: ["bear", "cute", "brown"]
const tagsArray = tagsRaw
  ? tagsRaw.split(",").map(tag => tag.trim().toLowerCase()).filter(tag => tag !== "")
  : [];

// 3. Add tagsArray to your Firestore payload object
const productData = {
  name: productNameInput.value,
  price: Number(productPriceInput.value),
  folder: productFolderInput.value,
  tags: tagsArray, // <-- ADD THIS LINE TO YOUR FIRESTORE PAYLOAD
  timestamp: new Date()
};

// ... your existing db.collection("products").add(productData) or setDoc logic ...
      const name =
        document.getElementById(
          "name"
        ).value.trim();

      const folder =
        document.getElementById(
          "folder"
        ).value.trim();

      const price =
        Number(
          document.getElementById(
            "price"
          ).value
        );

      const description =
        document.getElementById(
          "description"
        ).value.trim();

      const productTagsInput = document.getElementById("productTags");
      
      /* VALIDATION */

      if (
        !name ||
        !folder ||
        !price
      ) {

        alert(
          "Please fill all fields"
        );

        return;
      }

      /* FIREBASE */

      await addDoc(

        collection(
          db,
          "products"
        ),

        {

          name,
          folder,
          price,
          description,

          createdAt:
            Date.now()
        }
      );

      /* RESET */

      productForm.reset();

      alert(
        "Product Added 🧶"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Failed To Add Product"
      );
    }
  }
);

/* =========================================
   LIVE PRODUCTS
========================================= */

onSnapshot(

  collection(db, "products"),

  (snapshot) => {

    productList.innerHTML =
      "";

    snapshot.forEach(
      (docSnap) => {

        const product =
          docSnap.data();

        const cover =
          `assets/products/${product.folder}/cover.png`;

        const card =
          document.createElement(
            "div"
          );

        card.className =
          "product-card";

        card.innerHTML = `

          <img
            src="${cover}"
            alt="${product.name}"
          >

          <h3>
            ${product.name}
          </h3>

          <p>
            Folder:
            ${product.folder}
          </p>

          <p>
            ${Number(product.price)
              .toLocaleString()}
            VND
          </p>

          <button
            class="delete-btn"
            data-id="${docSnap.id}"
          >
            Delete
          </button>
        `;

        const deleteBtn =
          card.querySelector(
            ".delete-btn"
          );

        deleteBtn.onclick =
          () => {

            deleteProduct(
              docSnap.id
            );
          };

        productList.appendChild(
          card
        );
      }
    );
  }
);

/* =========================================
   DELETE
========================================= */

async function deleteProduct(
  id
) {

  const confirmDelete =
    confirm(
      "Delete this product?"
    );

  if (!confirmDelete)
    return;

  try {

    await deleteDoc(

      doc(
        db,
        "products",
        id
      )
    );

  } catch (error) {

    console.error(error);

    alert(
      "Delete failed"
    );
  }
}
