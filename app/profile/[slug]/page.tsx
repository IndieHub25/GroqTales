/**
 * Profile page for a specific user by username slug.
 * /profile/me → own profile (fetches auth'd endpoint)
 * /profile/<username> → public profile
 */
export const dynamicParams = true;

export function generateStaticParams() {
    return [{ slug: 'me' }];
}

import ProfilePageClient from './client';

export default function ProfilePage({
    params,
}: {
    params: { slug: string };
}) {
    return <ProfilePageClient slug={params.slug} />;
}
