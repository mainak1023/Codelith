"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { File, FolderPlus, FilePlus, Trash, Edit, ChevronRight, ChevronDown, FolderIcon, Loader2 } from "lucide-react"

interface FileExplorerProps {
  files: any[]
  currentFile: any
  onFileSelect: (fileId: string) => void
  onCreateFile: (name: string, content: string) => void
  onDeleteFile: (id: string) => void
  onRenameFile: (id: string, newName: string) => void
  loading?: boolean
}

export function FileExplorer({
  files,
  currentFile,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  loading = false,
}: FileExplorerProps) {
  const [newFileName, setNewFileName] = useState("")
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [isRenamingFile, setIsRenamingFile] = useState(false)
  const [fileToRename, setFileToRename] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
  })

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName, "")
      setNewFileName("")
      setIsCreatingFile(false)
    }
  }

  const handleRenameFile = () => {
    if (newFileName.trim() && fileToRename) {
      onRenameFile(fileToRename.id, newFileName)
      setNewFileName("")
      setIsRenamingFile(false)
      setFileToRename(null)
    }
  }

  const startRenameFile = (file) => {
    setFileToRename(file)
    setNewFileName(file.name)
    setIsRenamingFile(true)
  }

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  // Group files by folder structure
  const fileStructure = {
    id: "root",
    name: "Project",
    type: "folder",
    children: [],
  }

  // Populate file structure
  files.forEach((file) => {
    const pathParts = file.name.split("/")
    let currentLevel = fileStructure

    if (pathParts.length === 1) {
      // File is at root level
      currentLevel.children.push({
        ...file,
        type: "file",
      })
    } else {
      // File is in a subfolder
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i]
        let folder = currentLevel.children.find((item) => item.type === "folder" && item.name === folderName)

        if (!folder) {
          folder = {
            id: `folder-${folderName}-${i}`,
            name: folderName,
            type: "folder",
            children: [],
          }
          currentLevel.children.push(folder)
        }

        currentLevel = folder
      }

      // Add the file to the current folder
      currentLevel.children.push({
        ...file,
        name: pathParts[pathParts.length - 1],
        type: "file",
      })
    }
  })

  const renderFileTree = (item, level = 0) => {
    const isFolder = item.type === "folder"
    const isExpanded = expandedFolders[item.id]
    const isActive = currentFile && item.id === currentFile.id

    return (
      <div key={item.id} style={{ marginLeft: level * 12 }}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`flex items-center py-1 px-2 rounded-md cursor-pointer ${
                isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
              onClick={() => {
                if (isFolder) {
                  toggleFolder(item.id)
                } else {
                  onFileSelect(item.id)
                }
              }}
            >
              {isFolder && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 mr-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFolder(item.id)
                  }}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              )}
              {isFolder ? (
                <FolderIcon className="h-4 w-4 mr-2 text-blue-500" />
              ) : (
                <File className="h-4 w-4 mr-2 text-gray-500" />
              )}
              <span className="truncate">{item.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {!isFolder && (
              <>
                <ContextMenuItem onClick={() => startRenameFile(item)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onDeleteFile(item.id)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </ContextMenuItem>
              </>
            )}
            {isFolder && (
              <ContextMenuItem onClick={() => setIsCreatingFile(true)}>
                <FilePlus className="h-4 w-4 mr-2" />
                New File
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>

        {isFolder && isExpanded && item.children && (
          <div>{item.children.map((child) => renderFileTree(child, level + 1))}</div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium">Explorer</h3>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCreatingFile(true)}>
            <FilePlus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No files yet</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsCreatingFile(true)}>
              <FilePlus className="h-4 w-4 mr-2" />
              Create File
            </Button>
          </div>
        ) : (
          renderFileTree(fileStructure)
        )}
      </div>

      <Dialog open={isCreatingFile} onOpenChange={setIsCreatingFile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="filename.js"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingFile(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenamingFile} onOpenChange={setIsRenamingFile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="filename.js"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenamingFile(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameFile}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

