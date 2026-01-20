'use client';

export default function FloatingDoodles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 bg-pink-300 rounded-full blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-40 right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-20 animate-float-delayed" />
      <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-float-slow" />
    </div>
  );
}
