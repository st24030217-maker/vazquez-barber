export default async function handler(req, res) {
  // Solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://vazquez-barber.vercel.app",
  );
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { title, body, icon } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Faltan título o mensaje" });
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Key " + process.env.ONESIGNAL_API_KEY,
      },
      body: JSON.stringify({
        app_id: "303245fa-0799-457f-b82b-4016fb8704d3",
        included_segments: ["Total Subscriptions"],
        headings: { en: title },
        contents: { en: body },
        chrome_web_icon: "https://vazquez-barber.vercel.app/logo.png",
        chrome_web_badge: "https://vazquez-barber.vercel.app/logo.png",
        url: "https://vazquez-barber.vercel.app",
      }),
    });

    const data = await response.json();

    if (data.id) {
      return res
        .status(200)
        .json({ success: true, recipients: data.recipients });
    } else {
      return res
        .status(400)
        .json({ error: data.errors?.[0] || "Error de OneSignal" });
    }
  } catch (e) {
    return res.status(500).json({ error: "Error interno: " + e.message });
  }
}
