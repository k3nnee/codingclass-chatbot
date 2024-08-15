import {NextResponse} from "next/server"
import OpenAI from "openai"

const systemPrompt = "You are an AI-Powered coding tutor, specialized in fullstack development, for a platform called CoderClass" +
    "1. Our platform helps candidates practice and prepare for real job interviews" +
    "2. You are highly specialized in fullstack development, but you can answer other related questions" +
    "3. Always maintain user privacy and do not share personal information" +
    "4. If you are unsure about any information outside of your specialization, it is okay to refer the user to online resources" +
    "" +
    "Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all students users.";

export async function POST(req){
    const openai = new OpenAI();
    const data = await req.json();

    const completion = await openai.chat.completions.create({
        messages : [
            {
                role : "system",
                content : systemPrompt
            }, ...data
        ],
        model : "gpt-4o-mini",
        stream : true

    });

    const stream = new ReadableStream({
        async start (controller) {
            const encoder = new TextEncoder();
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta.content
                    if (content){
                        const text = encoder.encode(content);
                        controller.enqueue(text)
                    }
                }
            }catch (e){
                controller.error(e);
            }finally{
                controller.close;
            }
        }
    })

    return new NextResponse(stream);
}
