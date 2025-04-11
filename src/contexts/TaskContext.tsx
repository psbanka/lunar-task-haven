import {
  type FC,
  type ReactNode,
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "../../server/index";

// import { Template, Category, MonthData, Task } from "@/types";
import type { User, Task, Category, TaskUser } from "../../server/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

type CurrentMonthType = inferProcedureOutput<AppRouter["getActiveMonth"]>;
type TemplateType = inferProcedureOutput<AppRouter["getTemplate"]>;

export type UserTasks = UserTask[] | undefined;

// TODO: DELETE THIS?
export type UserTask = {
  user: { id: string };
  userId: string;
  task: Task;
  taskId: string;
}

type TaskContextType = {
  currentMonth: CurrentMonthType | undefined;
  template: TemplateType | undefined;
  users: User[] | undefined;
  tasks: Task[] | undefined;

  loadingTasks: boolean;
  completeTask: (taskId: string) => void;
  // incrementTaskCount: (taskId: string) => void;
  addTask: (
    task: Omit<Task, "id" | "createdAt">,
    categoryId: string,
    userIds: string[]
  ) => void;
  updateTask: (
    taskId: string,
    updates: Omit<Task, "id">,
    categoryId: string,
    userIds: string[]
  ) => void;
  deleteTask: (taskId: string) => void;
  addCategory: (category: Omit<Category, "id" | "tasks">) => void;
  updateCategory: (
    categoryId: string,
    updates: Omit<Category, "tasks">
  ) => void;
  deleteCategory: (categoryId: string) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const trpc = useTRPC();
  const monthQueryOptions = trpc.getActiveMonth.queryOptions();
  const monthQuery = useQuery(monthQueryOptions);
  const templateQueryOptions = trpc.getTemplate.queryOptions();
  const templateQuery = useQuery(templateQueryOptions);
  const userQueryOptions = trpc.getUsers.queryOptions();
  const userQuery = useQuery(userQueryOptions);

  const completeTaskOptions = trpc.completeTask.mutationOptions();
  const completeTaskMutation = useMutation(completeTaskOptions);
  const deleteTaskOptions = trpc.deleteTask.mutationOptions();
  const deleteTaskMutation = useMutation(deleteTaskOptions);
  const addCategoryOptions = trpc.addCategory.mutationOptions();
  const addCategoryMutation = useMutation(addCategoryOptions);
  const updateTaskOptions = trpc.updateTask.mutationOptions();
  const updateTaskMutation = useMutation(updateTaskOptions);
  const addTaskOptions = trpc.addTask.mutationOptions();
  const addTaskMutation = useMutation(addTaskOptions);
  const updateCategoryOptions = trpc.updateCategory.mutationOptions();
  const updateCategoryMutation = useMutation(updateCategoryOptions);
  const deleteCategoryOptions = trpc.deleteCategory.mutationOptions();
  const deleteCategoryMutation = useMutation(deleteCategoryOptions);
  const getTasksByUserQueryOptions = trpc.getTasksByUserId.queryOptions({ userId: user?.id || ''});
  const getTasksByUserQuery = useQuery(getTasksByUserQueryOptions);

  const completeTask = async (taskId: string) => {
    if (monthQuery.isError || monthQuery.isLoading) return;
    const newTask = await completeTaskMutation.mutate({ taskId });
    console.log(newTask);
    toast.success("Progress updated!");
  };

  const addTask = async (
    task: Omit<Task, "id" | "createdAt">,
    categoryId: string,
    userIds: string[]
  ) => {
    await addTaskMutation.mutate({
      task: { ...task, categoryId, userIds: userIds },
    });
    toast.success("Task added successfully!");
  };

  const updateTask = async (
    taskId: string,
    updates: Omit<Task, "id">,
    categoryId: string,
    userIds: string[]
  ) => {
    await updateTaskMutation.mutate({
      task: { ...updates, id: taskId, userIds, categoryId },
    });
    toast.success("Task updated!");
  };

  const deleteTask = async (taskId: string) => {
    await deleteTaskMutation.mutate({ taskId });
    toast.success("Task deleted!");
  };

  const addCategory = async (category: Omit<Category, "id" | "tasks">) => {
    await addCategoryMutation.mutate({ category });
    toast.success("Category added!");
  };

  const updateCategory = async (
    categoryId: string,
    updates: Omit<Category, "tasks">
  ) => {
    await updateCategoryMutation.mutate({
      name: updates.name,
      description: updates.description,
      id: categoryId,
    });
    toast.success("Category updated!");
  };

  const deleteCategory = async (categoryId: string) => {
    await deleteCategoryMutation.mutate({ id: categoryId });
    toast.success("Category deleted!");
  };

  const categories =
    monthQuery.data?.monthCategories.map((mc) => mc.category) ?? [];


  return (
    <TaskContext.Provider
      value={{
        currentMonth: monthQuery.data,
        users: userQuery.data,
        tasks: getTasksByUserQuery.data,
        template: templateQuery.data,
        loadingTasks: monthQuery.isLoading,
        completeTask,
        addTask,
        updateTask,
        deleteTask,
        addCategory,
        updateCategory,
        deleteCategory,
      }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
