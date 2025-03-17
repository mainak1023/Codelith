"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface File {
  id: string
  name: string
  content: string
}

interface TabsProps {
  files: File[]
  activeTab: number
  setActiveTab: (index: number) => void
  onClose: (index: number) => void
}

export function Tabs({ files, activeTab, setActiveTab, onClose }: TabsProps) {
  if (files.length === 0) {
    return null
  }

  return (
    <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-muted/40">
      {files.map((file, index) => (
        <div
          key={file.id}
          className={`flex items-center px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer ${
            activeTab === index
              ? "bg-background text-foreground"
              : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
          }`}
          onClick={() => setActiveTab(index)}
        >
          <span className="truncate max-w-[150px]">{file.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-2 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              onClose(index)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}

