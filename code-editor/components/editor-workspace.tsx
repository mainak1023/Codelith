"use client"

import { useState } from "react"
import { FileExplorer } from "@/components/file-explorer"
import { EditorTabs } from "@/components/editor-tabs"
import { MonacoEditor } from "@/components/monaco-editor"
import { Preview } from "@/components/preview"
import { Terminal } from "@/components/terminal"
import { Toolbar } from "@/components/toolbar"
import { Settings } from "@/components/settings"
import { useTheme } from "next-themes"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { type File, FileType } from "@/lib/types"

export function EditorWorkspace() {
  const [files, setFiles] = useState<File[]>([
    {
      id: "1",
      name: "index.html",
      content:
        '<html>\n  <head>\n    <title>My Project</title>\n    <link rel="stylesheet" href="styles.css">\n  </head>\n  <body>\n    <h1>Hello, World!</h1>\n    <p>Welcome to my code editor project.</p>\n    <script src="script.js"></script>\n  </body>\n</html>',
      language: "html",
      type: FileType.HTML,
    },
    {
      id: "2",
      name: "styles.css",
      content:
        "body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f5f5f5;\n  color: #333;\n}\n\nh1 {\n  color: #0070f3;\n}",
      language: "css",
      type: FileType.CSS,
    },
    {
      id: "3",
      name: "script.js",
      content:
        "// JavaScript code\nconsole.log('Hello from the code editor!');\n\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('DOM fully loaded');\n});",
      language: "javascript",
      type: FileType.JavaScript,
    },
  ])

  const [activeFileId, setActiveFileId] = useState<string>("1")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "Welcome to the Code Editor Terminal",
    "Type 'help' to see available commands",
  ])
  const { theme } = useTheme()

  const [layout, setLayout] = useLocalStorage("editor-layout", {
    explorerWidth: 20,
    editorWidth: 50,
    previewWidth: 30,
    terminalHeight: 30,
  })

  const activeFile = files.find((file) => file.id === activeFileId) || files[0]

  const handleFileChange = (fileId: string, content: string) => {
    setFiles(files.map((file) => (file.id === fileId ? { ...file, content } : file)))
  }

  const handleFileCreate = (name: string, type: FileType) => {
    const language =
      type === FileType.HTML
        ? "html"
        : type === FileType.CSS
          ? "css"
          : type === FileType.JavaScript
            ? "javascript"
            : "plaintext"

    const newFile: File = {
      id: Date.now().toString(),
      name,
      content: "",
      language,
      type,
    }

    setFiles([...files, newFile])
    setActiveFileId(newFile.id)
  }

  const handleFileDelete = (fileId: string) => {
    setFiles(files.filter((file) => file.id !== fileId))
    if (activeFileId === fileId) {
      setActiveFileId(files[0]?.id || "")
    }
  }

  const handleFileRename = (fileId: string, newName: string) => {
    setFiles(files.map((file) => (file.id === fileId ? { ...file, name: newName } : file)))
  }

  const handleTerminalCommand = (command: string) => {
    setTerminalOutput([...terminalOutput, `> ${command}`])

    // Simple command handling
    if (command === "clear") {
      setTerminalOutput([])
    } else if (command === "help") {
      setTerminalOutput([
        ...terminalOutput,
        `> ${command}`,
        "Available commands:",
        "  clear - Clear the terminal",
        "  help - Show this help message",
        "  ls - List files",
        "  echo [text] - Print text to terminal",
      ])
    } else if (command === "ls") {
      setTerminalOutput([...terminalOutput, `> ${command}`, ...files.map((file) => file.name)])
    } else if (command.startsWith("echo ")) {
      setTerminalOutput([...terminalOutput, `> ${command}`, command.substring(5)])
    } else {
      setTerminalOutput([...terminalOutput, `> ${command}`, `Command not found: ${command}`])
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Toolbar onSettingsClick={() => setIsSettingsOpen(true)} files={files} />

      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        <ResizablePanel
          defaultSize={layout.explorerWidth}
          minSize={15}
          onResize={(size) => setLayout({ ...layout, explorerWidth: size })}
          className="bg-background border-r"
        >
          <FileExplorer
            files={files}
            activeFileId={activeFileId}
            onFileSelect={setActiveFileId}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
          />
        </ResizablePanel>

        <ResizablePanel
          defaultSize={layout.editorWidth}
          minSize={30}
          onResize={(size) => setLayout({ ...layout, editorWidth: size })}
        >
          <div className="flex flex-col h-full">
            <EditorTabs
              files={files}
              activeFileId={activeFileId}
              onTabChange={setActiveFileId}
              onTabClose={handleFileDelete}
            />

            <div className="flex-grow">
              <MonacoEditor
                file={activeFile}
                onChange={(content) => handleFileChange(activeFileId, content)}
                theme={theme === "dark" ? "vs-dark" : "vs-light"}
              />
            </div>

            <ResizablePanel
              defaultSize={layout.terminalHeight}
              minSize={10}
              maxSize={50}
              onResize={(size) => setLayout({ ...layout, terminalHeight: size })}
              className="border-t"
            >
              <Terminal output={terminalOutput} onCommand={handleTerminalCommand} />
            </ResizablePanel>
          </div>
        </ResizablePanel>

        <ResizablePanel
          defaultSize={layout.previewWidth}
          minSize={20}
          onResize={(size) => setLayout({ ...layout, previewWidth: size })}
          className="border-l"
        >
          <Preview files={files} />
        </ResizablePanel>
      </ResizablePanelGroup>

      {isSettingsOpen && <Settings onClose={() => setIsSettingsOpen(false)} />}
    </div>
  )
}

