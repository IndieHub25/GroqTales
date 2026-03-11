import StoryClient from './client';

// A minimal list of params is required when `output: 'export'` is set, otherwise
// Next.js will abort the build with a missing generateStaticParams error. We
// supply a dummy id so one static page is generated; additional story IDs will
// be handled by the client router at runtime thanks to `dynamicParams = true`.
// With Cloudflare Pages a non-prerendered `/stories/<id>` request will fall
// through to the SPA fallback if you've configured one; otherwise the page may
// 404 on direct access but will still work via client-side navigation.
export function generateStaticParams() {
  return [{ id: 'default' }];
}

export const dynamicParams = true;

export default function StoryPage({ params }: { params: { id: string } }) {
  return <StoryClient id={params.id} />;
}