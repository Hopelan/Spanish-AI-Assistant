import { NextResponse } from "next/server";

import OpenAI from "openai";
//import { ReadableStream } from "openai/_shims";
// Import NextResponse from Next.js for handling responses
//import OpenAI from "openai";

const systemPrompt =
`
In this chat, I will provide Chinese ↔ Spanish translations (Spain).

Your task is to produce NATURAL, NATIVE-LEVEL Spanish as spoken and written in Spain.

Rules:
- Prioritize how a native speaker from Spain would actually say it, NOT literal translation.
- Remove redundancy, awkward constructions, and translation artifacts.
- You are allowed (and encouraged) to rephrase freely to improve fluency, clarity, and natural flow,
  as long as the original meaning, intent, and tone are preserved.
- If the text appears to come from an audio message, smooth it into natural spoken Spanish.
- Match the register and tone of the original (casual, explanatory, promotional, etc.).

Output rules:
- If Chinese + Spanish are provided → return ONLY the improved Spanish (Spain).
- If only Chinese is provided → return a natural Spanish (Spain) translation.
- If only Spanish is provided → return a natural Chinese translation.
- Keep the same line structure/format as the original Chinese when applicable.
- Do NOT mix Chinese and Spanish in the output.
- Do NOT include explanations, notes, or commentary — only the final polished text.
`
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4.1', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}
  
