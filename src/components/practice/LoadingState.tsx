
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingState: React.FC = () => {
  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col justify-center items-center h-40 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-16 w-64" />
          <p className="text-muted-foreground">Loading example...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
