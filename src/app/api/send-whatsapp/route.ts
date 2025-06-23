import { NextResponse } from 'next/server'

const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!process.env.WHATSAPP_API_KEY) {
      throw new Error("WHATSAPP_API_KEY is not configured")
    }
    if (!process.env.WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error("WHATSAPP_PHONE_NUMBER_ID is not configured")
    }

    // Parse request body
    const body = await request.json()
    const { phone, message } = body

    if (!phone || !message) {
      return NextResponse.json(
        { error: "Phone number and message are required" },
        { status: 400 }
      )
    }

    // Format phone number (remove any non-numeric characters and ensure it starts with country code)
    let formattedPhone = phone.replace(/\D/g, "")
    if (!formattedPhone.startsWith("62")) {
      formattedPhone = formattedPhone.replace(/^0|^8/, "62")
    }

    // Prepare WhatsApp API request
    const whatsappData = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "text",
      text: {
        preview_url: false,
        body: message
      }
    }

    // Send message via WhatsApp API
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WHATSAPP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(whatsappData),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("WhatsApp API error:", responseData)
      throw new Error(responseData.error?.message || "Failed to send WhatsApp message")
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error("Error in WhatsApp API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
} 