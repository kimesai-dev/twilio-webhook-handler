import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const from = req.body.From || "Unknown"
  const body = req.body.Body || ""

  console.log("📨 Incoming SMS:", { from, body })

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .select("id")
    .eq("phone", from)
    .single()

  let contactId = contact?.id

  if (!contactId) {
    const { data: newContact, error: createError } = await supabase
      .from("contacts")
      .insert([{ name: `Contact ${from}`, phone: from, status: "Lead", tags: ["Inbound"] }])
      .select()
      .single()

    if (createError) {
      console.error("❌ Failed to create contact:", createError)
      return res.status(500).json({ error: "Failed to create contact" })
    }

    contactId = newContact.id
  }

  const { error: messageError } = await supabase
    .from("messages")
    .insert([
      {
        contact_id: contactId,
        content: body,
        status: "Received",
        direction: "inbound",
        sent_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
      },
    ])

  if (messageError) {
    console.error("❌ Failed to insert message:", messageError)
    return res.status(500).json({ error: "Failed to save message" })
  }

  console.log("✅ Message saved for contact", contactId)
  return res.status(200).json({ success: true })
}
