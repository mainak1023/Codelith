"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface File {
  id: string
  name: string
  content: string
  projectId?: string
  userId?: string
}

export function useFileSystem(projectId?: string) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load files from API or localStorage on initial render
  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true)
      try {
        if (session?.user?.id && projectId) {
          // Load from API if authenticated and project ID is provided
          const response = await fetch(`/api/files?projectId=${projectId}&userId=${session.user.id}`)

          if (!response.ok) {
            throw new Error("Failed to fetch files")
          }

          const data = await response.json()
          setFiles(data.files || [])

          if (data.files && data.files.length > 0) {
            setCurrentFile(data.files[0])
          }
        } else {
          // Load from localStorage if not authenticated or no project ID
          const savedFiles = localStorage.getItem("codelith-files")
          if (savedFiles) {
            const parsedFiles = JSON.parse(savedFiles)
            setFiles(parsedFiles)
            if (parsedFiles.length > 0) {
              setCurrentFile(parsedFiles[0])
            }
          }
        }
      } catch (err) {
        console.error("Error loading files:", err)
        setError("Failed to load files")
        toast({
          title: "Error",
          description: "Failed to load files",
          variant: "destructive",
        })

        // Fall back to localStorage
        const savedFiles = localStorage.getItem("codelith-files")
        if (savedFiles) {
          const parsedFiles = JSON.parse(savedFiles)
          setFiles(parsedFiles)
          if (parsedFiles.length > 0) {
            setCurrentFile(parsedFiles[0])
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadFiles()
  }, [session, projectId, toast])

  // Save files to localStorage whenever they change
  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem("codelith-files", JSON.stringify(files))
    }
  }, [files])

  const createFile = async (name: string, content = "") => {
    try {
      const newFile = {
        id: uuidv4(),
        name,
        content,
        projectId,
        userId: session?.user?.id,
      }

      if (session?.user?.id && projectId) {
        // Create file in API if authenticated and project ID is provided
        const response = await fetch("/api/files", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            content,
            userId: session.user.id,
            projectId,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create file")
        }

        const data = await response.json()
        setFiles((prevFiles) => [...prevFiles, data.file])
        setCurrentFile(data.file)
        return data.file
      } else {
        // Create file locally if not authenticated or no project ID
        setFiles((prevFiles) => [...prevFiles, newFile])
        setCurrentFile(newFile)
        return newFile
      }
    } catch (err) {
      console.error("Error creating file:", err)
      toast({
        title: "Error",
        description: "Failed to create file",
        variant: "destructive",
      })

      // Fall back to local creation
      const newFile = {
        id: uuidv4(),
        name,
        content,
      }
      setFiles((prevFiles) => [...prevFiles, newFile])
      setCurrentFile(newFile)
      return newFile
    }
  }

  const getFile = (id: string) => {
    return files.find((file) => file.id === id) || null
  }

  const updateFile = async (id: string, content: string) => {
    try {
      if (session?.user?.id && projectId) {
        // Update file in API if authenticated and project ID is provided
        const response = await fetch("/api/files", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            content,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update file")
        }

        const data = await response.json()
        setFiles((prevFiles) => prevFiles.map((file) => (file.id === id ? data.file : file)))

        if (currentFile && currentFile.id === id) {
          setCurrentFile(data.file)
        }
      } else {
        // Update file locally if not authenticated or no project ID
        setFiles((prevFiles) => prevFiles.map((file) => (file.id === id ? { ...file, content } : file)))

        if (currentFile && currentFile.id === id) {
          setCurrentFile((prev) => (prev ? { ...prev, content } : prev))
        }
      }
    } catch (err) {
      console.error("Error updating file:", err)
      toast({
        title: "Error",
        description: "Failed to update file",
        variant: "destructive",
      })

      // Fall back to local update
      setFiles((prevFiles) => prevFiles.map((file) => (file.id === id ? { ...file, content } : file)))

      if (currentFile && currentFile.id === id) {
        setCurrentFile((prev) => (prev ? { ...prev, content } : prev))
      }
    }
  }

  const renameFile = async (id: string, newName: string) => {
    try {
      if (session?.user?.id && projectId) {
        // Rename file in API if authenticated and project ID is provided
        const response = await fetch("/api/files", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            name: newName,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to rename file")
        }

        const data = await response.json()
        setFiles((prevFiles) => prevFiles.map((file) => (file.id === id ? data.file : file)))

        if (currentFile && currentFile.id === id) {
          setCurrentFile(data.file)
        }
      } else {
        // Rename file locally if not authenticated or no project ID
        setFiles((prevFiles) => prevFiles.map((file) => (file.id === id ? { ...file, name: newName } : file)))

        if (currentFile && currentFile.id === id) {
          setCurrentFile((prev) => (prev ? { ...prev, name: newName } : prev))
        }
      }
    } catch (err) {
      console.error("Error renaming file:", err)
      toast({
        title: "Error",
        description: "Failed to rename file",
        variant: "destructive",
      })

      // Fall back to local rename
      setFiles((prevFiles) => prevFiles.map((file) => (file.id === id ? { ...file, name: newName } : file)))

      if (currentFile && currentFile.id === id) {
        setCurrentFile((prev) => (prev ? { ...prev, name: newName } : prev))
      }
    }
  }

  const deleteFile = async (id: string) => {
    try {
      if (session?.user?.id && projectId) {
        // Delete file in API if authenticated and project ID is provided
        const response = await fetch(`/api/files?id=${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete file")
        }
      }

      // Update local state
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id))

      if (currentFile && currentFile.id === id) {
        const remainingFiles = files.filter((file) => file.id !== id)
        setCurrentFile(remainingFiles.length > 0 ? remainingFiles[0] : null)
      }
    } catch (err) {
      console.error("Error deleting file:", err)
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })

      // Fall back to local delete
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id))

      if (currentFile && currentFile.id === id) {
        const remainingFiles = files.filter((file) => file.id !== id)
        setCurrentFile(remainingFiles.length > 0 ? remainingFiles[0] : null)
      }
    }
  }

  const selectFile = (id: string) => {
    const file = getFile(id)
    if (file) {
      setCurrentFile(file)
    }
    return file
  }

  return {
    files,
    currentFile,
    loading,
    error,
    createFile,
    getFile,
    updateFile,
    renameFile,
    deleteFile,
    selectFile,
  }
}

