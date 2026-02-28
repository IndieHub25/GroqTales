import { fetchStoryById } from '@/lib/mock-data';

/**
 * Pre-render pages for all known mock story IDs at build time.
 * Required by Next.js static export (`output: 'export'`).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  const params = [
    { id: 'top-1' },
    { id: 'top-2' },
    { id: 'top-3' },
  ];
  for (let i = 1; i <= 90; i++) {
    params.push({ id: `story-${i}` });
  }
  return params;
}

export default function StoryPage({
  params,
}: {
  params: { id: string };
}) {
  const story = fetchStoryById(params.id) as any;

  if (!story) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Signal Lost</h2>
          <p className="text-white/50">Story not found.</p>
          <a
            href="/nft-gallery"
            className="inline-block mt-4 px-6 py-3 border border-white/20 rounded-full text-sm hover:bg-white/10"
          >
            ← Return to Hub
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="container mx-auto px-6 py-6">
        <a
          href="/nft-gallery"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm"
        >
          ← Gallery
        </a>
      </nav>

      <header className="container mx-auto px-6 py-12 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            {story.genre && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                {story.genre}
              </span>
            )}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            {story.title}
          </h1>

          <div className="flex items-center gap-4 mb-8 text-white/60 text-sm">
            <span>By {story.author}</span>
            <span>•</span>
            <span>{story.views?.toLocaleString()} views</span>
            <span>•</span>
            <span>{story.likes?.toLocaleString()} likes</span>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-8">Synopsis</h3>
            <div className="prose prose-invert prose-lg max-w-none text-white/70 leading-relaxed">
              {story.description
                ?.split('\n\n')
                .map((p: string, i: number) => (
                  <p key={i} className="mb-6">
                    {p}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}