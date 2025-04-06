import type { TaskPriority } from "@/lib/stores/types";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
	try {
		// Parse the request body
		const body = await req.json();
		console.log("Received request body:", body);

		// Extract tasks from the request body
		const { tasks } = body;

		if (!Array.isArray(tasks)) {
			console.error("Invalid request: tasks is not an array", tasks);
			return NextResponse.json(
				{ error: "Tasks must be an array" },
				{ status: 400 },
			);
		}

		if (tasks.length === 0) {
			console.error("Invalid request: tasks array is empty");
			return NextResponse.json(
				{ error: "Tasks array is empty" },
				{ status: 400 },
			);
		}

		// Format the prompt for the AI
		const prompt = `Classify the following tasks into the Eisenhower Matrix quadrants (urgent, important, delegate, eliminate). 
    Consider urgency based on time sensitivity and importance based on impact and alignment with goals.
    
    Tasks:
    ${tasks.map((task) => `- ${task.id}: ${task.title}${task.description ? `: ${task.description}` : ""}`).join("\n")}`;

		console.log("Sending prompt to AI:", prompt);

		// Call the AI model with generateObject
		const result = await generateObject({
			model: openai("gpt-4o"),
			system:
				"You are a task classification expert. Analyze tasks and classify them into the Eisenhower Matrix quadrants based on their urgency and importance. Return a JSON object with task IDs as keys and their classifications (urgent, important, delegate, eliminate) as values.",
			prompt: prompt,
			schema: z.object({
				classifications: z.array(
					z.object({
						taskId: z.string(),
						classification: z.enum([
							"urgent",
							"important",
							"delegate",
							"eliminate",
						]),
					}),
				),
			}),
		});

		if (!result.object || !result.object.classifications) {
			console.error("No content received from OpenAI");
			throw new Error("No content received from OpenAI");
		}

		console.log("Received AI response:", result.object.classifications);

		// Convert array of classifications to a map for easier processing
		const classificationsMap = result.object.classifications.reduce(
			(acc, item) => {
				acc[item.taskId] = item.classification;
				return acc;
			},
			{} as Record<string, TaskPriority>,
		);

		// Return the classifications
		return NextResponse.json(classificationsMap);
	} catch (error) {
		console.error("Error classifying tasks:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to classify tasks",
			},
			{ status: 500 },
		);
	}
}
