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

const productList =
  document.getElementById(
    "productList"
  );

/* =========================================
   BUILD PRODUCT PATHS
========================================= */

function buildProductData(
  folder
) {

  const base =
    `assets/products/${folder}`;

  return {

    folder,

    coverImage:
      `${base}/cover.png`,

    emojiImage:
      `${base}/emoji.png`,

    displayImages: [

      `${base}/1.png`,
      `${base}/2.png`,
      `${base}/3.png`,
      `${base}/4.png`

    ],

    iconFolder:
      `${base}/icon`,

    subFolder:
      `${base}/icon/sub`
  };
}

/* =========================================
   ADD PRODUCT
========================================= */

async function addProduct() {

  try {

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

    /* AUTO BUILD */

    const autoData =
      buildProductData(
        folder
      );

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

        coverImage:
          autoData.coverImage,

        emojiImage:
          autoData.emojiImage,

        displayImages:
          autoData.displayImages,

        iconFolder:
          autoData.iconFolder,

        subFolder:
          autoData.subFolder,

        createdAt:
          Date.now()
      }
    );

    /* CLEAR */

    document.getElementById(
      "name"
    ).value = "";

    document.getElementById(
      "folder"
    ).value = "";

    document.getElementById(
      "price"
    ).value = "";

    document.getElementById(
      "description"
    ).value = "";

    alert(
      "Product Added 🧶"
    );

  } catch (error) {

    console.error(error);

    alert(
      "Failed to add product"
    );
  }
}

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

        const card =
          document.createElement(
            "div"
          );

        card.className =
          "product-card";

        card.innerHTML = `

          <img
            src="${product.coverImage}"
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
            onclick="deleteProduct('${docSnap.id}')"
          >
            Delete
          </button>
        `;

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

/* =========================================
   WINDOW
========================================= */

window.addProduct =
  addProduct;

window.deleteProduct =
  deleteProduct;
