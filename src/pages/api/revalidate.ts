import type { NextApiRequest, NextApiResponse } from 'next';

// Vercel specific, Incremental Static Regeneration. more info https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = req.query.secret as string | undefined;

  if (secret !== process.env.UNIFORM_PREVIEW_SECRET) {
    return res.status(401).json({ message: 'Secret was not provided or it does not match' });
  }

  const path = (req.query.path as string) || (req.body?.slug as string | undefined);

  if (!path || typeof path !== 'string') {
    return res.status(401).json({ message: 'Composition slug is not provided' });
  }

  try {
    await res.revalidate(path.startsWith('/') ? path : `/${path}`);
    return res.json({ revalidated: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).json({ message: err.message, path, query: req.query, body: req.body });
  }
}
