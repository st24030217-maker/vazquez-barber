import webpush from "web-push";

const VAPID_PUBLIC =
  "BCeJufqGlHjQ6H8Zm0fZHhGznoJQ-5ZqktsufY6lBMbOUK-6AIT4mIMf6x7zxwBVOIlsYCSI7iOzHAw5Y09EjzQ";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  "mailto:admin@vazquez-barber.vercel.app",
  VAPID_PUBLIC,
  VAPID_PRIVATE,
);

// Base de datos simple en memoria (Vercel KV sería ideal para producción)
// Usamos un archivo global para almacenar suscriptores entre requests
global.subscriptions = global.subscriptions || [];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Guardar suscriptor
  if (req.method === "POST" && req.url.includes("subscribe")) {
    const sub = req.body;
    if (!sub || !sub.endpoint)
      return res.status(400).json({ error: "Suscripción inválida" });
    const exists = global.subscriptions.find(
      (s) => s.endpoint === sub.endpoint,
    );
    if (!exists) global.subscriptions.push(sub);
    return res
      .status(200)
      .json({ success: true, total: global.subscriptions.length });
  }

  // Enviar notificación a todos
  if (req.method === "POST") {
    const { title, body, icon } = req.body || {};
    if (!title || !body)
      return res.status(400).json({ error: "Faltan título o mensaje" });

    const payload = JSON.stringify({ title, body, icon, url: "/" });
    let sent = 0,
      failed = 0;

    for (const sub of global.subscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (e) {
        failed++;
        // Remover suscriptores expirados
        if (e.statusCode === 410) {
          global.subscriptions = global.subscriptions.filter(
            (s) => s.endpoint !== sub.endpoint,
          );
        }
      }
    }

    return res
      .status(200)
      .json({
        success: true,
        sent,
        failed,
        total: global.subscriptions.length,
      });
  }

  // Ver cuántos suscriptores hay
  if (req.method === "GET") {
    return res.status(200).json({ total: global.subscriptions.length });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
