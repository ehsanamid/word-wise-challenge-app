
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6">
        <div className="flex justify-center items-center h-40">
          <p>Loading example...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
