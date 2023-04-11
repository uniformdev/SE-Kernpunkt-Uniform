import getConfig from 'next/config';
import { createPreviewHandler } from '@uniformdev/canvas-next';
import { enhancerCustomExtenderFactory } from '@/utilities/enhancers/commerce';
import { enhanceComposition } from '@/utilities/enhanceComposition';
import categories from '@/data/categories.json';
import productsHashCache from '@/data/products.json';

// Preview Mode, more info https://nextjs.org/docs/advanced-features/preview-mode
export default createPreviewHandler({
  secret: () => getConfig().serverRuntimeConfig.previewSecret,
  enhance: async composition =>
    enhanceComposition({
      composition,
      extendEnhancer: enhancerCustomExtenderFactory(productsHashCache, { categories }),
      preview: true,
    }),
});
