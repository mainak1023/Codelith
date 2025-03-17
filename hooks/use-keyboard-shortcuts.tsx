"use client"

import { useCallback } from "react"

export function useKeyboardShortcuts(editorRef) {
  const handleKeyDown = useCallback((event, shortcuts) => {
    // Create a key string based on modifiers and key
    const keyString = [
      event.ctrlKey ? "ctrl" : "",
      event.shiftKey ? "shift" : "",
      event.altKey ? "alt" : "",
      event.key.toLowerCase(),
    ]
      .filter(Boolean)
      .join("+")

    // Check if this key combination is in our shortcuts
    if (shortcuts[keyString]) {
      event.preventDefault()
      shortcuts[keyString]()
      return true
    }

    return false
  }, [])

  const registerShortcuts = useCallback(
    (shortcuts) => {
      const handleGlobalKeyDown = (event) => {
        // Don't trigger shortcuts when typing in input fields
        if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.isContentEditable) {
          // Allow specific shortcuts even in input fields
          const allowedInInputs = ["ctrl+s", "ctrl+r", "ctrl+b", "ctrl+`", "ctrl+e"]
          const keyString = [
            event.ctrlKey ? "ctrl" : "",
            event.shiftKey ? "shift" : "",
            event.altKey ? "alt" : "",
            event.key.toLowerCase(),
          ]
            .filter(Boolean)
            .join("+")

          if (!allowedInInputs.includes(keyString)) {
            return
          }
        }

        handleKeyDown(event, shortcuts)
      }

      // Add the event listener
      window.addEventListener("keydown", handleGlobalKeyDown)

      // Return a cleanup function
      return () => {
        window.removeEventListener("keydown", handleGlobalKeyDown)
      }
    },
    [handleKeyDown],
  )

  return { registerShortcuts }
}

