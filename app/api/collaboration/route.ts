import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { v4 as uuidv4 } from "uuid"
import { Pusher } from "pusher"

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "us2",
  useTLS: true,
})

// Create a new collaboration session
export async function POST(request: NextRequest) {
  try {
    const { projectId, userId, userName, userAvatar } = await request.json()

    if (!projectId || !userId || !userName) {
      return NextResponse.json({ error: "Project ID, User ID, and User Name are required" }, { status: 400 })
    }

    const sessionId = uuidv4()
    const now = Date.now()

    // Create session
    const session = {
      id: sessionId,
      projectId,
      createdAt: now,
      updatedAt: now,
      participants: [
        {
          userId,
          userName,
          userAvatar: userAvatar || null,
          joinedAt: now,
        },
      ],
    }

    // Store session in KV store
    await kv.set(`collab:session:${sessionId}`, session)
    await kv.set(`collab:project:${projectId}`, sessionId)

    // Generate auth token for Pusher
    const authToken = uuidv4()
    await kv.set(`collab:auth:${sessionId}:${userId}`, authToken, { ex: 86400 }) // Expires in 24 hours

    return NextResponse.json(
      {
        sessionId,
        authToken,
        channelName: `presence-collab-${sessionId}`,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating collaboration session:", error)
    return NextResponse.json({ error: "Failed to create collaboration session" }, { status: 500 })
  }
}

// Join an existing collaboration session
export async function PUT(request: NextRequest) {
  try {
    const { sessionId, userId, userName, userAvatar } = await request.json()

    if (!sessionId || !userId || !userName) {
      return NextResponse.json({ error: "Session ID, User ID, and User Name are required" }, { status: 400 })
    }

    // Get existing session
    const session = await kv.get(`collab:session:${sessionId}`)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const now = Date.now()

    // Check if user is already in the session
    const existingParticipant = session.participants.find((p) => p.userId === userId)

    if (!existingParticipant) {
      // Add user to session
      session.participants.push({
        userId,
        userName,
        userAvatar: userAvatar || null,
        joinedAt: now,
      })

      session.updatedAt = now

      // Update session in KV store
      await kv.set(`collab:session:${sessionId}`, session)

      // Notify other participants
      await pusher.trigger(`presence-collab-${sessionId}`, "user-joined", {
        userId,
        userName,
        userAvatar: userAvatar || null,
        joinedAt: now,
      })
    }

    // Generate auth token for Pusher
    const authToken = uuidv4()
    await kv.set(`collab:auth:${sessionId}:${userId}`, authToken, { ex: 86400 }) // Expires in 24 hours

    return NextResponse.json(
      {
        sessionId,
        authToken,
        channelName: `presence-collab-${sessionId}`,
        participants: session.participants,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error joining collaboration session:", error)
    return NextResponse.json({ error: "Failed to join collaboration session" }, { status: 500 })
  }
}

// Get session info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Get session from KV store
    const session = await kv.get(`collab:session:${sessionId}`)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ session }, { status: 200 })
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}

// Leave a collaboration session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const userId = searchParams.get("userId")

    if (!sessionId || !userId) {
      return NextResponse.json({ error: "Session ID and User ID are required" }, { status: 400 })
    }

    // Get existing session
    const session = await kv.get(`collab:session:${sessionId}`)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Remove user from session
    session.participants = session.participants.filter((p) => p.userId !== userId)
    session.updatedAt = Date.now()

    // Update session in KV store or delete if empty
    if (session.participants.length > 0) {
      await kv.set(`collab:session:${sessionId}`, session)

      // Notify other participants
      await pusher.trigger(`presence-collab-${sessionId}`, "user-left", {
        userId,
      })
    } else {
      // Delete empty session
      await kv.del(`collab:session:${sessionId}`)
      await kv.del(`collab:project:${session.projectId}`)
    }

    // Delete auth token
    await kv.del(`collab:auth:${sessionId}:${userId}`)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error leaving collaboration session:", error)
    return NextResponse.json({ error: "Failed to leave collaboration session" }, { status: 500 })
  }
}

