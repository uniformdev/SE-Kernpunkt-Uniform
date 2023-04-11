import { GetStaticProps, GetStaticPaths } from 'next';
import { enhancerCustomExtenderFactory } from '@/utilities/enhancers/commerce';
import { CommonContainer } from '@/components';
import { getErrorPageProps } from '@/utilities';
import { getPathsFromProjectMap, getCompositionProps } from '@/utilities/canvas';
import { getAvailableSubCategoriesPaths } from '@/utilities/products';
import { DepthOfNavigationLinks, InternalCompositionSlugs, ProductPagesPrefixes } from '@/constants';
import categories from '@/data/categories.json';
import productsHashCache from '@/data/products.json';

export const getStaticProps: GetStaticProps<{ preview?: boolean }> = async context => {
  const { preview, params } = context;
  const { category: queryCategory, subcategory: querySubCategory } = params || {};

  const category = String(queryCategory);
  const subCategory = String(querySubCategory);

  return getCompositionProps({
    path: `${InternalCompositionSlugs.ProductListingPrefix}/${category}`,
    context,
    navigationLinkOptions: { depth: DepthOfNavigationLinks, skipPaths: [ProductPagesPrefixes.ProductDetailsPage] },
    extendEnhancer: enhancerCustomExtenderFactory(productsHashCache, { category, categories, subCategory }),
  })
    .then(compositionProps => ({
      props: {
        ...compositionProps,
        preview: Boolean(preview),
        key: `${category}-${subCategory}`,
        revalidate: Number.MAX_SAFE_INTEGER,
      },
    }))
    .catch(getErrorPageProps);
};

export const getStaticPaths: GetStaticPaths = async () => {
  const baseCategoriesPaths = await getPathsFromProjectMap({ path: ProductPagesPrefixes.ProductListPage });
  const paths = getAvailableSubCategoriesPaths(baseCategoriesPaths, categories);
  return { paths, fallback: false };
};

export default CommonContainer;
