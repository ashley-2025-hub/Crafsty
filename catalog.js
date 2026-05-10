console.log("catalog working");

const productContainer =
  document.getElementById("productContainer");

if (productContainer) {

  productContainer.innerHTML = `

    <div class="catalog-card">

      <img
        src="https://placehold.co/300"
        class="catalog-image"
      >

      <h3>🧸 Test Product</h3>

      <p>100,000 VND</p>

      <button class="add-btn">
        Add to Cart
      </button>

    </div>

  `;
}
