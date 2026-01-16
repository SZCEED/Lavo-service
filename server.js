import express from "express";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "tes123";

/**
 * VERIFY WEBHOOK
 */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("VERIFY REQUEST:", mode, token, challenge);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/**
 * RECEIVE MESSAGE
 */
app.post("/webhook", (req, res) => {
  console.log("INCOMING MESSAGE:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Webhook running on port", PORT);
});
