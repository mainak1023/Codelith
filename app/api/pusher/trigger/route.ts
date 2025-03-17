import { type NextRequest, NextResponse } from "next/server"
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
    const { channel, event, data } = await request.json()

    if (!channel || !event || !data) {
      return NextResponse.json({ error: "Channel, event, and data are required" }, { status: 400 })
    }

    // Trigger event on Pusher channel
    await pusher.trigger(channel, event, data)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error triggering Pusher event:", error)
    return NextResponse.json({ error: "Failed to trigger Pusher event" }, { status: 500 })
  }
}

