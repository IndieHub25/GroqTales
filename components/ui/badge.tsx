import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-none border-2 border-black px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  {
    variants: {
      variant: {
        default:
          'border-black bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-black bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-black bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground bg-background',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
export { Badge, badgeVariants };
