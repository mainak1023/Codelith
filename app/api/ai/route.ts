import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { code, language, action } = await request.json()

    if (!code || !language || !action) {
      return NextResponse.json({ error: "Code, language, and action are required" }, { status: 400 })
    }

    let prompt = ""
    let system = ""

    switch (action) {
      case "suggest":
        system = `You are an expert ${language} programmer. Provide code suggestions to complete the user's code. 
                 Return ONLY valid JSON in the format: 
                 [{"label": "suggestion name", "insertText": "code to insert", "documentation": "explanation"}]
                 Limit to 5 high-quality suggestions.`
        prompt = `Given this ${language} code, provide intelligent autocompletion suggestions:
                 \`\`\`${language}
                 ${code}
                 \`\`\``
        break

      case "fix":
        system = `You are an expert ${language} programmer. Fix errors in the user's code.
                 Return ONLY the fixed code without explanations.`
        prompt = `Fix any errors in this ${language} code:
                 \`\`\`${language}
                 ${code}
                 \`\`\``
        break

      case "explain":
        system = `You are an expert ${language} programmer. Explain the provided code in detail.`
        prompt = `Explain this ${language} code in detail:
                 \`\`\`${language}
                 ${code}
                 \`\`\``
        break

      case "optimize":
        system = `You are an expert ${language} programmer. Optimize the user's code for better performance and readability.
                 Return ONLY the optimized code without explanations.`
        prompt = `Optimize this ${language} code for better performance and readability:
                 \`\`\`${language}
                 ${code}
                 \`\`\``
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system,
      prompt,
    })

    // For suggestions, parse the JSON response
    if (action === "suggest") {
      try {
        const suggestions = JSON.parse(text)
        return NextResponse.json({ suggestions }, { status: 200 })
      } catch (error) {
        console.error("Error parsing AI suggestions:", error)
        return NextResponse.json({ error: "Failed to parse AI suggestions" }, { status: 500 })
      }
    }

    return NextResponse.json({ result: text }, { status: 200 })
  } catch (error) {
    console.error("AI processing error:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}

