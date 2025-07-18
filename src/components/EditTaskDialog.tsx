import { FIBONACCI } from "../../shared/types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type } from "arktype";
import { arktypeResolver } from "@hookform/resolvers/arktype";
import { LoadingScreen } from "./LoadingScreen";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { useTask } from "@/contexts/TaskContext";
import { Trash, Layers, Eye, EyeOff } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Avatar } from "@/components/ui/avatar";

// Schema for task creation
const TaskSchema = type({
  "id?": "string",
  title: "string > 0",
  description: "string",
  storyPoints: "0 | 1 | 2 | 3 | 5 | 8 | 13",
  targetCount: "1 <= number.integer <= 31",
  "completedCount?": "number",
  userIds: "string[] >= 1",
  monthId: "string | null",
  categoryId: "string",
  "isFocused?": "0 | 1",
});

type TaskFormValues = typeof TaskSchema.infer;

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: string;
  monthId: string | null;
  isTemplateTask: boolean;
  initialValues?: Partial<TaskFormValues>;
}

export function EditTaskDialog({
  open,
  onOpenChange,
  categoryId,
  monthId,
  isTemplateTask,
  initialValues,
}: EditTaskDialogProps) {
  const {
    currentMonth,
    addTask,
    updateTask,
    updateTemplateTask,
    addTemplateTask,
    users,
    deleteTask,
    deleteTemplateTask,
  } = useTask();
  const isMobile = useMediaQuery("(max-width: 640px)"); // Tailwind's 'sm' breakpoint
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditingId = initialValues?.id;
  const isEditingTask = isEditingId && categoryId;
  const isEditingTemplateTask = isEditingId && isTemplateTask;
  const isContinuingTask =
    initialValues?.targetCount && initialValues.targetCount > 1;

  const form = useForm<TaskFormValues>({
    resolver: arktypeResolver(TaskSchema),
    defaultValues: {
      title: "",
      description: "",
      storyPoints: 1,
      targetCount: 1,
      completedCount: 0,
      isFocused: 0,
      userIds: [],
      monthId,
      categoryId,
      ...initialValues,
    },
  });

  if (!categoryId) return null;

  const onSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    const userIds = values.userIds;
    try {
      if (isEditingId && categoryId) {
        await updateTask(
          isEditingId,
          {
            title: values.title,
            description: values.description || null,
            storyPoints: values.storyPoints as (typeof FIBONACCI)[number], // FIXME
            targetCount: values.targetCount,
            completedCount: values.completedCount || 0,
            isFocused: values.isFocused || 0,
            monthId: values.monthId,
            templateTaskId: null,
            categoryId: values.categoryId,
          },
          values.userIds
        );
      } else if (isEditingId && isTemplateTask) {
        await updateTemplateTask(
          isEditingId,
          {
            title: values.title,
            description: values.description || null,
            storyPoints: values.storyPoints as (typeof FIBONACCI)[number], // FIXME
            targetCount: values.targetCount,
            categoryId: values.categoryId,
          },
          values.userIds
        );
      } else if (categoryId) {
        await addTask(
          {
            title: values.title,
            description: values.description || null,
            storyPoints: values.storyPoints as (typeof FIBONACCI)[number], // FIXME
            targetCount: values.targetCount,
            categoryId: categoryId,
            monthId: monthId,
            isFocused: values.isFocused || 0,
            completedCount: 0,
          },
          userIds
        );
      } else if (isTemplateTask) {
        await addTemplateTask(
          {
            title: values.title,
            description: values.description || null,
            storyPoints: values.storyPoints as (typeof FIBONACCI)[number], // FIXME
            targetCount: values.targetCount,
            categoryId: values.categoryId,
          },
          userIds
        );
      }

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditingId) return;

    setIsSubmitting(true);
    try {
      if (isEditingTemplateTask) {
        await deleteTemplateTask(isEditingId);
      } else if (isEditingTask) {
        await deleteTask(isEditingId);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!users) {
    return <LoadingScreen />;
  }

  const errorMessages = Object.values(form.formState.errors).map(
    (error) => error.message
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "overflow-y-auto", // Ensure content can scroll
          isMobile
            ? "h-screen w-screen max-w-full fixed top-0 left-0 m-0 p-4 rounded-none border-none translate-x-0 translate-y-0 data-[state=open]:animate-none data-[state=closed]:animate-none"
            : "sm:max-w-[425px]"
        )}
      >
        {/* On mobile, the DialogPrimitive.Close 'X' button (if part of base DialogContent) will be at top-right. */}
        {/* The form content will scroll within this full-screen container. */}
        <DialogHeader>
          <DialogTitle>
            <DialogDescription>
              {isEditingId ? "Edit Task" : "Add New Task"}
            </DialogDescription>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this task..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storyPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story Points</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {FIBONACCI.map((points) => (
                      <Button
                        key={points}
                        type="button"
                        variant={field.value === points ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(points)}>
                        {points}
                      </Button>
                    ))}
                  </div>
                  <FormDescription>
                    Select the complexity level (1 is easiest, 13 is hardest)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isTemplateTask && (
              <FormField
                control={form.control}
                name="targetCount"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Times per month: {value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={31}
                        step={1}
                        value={[value]}
                        onValueChange={(vals) => onChange(vals[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      {value === 1
                        ? "Do once per month"
                        : value === 31
                        ? "Do every day"
                        : `Do ${value} times per month`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {isEditingTask &&
              initialValues?.targetCount &&
              initialValues.targetCount > 1 && (
                <FormField
                  control={form.control}
                  name="completedCount"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>Completed Count: {value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={initialValues.targetCount}
                          step={1}
                          value={[value ?? 0]}
                          onValueChange={(vals) => onChange(vals[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Set the number of times this task has been completed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

            <FormField
              control={form.control}
              name="userIds"
              render={() => (
                <FormItem>
                  <FormLabel>Assign to</FormLabel>
                  <div className="grid grid-cols-1 grid-cols-3 gap-3">
                    {users.map((user) => {
                      if (user.role === "admin") return null;
                      return (
                        <FormField
                          key={user.id}
                          control={form.control}
                          name="userIds"
                          render={({
                            field: { onChange, value: selectedUserIds },
                          }) => {
                            const isSelected = selectedUserIds?.includes(
                              user.id
                            );
                            return (
                              <Button
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                className="flex items-center justify-start gap-2 h-auto p-2"
                                onClick={() => {
                                  if (isSelected) {
                                    // Don't allow unchecking the last user
                                    if (selectedUserIds.length > 1) {
                                      onChange(
                                        selectedUserIds.filter(
                                          (id) => id !== user.id
                                        )
                                      );
                                    }
                                  } else {
                                    onChange([...selectedUserIds, user.id]);
                                  }
                                }}>
                                <Avatar className="h-8 w-8">
                                  <UserAvatar
                                    user={user}
                                    dimmed={!isSelected}
                                  />
                                </Avatar>
                                <span className="hidden sm:inline truncate">
                                  {user.name}
                                </span>
                                <span className="sm:hidden inline">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </Button>
                            );
                          }}
                        />
                      );
                    })}
                  </div>
                  <FormDescription>
                    Select at least one person to assign this task to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              {errorMessages.length > 0 && (
                <div className="w-full text-left text-sm text-destructive space-y-1">
                  {errorMessages.map((message, index) => (
                    <p key={`error-${index}`}>{message}</p>
                  ))}
                </div>
              )}
              {isEditingId && (isTemplateTask || !isContinuingTask) && (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={handleDelete}
                  className="mr-auto">
                  {isSubmitting ? "..." : <Trash className="h-4 w-4" />}
                </Button>
              )}

              <FormField
                control={form.control}
                name="isFocused"
                render={({ field }) => {
                  return (
                    <Button
                      size="sm"
                      variant={field.value === 1 ? "default" : "outline"}
                      type="button"
                      onClick={() => field.onChange(field.value === 1 ? 0 : 1)}>
                      {field.value === 1 ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="monthId"
                render={({ field }) => {
                  return (
                    <Button
                      size="sm"
                      variant={field.value === null ? "default" : "outline"}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          field.value === null ? currentMonth : null
                        )
                      }>
                      <Layers className="w-4 h-4" />
                    </Button>
                  );
                }}
              />
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              {isEditingId ? (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Save"}
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Adding..."
                    : categoryId
                    ? "Add Task"
                    : "Add Template Task"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
