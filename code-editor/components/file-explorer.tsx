"use client"

import { useState } from "react"
import { type File, FileType } from "@/lib/types"
import {
  FileIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  FileTextIcon,
  FileCodeIcon,
  FileTypeIcon as FileCssIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface FileExplorerProps {
  files: File[]
  activeFileId: string
  onFileSelect: (fileId: string) => void
  onFileCreate: (name: string, type: FileType) => void
  onFileDelete: (fileId: string) => void
  onFileRename: (fileId: string, newName: string) => void
}

export function FileExplorer({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
}: FileExplorerProps) {
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileType, setNewFileType] = useState<FileType>(FileType.HTML)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingFileName, setEditingFileName] = useState("")

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onFileCreate(newFileName, newFileType)
      setNewFileName("")
      setIsCreatingFile(false)
    }
  }

  const handleRenameFile = () => {
    if (editingFileId && editingFileName.trim()) {
      onFileRename(editingFileId, editingFileName)
      setEditingFileId(null)
      setEditingFileName("")
    }
  }

  const getFileIcon = (file: File) => {
    switch (file.type) {
      case FileType.HTML:
        return <FileCodeIcon className="h-4 w-4 mr-2 text-orange-500" />
      case FileType.CSS:
        return <FileCssIcon className="h-4 w-4 mr-2 text-blue-500" />
      case FileType.JavaScript:
        return <FileIcon className="h-4 w-4 mr-2 text-yellow-500" />
      default:
        return <FileTextIcon className="h-4 w-4 mr-2 text-gray-500" />
    }
  }

  return (
    <div className="h-full p-2 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Files</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setNewFileType(FileType.HTML)
                setIsCreatingFile(true)
              }}
            >
              <FileCodeIcon className="h-4 w-4 mr-2 text-orange-500" />
              HTML File
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setNewFileType(FileType.CSS)
                setIsCreatingFile(true)
              }}
            >
              <FileCssIcon className="h-4 w-4 mr-2 text-blue-500" />
              CSS File
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setNewFileType(FileType.JavaScript)
                setIsCreatingFile(true)
              }}
            >
              <FileIcon className="h-4 w-4 mr-2 text-yellow-500" />
              JavaScript File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isCreatingFile && (
        <div className="mb-2 flex items-center">
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="File name"
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFile()
              if (e.key === "Escape") setIsCreatingFile(false)
            }}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-1" onClick={handleCreateFile}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-1">
        {files.map((file) => (
          <div key={file.id}>
            {editingFileId === file.id ? (
              <div className="flex items-center">
                <Input
                  value={editingFileName}
                  onChange={(e) => setEditingFileName(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameFile()
                    if (e.key === "Escape") {
                      setEditingFileId(null)
                      setEditingFileName("")
                    }
                  }}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-1" onClick={handleRenameFile}>
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  "flex items-center justify-between px-2 py-1 text-sm rounded-md cursor-pointer",
                  activeFileId === file.id ? "bg-primary/10 text-primary" : "hover:bg-muted",
                )}
                onClick={() => onFileSelect(file.id)}
              >
                <div className="flex items-center overflow-hidden">
                  {getFileIcon(file)}
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingFileId(file.id)
                      setEditingFileName(file.name)
                    }}
                  >
                    <EditIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileDelete(file.id)
                    }}
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

