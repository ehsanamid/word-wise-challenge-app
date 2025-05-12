
import React from 'react';

interface WordHintProps {
  word: string;
  type: string;
  pronunciation: string;
  definition: string;
  show: boolean;
}

const WordHint: React.FC<WordHintProps> = ({ word, type, pronunciation, definition, show }) => {
  if (!show) return null;
  
  return (
    <div className="bg-yellow-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-1">Key Word:</h3>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{word} <span className="text-sm text-gray-500">({type})</span></p>
        <p className="text-sm text-gray-600">Pronunciation: {pronunciation}</p>
        <p className="text-sm">{definition}</p>
      </div>
    </div>
  );
};

export default WordHint;
