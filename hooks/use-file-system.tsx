"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface File {
  id: string
  name: string
  content: string
  userId?: string
  createdAt?: number
  updatedAt?: number
}

export function useFileSystem() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load files from Firestore or localStorage on initial render
  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true)
      try {
        if (user) {
          // Load from Firestore if authenticated
          const filesRef = collection(db, "files")
          const q = query(filesRef, where("userId", "==", user.uid))

          // Set up real-time listener
          const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const loadedFiles = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as File[]

              setFiles(loadedFiles)

              if (loadedFiles.length > 0 && !currentFile) {
                setCurrentFile(loadedFiles[0])
              }

              setLoading(false)
            },
            (err) => {
              console.error("Error loading files:", err)
              setError("Failed to load files")
              setLoading(false)

              // Fall back to localStorage
              loadFromLocalStorage()
            },
          )

          return () => unsubscribe()
        } else {
          // Load from localStorage if not authenticated
          loadFromLocalStorage()
        }
      } catch (err) {
        console.error("Error loading files:", err)
        setError("Failed to load files")

        // Fall back to localStorage
        loadFromLocalStorage()
      }
    }

    const loadFromLocalStorage = () => {
      const savedFiles = localStorage.getItem("codelith-files")
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles)
        setFiles(parsedFiles)
        if (parsedFiles.length > 0 && !currentFile) {
          setCurrentFile(parsedFiles[0])
        }
      }
      setLoading(false)
    }

    loadFiles()
  }, [user])

  // Save files to localStorage whenever they change
  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem("codelith-files", JSON.stringify(files))
    }
  }, [files])

  const createFile = async (name: string, content = "") => {
    try {
      const now = Date.now()

      if (user) {
        // Create file in Firestore if authenticated
        const newFile = {
          name,
          content,
          userId: user.uid,
          createdAt: now,
          updatedAt: now,
        }

        const docRef = await addDoc(collection(db, "files"), newFile)

        const createdFile = {
          id: docRef.id,
          ...newFile,
        }

        // The onSnapshot listener will update the files state
        setCurrentFile(createdFile)
        return createdFile
      } else {
        // Create file locally if not authenticated
        const newFile = {
          id: uuidv4(),
          name,
          content,
          createdAt: now,
          updatedAt: now,
        }

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
      const now = Date.now()

      if (user) {
        // Update file in Firestore if authenticated
        await updateDoc(doc(db, "files", id), {
          content,
          updatedAt: now,
        })

        // The onSnapshot listener will update the files state
        if (currentFile && currentFile.id === id) {
          setCurrentFile((prev) => (prev ? { ...prev, content, updatedAt: now } : prev))
        }
      } else {
        // Update file locally if not authenticated
        setFiles((prevFiles) => prevFiles.map((file) => (file.id === id ? { ...file, content, updatedAt: now } : file)))

        if (currentFile && currentFile.id === id) {
          setCurrentFile((prev) => (prev ? { ...prev, content, updatedAt: now } : prev))
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
      setFiles((prevFiles) =>
        prevFiles.map((file) => (file.id === id ? { ...file, content, updatedAt: Date.now() } : file)),
      )

      if (currentFile && currentFile.id === id) {
        setCurrentFile((prev) => (prev ? { ...prev, content, updatedAt: Date.now() } : prev))
      }
    }
  }

  const renameFile = async (id: string, newName: string) => {
    try {
      const now = Date.now()

      if (user) {
        // Rename file in Firestore if authenticated
        await updateDoc(doc(db, "files", id), {
          name: newName,
          updatedAt: now,
        })

        // The onSnapshot listener will update the files state
        if (currentFile && currentFile.id === id) {
          setCurrentFile((prev) => (prev ? { ...prev, name: newName, updatedAt: now } : prev))
        }
      } else {
        // Rename file locally if not authenticated
        setFiles((prevFiles) =>
          prevFiles.map((file) => (file.id === id ? { ...file, name: newName, updatedAt: now } : file)),
        )

        if (currentFile && currentFile.id === id) {
          setCurrentFile((prev) => (prev ? { ...prev, name: newName, updatedAt: now } : prev))
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
      setFiles((prevFiles) =>
        prevFiles.map((file) => (file.id === id ? { ...file, name: newName, updatedAt: Date.now() } : file)),
      )

      if (currentFile && currentFile.id === id) {
        setCurrentFile((prev) => (prev ? { ...prev, name: newName, updatedAt: Date.now() } : prev))
      }
    }
  }

  const deleteFile = async (id: string) => {
    try {
      if (user) {
        // Delete file in Firestore if authenticated
        await deleteDoc(doc(db, "files", id))

        // The onSnapshot listener will update the files state
        if (currentFile && currentFile.id === id) {
          const remainingFiles = files.filter((file) => file.id !== id)
          setCurrentFile(remainingFiles.length > 0 ? remainingFiles[0] : null)
        }
      } else {
        // Delete file locally if not authenticated
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id))

        if (currentFile && currentFile.id === id) {
          const remainingFiles = files.filter((file) => file.id !== id)
          setCurrentFile(remainingFiles.length > 0 ? remainingFiles[0] : null)
        }
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

