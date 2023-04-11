import { GetStaticProps, GetStaticPaths } from 'next';
import { enhancerCustomExtenderFactory } from '@/utilities/enhancers/commerce';
import { CommonContainer } from '@/components';
import { getErrorPageProps } from '@/utilities';
import { getPathsFromProjectMap, getCompositionProps } from '@/utilities/canvas';
import { DepthOfNavigationLinks, InternalCompositionSlugs, ProductPagesPrefixes } from '@/constants';
import categories from '@/data/categories.json';
import productsHashCache from '@/data/products.json';

export const getStaticProps: GetStaticProps<{ preview?: boolean }> = async context => {
  const { preview, params } = context;
  const { category: queryCategory } = params || {};

  const category = String(queryCategory);

  return getCompositionProps({
    path: `${InternalCompositionSlugs.ProductListingPrefix}/${category}`,
    context,
    navigationLinkOptions: { depth: DepthOfNavigationLinks, skipPaths: [ProductPagesPrefixes.ProductDetailsPage] },
    extendEnhancer: enhancerCustomExtenderFactory(productsHashCache, { category, categories }),
  })
    .then(compositionProps => ({
      props: {
        ...compositionProps,
        key: category,
        preview: Boolean(preview),
        revalidate: Number.MAX_SAFE_INTEGER,
      },
    }))
    .catch(getErrorPageProps);
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getPathsFromProjectMap({ path: ProductPagesPrefixes.ProductListPage });
  return { paths, fallback: false };
};

export default CommonContainer;
