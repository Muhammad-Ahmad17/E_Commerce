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



      select * from ProductReviews
          where productId = 8