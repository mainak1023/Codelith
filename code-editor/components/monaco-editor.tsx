"use client"

import { useEffect, useRef } from "react"
import type { File } from "@/lib/types"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"

// Monaco editor types
declare global {
  interface Window {
    monaco: any
    MonacoEnvironment: any
  }
}

interface MonacoEditorProps {
  file: File
  onChange: (content: string) => void
  theme?: string
}

export function MonacoEditor({ file, onChange, theme = "vs-dark" }: MonacoEditorProps) {
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<any>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Define Monaco loader script
      const loadMonaco = async () => {
        if (!window.monaco) {
          // Set up Monaco environment
          window.MonacoEnvironment = {
            getWorkerUrl: (_moduleId: string, label: string) => {
              if (label === "json") {
                return "/monaco-editor-workers/json.worker.js"
              }
              if (label === "css" || label === "scss" || label === "less") {
                return "/monaco-editor-workers/css.worker.js"
              }
              if (label === "html" || label === "handlebars" || label === "razor") {
                return "/monaco-editor-workers/html.worker.js"
              }
              if (label === "typescript" || label === "javascript") {
                return "/monaco-editor-workers/ts.worker.js"
              }
              return "/monaco-editor-workers/editor.worker.js"
            },
          }

          // Dynamically import Monaco Editor
          const monaco = await import("monaco-editor")
          monacoRef.current = monaco

          // Initialize editor if container exists
          if (containerRef.current && !editorRef.current) {
            initializeEditor(monaco, file)
          }
        } else if (containerRef.current && !editorRef.current) {
          // Monaco is already loaded, just initialize the editor
          initializeEditor(window.monaco, file)
        }
      }

      loadMonaco()
    }

    return () => {
      // Dispose editor when component unmounts
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = null
      }
    }
  }, [])

  // Update editor content when file changes
  useEffect(() => {
    if (editorRef.current && file) {
      const model = editorRef.current.getModel()
      if (model && model.getValue() !== file.content) {
        editorRef.current.executeEdits("", [
          {
            range: model.getFullModelRange(),
            text: file.content,
          },
        ])
      }

      // Update language if needed
      const currentLanguage = model.getLanguageId()
      if (currentLanguage !== file.language) {
        monacoRef.current?.editor.setModelLanguage(model, file.language)
      }
    }
  }, [file])

  // Update theme when it changes
  useEffect(() => {
    if (editorRef.current) {
      const newTheme = resolvedTheme === "dark" ? "vs-dark" : "vs-light"
      monacoRef.current?.editor.setTheme(newTheme)
    }
  }, [resolvedTheme])

  const initializeEditor = (monaco: any, file: File) => {
    if (!containerRef.current) return

    // Create editor
    editorRef.current = monaco.editor.create(containerRef.current, {
      value: file.content,
      language: file.language,
      theme: resolvedTheme === "dark" ? "vs-dark" : "vs-light",
      automaticLayout: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: "on",
      renderLineHighlight: "all",
      roundedSelection: true,
      selectOnLineNumbers: true,
      wordWrap: "on",
    })

    // Set up change event handler
    editorRef.current.onDidChangeModelContent(() => {
      const value = editorRef.current.getValue()
      onChange(value)
    })

    // Set up keyboard shortcuts
    editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save functionality
      console.log("Save triggered")
    })
  }

  return (
    <div className="h-full w-full relative">
      {!editorRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}

