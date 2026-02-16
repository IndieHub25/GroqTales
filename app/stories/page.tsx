import { StoriesClient } from './StoriesClient';

export const metadata = {
  title: 'Stories | GroqTales',
  description:
    'Learn how to create and share your own stories on GroqTales, the Web3 storytelling platform',
};

export const revalidate =
  process.env.NEXT_PUBLIC_BUILD_MODE === 'true' ? 10 : 3600;

export default function StoriesPage() {
  return <StoriesClient />;
}
