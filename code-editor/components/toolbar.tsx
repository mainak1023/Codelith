"use client"
import { Button } from "@/components/ui/button"
import { Save, Settings, Download, Upload, Moon, Sun, Github } from "lucide-react"
import { useTheme } from "next-themes"
import type { File } from "@/lib/types"

interface ToolbarProps {
  onSettingsClick: () => void
  files: File[]
}

export function Toolbar({ onSettingsClick, files }: ToolbarProps) {
  const { theme, setTheme } = useTheme()

  const handleSave = () => {
    // Save functionality
    console.log("Saving project...")
  }

  const handleExport = () => {
    // Create a zip file with all project files
    const content = files.map((file) => ({
      name: file.name,
      content: file.content,
    }))

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "code-editor-project.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files[0]) {
        const file = target.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const result = e.target?.result as string
            const importedFiles = JSON.parse(result)
            console.log("Imported files:", importedFiles)
            // Handle imported files
          } catch (error) {
            console.error("Error parsing imported file:", error)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center">
        <h1 className="text-lg font-bold mr-4">Code Editor</h1>
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onSettingsClick}>
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="https://github.com/yourusername/code-editor" target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </a>
        </Button>
      </div>
    </div>
  )
}

