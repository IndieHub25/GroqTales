import { BookOpen, Users, Eye, Sparkles } from "lucide-react";

const stats = [
  { label: "Stories", value: "12", icon: BookOpen },
  { label: "Followers", value: "1.2k", icon: Users },
  { label: "Views", value: "8.5k", icon: Eye },
  { label: "NFTs Minted", value: "5", icon: Sparkles, highlight: true },
];

interface ProfileStatsProps {
  stats: {
    storyCount: number;
    totalLikes: number;
    totalViews: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  // Define the structure but use the values from the props
  const displayStats = [
    { label: "Stories", value: stats?.storyCount || 0, icon: BookOpen },
    { label: "Followers", value: "0", icon: Users }, // Followers logic can be added later
    { label: "Views", value: stats?.totalViews || 0, icon: Eye },
    { label: "Likes", value: stats?.totalLikes || 0, icon: Sparkles, highlight: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-800/50 bg-slate-900/20 backdrop-blur-sm">
      {displayStats.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center justify-center p-2 text-center group">
          <div className={`flex items-center gap-2 text-2xl font-bold ${stat.highlight ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400' : 'text-slate-100'}`}>
            <stat.icon className={`w-5 h-5 ${stat.highlight ? 'text-pink-400' : 'text-slate-500'}`} />
            {stat.value}
          </div>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold group-hover:text-slate-400 transition-colors">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}