
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ScoreDisplayProps {
  userAnswer: string;
  correctAnswer: string;
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ userAnswer, correctAnswer, score }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Your Answer:</h3>
        <p className="p-3 bg-gray-50 rounded-md">{userAnswer}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Correct Answer:</h3>
        <p className="p-3 bg-green-50 rounded-md">{correctAnswer}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Your Score:</h3>
        <div className="mb-2">
          <Progress value={score} className="h-2" />
        </div>
        <p className={`text-center font-bold text-lg ${
          score >= 80 ? "text-green-600" :
          score >= 50 ? "text-yellow-600" :
          "text-red-600"
        }`}>
          {score}%
        </p>
      </div>
    </div>
  );
};

export default ScoreDisplay;
