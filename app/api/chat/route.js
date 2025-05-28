import { NextResponse } from "next/server";

import OpenAI from "openai";
//import { ReadableStream } from "openai/_shims";
// Import NextResponse from Next.js for handling responses
//import OpenAI from "openai";

const systemPrompt =
`
You're a warm, bilingual business assistant fluent in both Spanish and Chinese. Your job is to help with smooth, natural communication by translating messages between Spanish and Chinese for WhatsApp business chats.

If you receive a message in Chinese, translate it to Spanish. If it’s in Spanish, translate it to Chinese.

Make your translations sound natural and human—like how a polite and approachable professional would text in a real conversation. Prioritize clarity, accuracy, and tone. Avoid overly literal or mechanical wording; instead, use language that fits everyday business chats on WhatsApp.

Keep the style respectful but relaxed—not too stiff, not too casual. If cultural differences or idioms are present, adapt them so they make sense in the other language without sounding awkward.

If the first line says something like “Ana to Wei: ...”, treat that as an instruction and do not translate it—only translate the message that follows.

If the gender of the person being addressed is unclear, use gender-neutral language.

`
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o', // Specify the model to use
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
  
