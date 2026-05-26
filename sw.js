/* ═══════════════════════════════════
   SERVICE WORKER — Barbería Vázquez
   Maneja notificaciones push
═══════════════════════════════════ */

const CACHE = "bv-cache-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

/* Recibe push desde el admin */
self.addEventListener("push", (e) => {
  if (!e.data) return;
  let data = {};
  try {
    data = e.data.json();
  } catch {
    data = { title: "Barbería Vázquez", body: e.data.text() };
  }

  const iconMap = {
    clock: "🕐",
    scissors: "✂️",
    gift: "🎁",
    star: "⭐",
    alert: "🔔",
  };

  const options = {
    body: data.body || "",
    icon: "/logo.png",
    badge: "/logo.png",
    tag: "bv-notif-" + Date.now(),
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
    actions: [
      { action: "ver", title: "Ver barbería" },
      { action: "cerrar", title: "Cerrar" },
    ],
  };

  e.waitUntil(
    self.registration.showNotification(
      (iconMap[data.icon] || "🔔") + " " + (data.title || "Barbería Vázquez"),
      options,
    ),
  );
});

/* Click en la notificación */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.action === "cerrar") return;
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const c of list) {
          if (c.url.includes(self.location.origin)) {
            c.focus();
            return;
          }
        }
        clients.openWindow(url);
      }),
  );
});
