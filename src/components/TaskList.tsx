import React, { useEffect, useState } from 'react';
import { ListTodo, Pencil, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  created_at: string;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', taskId)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      );
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task.id);
    setEditedTitle(task.title);
  };

  const saveEdit = async () => {
    if (!editingTask || !user) return;

    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ title: editedTitle })
        .eq('id', editingTask)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setTasks(prev =>
        prev.map(task =>
          task.id === editingTask ? { ...task, title: editedTitle } : task
        )
      );
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view your tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ListTodo className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold ml-2 text-gray-900">My Tasks</h1>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filter === 'active'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filter === 'completed'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Progress: {Math.round(progress)}%
              </span>
              <span className="text-sm text-gray-600">
                {completedCount} of {tasks.length} tasks completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4 text-gray-600">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-4 text-gray-600">
              No tasks found. Start by generating some tasks!
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredTasks.map(task => (
                <li
                  key={task.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={() => toggleTaskCompletion(task.id, task.completed)}
                      className={`w-5 h-5 rounded-full border transition-colors ${
                        task.completed
                          ? 'bg-primary border-primary'
                          : 'border-gray-400 hover:border-primary'
                      } flex items-center justify-center`}
                    >
                      {task.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    
                    {editingTask === task.id ? (
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`flex-1 ${
                          task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {editingTask === task.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="text-primary opacity-0 group-hover:opacity-100 hover:text-primary/80 transition-all"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="text-destructive opacity-0 group-hover:opacity-100 hover:text-destructive/80 transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(task)}
                          className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-gray-700 transition-all"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-destructive opacity-0 group-hover:opacity-100 hover:text-destructive/80 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}