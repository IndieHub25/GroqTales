/**
 * Profile page for a specific user by MongoDB ObjectId.
 * Static export compatible — generates a default param for build.
 */
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ id: 'default' }];
}

import ProfilePageClient from './client';

export default function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return <ProfilePageClient userId={params.id} />;
}
