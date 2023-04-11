import { GetStaticProps, GetStaticPaths } from 'next';
import { enhancerCustomExtenderFactory } from '@/utilities/enhancers/commerce';
import { CommonContainer } from '@/components';
import { getErrorPageProps, getFormattedPath } from '@/utilities';
import { getPathsFromProjectMap, getCompositionProps } from '@/utilities/canvas';
import { AppPages, DepthOfNavigationLinks, ProductPagesPrefixes } from '@/constants';
import productsHashCache from '@/data/products.json';

export const getStaticProps: GetStaticProps<{ preview?: boolean }> = async context => {
  const { preview, params } = context;
  const { slug: initialSlug } = params || {};

  const path = getFormattedPath(AppPages.Home, initialSlug);

  return getCompositionProps({
    path,
    context,
    navigationLinkOptions: { depth: DepthOfNavigationLinks, skipPaths: [ProductPagesPrefixes.ProductDetailsPage] },
    extendEnhancer: enhancerCustomExtenderFactory(productsHashCache),
  })
    .then(compositionProps => ({
      props: {
        ...compositionProps,
        preview: Boolean(preview),
        revalidate: Number.MAX_SAFE_INTEGER,
      },
    }))
    .catch(getErrorPageProps);
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getPathsFromProjectMap({ skipPaths: [ProductPagesPrefixes.ProductListPage], depth: 1 });
  return { paths, fallback: false };
};

export default CommonContainer;
