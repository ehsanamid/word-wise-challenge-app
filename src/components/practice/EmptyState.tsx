
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  onChangeDifficulty: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onChangeDifficulty }) => {
  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col justify-center items-center h-40 space-y-4">
          <p>No examples available for this difficulty level.</p>
          <Button onClick={onChangeDifficulty}>Change Difficulty</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
