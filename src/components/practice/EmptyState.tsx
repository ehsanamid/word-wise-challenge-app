
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  onChangeDifficulty: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onChangeDifficulty }) => {
  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col justify-center items-center h-40 space-y-4">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <div className="text-center">
            <p className="text-lg font-medium">No examples available for this difficulty level.</p>
            <p className="text-muted-foreground mb-4">Please try a different difficulty level.</p>
          </div>
          <Button onClick={onChangeDifficulty}>Change Difficulty</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
