"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ActionButton } from "./action-button"

// Define the task schema with zod
const taskFormSchema = z.object({
    title: z.string().min(1, "El título es obligatorio"),
    description: z.string().optional(),
    priority: z.enum(["urgent", "important", "delegate", "eliminate", "unclassified"], {
        required_error: "Por favor selecciona una prioridad",
    }),
})

// Infer the type from the schema
type TaskFormValues = z.infer<typeof taskFormSchema>

// Define the props for the TaskForm component
interface TaskFormProps {
    onSubmit: (task: {
        id: string
        title: string
        description?: string
        priority: "urgent" | "important" | "delegate" | "eliminate" | "unclassified"
    }) => void
    trigger?: React.ReactNode
}

export function TaskForm({ onSubmit, trigger }: TaskFormProps) {
    const [open, setOpen] = useState(false)

    // Initialize the form with react-hook-form
    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "unclassified",
        },
    })

    // Handle form submission
    const handleSubmit = (values: TaskFormValues) => {
        // Generate a unique ID for the task using crypto.randomUUID()
        const taskId = crypto.randomUUID()

        // Call the onSubmit prop with the new task
        onSubmit({
            id: taskId,
            ...values,
        })

        // Reset the form and close the dialog
        form.reset()
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <ActionButton>+ New Task</ActionButton>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nueva Tarea</DialogTitle>
                    <DialogDescription>
                        Crea una nueva tarea y clasifícala según su importancia y urgencia.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Título de la tarea" {...field} />
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
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción de la tarea (opcional)"
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
                            name="priority"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Clasificación</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="urgent" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-red-600 dark:text-red-400">
                                                    Urgente e Importante
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="important" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-blue-600 dark:text-blue-400">
                                                    Importante, no urgente
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="delegate" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-yellow-600 dark:text-yellow-400">
                                                    Urgente, no importante
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="eliminate" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-gray-600 dark:text-gray-400">
                                                    Ni urgente ni importante
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="unclassified" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Sin clasificar
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormDescription>
                                        Clasifica la tarea según su importancia y urgencia
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">Guardar Tarea</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 