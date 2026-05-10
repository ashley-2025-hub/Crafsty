await addDoc(
  collection(db, "products"),
  {
    name,
    price,
    emoji,
    coverImage,
    description,
    displayImages,
    createdAt: Date.now()
  }
);
