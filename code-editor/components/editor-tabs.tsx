"use client"

import type { File } from "@/lib/types"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface EditorTabsProps {
  files: File[]
  activeFileId: string
  onTabChange: (fileId: string) => void
  onTabClose: (fileId: string) => void
}

export function EditorTabs({ files, activeFileId, onTabChange, onTabClose }: EditorTabsProps) {
  return (
    <ScrollArea className="w-full border-b">
      <div className="flex h-10">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              "flex items-center px-4 py-2 text-sm border-r border-b -mb-px cursor-pointer group",
              activeFileId === file.id ? "bg-background border-b-transparent" : "bg-muted/50 hover:bg-muted",
            )}
            onClick={() => onTabChange(file.id)}
          >
            <span className="truncate max-w-[120px]">{file.name}</span>
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(file.id)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

