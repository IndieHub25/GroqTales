/**
 * Profile page for a specific user by username slug.
 * /profile/me → own profile (fetches auth'd endpoint)
 * /profile/<username> → public profile
 */
export const dynamicParams = true;

// A minimal list of static params is required when `output: 'export'` is
// enabled. We only pre-render the authenticated "me" page; all other slugs
// will simply 404 in the static export. Client-side navigation and the
// frontend router still handle dynamic usernames when the app is running in
// a browser.
export function generateStaticParams() {
  return [
    {
      slug: 'me',
    },
  ];
}

import ProfilePageClient from './client';

export default function ProfilePage({
    params,
}: {
    params: { slug: string };
}) {
    return <ProfilePageClient slug={params.slug} />;
}
