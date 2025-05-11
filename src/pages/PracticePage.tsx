
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DifficultySelector from '@/components/DifficultySelector';
import PracticeExercise from '@/components/PracticeExercise';
import { Button } from '@/components/ui/button';

const PracticePage = () => {
  const { user, logout } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [lastExampleId, setLastExampleId] = useState<number | null>(null);

  const handleSelectDifficulty = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
  };

  const handleChangeDifficulty = () => {
    setSelectedDifficulty(null);
  };

  const handleComplete = (exampleId: number) => {
    setLastExampleId(exampleId);
    setSelectedDifficulty(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-200 p-4">
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Persian-English Practice</h1>
          <p className="text-gray-600">Welcome, {user?.user}!</p>
        </div>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </header>
      
      <main className="max-w-6xl mx-auto flex flex-col items-center justify-center">
        {selectedDifficulty ? (
          <PracticeExercise 
            difficulty={selectedDifficulty}
            onComplete={handleComplete}
            onChangeDifficulty={handleChangeDifficulty}
            lastExampleId={lastExampleId}
          />
        ) : (
          <DifficultySelector onSelect={handleSelectDifficulty} />
        )}
      </main>
    </div>
  );
};

export default PracticePage;
