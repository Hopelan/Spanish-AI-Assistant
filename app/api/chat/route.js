import { NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
//import { ReadableStream } from "openai/_shims";
// Import NextResponse from Next.js for handling responses
//import OpenAI from "openai";

const systemPrompt =
  "You are a chatbot designed to assist computer science students studying for data structures and algorithms exams. You handle both text in any human language and code,in any programming language.\
  Your capabilities include:\
  Clarify data structures and algorithms concepts.\
  Analyze, debug, and explain code snippets\
  Address theory and practical problem-solving inquiries.\
  Offer and explain example problems and solutions.\
  Understand and respond to inputs in various languages.\
  Engage with students to solve problems and explain concepts.\
  Your responses should be concise and complete within 50 words\
  Usage: Provide accurate, contextually relevant responses and explanations for both text and code inputs.\
  You only answer question srelated to data structures and algorithms, if a user asks other questions, for example about biology without any relation to data astructures and algorithms\
  you must politely decline to answer.";

  export async function POST(req) {

    const modelId = "anthropic.claude-3-haiku-20240307-v1:0";
    const data = await req.json();
    console.log("data -->", data);

    // Create a new Bedrock Runtime client instance.
    const client = new BedrockRuntimeClient({ region: "ap-southeast-2" });
  
    // Prepare the payload for the model.
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 100,
      system:systemPrompt,
      messages: [{"role": "user", "content": "Hello there."},...data]
    };
  
    // Invoke Claude with the payload and wait for the API to respond.
    const command = new InvokeModelWithResponseStreamCommand({
      contentType: "application/json",
      body: JSON.stringify(payload),
      modelId:modelId,
    });
    const apiResponse = await client.send(command);
  
    let completeMessage = "";
  
    // Decode and process the response stream
    for await (const item of apiResponse.body) {
      /*  @type Chunk */
      const chunk = JSON.parse(new TextDecoder().decode(item.chunk.bytes));
      const chunk_type = chunk.type;
  
      if (chunk_type === "content_block_delta") {
        const text = chunk.delta.text;
        completeMessage = completeMessage + text;
        //process.stdout.write(text);
      }
    }
  
    // Return the final response
    return new NextResponse(completeMessage);
  };
  

  

  /*
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data], // Include the system prompt and user messages
    model: "gpt-4o", // Specify the model to use
    stream: true, // Enable streaming responses
  });
  

  console.log("completion -->", completion);
  *

    // Send the command to the model and wait for the response
  const response = await client.send(command);
  
    // Extract and print the streamed response text in real-time.


  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const item of response.stream) {
          const content = item.contentBlockDelta;

          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
        /*
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
          */
         /*
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream);
}
  */
