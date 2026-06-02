/* ═══════════════════════════════════════════════════
   API — Barbería Vázquez
   GET  /api/datos  → devuelve datos del negocio
   POST /api/datos  → guarda datos (requiere admin_secret)

   Variables de entorno requeridas en Vercel:
     KV_REST_API_URL      → desde Vercel KV dashboard
     KV_REST_API_TOKEN    → desde Vercel KV dashboard
     ADMIN_SECRET         → contraseña que tú eliges (ej. "vazquez2024")
═══════════════════════════════════════════════════ */

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const SECRET = process.env.ADMIN_SECRET;
const KV_KEY = "bv_datos";

/* ── Helpers KV REST ── */
async function kvGet(key) {
  const res = await fetch(`${KV_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  const json = await res.json();
  if (!json.result) return null;
  return JSON.parse(json.result);
}

async function kvSet(key, value) {
  await fetch(`${KV_URL}/set/${key}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value: JSON.stringify(value) }),
  });
}

/* ── Datos por defecto (primera vez que no hay nada en KV) ── */
const DATOS_DEFAULT = {
  horarios: [
    { dia: "Lunes", abre: "09:00", cierra: "20:00", abierto: true },
    { dia: "Martes", abre: "09:00", cierra: "20:00", abierto: true },
    { dia: "Miércoles", abre: "09:00", cierra: "20:00", abierto: true },
    { dia: "Jueves", abre: "09:00", cierra: "21:00", abierto: true },
    { dia: "Viernes", abre: "09:00", cierra: "21:00", abierto: true },
    { dia: "Sábado", abre: "09:00", cierra: "18:00", abierto: true },
    { dia: "Domingo", abre: "10:00", cierra: "15:00", abierto: false },
  ],
  servicios: [
    {
      id: 1,
      nombre: "Corte Clásico",
      precio: 140,
      duracion: 45,
      desc: "Corte a tijera y navaja con acabado impecable.",
    },
    {
      id: 2,
      nombre: "Corte Moderno",
      precio: 140,
      duracion: 45,
      desc: "Corte de estilo contemporáneo adaptado a tu look.",
    },
    {
      id: 3,
      nombre: "Arreglo de Barba en Ritual",
      precio: 140,
      duracion: 40,
      desc: "Ritual completo de perfilado y diseño profesional de barba.",
    },
    {
      id: 4,
      nombre: "Delineado",
      precio: 60,
      duracion: 20,
      desc: "Definición precisa de líneas y contornos.",
    },
    {
      id: 5,
      nombre: "Arreglo de Ceja",
      precio: 60,
      duracion: 15,
      desc: "Perfilado y arreglo profesional de cejas.",
    },
    {
      id: 6,
      nombre: "Lavado de Cabello",
      precio: 50,
      duracion: 15,
      desc: "Lavado con productos de calidad.",
    },
    {
      id: 7,
      nombre: "Mascarilla o Tinte de Barba",
      precio: 100,
      duracion: 30,
      desc: "Mascarilla nutritiva o tinte profesional para barba.",
    },
  ],
  equipo: [
    {
      id: 1,
      nombre: "Rafael Medina",
      rol: "Fundador & Maestro Barbero",
      bio: "30 años perfeccionando el arte del corte clásico. Formado en España y México.",
      tags: ["Navaja clásica", "Corte clásico", "Vintage"],
    },
    {
      id: 2,
      nombre: "Carlos Vega",
      rol: "Especialista en Fades",
      bio: "Campeón regional 2022. Experto en degradados y estilos urbanos modernos.",
      tags: ["Skin fade", "Diseños", "Urban style"],
    },
    {
      id: 3,
      nombre: "Miguel Torres",
      rol: "Maestro de la Barba",
      bio: "Sus diseños de barba son reconocidos como los mejores de la región lagunera.",
      tags: ["Diseño de barba", "Navaja real", "Tratamientos"],
    },
  ],
  ia: {
    nombre: "Vazco",
    tono: "profesional y amigable",
    bienvenida:
      "¡Bienvenido a Barbería Vázquez! Soy Vazco, tu asistente. ¿En qué puedo ayudarte hoy?",
    quickBtns: [
      "¿Cuáles son sus horarios?",
      "¿Qué servicios ofrecen?",
      "¿Cuánto cuesta un corte?",
      "¿Cómo puedo agendar una cita?",
    ],
  },
  citas: [],
};

/* ── Handler principal ── */
export default async function handler(req, res) {
  /* CORS para que el sitio pueda llamar a la API */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-secret");

  if (req.method === "OPTIONS") return res.status(200).end();

  /* ── GET: devuelve datos actuales ── */
  if (req.method === "GET") {
    try {
      const datos = (await kvGet(KV_KEY)) || DATOS_DEFAULT;
      return res.status(200).json({ ok: true, datos });
    } catch (e) {
      console.error("KV GET error:", e);
      return res.status(200).json({ ok: true, datos: DATOS_DEFAULT });
    }
  }

  /* ── POST: guarda datos (requiere secret) ── */
  if (req.method === "POST") {
    const secret = req.headers["x-admin-secret"];
    if (!secret || secret !== SECRET) {
      return res.status(401).json({ ok: false, error: "No autorizado" });
    }

    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).json({ ok: false, error: "JSON inválido" });
    }

    if (!body || typeof body !== "object") {
      return res.status(400).json({ ok: false, error: "Datos inválidos" });
    }

    try {
      await kvSet(KV_KEY, body);
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("KV SET error:", e);
      return res.status(500).json({ ok: false, error: "Error al guardar" });
    }
  }

  return res.status(405).json({ ok: false, error: "Método no permitido" });
}
