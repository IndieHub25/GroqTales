/**
 * No profiles to pre-render — data is fetched at runtime by wallet address.
 * Required by Next.js static export (`output: 'export'`).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ username: 'default' }];
}

export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  return (
    <main className="min-h-screen bg-black text-slate-200 pb-20">
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">User Profile</h1>
        <p className="text-slate-400 mb-2">Wallet: {params.username}</p>
        <p className="text-slate-500 text-sm">
          Connect your wallet to view full profile details.
        </p>
        <a
          href="/"
          className="inline-block mt-8 px-6 py-3 border border-slate-700 rounded-full text-sm hover:bg-slate-900 transition-colors"
        >
          ← Back to Home
        </a>
      </div>
    </main>
  );
}
