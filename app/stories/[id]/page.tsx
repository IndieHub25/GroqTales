import StoryClient from './client';

export const dynamic = 'force-dynamic';

export default function StoryPage({ params }: { params: { id: string } }) {
  return <StoryClient id={params.id} />;
}