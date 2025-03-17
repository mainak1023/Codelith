import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { v4 as uuidv4 } from "uuid"

// File structure interface
interface File {
  id: string
  name: string
  content: string
  userId: string
  projectId: string
  createdAt: number
  updatedAt: number
}

// Get all files for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const userId = searchParams.get("userId")

    if (!projectId || !userId) {
      return NextResponse.json({ error: "Project ID and User ID are required" }, { status: 400 })
    }

    // Get files from KV store
    const fileKeys = await kv.smembers(`project:${projectId}:files`)

    if (!fileKeys || fileKeys.length === 0) {
      return NextResponse.json({ files: [] }, { status: 200 })
    }

    const filePromises = fileKeys.map(async (fileId) => {
      return await kv.get(`file:${fileId}`)
    })

    const files = await Promise.all(filePromises)

    return NextResponse.json({ files }, { status: 200 })
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}

// Create a new file
export async function POST(request: NextRequest) {
  try {
    const { name, content, userId, projectId } = await request.json()

    if (!name || !userId || !projectId) {
      return NextResponse.json({ error: "Name, User ID, and Project ID are required" }, { status: 400 })
    }

    const fileId = uuidv4()
    const now = Date.now()

    const file: File = {
      id: fileId,
      name,
      content: content || "",
      userId,
      projectId,
      createdAt: now,
      updatedAt: now,
    }

    // Store file in KV store
    await kv.set(`file:${fileId}`, file)
    await kv.sadd(`project:${projectId}:files`, fileId)

    return NextResponse.json({ file }, { status: 201 })
  } catch (error) {
    console.error("Error creating file:", error)
    return NextResponse.json({ error: "Failed to create file" }, { status: 500 })
  }
}

// Update a file
export async function PUT(request: NextRequest) {
  try {
    const { id, content, name } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    // Get existing file
    const existingFile: File = await kv.get(`file:${id}`)

    if (!existingFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Update file
    const updatedFile: File = {
      ...existingFile,
      content: content !== undefined ? content : existingFile.content,
      name: name !== undefined ? name : existingFile.name,
      updatedAt: Date.now(),
    }

    // Store updated file
    await kv.set(`file:${id}`, updatedFile)

    return NextResponse.json({ file: updatedFile }, { status: 200 })
  } catch (error) {
    console.error("Error updating file:", error)
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 })
  }
}

// Delete a file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    // Get existing file to get the project ID
    const existingFile: File = await kv.get(`file:${id}`)

    if (!existingFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Delete file
    await kv.del(`file:${id}`)
    await kv.srem(`project:${existingFile.projectId}:files`, id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}

