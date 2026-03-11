import StoryClient from './client';

// A minimal list of params is required when `output: 'export'` is set, otherwise
// Next.js will abort the build with a missing generateStaticParams error. We
// supply a dummy id so one static page is generated; additional IDs will fall
// back to the client-side router or 404.
export function generateStaticParams() {
  return [{ id: 'default' }];
}

export const dynamicParams = false;

export default function StoryPage({ params }: { params: { id: string } }) {
  return <StoryClient id={params.id} />;
}