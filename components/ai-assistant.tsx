"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Send, Loader2 } from "lucide-react"

export function AIAssistant() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setResponse("")

    try {
      // In a real implementation, this would call an AI API
      // For demo purposes, we'll simulate a response
      setTimeout(() => {
        setResponse(
          `Here's a suggestion for your code:\n\n\`\`\`javascript\n// Improved version\nfunction optimizedFunction() {\n  // Your AI-suggested code here\n  console.log("AI optimized code");\n}\n\`\`\``,
        )
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Error getting AI response:", error)
      setResponse("Sorry, there was an error processing your request.")
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
          AI Assistant
        </h3>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {response && <div className="mb-4 p-3 bg-muted rounded-lg whitespace-pre-wrap">{response}</div>}
      </div>

      <form onSubmit={handleSubmit} className="p-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask for code suggestions, optimizations, or help with bugs..."
            className="min-h-[80px] flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !prompt.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  )
}

