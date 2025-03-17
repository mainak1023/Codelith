"use client"

import { useState, useEffect, useRef } from "react"
import { Editor } from "@monaco-editor/react"
import { Resizable } from "re-resizable"
import { useTheme } from "next-themes"
import { Tabs } from "@/components/tabs"
import { Terminal } from "@/components/terminal"
import { Toolbar } from "@/components/toolbar"
import { StatusBar } from "@/components/status-bar"
import { FileExplorer } from "@/components/file-explorer"
import { useFileSystem } from "@/hooks/use-file-system"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useAIAssistant } from "@/hooks/use-ai-assistant"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function CodeEditor() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { theme } = useTheme()
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [showPreview, setShowPreview] = useState(true)
  const [showTerminal, setShowTerminal] = useState(true)
  const [showFileExplorer, setShowFileExplorer] = useState(true)
  const [fontSize, setFontSize] = useState(14)
  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 })
  const editorRef = useRef(null)

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
    }
  }, [user, authLoading, router])

  const {
    files,
    currentFile,
    loading: filesLoading,
    createFile,
    updateFile,
    deleteFile,
    renameFile,
    selectFile,
  } = useFileSystem()

  const { registerShortcuts } = useKeyboardShortcuts(editorRef)
  const { getSuggestions, fixErrors, explainCode, optimizeCode, isLoading: aiLoading } = useAIAssistant()

  // Initialize with a default file if none exists
  useEffect(() => {
    if (!filesLoading && files.length === 0) {
      createFile("index.js", "// Write your code here")
    }
  }, [files, createFile, filesLoading])

  // Set up keyboard shortcuts
  useEffect(() => {
    const cleanup = registerShortcuts({
      "ctrl+s": () => saveCurrentFile(),
      "ctrl+r": () => runCode(),
      "ctrl+b": () => togglePreview(),
      "ctrl+`": () => toggleTerminal(),
      "ctrl+e": () => toggleFileExplorer(),
      "ctrl+shift+p": () => showCommandPalette(),
    })

    return cleanup
  }, [registerShortcuts])

  // Update code when current file changes
  useEffect(() => {
    if (currentFile) {
      setCode(currentFile.content)
      setLanguage(getLanguageFromFilename(currentFile.name))
    }
  }, [currentFile])

  const getLanguageFromFilename = (filename) => {
    const extension = filename.split(".").pop()
    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      css: "css",
      json: "json",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      go: "go",
      rs: "rust",
      php: "php",
      rb: "ruby",
    }
    return languageMap[extension] || "plaintext"
  }

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor

    // Set up autocompletion
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: async (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        const suggestions = await getSuggestions(textUntilPosition, language)
        return {
          suggestions: suggestions.map((s) => ({
            label: s.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: s.insertText,
            documentation: s.documentation,
          })),
        }
      },
    })

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      })
    })
  }

  const handleEditorChange = (value) => {
    setCode(value)
    if (currentFile) {
      updateFile(currentFile.id, value)
    }
  }

  const runCode = async () => {
    if (!currentFile) return

    setIsRunning(true)
    setOutput("Running code...")

    try {
      // Call the backend API to execute the code
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error("Code execution failed")
      }

      const data = await response.json()
      setOutput(data.output || "Code executed successfully with no output.")
    } catch (error) {
      console.error("Error executing code:", error)
      setOutput(`Error: ${error.message}`)

      toast({
        title: "Execution Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const saveCurrentFile = () => {
    if (currentFile) {
      // File is already saved via the updateFile function
      toast({
        title: "File Saved",
        description: `${currentFile.name} has been saved`,
      })
    }
  }

  const togglePreview = () => setShowPreview(!showPreview)
  const toggleTerminal = () => setShowTerminal(!showTerminal)
  const toggleFileExplorer = () => setShowFileExplorer(!showFileExplorer)

  const showCommandPalette = () => {
    // Implement command palette functionality
    toast({
      title: "Command Palette",
      description: "Command palette is not yet implemented",
    })
  }

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize)
  }

  const handleAIAssist = async (action) => {
    if (!currentFile || !code) {
      toast({
        title: "No Code",
        description: "Please write some code first",
        variant: "destructive",
      })
      return
    }

    try {
      let result

      switch (action) {
        case "fix":
          result = await fixErrors(code, null, language)
          setCode(result)
          updateFile(currentFile.id, result)
          toast({
            title: "Code Fixed",
            description: "AI has attempted to fix your code",
          })
          break

        case "explain":
          result = await explainCode(code, language)
          setOutput(result)
          setShowTerminal(true)
          break

        case "optimize":
          result = await optimizeCode(code, language)
          setCode(result)
          updateFile(currentFile.id, result)
          toast({
            title: "Code Optimized",
            description: "AI has optimized your code",
          })
          break

        default:
          toast({
            title: "Invalid Action",
            description: "Unknown AI action requested",
            variant: "destructive",
          })
      }
    } catch (error) {
      console.error("AI assistance error:", error)
      toast({
        title: "AI Error",
        description: "Failed to process AI request",
        variant: "destructive",
      })
    }
  }

  const exportProject = () => {
    if (files.length === 0) {
      toast({
        title: "No Files",
        description: "There are no files to export",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a JSON representation of the project
      const projectData = {
        files: files.map((file) => ({
          name: file.name,
          content: file.content,
        })),
      }

      // Convert to a Blob
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" })

      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "codelith-project.json"
      document.body.appendChild(a)
      a.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)

      toast({
        title: "Project Exported",
        description: "Your project has been exported successfully",
      })
    } catch (error) {
      console.error("Error exporting project:", error)
      toast({
        title: "Export Error",
        description: "Failed to export project",
        variant: "destructive",
      })
    }
  }

  const importProject = (event) => {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".json"

    fileInput.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()

      reader.onload = async (event) => {
        try {
          const projectData = JSON.parse(event.target.result)

          if (!projectData.files || !Array.isArray(projectData.files)) {
            throw new Error("Invalid project format")
          }

          // Clear existing files
          files.forEach((file) => deleteFile(file.id))

          // Import new files
          for (const fileData of projectData.files) {
            await createFile(fileData.name, fileData.content)
          }

          toast({
            title: "Project Imported",
            description: `Imported ${projectData.files.length} files`,
          })
        } catch (error) {
          console.error("Error importing project:", error)
          toast({
            title: "Import Error",
            description: "Failed to import project: " + error.message,
            variant: "destructive",
          })
        }
      }

      reader.readAsText(file)
    }

    fileInput.click()
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <Toolbar
        language={language}
        setLanguage={setLanguage}
        runCode={runCode}
        isRunning={isRunning}
        togglePreview={togglePreview}
        showPreview={showPreview}
        toggleTerminal={toggleTerminal}
        showTerminal={showTerminal}
        toggleFileExplorer={toggleFileExplorer}
        showFileExplorer={showFileExplorer}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        onAIAssist={handleAIAssist}
        onExport={exportProject}
        onImport={importProject}
      />

      <div className="flex flex-1 overflow-hidden">
        {showFileExplorer && (
          <Resizable
            defaultSize={{ width: 250, height: "100%" }}
            minWidth={200}
            maxWidth={400}
            enable={{ right: true }}
            className="border-r border-gray-200 dark:border-gray-700"
          >
            <FileExplorer
              files={files}
              currentFile={currentFile}
              onFileSelect={(fileId) => selectFile(fileId)}
              onCreateFile={createFile}
              onDeleteFile={deleteFile}
              onRenameFile={renameFile}
              loading={filesLoading}
            />
          </Resizable>
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          <Tabs
            files={files}
            activeTab={activeTab}
            setActiveTab={(index) => {
              setActiveTab(index)
              selectFile(files[index].id)
            }}
            onClose={(index) => {
              if (files.length > 1) {
                deleteFile(files[index].id)
              } else {
                toast({
                  title: "Cannot Delete",
                  description: "You must have at least one file",
                  variant: "destructive",
                })
              }
            }}
          />

          <div className="flex flex-1 overflow-hidden">
            <Resizable
              defaultSize={{ width: "50%", height: "100%" }}
              minWidth={200}
              maxWidth="80%"
              enable={{ right: true }}
              className="border-r border-gray-200 dark:border-gray-700"
            >
              <Editor
                height="100%"
                language={language}
                value={code}
                theme={theme === "dark" ? "vs-dark" : "vs-light"}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: fontSize,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  tabSize: 2,
                  lineNumbers: "on",
                  glyphMargin: true,
                  folding: true,
                }}
                loading={<div className="flex items-center justify-center h-full">Loading editor...</div>}
              />
            </Resizable>

            {showPreview && (
              <div className="flex-1 overflow-hidden">
                {language === "html" || language === "javascript" || language === "css" ? (
                  <iframe
                    title="preview"
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <style>${language === "css" ? code : ""}</style>
                        </head>
                        <body>
                          ${language === "html" ? code : ""}
                          <script>${language === "javascript" ? code : ""}</script>
                        </body>
                      </html>
                    `}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Preview not available for {language}
                  </div>
                )}
              </div>
            )}
          </div>

          {showTerminal && (
            <Resizable
              defaultSize={{ width: "100%", height: 200 }}
              minHeight={100}
              maxHeight={500}
              enable={{ top: true }}
              className="border-t border-gray-200 dark:border-gray-700"
            >
              <Terminal output={output} />
            </Resizable>
          )}
        </div>
      </div>

      <StatusBar language={language} cursorPosition={cursorPosition} user={user} />
    </div>
  )
}

