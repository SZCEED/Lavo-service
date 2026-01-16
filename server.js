import express from "express";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "tes123";

// ================= VERIFY WEBHOOK =================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ================= RULE ENGINE =================
function generateReply(message) {
  const text = message.toLowerCase();

  if (text.includes("harga")) {
    return "Harga servis tergantung jenis kendaraan. Silakan sebutkan tipe kendaraan Anda.";
  }

  if (text.includes("alamat")) {
    return "Bengkel kami berlokasi di Waru, Sidoarjo.";
  }

  if (text.includes("jam")) {
    return "Jam operasional kami: Senin–Sabtu, pukul 08.00–17.00.";
  }

  if (text.includes("booking")) {
    return "Untuk booking servis, silakan sebutkan nama dan jenis kendaraan Anda.";
  }

  return "Terima kasih telah menghubungi kami. Pesan Anda akan segera kami proses.";
}

// ================= RECEIVE WEBHOOK =================
app.post("/webhook", async (req, res) => {
  console.log("INCOMING MESSAGE:", JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message || !message.text) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text.body;
    const reply = generateReply(text);

    // ================= SEND MESSAGE (AKTIFKAN NANTI) =================
    /*
    await fetch(`https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply },
      }),
    });
    */

    console.log("AUTO REPLY:", reply);
    res.sendStatus(200);
  } catch (error) {
    console.error("ERROR:", error);
    res.sendStatus(500);
  }
});

// ================= SIMULATION =================
app.post("/simulate", (req, res) => {
  const { message } = req.body;
  const reply = generateReply(message);
  res.json({ reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
