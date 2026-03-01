/**
 * No text stories to pre-render — IDs are loaded dynamically.
 * Required by Next.js static export (`output: 'export'`).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function TextStoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <a
            href="/nft-marketplace/text-stories"
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
          >
            ← Back to Marketplace
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Text Story Detail
            </h1>
            <p className="text-gray-600">Story ID: {params.id}</p>
            <p className="text-sm text-gray-500">
              This page is under development. The full text story detail
              functionality will be implemented soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
