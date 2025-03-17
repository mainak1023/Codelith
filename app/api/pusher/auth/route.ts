import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { Pusher } from "pusher"

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "us2",
  useTLS: true,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const socketId = formData.get("socket_id") as string
    const channel = formData.get("channel_name") as string
    const sessionId = channel.replace("presence-collab-", "")
    const userId = formData.get("user_id") as string
    const authToken = formData.get("auth_token") as string

    if (!socketId || !channel || !userId || !authToken) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify auth token
    const storedToken = await kv.get(`collab:auth:${sessionId}:${userId}`)

    if (!storedToken || storedToken !== authToken) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 403 })
    }

    // Get user data
    const userData = await kv.get(`user:${userId}`)

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate Pusher auth response
    const presenceData = {
      user_id: userId,
      user_info: {
        name: userData.name,
        avatar: userData.image,
      },
    }

    const authResponse = pusher.authorizeChannel(socketId, channel, presenceData)

    return NextResponse.json(authResponse, { status: 200 })
  } catch (error) {
    console.error("Error authenticating Pusher channel:", error)
    return NextResponse.json({ error: "Failed to authenticate Pusher channel" }, { status: 500 })
  }
}

