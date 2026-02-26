import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export const StatCard = ({ label, value, icon }: StatCardProps) => (
  <div className="p-6 bg-gradient-to-br from-gray-900 to-black border border-purple-500/20 rounded-2xl shadow-xl">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);