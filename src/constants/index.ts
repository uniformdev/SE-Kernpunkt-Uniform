export enum BaseAddPages {
  Home = '/',
}

export enum ProductPagesPrefixes {
  ProductListPage = '/shop',
  ProductDetailsPage = '/products',
}

export enum ArticlePagesPrefixes {
  ArticlesPage = '/articles',
}



export const AppPages = {
  ...BaseAddPages,
  CoffeeMakers: `${ProductPagesPrefixes.ProductListPage}/coffee-makers`,
  Beans: `${ProductPagesPrefixes.ProductListPage}/beans`,
  Cart: `/cart`,
};

export const InternalCompositionSlugs = {
  ProductDetails: '/product-slug',
  ProductListingPrefix: ProductPagesPrefixes.ProductListPage,
};

export const DepthOfNavigationLinks = 2;


