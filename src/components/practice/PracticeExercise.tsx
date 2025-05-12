
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { calculateSimilarity } from '@/lib/similarity';
import { usePracticeExample } from '@/hooks/usePracticeExample';

// Import sub-components
import ExampleDisplay from './ExampleDisplay';
import WordHint from './WordHint';
import AnswerInput from './AnswerInput';
import ScoreDisplay from './ScoreDisplay';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

interface PracticeExerciseProps {
  difficulty: string;
  onComplete: (exampleId: number) => void;
  onChangeDifficulty: () => void;
  lastExampleId: number | null;
}

const PracticeExercise: React.FC<PracticeExerciseProps> = ({ 
  difficulty, 
  onComplete,
  onChangeDifficulty,
  lastExampleId
}) => {
  const {
    currentExample,
    exampleInfo,
    userAnswer,
    setUserAnswer,
    showWord,
    setShowWord,
    showAnswer,
    setShowAnswer,
    score,
    setScore,
    loading,
    saveScore
  } = usePracticeExample(difficulty, lastExampleId);

  // Handle submit answer
  const handleSubmit = () => {
    if (currentExample && userAnswer.trim()) {
      const similarityScore = calculateSimilarity(userAnswer, currentExample.english);
      setScore(similarityScore);
      saveScore(similarityScore);
    }
  };

  // Handle complete
  const handleComplete = () => {
    if (currentExample) {
      onComplete(currentExample.exampleid);
    } else {
      onChangeDifficulty();
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!currentExample) {
    return <EmptyState onChangeDifficulty={onChangeDifficulty} />;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Translation Practice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Persian text to translate */}
        <ExampleDisplay persian={currentExample.persian} />

        {/* Word hint (initially hidden) */}
        {exampleInfo && (
          <WordHint
            word={exampleInfo.word}
            type={exampleInfo.type}
            pronunciation={exampleInfo.pronunciation}
            definition={exampleInfo.definition}
            show={showWord}
          />
        )}

        {/* Answer input or display the correct answer */}
        {!score ? (
          <AnswerInput
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            showWord={showWord}
            setShowWord={setShowWord}
            showAnswer={showAnswer}
            setShowAnswer={setShowAnswer}
            correctAnswer={currentExample.english}
            handleSubmit={handleSubmit}
          />
        ) : (
          <ScoreDisplay
            userAnswer={userAnswer}
            correctAnswer={currentExample.english}
            score={score}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onChangeDifficulty}
        >
          Change Difficulty
        </Button>
        {!score ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!userAnswer.trim()}
          >
            Submit
          </Button>
        ) : (
          <Button onClick={handleComplete}>Next Example</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PracticeExercise;
