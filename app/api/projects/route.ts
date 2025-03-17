import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { v4 as uuidv4 } from "uuid"

// Project structure interface
interface Project {
  id: string
  name: string
  description: string
  userId: string
  isPublic: boolean
  createdAt: number
  updatedAt: number
}

// Get all projects for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get projects from KV store
    const projectKeys = await kv.smembers(`user:${userId}:projects`)

    if (!projectKeys || projectKeys.length === 0) {
      return NextResponse.json({ projects: [] }, { status: 200 })
    }

    const projectPromises = projectKeys.map(async (projectId) => {
      return await kv.get(`project:${projectId}`)
    })

    const projects = await Promise.all(projectPromises)

    return NextResponse.json({ projects }, { status: 200 })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

// Create a new project
export async function POST(request: NextRequest) {
  try {
    const { name, description, userId, isPublic } = await request.json()

    if (!name || !userId) {
      return NextResponse.json({ error: "Name and User ID are required" }, { status: 400 })
    }

    const projectId = uuidv4()
    const now = Date.now()

    const project: Project = {
      id: projectId,
      name,
      description: description || "",
      userId,
      isPublic: isPublic || false,
      createdAt: now,
      updatedAt: now,
    }

    // Store project in KV store
    await kv.set(`project:${projectId}`, project)
    await kv.sadd(`user:${userId}:projects`, projectId)

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}

// Update a project
export async function PUT(request: NextRequest) {
  try {
    const { id, name, description, isPublic } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Get existing project
    const existingProject: Project = await kv.get(`project:${id}`)

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Update project
    const updatedProject: Project = {
      ...existingProject,
      name: name !== undefined ? name : existingProject.name,
      description: description !== undefined ? description : existingProject.description,
      isPublic: isPublic !== undefined ? isPublic : existingProject.isPublic,
      updatedAt: Date.now(),
    }

    // Store updated project
    await kv.set(`project:${id}`, updatedProject)

    return NextResponse.json({ project: updatedProject }, { status: 200 })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

// Delete a project
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Get existing project to get the user ID
    const existingProject: Project = await kv.get(`project:${id}`)

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get all files for this project
    const fileKeys = await kv.smembers(`project:${id}:files`)

    // Delete all files
    if (fileKeys && fileKeys.length > 0) {
      const deleteFilePromises = fileKeys.map(async (fileId) => {
        await kv.del(`file:${fileId}`)
      })

      await Promise.all(deleteFilePromises)
    }

    // Delete project and references
    await kv.del(`project:${id}`)
    await kv.del(`project:${id}:files`)
    await kv.srem(`user:${existingProject.userId}:projects`, id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}

