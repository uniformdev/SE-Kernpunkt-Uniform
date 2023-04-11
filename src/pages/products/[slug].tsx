import { GetStaticProps, GetStaticPaths } from 'next';
import { enhancerCustomExtenderFactory, getPreEnhancer } from '@/utilities/enhancers/commerce';
import { CommonContainer } from '@/components';
import { getErrorPageProps, getFormattedPath } from '@/utilities';
import { getCompositionProps } from '@/utilities/canvas';
import { getProductIdByProductSlug } from '@/utilities/products';
import { DepthOfNavigationLinks, InternalCompositionSlugs, ProductPagesPrefixes } from '@/constants';
import productsHashCache from '@/data/products.json';

export const getStaticProps: GetStaticProps<{ preview?: boolean }> = async context => {
  const { preview, params } = context;
  const { slug: initialSlug } = params || {};

  const path = getFormattedPath(ProductPagesPrefixes.ProductDetailsPage, initialSlug);
  const productSlug = String(initialSlug);

  if (!productSlug) return { notFound: true };

  const productId = InternalCompositionSlugs.ProductDetails.includes(productSlug)
    ? Object.keys(productsHashCache)?.[0] // Default product id
    : getProductIdByProductSlug(productSlug);

  return getCompositionProps({
    path,
    defaultPath: `${ProductPagesPrefixes.ProductDetailsPage}${InternalCompositionSlugs.ProductDetails}`,
    context,
    navigationLinkOptions: { depth: DepthOfNavigationLinks, skipPaths: [ProductPagesPrefixes.ProductDetailsPage] },
    extendEnhancer: enhancerCustomExtenderFactory(productsHashCache, { productId }),
    preEnhancer: getPreEnhancer(productId),
  })
    .then(compositionProps => ({
      props: {
        ...compositionProps,
        preview: Boolean(preview),
        revalidate: Number.MAX_SAFE_INTEGER,
        key: productSlug,
      },
    }))
    .catch(getErrorPageProps);
};

export const getStaticPaths: GetStaticPaths = async () => {
  const products = Object.values(productsHashCache);

  const paths = products
    ? products.map((product: Type.Product) => `${ProductPagesPrefixes.ProductDetailsPage}/${product.slug}`)
    : [];

  return { paths, fallback: false };
};

export default CommonContainer;
