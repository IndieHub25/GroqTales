"use client";
import React from 'react';
import { StatCard } from '@/components/Analytics/StatCard';
import { GenreChart } from '@/components/Analytics/GenreChart';
import { useChronicleAnalytics } from '@/hooks/useChronicleAnalytics';
import { BarChart3, BookOpen, Cpu, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const { insights, loading } = useChronicleAnalytics([]); // Connect to real data source here

  if (loading) return <div className="p-10 text-purple-500">Scanning Chronicles...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Chronicle Insights
        </h1>
        <p className="text-gray-400">Data-driven analysis of your AI-generated realms.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Stories" value={insights?.totalStories || 0} icon={<BookOpen size={24}/>} />
        <StatCard label="Words Woven" value={insights?.totalTokensUsed || 0} icon={<Zap size={24}/>} />
        <StatCard label="Complexity" value="High" icon={<Cpu size={24}/>} />
        <StatCard label="Productivity" value="+12%" icon={<BarChart3 size={24}/>} />
      </div>

      <div className="bg-gray-900/50 p-8 rounded-3xl border border-white/5">
        <GenreChart data={insights?.genreBreakdown || { "Fantasy": 1 }} />
      </div>
    </div>
  );
}