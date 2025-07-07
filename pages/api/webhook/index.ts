import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const from = req.body.From || "Unknown"
  const body = req.body.Body || ""

  console.log("📨 Incoming SMS:", { from, body })

  return res.status(200).json({ success: true })
}
