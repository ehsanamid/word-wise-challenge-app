
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DifficultySelectorProps {
  onSelect: (difficulty: string) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect }) => {
  const difficulties = [
    { value: "100", label: "Beginner (Top 100 Words)", color: "bg-green-500" },
    { value: "1000", label: "Elementary (Top 1000 Words)", color: "bg-blue-500" },
    { value: "3000", label: "Intermediate (Top 3000 Words)", color: "bg-yellow-500" },
    { value: "5000", label: "Advanced (Top 5000 Words)", color: "bg-orange-500" },
    { value: "10000", label: "Expert (Top 10000 Words)", color: "bg-red-500" }
  ];

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Select Difficulty Level</CardTitle>
        <CardDescription>Choose a difficulty level to start practicing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {difficulties.map((difficulty) => (
            <Button
              key={difficulty.value}
              className={`h-16 ${difficulty.color} hover:opacity-90 transition-opacity`}
              onClick={() => onSelect(difficulty.value)}
            >
              {difficulty.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DifficultySelector;
