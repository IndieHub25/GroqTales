import {
  BookOpen,
  ShoppingCart,
  Users,
  Bookmark,
  Library,
  Settings,
  HelpCircle,
  Newspaper,
  BarChart3,
  Heart,
} from 'lucide-react';
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?:
    | 'book'
    | 'shopping-cart'
    | 'users'
    | 'bookmark'
    | 'library'
    | 'settings'
    | 'help'
    | 'newspaper'
    | 'chart'
    | 'heart'
    | null;
}
export function PageHeader({ title, description, icon }: PageHeaderProps) {
  const getIcon = () => {
    switch (icon) {
      case 'book':
        return <BookOpen className="h-8 w-8 mr-4 text-primary/80" />;
      case 'shopping-cart':
        return <ShoppingCart className="h-8 w-8 mr-4 text-primary/80" />;
      case 'users':
        return <Users className="h-8 w-8 mr-4 text-primary/80" />;
      case 'bookmark':
        return <Bookmark className="h-8 w-8 mr-4 text-primary/80" />;
      case 'library':
        return <Library className="h-8 w-8 mr-4 text-primary/80" />;
      case 'settings':
        return <Settings className="h-8 w-8 mr-4 text-primary/80" />;
      case 'help':
        return <HelpCircle className="h-8 w-8 mr-4 text-primary/80" />;
      case 'newspaper':
        return <Newspaper className="h-8 w-8 mr-4 text-primary/80" />;
      case 'chart':
        return <BarChart3 className="h-8 w-8 mr-4 text-primary/80" />;
      case 'heart':
        return <Heart className="h-8 w-8 mr-4 text-primary/80" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        {icon && getIcon()}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {description && (
        <p className="mt-2 text-muted-foreground max-w-3xl">{description}</p>
      )}
    </div>
  );
}
