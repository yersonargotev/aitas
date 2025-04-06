import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

interface Task {
	id: string;
	title: string;
	description?: string;
	priority: "urgent" | "important" | "delegate" | "eliminate" | "unclassified";
	dueDate?: Date;
}

export async function POST(req: Request) {
	try {
		const { tasks } = await req.json();

		if (!Array.isArray(tasks)) {
			return NextResponse.json(
				{ error: "Tasks must be an array" },
				{ status: 400 },
			);
		}

		const prompt = `Classify the following tasks into the Eisenhower Matrix quadrants (urgent, important, delegate, eliminate). 
    Consider urgency based on time sensitivity and importance based on impact and alignment with goals.
    Return only the task IDs and their classifications in JSON format.
    
    Tasks:
    ${tasks.map((task) => `- ${task.title}${task.description ? `: ${task.description}` : ""}`).join("\n")}`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"You are a task classification expert. Analyze tasks and classify them into the Eisenhower Matrix quadrants based on their urgency and importance. Return only valid JSON with task IDs and their classifications.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			response_format: { type: "json_object" },
		});

		const content = completion.choices[0].message.content;
		if (!content) {
			throw new Error("No content received from OpenAI");
		}

		const classifications = JSON.parse(content);

		return NextResponse.json(classifications);
	} catch (error) {
		console.error("Error classifying tasks:", error);
		return NextResponse.json(
			{ error: "Failed to classify tasks" },
			{ status: 500 },
		);
	}
}
