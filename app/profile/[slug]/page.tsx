/**
 * Profile page for a specific user by username slug.
 * /profile/me → own profile (fetches auth'd endpoint)
 * /profile/<username> → public profile
 */
export const runtime = 'edge';
export const dynamicParams = true;

import ProfilePageClient from './client';

export default function ProfilePage({ params }: { params: { slug: string } }) {
  return <ProfilePageClient slug={params.slug} />;
}
