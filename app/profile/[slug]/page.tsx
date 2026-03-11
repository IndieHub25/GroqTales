/**
 * Profile page for a specific user by username slug.
 * /profile/me → own profile (fetches auth'd endpoint)
 * /profile/<username> → public profile
 */
export const dynamicParams = true;

// When `dynamicParams` is true we allow the route to resolve at request time
// instead of forcing every possible slug to be pre-rendered.  Under a normal
// Node build this behaves like classic dynamic routing.  However, with
// `output: 'export'` (Cloudflare Pages static export) only the IDs returned by
// `generateStaticParams()` are rendered at build time; any other slug requested
// directly will 404 unless the hosting platform is configured with an SPA
// fallback (e.g. redirect all `/profile/*` to the client entry).  Client-side
// navigation after initial load still works because the router can handle the
// slug on the browser.
//
// We pre-render only the special "me" slug for authenticated users; all other
// profiles rely on client-side resolution.
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
