import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */

const recommendationContainer =
  document.getElementById("recommendationContainer");

const totalElement =
  document.getElementById("total");

let total = 0;

/* =========================
   LOAD RECOMMENDATIONS
========================= */

async function loadRecommendations() {

  if (!recommendationContainer) return;

  try {

    const snapshot = await getDocs(
      collection(db, "products")
    );

    recommendationContainer.innerHTML = "";

    snapshot.forEach((docSnap) => {

      const product = docSnap.data();

      const item =
        document.createElement("div");

      item.className =
        "recommendation-item";

      item.innerHTML = `
        <img
          src="${product.coverImage}"
          class="recommendation-image"
        >

        <span>
          ${product.emoji || "🧶"}
          ${product.name}
        </span>
      `;

      /* =========================
         OPEN PRODUCT PAGE
      ========================= */

      item.addEventListener(
        "click",
        () => {

          window.location.href =
            `product.html?id=${docSnap.id}`;
        }
      );

      recommendationContainer
        .appendChild(item);

    });

  } catch (error) {

    console.error(error);
  }
}

/* =========================
   BACKGROUND COLORS
========================= */

window.setBackground = function(color1, color2) {

  document.body.style.background =
    `linear-gradient(135deg, ${color1}, ${color2})`;
};

/* =========================
   CLEAR CART
========================= */

window.clearCart = function() {

  total = 0;

  if (totalElement) {

    totalElement.textContent =
      "0 VND";
  }

  alert("Cart cleared!");
};

/* =========================
   PLACE ORDER
========================= */

window.placeOrder = function() {

  const name =
    document.getElementById("customerName").value;

  const contact =
    document.getElementById("customerContact").value;

  if (!name || !contact) {

    alert("Please fill your info!");

    return;
  }

  alert(
    `Thank you ${name}! 🧶`
  );
};

/* =========================
   START
========================= */

loadRecommendations();
