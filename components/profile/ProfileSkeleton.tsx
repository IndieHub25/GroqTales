import { Card, CardContent } from '@/components/ui/card';

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex gap-6">
          <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 h-20 bg-muted animate-pulse" />
          </Card>
        ))}
      </div>
    </div>
  );
}
