import express from "express";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "tes123";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = "861027807104753";

// ================= VERIFY WEBHOOK =================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ================= RECEIVE MESSAGE =================
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body || "";

    console.log("FROM:", from);
    console.log("TEXT:", text);

    let reply =
      "Halo 👋 Bengkel Lavo siap membantu.\n\n" +
      "Balas angka:\n" +
      "1️⃣ Servis kendaraan\n" +
      "2️⃣ Tanya harga\n" +
      "3️⃣ Jam operasional";

    if (text.trim() === "1") reply = "Silakan sebutkan jenis kendaraan Anda.";
    else if (text.trim() === "2") reply = "Mohon jelaskan servis yang dibutuhkan.";
    else if (text.trim() === "3") reply = "Kami buka setiap hari 08.00–17.00.";

    await fetch(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply },
        }),
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("ERROR:", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Webhook running on port", PORT);
});
app.post("/simulate", async (req, res) => {
  const from = req.body.from || "628123456789";
  const text = req.body.text || "";

  console.log("SIMULATE FROM:", from);
  console.log("SIMULATE TEXT:", text);

  let reply =
    "Halo 👋 Bengkel Lavo siap membantu.\n\n" +
    "Balas angka:\n" +
    "1️⃣ Servis kendaraan\n" +
    "2️⃣ Tanya harga\n" +
    "3️⃣ Jam operasional";

  if (text.trim() === "1") reply = "Silakan sebutkan jenis kendaraan Anda.";
  else if (text.trim() === "2") reply = "Mohon jelaskan servis yang dibutuhkan.";
  else if (text.trim() === "3") reply = "Kami buka setiap hari 08.00–17.00.";

  return res.json({
    from,
    user_message: text,
    bot_reply: reply,
  });
});

