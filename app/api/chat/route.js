import { NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
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

    const modelId = "mistral.mistral-large-2402-v1:0";
    const data = await req.json();
    console.log("data -->", data);

    // Create a new Bedrock Runtime client instance.
    const client = new BedrockRuntimeClient({ region: "ap-southeast-2" });
  
    // Prepare the payload for the model.
    const payload = {
      temperature:0.5,
      max_tokens: 500,
      messages: [{role: "system", content: systemPrompt},...data]
    };
  
    // Invoke Mistral with the payload and wait for the API to respond.
    const command = new InvokeModelCommand({
      contentType: "application/json",
      body: JSON.stringify(payload),
      modelId:modelId,
    });

    const apiResponse = await client.send(command);
    
    const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
    const responseBody = JSON.parse(decodedResponseBody);
    //console.log(responseBody.choices[0].message.content);

    
    return new NextResponse(responseBody.choices[0].message.content);
  };
  
  
