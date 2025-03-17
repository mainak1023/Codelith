"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export function useAIAssistant() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Get code suggestions based on current code and context
  const getSuggestions = useCallback(async (code, language) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          action: "suggest",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI suggestions")
      }

      const data = await response.json()
      setIsLoading(false)
      return data.suggestions || []
    } catch (error) {
      console.error("Error getting AI suggestions:", error)
      setIsLoading(false)

      // Fallback to basic suggestions
      return [
        {
          label: "console.log()",
          insertText: 'console.log("${1:message}");',
          documentation: "Log a message to the console",
        },
        {
          label: "for loop",
          insertText: "for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${3}\n}",
          documentation: "Create a for loop",
        },
      ]
    }
  }, [])

  // Fix errors in code
  const fixErrors = useCallback(
    async (code, errors, language) => {
      setIsLoading(true)

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            language,
            action: "fix",
            errors,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to fix code with AI")
        }

        const data = await response.json()
        setIsLoading(false)
        return data.result || code
      } catch (error) {
        console.error("Error fixing code with AI:", error)
        toast({
          title: "AI Error",
          description: "Failed to fix code with AI",
          variant: "destructive",
        })
        setIsLoading(false)
        return code // Return original code if there's an error
      }
    },
    [toast],
  )

  // Get AI explanation for code
  const explainCode = useCallback(
    async (code, language) => {
      setIsLoading(true)

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            language,
            action: "explain",
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to get AI explanation")
        }

        const data = await response.json()
        setIsLoading(false)
        return data.result || "No explanation available."
      } catch (error) {
        console.error("Error getting AI explanation:", error)
        toast({
          title: "AI Error",
          description: "Failed to get code explanation",
          variant: "destructive",
        })
        setIsLoading(false)
        return "Failed to get explanation. Please try again."
      }
    },
    [toast],
  )

  // Optimize code with AI
  const optimizeCode = useCallback(
    async (code, language) => {
      setIsLoading(true)

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            language,
            action: "optimize",
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to optimize code with AI")
        }

        const data = await response.json()
        setIsLoading(false)
        return data.result || code
      } catch (error) {
        console.error("Error optimizing code with AI:", error)
        toast({
          title: "AI Error",
          description: "Failed to optimize code",
          variant: "destructive",
        })
        setIsLoading(false)
        return code // Return original code if there's an error
      }
    },
    [toast],
  )

  return {
    getSuggestions,
    fixErrors,
    explainCode,
    optimizeCode,
    isLoading,
  }
}

