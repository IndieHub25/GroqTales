import React from 'react';

export const GenreChart = ({ data }: { data: Record<string, number> }) => {
  const entries = Object.entries(data);
  const max = Math.max(...Object.values(data));

  return (
    <div className="space-y-4">
      <h4 className="text-white font-semibold">Genre Distribution</h4>
      {entries.map(([genre, count]) => (
        <div key={genre} className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-200 bg-purple-600/20">
              {genre}
            </span>
            <span className="text-xs font-semibold text-purple-400">{count} Stories</span>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-800">
            <div 
              style={{ width: `${(count / max) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 transition-all duration-500"
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};