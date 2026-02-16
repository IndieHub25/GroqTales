import React from 'react';
export default function TextStoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="flex min-h-screen flex-col">{children}</section>;
}
