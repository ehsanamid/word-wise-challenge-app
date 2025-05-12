
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ExampleDisplayProps {
  persian: string;
}

const ExampleDisplay: React.FC<ExampleDisplayProps> = ({ persian }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg text-center">
      <h3 className="text-lg font-semibold mb-2">Translate to English:</h3>
      <p className="text-2xl font-medium" dir="rtl">{persian}</p>
    </div>
  );
};

export default ExampleDisplay;
