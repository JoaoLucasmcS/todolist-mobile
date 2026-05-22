import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Task = {
    id: string;
    title: string;
    completed: boolean;
};

export type TaskFilter = 'all' | 'completed' | 'pending';

type TaskState = {
    tasks: Task[];
    filter: TaskFilter;
    editingTaskId: string | null;

    addTask: (title: string, completed?: boolean) => void;
    updateTask: (taskId: string, title: string, completed: boolean) => void;
    toggleTaskCompleted: (taskId: string) => void;
    deleteTask: (taskId: string) => void;
    deleteAllTasks: () => void;

    setFilter: (filter: TaskFilter) => void;
    startEditing: (taskId: string | null) => void;
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
    tasks: [],
    filter: 'all',
    editingTaskId: null,

    addTask: (title, completed = false) => {
        const newTask: Task = {
            id: String(new Date().getTime()),
            title,
            completed,
        };

        set((state) => ({
            tasks: [...state.tasks, newTask],
        }));
    },

    updateTask: (taskId, title, completed) => {
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        title,
                        completed,
                    }
                    : task
            ),
        }));
    },

    toggleTaskCompleted: (taskId) => {
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
            ),
        }));
    },

    deleteTask: (taskId) => {
        set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
    },

    deleteAllTasks: () => {
        set({ tasks: [] });
    },

    setFilter: (filter) => set({ filter }),

    startEditing: (taskId) => set({ editingTaskId: taskId }),
    }),
    {
      name: 'tasks-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tasks: state.tasks, filter: state.filter }),
    }
  )
);

