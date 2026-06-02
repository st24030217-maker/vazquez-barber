/* =====================
   CHAT ASISTENTE IA
   ===================== */

const BSC = {
  open: false,
  history: [],
  SYSTEM: `Eres Vazco, el asistente virtual de Barbería Vázquez, una barbería de confianza ubicada en México.

Tu personalidad es: profesional, amigable, conciso y con un toque de elegancia. Hablas en español. Nunca menciones que eres una IA de Anthropic o Claude — eres Vazco, el asistente de Barbería Vázquez.

INFORMACIÓN DEL NEGOCIO:
- Nombre: Barbería Vázquez
- Ubicación: Blvd. Miguel Alemán 520, Villa Jardín, 35168 Lerdo, Dgo.
- Teléfono: (871) 518-1769
- WhatsApp: +52 871 518 1769
- Instagram: @vazquezbarberia
- Facebook: Barberia Vazquez

SERVICIOS Y PRECIOS:
- Corte Clásico (corte a tijera y navaja): $140 MXN (45 min)
- Corte Moderno: $140 MXN (45 min)
- Arreglo de Barba en Ritual: $140 MXN (40 min)
- Delineado: $60 MXN (20 min)
- Arreglo de Ceja: $60 MXN (15 min)
- Lavado de Cabello: $50 MXN (15 min)
- Mascarilla o Tinte de Barba: $100 MXN (30 min)

HORARIOS:
- Lunes a Viernes: 9:00 AM – 8:00 PM
- Sábados: 9:00 AM – 6:00 PM
- Domingos: 10:00 AM – 3:00 PM

EQUIPO (barberos):
- Maestro Rafael — 30 años de experiencia, fundador, especialista en cortes clásicos
- Carlos Mendoza — especialista en fade y diseños modernos
- Diego Reyes — experto en tratamientos capilares y coloración

RESERVAS: Los clientes pueden agendar en la sección "Reservar" del sitio web, o llamar directamente a la barbería.

POLÍTICAS:
- Se recomienda reservar con al menos 24 horas de anticipación
- Se puede cancelar hasta 2 horas antes sin cargo
- Se aceptan walk-ins según disponibilidad

Responde de forma breve y directa. Si te preguntan algo que no sabes, invita al cliente a llamar directamente. Siempre ofrece ayuda adicional al final.`,
};

function bscToggle() {
  BSC.open = !BSC.open;
  document.getElementById("bs-chat-panel").classList.toggle("open", BSC.open);
  document.getElementById("bscBadge").style.display = "none";
  if (BSC.open && BSC.history.length === 0) {
    setTimeout(
      () =>
        bscBot(
          "¡Qué tal! Soy Vazco, el asistente de <b>Barbería Vázquez</b>. Cuéntame — ¿qué andas buscando?",
        ),
      400,
    );
  }
  if (BSC.open)
    setTimeout(() => document.getElementById("bscInput").focus(), 350);
}

function bscQuick(txt) {
  document.getElementById("bscQuick").style.display = "none";
  bscAddMsg(txt, "usr");
  bscHistory(txt);
  bscCallAI(txt);
}

function bscSend() {
  const inp = document.getElementById("bscInput");
  const txt = inp.value.trim();
  if (!txt) return;
  inp.value = "";
  document.getElementById("bscQuick").style.display = "none";
  bscAddMsg(txt, "usr");
  bscHistory(txt);
  bscCallAI(txt);
}

function bscHistory(txt) {
  BSC.history.push({ role: "user", content: txt });
}

function bscBot(txt) {
  bscAddMsg(txt, "bot");
  BSC.history.push({ role: "assistant", content: txt });
}

function bscAddMsg(txt, who) {
  const msgs = document.getElementById("bscMsgs");
  const now = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const div = document.createElement("div");
  div.className = "bsc-msg " + who;
  div.innerHTML = `<div class="bsc-bubble">${txt}</div><div class="bsc-time">${now}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function bscShowTyping() {
  const msgs = document.getElementById("bscMsgs");
  const t = document.createElement("div");
  t.id = "bscTyping";
  t.className = "bsc-typing";
  t.innerHTML = "<span></span><span></span><span></span>";
  msgs.appendChild(t);
  msgs.scrollTop = msgs.scrollHeight;
  return t;
}

/* ── VAZCO — MOTOR DE RESPUESTAS OFFLINE ── */

/* Normaliza texto: minúsculas, sin acentos, sin puntuación */
function bscNorm(t) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:]/g, "");
}

/* Detecta intención con pesos — retorna la de mayor score */
function bscDetectIntent(msg) {
  const t = bscNorm(msg);
  const words = t.split(/\s+/);

  const intents = [
    {
      id: "saludo",
      pesos: {
        hola: 3,
        hey: 3,
        buenas: 3,
        buenos: 2,
        saludos: 2,
        buen: 1,
        hi: 2,
        que: 1,
        tal: 1,
        como: 1,
        estan: 1,
      },
    },
    {
      id: "horario",
      pesos: {
        horario: 4,
        horarios: 4,
        hora: 3,
        horas: 3,
        abierto: 4,
        abren: 4,
        cierran: 4,
        cuando: 2,
        dias: 2,
        dia: 2,
        lunes: 3,
        viernes: 3,
        sabado: 3,
        domingo: 3,
        schedule: 3,
        atienden: 4,
        trabajan: 3,
      },
    },
    {
      id: "precios",
      pesos: {
        precio: 4,
        precios: 4,
        cuesta: 4,
        costo: 4,
        cobran: 4,
        cuanto: 3,
        vale: 3,
        tarifas: 3,
        tarifa: 3,
        dinero: 2,
        pesos: 2,
        mxn: 3,
        barato: 2,
        caro: 2,
        presupuesto: 3,
      },
    },
    {
      id: "servicios",
      pesos: {
        servicio: 4,
        servicios: 4,
        ofrecen: 3,
        hacen: 3,
        menu: 3,
        catalogo: 3,
        lista: 2,
      },
    },
    {
      id: "corte",
      pesos: {
        corte: 4,
        cortar: 4,
        pelo: 3,
        cabello: 3,
        clasico: 3,
        fade: 4,
        degradado: 4,
        estilo: 3,
        moderno: 3,
        diseño: 2,
      },
    },
    {
      id: "barba",
      pesos: {
        barba: 5,
        afeitado: 4,
        afeitar: 4,
        navaja: 4,
        bigote: 4,
        perfilar: 4,
        perfilado: 4,
        rasurar: 4,
        rasurado: 4,
      },
    },
    {
      id: "vip",
      pesos: {
        vip: 5,
        premium: 4,
        lujo: 4,
        especial: 3,
        experiencia: 3,
        completo: 3,
        paquete: 3,
        todo: 2,
        incluye: 2,
      },
    },
    {
      id: "color",
      pesos: {
        color: 5,
        mechas: 5,
        tinte: 5,
        coloracion: 5,
        rubio: 4,
        pintar: 4,
        aclarar: 4,
        oscurecer: 4,
        decolorar: 4,
      },
    },
    {
      id: "equipo",
      pesos: {
        rafael: 5,
        carlos: 5,
        diego: 5,
        barbero: 4,
        barberos: 4,
        equipo: 3,
        quien: 3,
        maestro: 4,
        especialista: 3,
        mejor: 2,
        recomienda: 3,
        recomendas: 3,
      },
    },
    {
      id: "reserva",
      pesos: {
        cita: 5,
        reserva: 5,
        reservar: 5,
        agendar: 5,
        agendo: 5,
        turno: 4,
        appointment: 4,
        disponibilidad: 4,
        quiero: 2,
        necesito: 2,
        cuando: 1,
        puedo: 1,
        ir: 1,
        asistir: 1,
      },
    },
    {
      id: "ubicacion",
      pesos: {
        donde: 4,
        ubicacion: 5,
        ubicados: 4,
        direccion: 5,
        lugar: 3,
        mapa: 4,
        llegar: 4,
        colonia: 3,
        boulevard: 4,
        blvd: 4,
        lerdo: 3,
        durango: 3,
        address: 4,
      },
    },
    {
      id: "contacto",
      pesos: {
        telefono: 5,
        numero: 4,
        whatsapp: 5,
        llamar: 4,
        contacto: 4,
        contact: 4,
        comunicar: 4,
        mensaje: 3,
        chat: 3,
      },
    },
    {
      id: "redes",
      pesos: {
        instagram: 5,
        facebook: 5,
        ig: 4,
        redes: 4,
        social: 4,
        seguir: 4,
        fotos: 3,
        trabajos: 3,
        foto: 3,
      },
    },
    {
      id: "cancelar",
      pesos: {
        cancelar: 5,
        cancelacion: 5,
        cancelar: 5,
        reprogramar: 5,
        cambiar: 4,
        politica: 4,
        reembolso: 4,
        devolver: 4,
        walkin: 3,
        walk: 3,
        sin: 1,
        cita: 2,
      },
    },
    {
      id: "gracias",
      pesos: {
        gracias: 5,
        thank: 4,
        perfecto: 3,
        excelente: 3,
        genial: 3,
        listo: 3,
        entendido: 3,
        chevere: 3,
        ok: 2,
        bien: 2,
        chido: 3,
        padre: 3,
        buenisimo: 3,
      },
    },
    {
      id: "recomendacion",
      pesos: {
        recomiendas: 5,
        recomendas: 5,
        recomienda: 5,
        cual: 3,
        sugiere: 5,
        mejor: 3,
        nuevo: 3,
        primera: 4,
        novato: 4,
        nunca: 3,
      },
    },
  ];

  let best = null,
    bestScore = 0;
  for (const intent of intents) {
    let score = 0;
    for (const w of words) {
      if (intent.pesos[w]) score += intent.pesos[w];
    }
    // También busca frases de 2 palabras
    for (let i = 0; i < words.length - 1; i++) {
      const pair = words[i] + " " + words[i + 1];
      if (intent.pesos[pair]) score += intent.pesos[pair];
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent.id;
    }
  }
  return bestScore >= 2 ? best : "default";
}

/* Hora actual para respuestas contextuales */
function bscGetHorarioHoy() {
  const dia = new Date().getDay(); // 0=dom, 1=lun ... 6=sab
  if (dia === 0) return { abierto: true, cierre: "3:00 PM", nombre: "domingo" };
  if (dia === 6) return { abierto: true, cierre: "6:00 PM", nombre: "sábado" };
  return { abierto: true, cierre: "8:00 PM", nombre: "hoy" };
}

/* Respuestas por intención */
const BSC_RESP = {
  saludo: [
    "¡Qué tal! Soy Vazco, el asistente de <b>Barbería Vázquez</b>. Aquí pa' lo que necesites — precios, citas, horarios o lo que sea. ¿En qué te ayudo?",
    "¡Buen día! Soy Vazco. ¿Vienes por primera vez o ya conoces la barbería? Cuéntame qué buscas y te oriento.",
    "¡Ey, bienvenido! <b>Barbería Vázquez</b>, la mejor de Lerdo. Soy Vazco — dime qué necesitas.",
  ],

  horario: () => {
    const h = bscGetHorarioHoy();
    return `Abrimos sin falla:<br><br>📅 <b>Lunes – Viernes:</b> 9:00 AM – 8:00 PM<br>📅 <b>Sábados:</b> 9:00 AM – 6:00 PM<br>📅 <b>Domingos:</b> 10:00 AM – 3:00 PM<br><br><b>${h.nombre === "domingo" || h.nombre === "sábado" ? "Hoy" : "Entre semana"} cerramos a las ${h.cierre}.</b><br><br>¿Te agendo una cita?`;
  },

  precios: [
    "Los precios son directos, sin sorpresas:<br><br>✂️ <b>Corte Clásico</b> — $140 · 45 min<br>✂️ <b>Corte Moderno</b> — $140 · 45 min<br>🧔 <b>Arreglo de Barba en Ritual</b> — $140 · 40 min<br>📏 <b>Delineado</b> — $60 · 20 min<br>👁️ <b>Arreglo de Ceja</b> — $60 · 15 min<br>💧 <b>Lavado de Cabello</b> — $50 · 15 min<br>🧴 <b>Mascarilla o Tinte de Barba</b> — $100 · 30 min<br><br>¿Alguno te llama la atención o quieres saber qué incluye?",
  ],

  servicios: [
    "En Barbería Vázquez manejamos:<br><br>✂️ <b>Corte Clásico</b> — tijera y navaja, acabado impecable<br>✂️ <b>Corte Moderno</b> — estilo contemporáneo a tu gusto<br>🧔 <b>Arreglo de Barba en Ritual</b> — ritual completo de perfilado<br>📏 <b>Delineado</b> — líneas y contornos precisos<br>👁️ <b>Arreglo de Ceja</b> — perfilado profesional<br>💧 <b>Lavado de Cabello</b> — limpieza con productos de calidad<br>🧴 <b>Mascarilla o Tinte de Barba</b> — nutrición y color para tu barba<br><br>¿Cuál te interesa?",
  ],

  corte: [
    "Para el corte tienes dos opciones:<br><br>✂️ <b>Corte Clásico</b> — $140 MXN, 45 min. Tijera y navaja, el de toda la vida.<br>✂️ <b>Corte Moderno</b> — $140 MXN, 45 min. Estilo contemporáneo adaptado a tu look.<br><br>¿Alguno te convence? Te ayudo a agendar.",
    "Si buscas algo moderno, Carlos Vega es tu hombre — especialista en fades y diseños actuales. Si prefieres clásico, el Maestro Rafael tiene 30 años afinando la tijera.<br><br>¿Qué estilo traes en mente?",
  ],

  barba: [
    "Para la barba tenemos el <b>Arreglo de Barba en Ritual</b> — $140 MXN, 40 minutos. Ritual completo de perfilado y diseño profesional.<br><br>También el <b>Delineado</b> a $60 si solo necesitas definir líneas.<br><br>¿Te agendo?",
    "Si quieres color en la barba, la <b>Mascarilla o Tinte de Barba</b> está a $100 · 30 min. Y para el arreglo completo, el <b>Arreglo de Barba en Ritual</b> a $140.<br><br>¿Cuál te va?",
  ],

  vip: [
    "No manejamos paquete VIP actualmente, pero puedes combinar servicios a tu gusto. Por ejemplo corte + arreglo de barba en ritual — los dos a $140 cada uno.<br><br>Para un servicio personalizado llama al <b>(871) 518-1769</b>. ¿Te ayudo con algo más?",
  ],

  color: [
    "Tenemos la <b>Mascarilla o Tinte de Barba</b> — $100 MXN · 30 min. Nutrición y color para tu barba.<br><br>Para más detalles o disponibilidad llama al <b>(871) 518-1769</b>. ¿Algo más?",
  ],

  equipo: [
    "El equipo de Barbería Vázquez:<br><br>👨‍💼 <b>Maestro Rafael</b> — fundador, 30 años de experiencia. El rey del corte clásico.<br>✂️ <b>Carlos Vega</b> — fades y diseños modernos. Si quieres algo actual, es tu barbero.<br>✂️ <b>Miguel Torres</b> — maestro de la barba, los mejores diseños de la región.<br><br>¿Con quién te gustaría agendar?",
  ],

  reserva: [
    'Para apartar tu lugar tienes tres opciones:<br><br>1️⃣ Directo en la sección <b>"Reservar"</b> del sitio<br>2️⃣ 📞 Llama al <b>(871) 518-1769</b><br>3️⃣ 💬 Manda WhatsApp al <b>+52 871 518 1769</b><br><br>Se recomienda con 24 horas de anticipación. ¿Ya sabes qué servicio quieres?',
    "¡Apártalo antes de que se llene! Los sábados especialmente vuelan los turnos.<br><br>📞 <b>(871) 518-1769</b><br>💬 <b>WhatsApp: +52 871 518 1769</b><br><br>O usa el formulario de reserva en esta misma página. ¿Te ayudo con algo más?",
  ],

  ubicacion: [
    "Nos encuentras en:<br><br>📍 <b>Blvd. Miguel Alemán 520, Villa Jardín</b><br>35168 Lerdo, Dgo.<br><br>Búscanos en Google Maps como <b>Barbería Vázquez</b> y te lleva directo. ¿Necesitas algo más?",
  ],

  contacto: [
    "Para contactarnos:<br><br>📞 <b>Teléfono:</b> (871) 518-1769<br>💬 <b>WhatsApp:</b> +52 871 518 1769<br>📷 <b>Instagram:</b> @vazquezbarberia<br>👥 <b>Facebook:</b> Barberia Vazquez<br><br>El WhatsApp es lo más rápido. ¿Algo más en lo que te pueda ayudar?",
  ],

  redes: [
    "Síguenos, ahí está el trabajo real:<br><br>📷 <b>Instagram:</b> @vazquezbarberia<br>👥 <b>Facebook:</b> Barberia Vazquez<br><br>Subimos cortes, estilos y promos. Si ves algo que te guste, mándanos screenshot y lo replicamos. 💈",
  ],

  cancelar: [
    "Sin dramas:<br><br>✅ Cancelas sin cargo hasta <b>2 horas antes</b> de tu cita<br>🚶 También aceptamos <b>walk-ins</b> si hay lugar disponible<br><br>Para cancelar llama al <b>(871) 518-1769</b> o manda WhatsApp. ¿Algo más?",
  ],

  gracias: [
    "¡Para eso estamos! Si después se te ocurre algo más, aquí ando. Nos vemos en la silla. 💈",
    "¡Con gusto! Cualquier cosa, ya sabes dónde encontrarme. ¡Que te vaya bien!",
    "¡Chido! Te esperamos en Barbería Vázquez. 🤙",
  ],

  recomendacion: [
    "Si es tu primera vez, te recomiendo el <b>Corte Clásico</b> ($140) — tijera y navaja, acabado impecable. Así conoces la barbería sin complicaciones.<br><br>Si también quieres arreglar la barba, el <b>Arreglo de Barba en Ritual</b> está a $140 y sale excelente.<br><br>¿Qué te late?",
    "Depende qué busques:<br><br>— <b>Clásico y sin rodeos</b> → Corte Clásico con el Maestro Rafael<br>— <b>Estilo moderno o fade</b> → Carlos Vega<br>— <b>Barba definida</b> → Arreglo de Barba en Ritual con Miguel Torres<br><br>¿Cuál va contigo?",
  ],

  default: [
    "Esa no la tengo en mis notas. Para eso lo mejor es llamar directo:<br><br>📞 <b>(871) 518-1769</b><br>💬 <b>WhatsApp: +52 871 518 1769</b><br><br>¿Te puedo ayudar con precios, horarios o citas?",
    "No tengo esa info a la mano, pero el equipo te puede resolver todo por WhatsApp: <b>+52 871 518 1769</b>. ¿Hay algo más que pueda orientarte?",
  ],
};

function bscResponder(msg) {
  const intent = bscDetectIntent(msg);
  const respuesta = BSC_RESP[intent] || BSC_RESP.default;
  // Si es función (para respuestas dinámicas como horario)
  if (typeof respuesta === "function") return respuesta();
  return respuesta[Math.floor(Math.random() * respuesta.length)];
}

function bscCallAI(userMsg) {
  const typing = bscShowTyping();
  // Delay variable — más corto para saludos, más largo para respuestas elaboradas
  const intent = bscDetectIntent(userMsg);
  const fast = ["saludo", "gracias", "default"].includes(intent);
  const delay = fast ? 500 + Math.random() * 400 : 800 + Math.random() * 700;
  setTimeout(() => {
    typing.remove();
    bscBot(bscResponder(userMsg));
  }, delay);
}

/* =====================
   MAIN SCRIPTS
   ===================== */

// Cursor — solo en dispositivos con mouse real
const isTouchOnly = !window.matchMedia("(hover:hover)").matches;
const cur = document.getElementById("cur"),
  crng = document.getElementById("crng");
if (isTouchOnly) {
  cur.style.display = "none";
  crng.style.display = "none";
  document.body.style.cursor = "auto";
}
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;
if (!isTouchOnly) {
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + "px";
    cur.style.top = my + "px";
  });
  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    crng.style.left = rx + "px";
    crng.style.top = ry + "px";
    requestAnimationFrame(loop);
  })();
}

// Loader counter
let p = 0;
const pe = document.getElementById("ldPct");
const pt = setInterval(() => {
  p = Math.min(p + Math.random() * 3.5 + 1, 100);
  pe.textContent = Math.floor(p) + "%";
  if (p >= 100) {
    clearInterval(pt);
  }
}, 55);
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("exit");
    setTimeout(
      () => (document.getElementById("loader").style.display = "none"),
      1200,
    );
  }, 3400);
});

// Navbar
window.addEventListener("scroll", () =>
  document.getElementById("nav").classList.toggle("scrolled", scrollY > 60),
);

// Menu
function tmenu() {
  document.getElementById("mob").classList.toggle("open");
  document.getElementById("hbg").classList.toggle("open");
}
function cmenu() {
  document.getElementById("mob").classList.remove("open");
  document.getElementById("hbg").classList.remove("open");
}

// Reveal
const ro = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("vis");
    }),
  { threshold: 0.1 },
);
document.querySelectorAll(".reveal").forEach((el) => ro.observe(el));

// Counters
function animC(el) {
  const t = parseInt(el.getAttribute("data-count")),
    dur = 2000,
    step = t / (dur / 16);
  let c = 0;
  const tick = setInterval(() => {
    c += step;
    if (c >= t) {
      c = t;
      clearInterval(tick);
    }
    const v = Math.floor(c);
    el.textContent = t === 98 ? v + "%" : t === 8500 ? v.toLocaleString() : v;
    // keep suffix for hero floats
    if (el.closest(".hf-n") && t === 30) {
      const em = el.querySelector("em");
      if (em) el.textContent = v;
      el.appendChild(
        Object.assign(document.createElement("em"), {
          textContent: "+",
          style: "font-style:normal;color:var(--gold);font-size:1.8rem",
        }),
      );
    }
  }, 16);
}
const co = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.querySelectorAll("[data-count]").forEach(animC);
        co.unobserve(e.target);
      }
    }),
  { threshold: 0.5 },
);
document.querySelectorAll("#stats,#hero").forEach((el) => co.observe(el));

// Date
const di = document.getElementById("dateIn");
if (di) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  di.min = d.toISOString().split("T")[0];
}

/* ═══════════════════════════════════════════
   STRIPE PAYMENT — Barbería Vázquez
   ═══════════════════════════════════════════
   ⚠️  IMPORTANTE:
   Reemplaza STRIPE_PUBLISHABLE_KEY con tu clave
   pública real de Stripe (pk_live_... o pk_test_...)

   Para que funcione de verdad necesitas un backend
   (server) que cree el PaymentIntent. Las funciones
   handleCardPayment() y handleTransferPayment()
   muestran el flujo completo con comentarios donde
   debes llamar a tu API.
═══════════════════════════════════════════ */

const STRIPE_PK =
  "pk_test_51Tc9y5PaGoUc1SM9iH9AesIJL9IYRZC75PbzZeX1uF0spMrCVoUZrG6q9hPVUJlrXRUc5bsLA3b4OZq3Iv2RDGqv00DGTJnhgN";

let stripe = null;
let stripeElements = null;
let stripeCardEl = null;
let selectedTransferMethod = "spei"; // 'spei' | 'oxxo'

// Datos de la cita (se guardan al pasar al paso 2)
let bookingData = {};

// ── Inicializar Stripe cuando el DOM esté listo ──
document.addEventListener("DOMContentLoaded", () => {
  if (typeof Stripe !== "undefined" && !STRIPE_PK.includes("REEMPLAZA")) {
    stripe = Stripe(STRIPE_PK);
    stripeElements = stripe.elements();
    stripeCardEl = stripeElements.create("card", {
      style: {
        base: {
          color: "#eeebe5",
          fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif",
          fontSmoothing: "antialiased",
          fontSize: "14px",
          "::placeholder": { color: "#6a6a6a" },
          iconColor: "#909090",
        },
        invalid: { color: "#e05a5a", iconColor: "#e05a5a" },
      },
    });
    stripeCardEl.mount("#stripe-card-element");
    stripeCardEl.on("change", (ev) => {
      const el = document.getElementById("stripe-card-errors");
      el.textContent = ev.error ? ev.error.message : "";
    });
  }
});

// ── PASO 1 → PASO 2: captura datos y avanza ──
document.getElementById("aptForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const svcEl = document.getElementById("aptServicio");
  const svcText = svcEl.options[svcEl.selectedIndex].text;
  const svcPrice = parseInt(svcEl.value) || 0;

  bookingData = {
    nombre: document.getElementById("aptNombre").value.trim(),
    telefono: document.getElementById("aptTelefono").value.trim(),
    servicio: svcText,
    precio: svcPrice,
    barbero: document.getElementById("aptBarbero").value,
    fecha: document.getElementById("dateIn").value,
    hora: document.getElementById("aptHora").value,
    notas: document.getElementById("aptNotas").value.trim(),
  };

  // Mostrar resumen en paso 2
  const fecha = bookingData.fecha
    ? new Date(bookingData.fecha + "T12:00:00").toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  document.getElementById("bkSummary").innerHTML = `
    <div class="bks-row"><span class="bks-lbl">Servicio</span><span class="bks-val">${bookingData.servicio}</span></div>
    <div class="bks-row"><span class="bks-lbl">Barbero</span><span class="bks-val">${bookingData.barbero}</span></div>
    <div class="bks-row"><span class="bks-lbl">Fecha</span><span class="bks-val">${fecha}</span></div>
    <div class="bks-row"><span class="bks-lbl">Hora</span><span class="bks-val">${bookingData.hora}</span></div>
    <div class="bks-row bks-total"><span class="bks-lbl">Total</span><span class="bks-val">$${bookingData.precio} MXN</span></div>
  `;

  document.getElementById("bkStep1").style.display = "none";
  document.getElementById("bkStep2").style.display = "block";

  // Si Stripe no está configurado aún, mostrar mensaje de demo
  if (!stripe) {
    document.getElementById("stripe-card-element").innerHTML =
      '<div style="padding:1rem;color:var(--gray-light);font-size:.82rem;border:1px solid var(--gray);background:var(--dark2)">⚠️ Agrega tu clave pública de Stripe en main.js para activar el cobro real.</div>';
  }

  window.scrollTo({
    top: document.getElementById("booking").offsetTop - 80,
    behavior: "smooth",
  });
});

// ── Volver al paso 1 ──
function goBackStep1() {
  document.getElementById("bkStep2").style.display = "none";
  document.getElementById("bkStep1").style.display = "block";
}

// ── Switch entre tabs de pago ──
function switchPayTab(tab) {
  document.getElementById("tabCard").classList.toggle("active", tab === "card");
  document
    .getElementById("tabTransfer")
    .classList.toggle("active", tab === "transfer");
  document.getElementById("panelCard").style.display =
    tab === "card" ? "block" : "none";
  document.getElementById("panelTransfer").style.display =
    tab === "transfer" ? "block" : "none";
}

// ── Seleccionar método de transferencia ──
function selectTransfer(method) {
  selectedTransferMethod = method;
  document
    .getElementById("optSpei")
    .classList.toggle("active", method === "spei");
  document
    .getElementById("optOxxo")
    .classList.toggle("active", method === "oxxo");
}

// ── PAGO CON TARJETA (Stripe Card) ──
async function handleCardPayment() {
  if (!stripe) {
    // Modo demo — sin backend real
    confirmReservation("card");
    return;
  }

  const btn = document.getElementById("btnPayCard");
  btn.disabled = true;
  btn.textContent = "Procesando...";
  const errEl = document.getElementById("stripe-card-errors");
  errEl.textContent = "";

  try {
    /*
     * ── PRODUCCIÓN ──
     * Aquí debes llamar a TU servidor para crear un PaymentIntent:
     *
     * const res = await fetch("/api/create-payment-intent", {
     *   method: "POST",
     *   headers: { "Content-Type": "application/json" },
     *   body: JSON.stringify({
     *     amount: bookingData.precio * 100, // en centavos
     *     currency: "mxn",
     *     metadata: bookingData
     *   })
     * });
     * const { clientSecret } = await res.json();
     *
     * Después confirmar:
     * const result = await stripe.confirmCardPayment(clientSecret, {
     *   payment_method: { card: stripeCardEl, billing_details: { name: bookingData.nombre } }
     * });
     */

    // ── DEMO (sin backend) ── simula éxito tras 1.5s
    await new Promise((r) => setTimeout(r, 1500));
    confirmReservation("card");
  } catch (err) {
    errEl.textContent =
      err.message || "Error al procesar el pago. Intenta de nuevo.";
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> Pagar con Tarjeta`;
  }
}

// ── PAGO POR TRANSFERENCIA (SPEI / OXXO via Stripe) ──
async function handleTransferPayment() {
  if (!stripe) {
    // Modo demo — sin backend real
    confirmReservation(selectedTransferMethod);
    return;
  }

  const btn = document.getElementById("btnPayTransfer");
  btn.disabled = true;
  btn.textContent = "Generando instrucciones...";
  const errEl = document.getElementById("stripe-transfer-errors");
  errEl.textContent = "";

  try {
    /*
     * ── PRODUCCIÓN ──
     * Llama a tu servidor para crear un PaymentIntent con el método correcto:
     *
     * const paymentMethodType = selectedTransferMethod === "oxxo" ? "oxxo" : "customer_balance";
     * const res = await fetch("/api/create-payment-intent", {
     *   method: "POST",
     *   headers: { "Content-Type": "application/json" },
     *   body: JSON.stringify({
     *     amount: bookingData.precio * 100,
     *     currency: "mxn",
     *     payment_method_types: [paymentMethodType],
     *     metadata: bookingData
     *   })
     * });
     * const { clientSecret } = await res.json();
     *
     * Para OXXO:
     * const result = await stripe.confirmOxxoPayment(clientSecret, {
     *   payment_method: { billing_details: { name: bookingData.nombre, email: "cliente@email.com" } }
     * });
     *
     * Para SPEI (customer_balance):
     * const result = await stripe.confirmCustomerBalancePayment(clientSecret, {
     *   payment_method: { type: "customer_balance" },
     *   payment_method_options: { customer_balance: { funding_type: "bank_transfer", bank_transfer: { type: "mx_bank_transfer" } } }
     * });
     */

    // ── DEMO ── simula éxito
    await new Promise((r) => setTimeout(r, 1500));
    confirmReservation(selectedTransferMethod);
  } catch (err) {
    errEl.textContent =
      err.message || "Error al generar las instrucciones. Intenta de nuevo.";
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Generar instrucciones de pago`;
  }
}

// ── WhatsApp — número de la barbería ──
const WA_NUMBER = "528715181769"; // +52 871 518 1769

// ── Enviar comprobante por WhatsApp ──
function sendWhatsAppNotification(method, extraInfo) {
  const fecha = bookingData.fecha
    ? new Date(bookingData.fecha + "T12:00:00").toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const metodoPago =
    method === "card"
      ? "✅ Tarjeta (Stripe)"
      : method === "spei"
        ? "🏦 Transferencia SPEI"
        : "🏪 OXXO Pay";

  let msg =
    `✂️ *NUEVA RESERVACIÓN — Barbería Vázquez*\n\n` +
    `👤 *Cliente:* ${bookingData.nombre}\n` +
    `📱 *Teléfono:* ${bookingData.telefono}\n` +
    `──────────────────────\n` +
    `💈 *Servicio:* ${bookingData.servicio}\n` +
    `👨‍🦱 *Barbero:* ${bookingData.barbero}\n` +
    `📅 *Fecha:* ${fecha}\n` +
    `🕐 *Hora:* ${bookingData.hora}\n` +
    `💵 *Total:* $${bookingData.precio} MXN\n` +
    `──────────────────────\n` +
    `💳 *Método de pago:* ${metodoPago}\n`;

  if (extraInfo) msg += `${extraInfo}\n`;

  if (bookingData.notas) {
    msg += `──────────────────────\n📝 *Notas:* ${bookingData.notas}\n`;
  }

  msg += `\n_Reservación recibida desde barberiavazquez.com_`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// ── Mostrar confirmación final ──
function confirmReservation(method) {
  document.getElementById("bkStep2").style.display = "none";

  const fOk = document.getElementById("fOk");
  const fOkMsg = document.getElementById("fOkMsg");
  const fOkSub = document.getElementById("fOkSub");
  const transferInstructions = document.getElementById("transferInstructions");

  if (method === "card") {
    fOkMsg.textContent = "¡Pago confirmado! Reservación lista.";
    fOkSub.innerHTML = `Tu comprobante se está enviando por WhatsApp.<br><span style="font-size:.78rem;color:var(--gray-mid)">Si no se abrió automáticamente, toca el botón de abajo.</span>`;
    transferInstructions.style.display = "block";
    transferInstructions.innerHTML = `
      <button class="wa-btn" onclick="sendWhatsAppNotification('card')">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        Enviar comprobante por WhatsApp
      </button>`;
    showToast("¡Pago exitoso! Enviando comprobante...");
    setTimeout(() => sendWhatsAppNotification("card"), 800);
  } else if (method === "spei") {
    const ref = `${bookingData.nombre.toUpperCase().replace(/\s/g, "").substring(0, 8)}-${Date.now().toString().slice(-5)}`;
    fOkMsg.textContent = "Reservación creada — Pendiente de pago SPEI";
    fOkSub.textContent =
      "Se enviaron las instrucciones a WhatsApp. Realiza la transferencia para confirmar tu cita.";
    transferInstructions.style.display = "block";
    transferInstructions.innerHTML = `
      <div class="transfer-box">
        <div class="tbox-title">🏦 Instrucciones SPEI</div>
        <div class="tbox-row"><span>Banco</span><strong>STP</strong></div>
        <div class="tbox-row"><span>Beneficiario</span><strong>Barbería Vázquez</strong></div>
        <div class="tbox-row"><span>Monto exacto</span><strong>$${bookingData.precio}.00 MXN</strong></div>
        <div class="tbox-row"><span>Referencia</span><strong>${ref}</strong></div>
        <div class="tbox-note">⚠️ Activa SPEI en tu cuenta de Stripe para recibir la CLABE automáticamente. Por ahora envía tu comprobante de transferencia por WhatsApp.</div>
      </div>
      <button class="wa-btn" onclick="sendWhatsAppNotification('spei', '🔖 *Referencia SPEI:* ${ref}')">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        Enviar comprobante por WhatsApp
      </button>`;
    showToast("Instrucciones SPEI generadas");
    setTimeout(
      () => sendWhatsAppNotification("spei", `🔖 *Referencia SPEI:* ${ref}`),
      800,
    );
  } else if (method === "oxxo") {
    const ref = "43" + Math.random().toString().slice(2, 20).substring(0, 16);
    fOkMsg.textContent = "Reservación creada — Paga en OXXO";
    fOkSub.textContent =
      "Tu cupón y los datos de la cita se enviaron a WhatsApp.";
    transferInstructions.style.display = "block";
    transferInstructions.innerHTML = `
      <div class="transfer-box">
        <div class="tbox-title">🏪 Cupón OXXO Pay</div>
        <div class="oxxo-ref">${ref}</div>
        <div class="tbox-row"><span>Monto</span><strong>$${bookingData.precio}.00 MXN</strong></div>
        <div class="tbox-row"><span>Vigencia</span><strong>72 horas</strong></div>
        <div class="tbox-note">Di en caja: "Quiero pagar un servicio OXXO Pay" y muestra este número de referencia.</div>
      </div>
      <button class="wa-btn" onclick="sendWhatsAppNotification('oxxo', '🏪 *Referencia OXXO:* ${ref}')">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        Enviar comprobante por WhatsApp
      </button>`;
    showToast("Cupón OXXO generado");
    setTimeout(
      () => sendWhatsAppNotification("oxxo", `🏪 *Referencia OXXO:* ${ref}`),
      800,
    );
  }

  fOk.style.display = "block";
}

// Toast
function showToast(msg) {
  const t = document.getElementById("toast");
  document.getElementById("toastT").textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 4500);
}

// Lightbox
function openLb(title, sub) {
  document.getElementById("lbT").textContent = title;
  document.getElementById("lbS").textContent = sub;
  document.getElementById("lb").classList.add("open");
}
function closeLb(e) {
  if (
    !e ||
    e.target === document.getElementById("lb") ||
    e.target.classList.contains("lb-x")
  )
    document.getElementById("lb").classList.remove("open");
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    document.getElementById("lb").classList.remove("open");
});

/* =====================
   TARJETA DE FIDELIDAD
   ===================== */
(function () {
  const TOTAL = 6;
  let visitas = 0;

  function lcRender() {
    const container = document.getElementById("lcStamps");
    const progressText = document.getElementById("lcProgressText");
    const freeBadge = document.getElementById("lcFreeBadge");
    const countDisplay = document.getElementById("lcCount");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < TOTAL; i++) {
      const stamp = document.createElement("div");
      const isFreeSlot = i === TOTAL - 1;
      const isFilled = i < visitas;
      const isFreeFilled = visitas >= TOTAL && isFreeSlot;

      stamp.className =
        "lc-stamp" +
        (isFreeSlot && !isFreeFilled ? " free-slot" : "") +
        (isFilled && !isFreeSlot ? " filled" : "") +
        (isFreeFilled ? " free" : "");

      if (isFreeSlot) {
        // ícono tijeras para el slot final
        stamp.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/>
          <line x1="14.47" y1="14.48" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>`;
      } else {
        // ícono estrella para slots normales
        stamp.innerHTML = `<svg viewBox="0 0 24 24" fill="${isFilled ? "rgba(123,74,48,.3)" : "none"}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>`;
      }
      container.appendChild(stamp);
    }

    const filled = Math.min(visitas, TOTAL - 1);
    progressText.textContent =
      visitas >= TOTAL
        ? "¡Completada! Corte gratis canjeado ✓"
        : filled + " de " + (TOTAL - 1) + " visitas";

    freeBadge.style.display = visitas >= TOTAL ? "inline-flex" : "none";
    if (visitas >= TOTAL) progressText.style.display = "none";
    else progressText.style.display = "block";

    if (countDisplay) countDisplay.textContent = Math.min(visitas, TOTAL);
  }

  window.lcChange = function (delta) {
    visitas = Math.max(0, Math.min(TOTAL, visitas + delta));
    lcRender();
  };

  // Init on DOM ready
  document.addEventListener("DOMContentLoaded", lcRender);
  // Also try immediately in case DOM already loaded
  if (document.readyState !== "loading") lcRender();
})();

/* ═══════════════════════════════════════════════
   SINCRONIZACIÓN CON VERCEL KV
   Lee servicios, horarios y configuración de IA
   desde la API y actualiza el sitio en tiempo real
═══════════════════════════════════════════════ */

(async function bvSync() {
  try {
    const res = await fetch("/api/datos");
    if (!res.ok) return;
    const { ok, datos } = await res.json();
    if (!ok || !datos) return;

    /* ── 1. Actualiza select de servicios en el formulario de reserva ── */
    const sel = document.getElementById("aptServicio");
    if (sel && datos.servicios && datos.servicios.length) {
      const current = sel.value;
      sel.innerHTML = '<option value="">Seleccionar...</option>';
      datos.servicios.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.precio;
        opt.textContent = `${s.nombre} — $${s.precio}`;
        sel.appendChild(opt);
      });
      if (current) sel.value = current;
    }

    /* ── 2. Actualiza select de barberos en el formulario ── */
    const selBrb = document.getElementById("aptBarbero");
    if (selBrb && datos.equipo && datos.equipo.length) {
      selBrb.innerHTML = "<option>Cualquier barbero</option>";
      datos.equipo.forEach((b) => {
        const opt = document.createElement("option");
        opt.textContent = b.nombre;
        selBrb.appendChild(opt);
      });
    }

    /* ── 3. Actualiza horarios en la sección de reserva ── */
    const diasMap = {
      Lunes: 0,
      Martes: 1,
      Miércoles: 2,
      Jueves: 3,
      Viernes: 4,
      Sábado: 5,
      Domingo: 6,
    };
    if (datos.horarios) {
      const hrEls = document.querySelectorAll(".hr");
      datos.horarios.forEach((h) => {
        const idx = diasMap[h.dia];
        if (idx === undefined || !hrEls[idx]) return;
        const htEl = hrEls[idx].querySelector(".ht");
        const hcEl = hrEls[idx].querySelector(".hc");
        if (!h.abierto) {
          if (htEl) {
            htEl.className = "hc";
            htEl.textContent = "Cerrado";
          }
          if (hcEl) hcEl.textContent = "Cerrado";
        } else {
          const txt = `${h.abre.replace(":00", "").replace(/^0/, "")} – ${h.cierra.replace(":00", "").replace(/^0/, "")}`;
          if (htEl) htEl.textContent = txt;
          else if (hcEl) {
            hcEl.className = "ht";
            hcEl.textContent = txt;
          }
        }
      });
    }

    /* ── 4. Actualiza el system prompt de Vazco con servicios reales ── */
    if (datos.servicios && typeof BSC !== "undefined") {
      const serviciosTexto = datos.servicios
        .map(
          (s) =>
            `- ${s.nombre}: $${s.precio} MXN (${s.duracion} min) — ${s.desc}`,
        )
        .join("\n");

      const horariosTexto = datos.horarios
        ? datos.horarios
            .map((h) =>
              h.abierto
                ? `- ${h.dia}: ${h.abre} – ${h.cierra}`
                : `- ${h.dia}: Cerrado`,
            )
            .join("\n")
        : "";

      const equipoTexto = datos.equipo
        ? datos.equipo
            .map((b) => `- ${b.nombre} (${b.rol}): ${b.bio}`)
            .join("\n")
        : "";

      /* Reemplaza las secciones dinámicas en el SYSTEM prompt */
      BSC.SYSTEM = BSC.SYSTEM.replace(
        /SERVICIOS Y PRECIOS:[\s\S]*?(?=\nHORARIOS:)/,
        `SERVICIOS Y PRECIOS:\n${serviciosTexto}\n\n`,
      )
        .replace(
          /HORARIOS:[\s\S]*?(?=\nEQUIPO)/,
          `HORARIOS:\n${horariosTexto}\n\n`,
        )
        .replace(
          /EQUIPO[\s\S]*?(?=\nRESERVAS:)/,
          `EQUIPO (barberos):\n${equipoTexto}\n\n`,
        );
    }

    /* ── 5. Actualiza respuestas offline de Vazco ── */
    if (datos.servicios && typeof BSC !== "undefined" && BSC.RESP) {
      const svcs = datos.servicios;

      /* Lista completa de servicios */
      const listaHtml = svcs
        .map((s) => `✂️ <b>${s.nombre}</b> — $${s.precio} · ${s.duracion} min`)
        .join("<br>");

      BSC.RESP.precios = [
        `Los precios son directos, sin sorpresas:<br><br>${listaHtml}<br><br>¿Alguno te llama la atención?`,
      ];
      BSC.RESP.servicios = [
        `En Barbería Vázquez manejamos:<br><br>${listaHtml}<br><br>¿Cuál te interesa?`,
      ];
    }

    /* ── 6. Actualiza mensaje de bienvenida y quick buttons de Vazco ── */
    if (datos.ia) {
      if (datos.ia.bienvenida && typeof BSC !== "undefined") {
        BSC._bienvenida = datos.ia.bienvenida;
      }
      if (datos.ia.quickBtns) {
        const qEl = document.getElementById("bscQuick");
        if (qEl) {
          qEl.innerHTML = "";
          datos.ia.quickBtns.forEach((q) => {
            const btn = document.createElement("button");
            btn.className = "bsc-q-btn";
            btn.textContent = q;
            btn.onclick = () => bscQuick(q);
            qEl.appendChild(btn);
          });
        }
      }
    }
  } catch (e) {
    console.warn("bvSync: no se pudo sincronizar con la API", e);
  }
})();
