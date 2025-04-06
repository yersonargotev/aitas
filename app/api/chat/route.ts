import type { TaskPriority } from "@/lib/stores/types";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

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
    Return only the task IDs and their classifications in JSON format.
    
    Tasks:
    ${tasks.map((task) => `- ${task.id}: ${task.title}${task.description ? `: ${task.description}` : ""}`).join("\n")}`;

		console.log("Sending prompt to AI:", prompt);

		// Call the AI model
		const { text } = await generateText({
			model: openai("gpt-4o"),
			system:
				"You are a task classification expert. Analyze tasks and classify them into the Eisenhower Matrix quadrants based on their urgency and importance. Return only valid JSON with task IDs as keys and their classifications (urgent, important, delegate, eliminate) as values. Do not include any markdown formatting or code blocks.",
			prompt: prompt,
			providerOptions: {
				openai: {
					response_format: { type: "json_object" },
				},
			},
		});

		if (!text) {
			console.error("No content received from OpenAI");
			throw new Error("No content received from OpenAI");
		}

		console.log("Received AI response:", text);

		// Clean up the response to remove any markdown formatting
		let cleanText = text;
		if (text.includes("```json")) {
			// Extract JSON from markdown code block
			const match = text.match(/```json\s*([\s\S]*?)\s*```/);
			if (match?.[1]) {
				cleanText = match[1].trim();
			}
		} else if (text.includes("```")) {
			// Extract JSON from generic code block
			const match = text.match(/```\s*([\s\S]*?)\s*```/);
			if (match?.[1]) {
				cleanText = match[1].trim();
			}
		}

		console.log("Cleaned response text:", cleanText);

		// Parse the AI response
		let classifications: Record<string, string>;
		try {
			classifications = JSON.parse(cleanText);
		} catch (error) {
			console.error("Error parsing AI response:", error);
			return NextResponse.json(
				{ error: "Invalid JSON response from AI" },
				{ status: 500 },
			);
		}

		// Validate the response format
		const validClassifications: Record<string, TaskPriority> = {};

		for (const [taskId, priority] of Object.entries(classifications)) {
			if (
				typeof priority === "string" &&
				["urgent", "important", "delegate", "eliminate"].includes(priority)
			) {
				validClassifications[taskId] = priority as TaskPriority;
			}
		}

		console.log("Valid classifications:", validClassifications);

		// Return the valid classifications
		return NextResponse.json(validClassifications);
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
