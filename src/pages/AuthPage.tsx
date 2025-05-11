
import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-blue-200 p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Persian-English Practice</h1>
        <p className="text-gray-600">Improve your language skills with translation practice</p>
      </div>
      
      <Tabs defaultValue="login" className="w-full max-w-md" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthPage;
