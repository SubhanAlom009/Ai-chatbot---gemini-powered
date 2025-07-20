import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function POST(req) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const formData = await req.formData();
    const message = formData.get("message");
    const historyString = formData.get("history");
    const pdfFile = formData.get("pdf");

    let history = [];
    if (historyString) {
      history = JSON.parse(historyString);
    }

    let enhancedMessage = message;

    // Process PDF if uploaded
    if (pdfFile) {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());

      // Create a temporary file-like object for PDFLoader
      const blob = new Blob([buffer], { type: "application/pdf" });

      try {
        const loader = new PDFLoader(blob);
        const docs = await loader.load();
        const pdfContent = docs.map((doc) => doc.pageContent).join("\n");

        enhancedMessage = `Based on this PDF content:\n\n${pdfContent}\n\nUser question: ${message}`;
      } catch (pdfError) {
        console.error("PDF processing error:", pdfError);
        enhancedMessage = `I received a PDF file (${pdfFile.name}) but couldn't process it. Please ask your question about the document and I'll help as best I can. Your question: ${message}`;
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      },
    });

    const result = await chat.sendMessageStream(enhancedMessage);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
          controller.close();
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          controller.error(streamError);
        }
      },
      cancel() {
        console.log("Stream cancelled by client");
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Detailed Gemini API Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
    });

    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    if (error.message?.includes("quota") || error.message?.includes("rate")) {
      return NextResponse.json(
        { error: "API rate limit exceeded" },
        { status: 429 }
      );
    }

    if (error.message?.includes("model")) {
      return NextResponse.json(
        { error: "Model not available" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "An error occurred while processing your request.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
