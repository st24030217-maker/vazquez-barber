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
- Corte Clásico: $180 MXN — corte tradicional con acabado impecable (45 min)
- Corte + Afeitado: $280 MXN — corte premium + afeitado con navaja caliente (75 min)
- Diseño de Barba: $150 MXN — perfilado y diseño profesional (30 min)
- Experiencia VIP: $450 MXN — corte + afeitado + tratamiento + bebida de bienvenida (120 min)
- Color & Mechas: desde $350 MXN — consultar disponibilidad (90+ min)

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
          "¡Bienvenido a Barbería Vázquez! Soy Vazco, tu asistente. ¿En qué puedo ayudarte hoy?",
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

/* ── RESPUESTAS OFFLINE — sin servidor ni API ── */
const BSC_RESPUESTAS = [
  {
    claves: [
      "horario",
      "hora",
      "abierto",
      "abren",
      "cierran",
      "cuando",
      "horarios",
      "días",
      "dias",
      "schedule",
    ],
    resp: [
      "Nuestros horarios son:<br><br>🗓 <b>Lunes a Viernes:</b> 9:00 AM – 8:00 PM<br>🗓 <b>Sábados:</b> 9:00 AM – 6:00 PM<br>🗓 <b>Domingos:</b> 10:00 AM – 3:00 PM<br><br>¿Te gustaría agendar una cita?",
    ],
  },
  {
    claves: [
      "precio",
      "cuesta",
      "costo",
      "cobran",
      "vale",
      "cuanto",
      "tarifas",
      "precios",
    ],
    resp: [
      "Nuestros precios son:<br><br>✂️ <b>Corte Clásico:</b> $180 MXN (45 min)<br>✂️ <b>Corte + Afeitado:</b> $280 MXN (75 min)<br>💈 <b>Diseño de Barba:</b> $150 MXN (30 min)<br>⭐ <b>Experiencia VIP:</b> $450 MXN (120 min)<br>🎨 <b>Color & Mechas:</b> desde $350 MXN<br><br>¿Te interesa algún servicio en particular?",
    ],
  },
  {
    claves: [
      "servicio",
      "servicios",
      "ofrecen",
      "hacen",
      "corte",
      "afeitado",
      "barba",
      "color",
      "mechas",
      "vip",
      "tratamiento",
    ],
    resp: [
      "Ofrecemos los siguientes servicios:<br><br>✂️ Corte Clásico — $180 MXN<br>✂️ Corte + Afeitado — $280 MXN<br>💈 Diseño de Barba — $150 MXN<br>⭐ Experiencia VIP — $450 MXN<br>🎨 Color & Mechas — desde $350 MXN<br><br>Todos nuestros servicios incluyen atención personalizada. ¿Quieres saber más de alguno?",
    ],
  },
  {
    claves: [
      "cita",
      "reserva",
      "reservar",
      "agendar",
      "agendo",
      "appointment",
      "turno",
      "disponibilidad",
    ],
    resp: [
      '¡Con gusto te ayudamos a agendar! Puedes reservar tu cita directamente en la sección <b>"Reservar"</b> de nuestro sitio, o contactarnos:<br><br>📞 <b>Teléfono:</b> (871) 518-1769<br>💬 <b>WhatsApp:</b> +52 871 518 1769<br><br>Recomendamos reservar con al menos 24 horas de anticipación. ¿Necesitas algo más?',
    ],
  },
  {
    claves: [
      "ubicacion",
      "ubicación",
      "donde",
      "dirección",
      "direccion",
      "lugar",
      "como llegar",
      "mapa",
      "address",
    ],
    resp: [
      "Nos encontramos en:<br><br>📍 <b>Blvd. Miguel Alemán 520, Villa Jardín</b><br>35168 Lerdo, Dgo.<br><br>Puedes buscarnos en Google Maps como <b>Barbería Vázquez</b>. ¿Te puedo ayudar con algo más?",
    ],
  },
  {
    claves: [
      "telefono",
      "teléfono",
      "whatsapp",
      "contacto",
      "llamar",
      "número",
      "numero",
      "contact",
    ],
    resp: [
      "Puedes contactarnos por:<br><br>📞 <b>Teléfono:</b> (871) 518-1769<br>💬 <b>WhatsApp:</b> +52 871 518 1769<br>📷 <b>Instagram:</b> @vazquezbarberia<br>👥 <b>Facebook:</b> Barberia Vazquez<br><br>¡Estamos para servirte! ¿Algo más?",
    ],
  },
  {
    claves: [
      "barbero",
      "equipo",
      "quien",
      "quién",
      "rafael",
      "carlos",
      "diego",
      "especialista",
      "maestro",
    ],
    resp: [
      "Nuestro equipo de expertos:<br><br>👨‍💼 <b>Maestro Rafael</b> — 30 años de experiencia, fundador, especialista en cortes clásicos<br>✂️ <b>Carlos Mendoza</b> — especialista en fade y diseños modernos<br>🎨 <b>Diego Reyes</b> — experto en tratamientos capilares y coloración<br><br>¿Con alguno de ellos te gustaría agendar?",
    ],
  },
  {
    claves: [
      "cancelar",
      "cancelación",
      "cancelacion",
      "politica",
      "política",
      "reembolso",
      "cambiar cita",
    ],
    resp: [
      "Nuestra política de cancelación:<br><br>✅ Puedes cancelar sin cargo hasta <b>2 horas antes</b> de tu cita<br>🚶 También aceptamos <b>walk-ins</b> según disponibilidad<br><br>Para cancelar llámanos al (871) 518-1769. ¿Algo más en lo que pueda ayudarte?",
    ],
  },
  {
    claves: ["instagram", "facebook", "redes", "social", "seguir", "ig"],
    resp: [
      "Síguenos en nuestras redes:<br><br>📷 <b>Instagram:</b> @vazquezbarberia<br>👥 <b>Facebook:</b> Barberia Vazquez<br><br>Ahí publicamos nuestros trabajos y promociones especiales. ¿Te puedo ayudar con algo más?",
    ],
  },
  {
    claves: [
      "hola",
      "buenas",
      "buenos dias",
      "buenas tardes",
      "buenas noches",
      "hey",
      "hi",
      "saludos",
      "buen dia",
    ],
    resp: [
      "¡Hola! Bienvenido a <b>Barbería Vázquez</b> 👋<br>Soy Vazco, tu asistente. Puedo ayudarte con información sobre nuestros <b>servicios</b>, <b>horarios</b>, <b>precios</b> o <b>citas</b>.<br><br>¿En qué te puedo ayudar hoy?",
    ],
  },
  {
    claves: [
      "gracias",
      "thank",
      "perfecto",
      "excelente",
      "genial",
      "ok",
      "listo",
      "entendido",
    ],
    resp: [
      "¡Con mucho gusto! 😊 Es un placer atenderte. Si tienes alguna otra pregunta, aquí estaré. ¡Te esperamos en Barbería Vázquez!",
      "¡De nada! Recuerda que puedes contactarnos al (871) 518-1769 si necesitas algo más. ¡Hasta pronto! 💈",
    ],
  },
  {
    claves: ["vip", "especial", "premium", "lujo", "experiencia"],
    resp: [
      "La <b>Experiencia VIP</b> es nuestro servicio más completo:<br><br>⭐ Corte premium<br>⭐ Afeitado con navaja caliente<br>⭐ Tratamiento capilar<br>⭐ Bebida de bienvenida<br><br><b>Precio: $450 MXN · 120 min</b><br><br>¡Una experiencia de lujo completa! ¿Te gustaría agendar?",
    ],
  },
];

const BSC_DEFAULT = [
  "Entiendo tu pregunta. Para información más específica puedes contactarnos directamente:<br><br>📞 <b>(871) 518-1769</b><br>💬 <b>WhatsApp: +52 871 518 1769</b><br><br>¿Puedo ayudarte con algo más como horarios, precios o servicios?",
  "No tengo esa información disponible en este momento. Te recomiendo llamarnos al <b>(871) 518-1769</b> para atención personalizada. ¿Hay algo más en lo que pueda ayudarte?",
  "Para esa consulta específica, lo mejor es contactarnos directamente al <b>WhatsApp +52 871 518 1769</b>. ¡Con gusto te atenemos! ¿Puedo ayudarte con algo más?",
];

function bscResponder(msg) {
  const texto = msg
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita acentos
  for (const grupo of BSC_RESPUESTAS) {
    if (grupo.claves.some((c) => texto.includes(c))) {
      const opts = grupo.resp;
      return opts[Math.floor(Math.random() * opts.length)];
    }
  }
  return BSC_DEFAULT[Math.floor(Math.random() * BSC_DEFAULT.length)];
}

function bscCallAI(userMsg) {
  const typing = bscShowTyping();
  // Simula tiempo de "escritura" para que se sienta natural
  const delay = 600 + Math.random() * 800;
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

// Form
document.getElementById("aptForm").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.style.display = "none";
  document.getElementById("fOk").style.display = "block";
  showToast("Cita confirmada — te contactamos pronto");
});

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
