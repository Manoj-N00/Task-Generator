import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ListTodo } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Welcome to Task AI</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div 
          onClick={() => navigate('/generate')}
          className="border bg-card text-card-foreground p-6 rounded-lg hover:bg-accent transition-colors cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <Brain className="w-8 h-8" />
            <h2 className="text-xl font-semibold ml-2">Generate Tasks</h2>
          </div>
          <p className="text-muted-foreground">
            Use AI to generate personalized task lists for any topic or skill you want to learn.
          </p>
        </div>

        <div 
          onClick={() => navigate('/tasks')}
          className="border bg-card text-card-foreground p-6 rounded-lg hover:bg-accent transition-colors cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <ListTodo className="w-8 h-8" />
            <h2 className="text-xl font-semibold ml-2">My Tasks</h2>
          </div>
          <p className="text-muted-foreground">
            View and manage your saved tasks, track progress, and organize your learning journey.
          </p>
        </div>
      </div>

      <div className="mt-12 border bg-card text-card-foreground p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">How it works</h3>
        <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
          <li>Enter a topic you want to learn about</li>
          <li>AI generates a customized list of actionable tasks</li>
          <li>Save the tasks you want to work on</li>
          <li>Track your progress and mark tasks as complete</li>
        </ol>
      </div>
    </div>
  );
}