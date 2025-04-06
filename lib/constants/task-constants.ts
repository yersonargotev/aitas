import { EisenhowerQuadrant } from "../types/task";

/**
 * Constantes para los cuadrantes de la matriz de Eisenhower
 */
export const QUADRANT_INFO = {
	[EisenhowerQuadrant.Q1]: {
		title: "Urgent and Important",
		description: "Do it now",
		color: "bg-red-100 dark:bg-red-900/20",
		borderColor: "border-red-300 dark:border-red-800",
		textColor: "text-red-800 dark:text-red-200",
		icon: "⚡", // Puedes reemplazar con un icono de tu biblioteca preferida
	},
	[EisenhowerQuadrant.Q2]: {
		title: "Important but not Urgent",
		description: "Schedule it",
		color: "bg-blue-100 dark:bg-blue-900/20",
		borderColor: "border-blue-300 dark:border-blue-800",
		textColor: "text-blue-800 dark:text-blue-200",
		icon: "📅",
	},
	[EisenhowerQuadrant.Q3]: {
		title: "Urgent but not Important",
		description: "Delegate if possible",
		color: "bg-yellow-100 dark:bg-yellow-900/20",
		borderColor: "border-yellow-300 dark:border-yellow-800",
		textColor: "text-yellow-800 dark:text-yellow-200",
		icon: "🔄",
	},
	[EisenhowerQuadrant.Q4]: {
		title: "Neither Urgent nor Important",
		description: "Eliminate or postpone",
		color: "bg-gray-100 dark:bg-gray-800/20",
		borderColor: "border-gray-300 dark:border-gray-700",
		textColor: "text-gray-800 dark:text-gray-200",
		icon: "🗑️",
	},
};

/**
 * Prioridades de tareas
 */
export const PRIORITY_LEVELS = [
	{ value: 1, label: "Muy Baja" },
	{ value: 2, label: "Baja" },
	{ value: 3, label: "Media" },
	{ value: 4, label: "Alta" },
	{ value: 5, label: "Muy Alta" },
];

/**
 * Etiquetas predefinidas para las tareas
 */
export const PREDEFINED_TAGS = [
	"trabajo",
	"personal",
	"salud",
	"finanzas",
	"familia",
	"estudio",
	"proyecto",
	"reunión",
	"viaje",
	"hogar",
];

/**
 * Configuración para la paginación de tareas
 */
export const TASKS_PER_PAGE = 10;

/**
 * Configuración para el almacenamiento local
 */
export const STORAGE_KEYS = {
	TASKS: "eisenhower-tasks",
	SETTINGS: "eisenhower-settings",
};
