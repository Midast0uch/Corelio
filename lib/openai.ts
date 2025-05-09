import { type NextApiResponse } from "next";

// OpenAI API configuration
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

// Function to generate workout and meal plan
export async function generateWorkoutPlan(prompt: string) {
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key is not set.");
    throw new Error("OpenAI API key is not configured.");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Or the model you are using
        messages: [
          {
            role: "system",
            content:
              "You are a professional fitness trainer and nutritionist. Generate a workout plan and a meal plan in JSON format.",
          },
          {
            role: "user",
            content: prompt, // The user's input will be the prompt
          },
        ],
        max_tokens: 1000, // Adjust as needed
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error.message}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    // Parse the response to extract the workout plan
    const content = data.choices[0].message.content;

    console.log("OpenAI Response Content:", content); // Keep this for now

    try {
      // Try to parse if it's directly JSON
      return JSON.parse(content); // This is where the error occurs
    } catch (e) {
      // If not direct JSON, try to extract JSON from the text
      const jsonMatch = content.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || content.match(/{[\s\S]*}/);

      if (jsonMatch) {
        console.log("Extracted JSON Match:", jsonMatch[1] || jsonMatch[0]); // Keep this for now
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error("Could not parse workout plan from response");
      }
    }
  } catch (error: any) {
    console.error("Error generating workout plan:", error);
    return null;
  }
}
// ... other code ...

export async function generateMealPlan(prompt: string) {
  // Your meal plan generation logic here
  // ...
}

// ... other code ...
