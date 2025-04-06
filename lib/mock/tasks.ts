import {
	type EisenhowerMatrix,
	EisenhowerQuadrant,
	type Task,
	TaskStatus,
} from "../types/task";

/**
 * Datos mock para las tareas
 */
export const mockTasks: Task[] = [
	{
		id: "1",
		title: "Prepare presentation for the client",
		description:
			"Create a detailed presentation about the project for the meeting with the client",
		quadrant: EisenhowerQuadrant.Q1,
		status: TaskStatus.TODO,
		createdAt: new Date("2024-04-01T10:00:00"),
		updatedAt: new Date("2024-04-01T10:00:00"),
		dueDate: new Date("2024-04-05T18:00:00"),
		priority: 5,
		tags: ["work", "presentation", "client"],
	},
	{
		id: "2",
		title: "Plan summer vacation",
		description: "Research destinations and prices for summer vacation",
		quadrant: EisenhowerQuadrant.Q2,
		status: TaskStatus.TODO,
		createdAt: new Date("2024-04-02T09:30:00"),
		updatedAt: new Date("2024-04-02T09:30:00"),
		dueDate: new Date("2024-05-15T00:00:00"),
		priority: 3,
		tags: ["personal", "travel"],
	},
	{
		id: "3",
		title: "Respond to pending emails",
		description: "Review and respond to accumulated emails",
		quadrant: EisenhowerQuadrant.Q3,
		status: TaskStatus.IN_PROGRESS,
		createdAt: new Date("2024-04-03T08:00:00"),
		updatedAt: new Date("2024-04-03T14:30:00"),
		priority: 2,
		tags: ["work", "communication"],
	},
	{
		id: "4",
		title: "Reorganize phone applications",
		description: "Organize phone applications by categories",
		quadrant: EisenhowerQuadrant.Q4,
		status: TaskStatus.TODO,
		createdAt: new Date("2024-04-04T12:00:00"),
		updatedAt: new Date("2024-04-04T12:00:00"),
		priority: 1,
		tags: ["personal", "organization"],
	},
	{
		id: "5",
		title: "Review monthly report",
		description: "Review and approve the sales report for the previous month",
		quadrant: EisenhowerQuadrant.Q1,
		status: TaskStatus.COMPLETED,
		createdAt: new Date("2024-03-28T09:00:00"),
		updatedAt: new Date("2024-03-28T11:30:00"),
		completedAt: new Date("2024-03-28T11:30:00"),
		priority: 4,
		tags: ["work", "finances"],
	},
];

/**
 * Datos mock para la matriz de Eisenhower
 */
export const mockEisenhowerMatrix: EisenhowerMatrix = {
	quadrants: {
		[EisenhowerQuadrant.Q1]: {
			id: EisenhowerQuadrant.Q1,
			title: "Urgent and Important",
			description: "Do it now",
			tasks: mockTasks.filter(
				(task) => task.quadrant === EisenhowerQuadrant.Q1,
			),
		},
		[EisenhowerQuadrant.Q2]: {
			id: EisenhowerQuadrant.Q2,
			title: "Important but not Urgent",
			description: "Schedule it",
			tasks: mockTasks.filter(
				(task) => task.quadrant === EisenhowerQuadrant.Q2,
			),
		},
		[EisenhowerQuadrant.Q3]: {
			id: EisenhowerQuadrant.Q3,
			title: "Urgent but not Important",
			description: "Delegate if possible",
			tasks: mockTasks.filter(
				(task) => task.quadrant === EisenhowerQuadrant.Q3,
			),
		},
		[EisenhowerQuadrant.Q4]: {
			id: EisenhowerQuadrant.Q4,
			title: "Neither Urgent nor Important",
			description: "Eliminate or postpone",
			tasks: mockTasks.filter(
				(task) => task.quadrant === EisenhowerQuadrant.Q4,
			),
		},
	},
};
