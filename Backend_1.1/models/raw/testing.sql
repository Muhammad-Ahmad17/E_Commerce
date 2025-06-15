SELECT DISTINCT
  productId,
  productName,
  price,
  categoryName,
  vendorName,
  description,
  imageUrl
FROM BuyerCategoryProducts
WHERE productName LIKE '%' + 'dress' + '%'

SELECT DISTINCT
          productId,
          productName,
          price,
          categoryName,
          vendorName,
          description,
          imageUrl
        FROM BuyerCategoryProducts
        WHERE productName LIKE 'dress'

SELECT DISTINCT
        productId,
        productName,
        price,
        categoryName,
        vendorName,
        description,
        imageUrl
      FROM BuyerCategoryProducts
      WHERE productName LIKE @searchTerm