"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileExplorer } from "@/components/file-explorer"
import { AIAssistant } from "@/components/ai-assistant"
import { Folder, Sparkles, Settings } from "lucide-react"

interface SidebarProps {
  files: any[]
  currentFile: any
  onFileSelect: (fileId: string) => void
  onCreateFile: (name: string, content: string) => void
  onDeleteFile: (id: string) => void
  onRenameFile: (id: string, newName: string) => void
}

export function Sidebar({ files, currentFile, onFileSelect, onCreateFile, onDeleteFile, onRenameFile }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("files")

  return (
    <div className="h-full flex flex-col bg-muted/20">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-2 mt-2">
          <TabsTrigger value="files">
            <Folder className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="flex-1 p-0">
          <FileExplorer
            files={files}
            currentFile={currentFile}
            onFileSelect={onFileSelect}
            onCreateFile={onCreateFile}
            onDeleteFile={onDeleteFile}
            onRenameFile={onRenameFile}
          />
        </TabsContent>

        <TabsContent value="ai" className="flex-1 p-0">
          <AIAssistant />
        </TabsContent>

        <TabsContent value="settings" className="flex-1 p-4">
          <h3 className="text-lg font-medium mb-4">Settings</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Editor Settings</h4>
              {/* Editor settings would go here */}
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Theme Settings</h4>
              {/* Theme settings would go here */}
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Keyboard Shortcuts</h4>
              {/* Keyboard shortcuts would go here */}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

