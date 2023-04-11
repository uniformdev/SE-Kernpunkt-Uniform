import { ChildEnhancerBuilder, EnhancerBuilder, ComponentParameter } from '@uniformdev/canvas';
import { FAKE_COMMERCE_PRODUCT_SELECTOR_PARAMETER_TYPE } from '@uniformdev/canvas-enhancers';
import { getProductSearchResult } from '@/utilities/products';
import { EnhanceParameter } from '@/utilities';
import categoriesCache from '@/data/categories.json';

interface GetFakeCommerceEnhancersParams {
  productId?: string;
  category?: string;
  subCategory?: string;
  categories?: Type.Category[];
}

interface ProductComponentParameterEnhancerParams {
  productId: string;
}

interface ProductListComponentParameterEnhancerParams {
  category: string;
  subCategory?: string;
  categories: Type.Category[];
}

interface MeshEditorProductSelectorParams {
  productIds?: string[];
}

const parameterIsProductSelector = (parameter: ComponentParameter<MeshEditorProductSelectorParams>): boolean =>
  FAKE_COMMERCE_PRODUCT_SELECTOR_PARAMETER_TYPE.includes(parameter.type) && Boolean(parameter.value?.productIds);

const isParameterProductSelectorDefined = (value: MeshEditorProductSelectorParams): boolean =>
  Array.isArray(value?.productIds);

const getRelatedProducts = (productsHashCache: Type.ProductsHashCache, productId: string) => {
  const product = productsHashCache[productId];
  const productCategories = product?.categories || [];
  return Object.values(productsHashCache).filter(
    item => item.categories.some(category => productCategories.includes(category)) && item.id !== product?.id
  );
};

// We replacing the default AlgoliaRecord parameter enhancer with our own based on the product id from slug
const getProductParameterPreEnhancer = (productIds: string) => ({
  enhanceOne: async function Enhancer({ parameter }: EnhanceParameter<MeshEditorProductSelectorParams>) {
    return {
      ...parameter.value,
      productIds: [productIds],
    };
  },
});

const getComponentParameterEnhancer = (productsHashCache: Type.ProductsHashCache) => ({
  enhanceOne: async function Enhancer({ parameter }: EnhanceParameter<MeshEditorProductSelectorParams>) {
    if (parameterIsProductSelector(parameter)) {
      if (!isParameterProductSelectorDefined(parameter.value)) {
        return null;
      }

      return parameter.value.productIds?.reduce<Type.Product[]>((acc, id) => {
        if (productsHashCache[id]) {
          return [...acc, productsHashCache[id]];
        }
        return acc;
      }, []);
    }
  },
});

const getProductComponentParameterEnhancer =
  (productsHashCache: Type.ProductsHashCache, options: ProductComponentParameterEnhancerParams) =>
  (builder: ChildEnhancerBuilder) => {
    builder.data('product', () => productsHashCache[options.productId]);
  };

const getRelatedProductComponentParameterEnhancer =
  (productsHashCache: Type.ProductsHashCache, options: ProductComponentParameterEnhancerParams) =>
  (builder: ChildEnhancerBuilder) => {
    builder.data('relatedProducts', () => getRelatedProducts(productsHashCache, options?.productId));
  };

const getProductListComponentParameterEnhancer =
  (productsHashCache: Type.ProductsHashCache, options: ProductListComponentParameterEnhancerParams) =>
  (builder: ChildEnhancerBuilder) => {
    const { category, subCategory, categories } = options;

    const products = Object.values(productsHashCache);
    const currentMainCategory = categories.find(item => item.url === category);
    const currentCategory = categories.find(item => item.url === (subCategory || category));

    builder.data('categories', () => categories?.filter(item => item.parentId === currentMainCategory?.id));
    builder.data('prefetchedSearchResult', () => {
      const { data } = getProductSearchResult(products, {
        categoryId: currentCategory?.id,
      });

      return data;
    });
    builder.data('activeCategory', () => currentCategory);
  };

export const enhancerCustomExtenderFactory =
  (productsHashCache: Type.ProductsHashCache, options?: GetFakeCommerceEnhancersParams) =>
  (enhancer: EnhancerBuilder) => {
    const {
      productId = Object.keys(productsHashCache)?.[0], // Default product id
      category = categoriesCache.find(i => i.parentId === '0')?.url || '', // Default category
      subCategory,
      categories = [],
    } = options || {};

    enhancer
      .parameterType(FAKE_COMMERCE_PRODUCT_SELECTOR_PARAMETER_TYPE, getComponentParameterEnhancer(productsHashCache))
      .component(
        ['productInfo', 'productImageGallery', 'productDescription', 'addToCart'],
        getProductComponentParameterEnhancer(productsHashCache, { productId })
      )
      .component(['relatedProducts'], getRelatedProductComponentParameterEnhancer(productsHashCache, { productId }))
      .component(
        ['productCatalog'],
        getProductListComponentParameterEnhancer(productsHashCache, {
          category,
          subCategory,
          categories,
        })
      );
  };

export const getPreEnhancer = (productId: string) => {
  return new EnhancerBuilder().parameterType(
    FAKE_COMMERCE_PRODUCT_SELECTOR_PARAMETER_TYPE,
    getProductParameterPreEnhancer(productId)
  );
};
