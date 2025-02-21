import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Loader2, Save } from 'lucide-react';
import { generateTasks } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function TaskGenerator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const tasks = await generateTasks(topic.trim());
      setGeneratedTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskTitle: string) => {
    if (!user) {
      setError('Please sign in to save tasks');
      return;
    }

    try {
      const { error: saveError } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            title: taskTitle,
            category: topic,
            completed: false
          }
        ]);

      if (saveError) throw saveError;

      setGeneratedTasks(prev => prev.filter(t => t !== taskTitle));
    } catch (err) {
      setError('Failed to save task. Please try again.');
    }
  };

  const handleSaveAll = async () => {
    if (!user) {
      setError('Please sign in to save tasks');
      return;
    }

    try {
      const tasks = generatedTasks.map(title => ({
        user_id: user.id,
        title,
        category: topic,
        completed: false
      }));

      const { error: saveError } = await supabase
        .from('tasks')
        .insert(tasks);

      if (saveError) throw saveError;

      setGeneratedTasks([]);
      navigate('/tasks');
    } catch (err) {
      setError('Failed to save tasks. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border bg-card text-card-foreground p-8 rounded-lg">
        <div className="flex items-center mb-6">
          <Brain className="w-8 h-8" />
          <h1 className="text-2xl font-bold ml-2">Generate Tasks</h1>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleGenerate} className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              What do you want to learn?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g., Python programming, digital marketing, photography"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Tasks'
            )}
          </button>
        </form>

        {generatedTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Generated Tasks</h2>
              <button
                onClick={handleSaveAll}
                className="text-primary hover:text-primary/80 flex items-center transition-colors"
              >
                <Save className="w-4 h-4 mr-1" />
                Save All
              </button>
            </div>
            <ul className="space-y-3">
              {generatedTasks.map((task, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between border bg-accent/50 p-3 rounded-md group"
                >
                  <span className="text-sm">{task}</span>
                  <button
                    onClick={() => handleSaveTask(task)}
                    className="text-primary opacity-0 group-hover:opacity-100 hover:text-primary/80 transition-all"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}