
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AnswerInputProps {
  userAnswer: string;
  setUserAnswer: (value: string) => void;
  showWord: boolean;
  setShowWord: (value: boolean) => void;
  showAnswer: boolean;
  setShowAnswer: (value: boolean) => void;
  correctAnswer: string;
  handleSubmit: () => void;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  userAnswer,
  setUserAnswer,
  showWord,
  setShowWord,
  showAnswer,
  setShowAnswer,
  correctAnswer,
  handleSubmit
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="answer" className="text-sm font-medium block mb-2">Your translation:</label>
        <Input
          id="answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your English translation here..."
          className="w-full"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          onClick={() => setShowWord(true)}
          disabled={showWord}
        >
          Show Word
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowAnswer(true)}
          disabled={showAnswer}
        >
          Show Answer
        </Button>
        {showAnswer && (
          <div className="w-full mt-2 p-3 bg-green-50 rounded-md">
            <p className="font-medium">Answer: {correctAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerInput;
