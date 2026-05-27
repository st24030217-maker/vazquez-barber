/* ════════════════════════════════════════
   BARBERÍA VÁZQUEZ — ADMIN PANEL JS
════════════════════════════════════════ */

/* ── CREDENCIALES (cámbia a tu gusto) ── */
const ADMIN_CREDS = { user: "admin", pass: "vazquez2024" };

/* ── DATOS INICIALES ── */
const DATOS_INIT = {
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
      precio: 150,
      duracion: 45,
      desc: "Corte de precisión con tijera y máquina, terminado con navaja.",
    },
    {
      id: 2,
      nombre: "Corte + Afeitado",
      precio: 280,
      duracion: 75,
      desc: "Corte premium + afeitado a navaja con toalla caliente.",
    },
    {
      id: 3,
      nombre: "Diseño de Barba",
      precio: 120,
      duracion: 35,
      desc: "Perfilado y diseño profesional de barba.",
    },
    {
      id: 4,
      nombre: "Experiencia VIP",
      precio: 450,
      duracion: 120,
      desc: "Corte + afeitado + tratamiento + bebida de bienvenida.",
    },
    {
      id: 5,
      nombre: "Color & Mechas",
      precio: 350,
      duracion: 90,
      desc: "Coloración profesional o cobertura de canas.",
    },
    {
      id: 6,
      nombre: "Masaje & Facial",
      precio: 200,
      duracion: 50,
      desc: "Tratamiento facial revitalizante con masaje de cuero cabelludo.",
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

/* ── ESTADO ── */
let DATOS =
  JSON.parse(localStorage.getItem("bv_admin_datos") || "null") ||
  JSON.parse(JSON.stringify(DATOS_INIT));
let editSvcId = null;
let editBrbId = null;

function guardar() {
  localStorage.setItem("bv_admin_datos", JSON.stringify(DATOS));
}

/* ══════════════════════════
   LOGIN
══════════════════════════ */
function adminOpenLogin() {
  document.getElementById("adminLoginModal").classList.add("open");
  document.getElementById("adminUser").focus();
  document.getElementById("adminLoginErr").textContent = "";
  document.getElementById("adminUser").value = "";
  document.getElementById("adminPass").value = "";
}

function adminCloseLogin(e) {
  if (
    !e ||
    e.target === document.getElementById("adminLoginModal") ||
    e.target.classList.contains("adm-login-x")
  ) {
    document.getElementById("adminLoginModal").classList.remove("open");
  }
}

function adminDoLogin() {
  const u = document.getElementById("adminUser").value.trim();
  const p = document.getElementById("adminPass").value;
  if (u === ADMIN_CREDS.user && p === ADMIN_CREDS.pass) {
    document.getElementById("adminLoginModal").classList.remove("open");
    document.getElementById("adminPanel").classList.add("open");
    admInjectBottomNav();
    // Ocultar nav y menú móvil del sitio principal
    const siteNav = document.getElementById("nav");
    const siteMob = document.getElementById("mob");
    if (siteNav) siteNav.style.display = "none";
    if (siteMob) siteMob.style.display = "none";
    admRenderAll();
    document.getElementById("admDate").textContent =
      new Date().toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
  } else {
    document.getElementById("adminLoginErr").textContent =
      "Credenciales incorrectas. Intenta de nuevo.";
    document.getElementById("adminPass").value = "";
    document.getElementById("adminPass").focus();
  }
}

function adminClosePanel() {
  document.getElementById("adminPanel").classList.remove("open");
  document.getElementById("admSidebar").classList.remove("open");
  document.getElementById("admOverlay").classList.remove("open");
  // Restaurar nav y menú móvil del sitio principal
  const siteNav = document.getElementById("nav");
  const siteMob = document.getElementById("mob");
  if (siteNav) siteNav.style.display = "";
  if (siteMob) siteMob.style.display = "";
}

/* ══════════════════════════
   NAVEGACIÓN SIDEBAR
══════════════════════════ */
function admGoto(el) {
  const pageId = el.getAttribute("data-page");
  admGotoById(pageId);
  // sidebar item active
  document
    .querySelectorAll(".adm-sb-item")
    .forEach((i) => i.classList.remove("active"));
  el.classList.add("active");
  // close mobile sidebar
  document.getElementById("admSidebar").classList.remove("open");
  document.getElementById("admOverlay").classList.remove("open");
}

function admGotoById(pageId) {
  document
    .querySelectorAll(".adm-page")
    .forEach((p) => p.classList.remove("active"));
  const target = document.getElementById(pageId);
  if (target) target.classList.add("active");
  // sync sidebar highlight
  document.querySelectorAll(".adm-sb-item").forEach((i) => {
    i.classList.toggle("active", i.getAttribute("data-page") === pageId);
  });
}

function admToggleSidebar() {
  document.getElementById("admSidebar").classList.toggle("open");
  document.getElementById("admOverlay").classList.toggle("open");
}

/* ══════════════════════════
   RENDER ALL
══════════════════════════ */
function admRenderAll() {
  admRenderHorarios();
  admRenderServicios();
  admRenderEquipo();
  admRenderIA();
  admRenderCitas();
  admUpdateDashCitas();
}

/* ══════════════════════════
   HORARIOS
══════════════════════════ */
function admRenderHorarios() {
  const container = document.getElementById("admHorariosRows");
  container.innerHTML = "";
  DATOS.horarios.forEach((h, idx) => {
    const row = document.createElement("div");
    row.className = "adm-hor-row";
    row.innerHTML = `
      <div class="adm-hor-day">${h.dia}</div>
      <div>
        <label class="adm-form-label" style="margin-bottom:.3rem">Apertura</label>
        <input class="adm-form-input" type="time" value="${h.abre}" data-idx="${idx}" data-field="abre" ${!h.abierto ? "disabled" : ""} style="${!h.abierto ? "opacity:.35" : ""}" />
      </div>
      <div>
        <label class="adm-form-label" style="margin-bottom:.3rem">Cierre</label>
        <input class="adm-form-input" type="time" value="${h.cierra}" data-idx="${idx}" data-field="cierra" ${!h.abierto ? "disabled" : ""} style="${!h.abierto ? "opacity:.35" : ""}" />
      </div>
      <div class="adm-toggle-wrap" style="flex-direction:column;align-items:center;gap:.3rem">
        <label class="adm-form-label" style="margin:0;font-size:.58rem">Abierto</label>
        <label class="adm-toggle">
          <input type="checkbox" ${h.abierto ? "checked" : ""} data-idx="${idx}" onchange="admToggleHorario(this)" />
          <div class="adm-toggle-track"></div>
          <div class="adm-toggle-thumb"></div>
        </label>
      </div>
    `;
    // time input change
    row.querySelectorAll("input[type=time]").forEach((inp) => {
      inp.addEventListener("change", (e) => {
        DATOS.horarios[e.target.dataset.idx][e.target.dataset.field] =
          e.target.value;
      });
    });
    container.appendChild(row);
  });
}

function admToggleHorario(cb) {
  const idx = parseInt(cb.dataset.idx);
  DATOS.horarios[idx].abierto = cb.checked;
  admRenderHorarios();
}

function admSaveHorarios() {
  guardar();
  admToast("Horarios guardados correctamente");
}

/* ══════════════════════════
   SERVICIOS
══════════════════════════ */
function admRenderServicios() {
  const list = document.getElementById("admServiciosList");
  list.innerHTML = "";
  DATOS.servicios.forEach((s) => {
    const el = document.createElement("div");
    el.className = "adm-svc-item";
    el.innerHTML = `
      <div class="adm-svc-info">
        <div class="adm-svc-name">${s.nombre}</div>
        <div class="adm-svc-meta">$${s.precio} MXN &nbsp;·&nbsp; ${s.duracion} min &nbsp;·&nbsp; ${s.desc.slice(0, 60)}${s.desc.length > 60 ? "…" : ""}</div>
      </div>
      <div class="adm-svc-actions">
        <button class="adm-btn adm-btn-ghost adm-btn-sm" onclick="admEditSvc(${s.id})">Editar</button>
        <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="admDeleteSvc(${s.id})">Eliminar</button>
      </div>
    `;
    list.appendChild(el);
  });
}

function admAddServicio() {
  editSvcId = null;
  document.getElementById("admSvcModalTitle").textContent = "Nuevo Servicio";
  document.getElementById("svcNombre").value = "";
  document.getElementById("svcPrecio").value = "";
  document.getElementById("svcDuracion").value = "";
  document.getElementById("svcDesc").value = "";
  document.getElementById("admSvcModal").classList.add("open");
  document.getElementById("svcNombre").focus();
}

function admEditSvc(id) {
  const s = DATOS.servicios.find((x) => x.id === id);
  if (!s) return;
  editSvcId = id;
  document.getElementById("admSvcModalTitle").textContent = "Editar Servicio";
  document.getElementById("svcNombre").value = s.nombre;
  document.getElementById("svcPrecio").value = s.precio;
  document.getElementById("svcDuracion").value = s.duracion;
  document.getElementById("svcDesc").value = s.desc;
  document.getElementById("admSvcModal").classList.add("open");
}

function admDeleteSvc(id) {
  if (!confirm("¿Eliminar este servicio?")) return;
  DATOS.servicios = DATOS.servicios.filter((x) => x.id !== id);
  guardar();
  admRenderServicios();
  admToast("Servicio eliminado");
}

function admSaveSvc() {
  const nombre = document.getElementById("svcNombre").value.trim();
  const precio = parseInt(document.getElementById("svcPrecio").value);
  const duracion = parseInt(document.getElementById("svcDuracion").value);
  const desc = document.getElementById("svcDesc").value.trim();
  if (!nombre || !precio || !duracion) {
    alert("Completa todos los campos obligatorios");
    return;
  }
  if (editSvcId) {
    const s = DATOS.servicios.find((x) => x.id === editSvcId);
    Object.assign(s, { nombre, precio, duracion, desc });
    admToast("Servicio actualizado");
  } else {
    const newId = Math.max(0, ...DATOS.servicios.map((x) => x.id)) + 1;
    DATOS.servicios.push({ id: newId, nombre, precio, duracion, desc });
    admToast("Servicio creado");
  }
  guardar();
  admRenderServicios();
  admCloseSvcModal();
}

function admCloseSvcModal(e) {
  if (
    !e ||
    e.target === document.getElementById("admSvcModal") ||
    e.target.classList.contains("adm-modal-x")
  ) {
    document.getElementById("admSvcModal").classList.remove("open");
  }
}

/* ══════════════════════════
   EQUIPO
══════════════════════════ */
function admRenderEquipo() {
  const list = document.getElementById("admEquipoList");
  list.innerHTML = "";
  DATOS.equipo.forEach((b) => {
    const initials = b.nombre
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("");
    const el = document.createElement("div");
    el.className = "adm-team-card";
    el.innerHTML = `
      <div class="adm-team-avatar">${initials}</div>
      <div class="adm-team-info">
        <div class="adm-team-name">${b.nombre}</div>
        <div class="adm-team-role">${b.rol}</div>
        <div class="adm-team-bio">${b.bio}</div>
        <div class="adm-team-tags">${b.tags.map((t) => `<span class="adm-team-tag">${t}</span>`).join("")}</div>
      </div>
      <div class="adm-team-actions">
        <button class="adm-btn adm-btn-ghost adm-btn-sm" onclick="admEditBrb(${b.id})">Editar</button>
        <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="admDeleteBrb(${b.id})">Eliminar</button>
      </div>
    `;
    list.appendChild(el);
  });
}

function admAddBarbero() {
  editBrbId = null;
  document.getElementById("admBrbModalTitle").textContent = "Nuevo Barbero";
  document.getElementById("brbNombre").value = "";
  document.getElementById("brbRol").value = "";
  document.getElementById("brbBio").value = "";
  document.getElementById("brbTags").value = "";
  document.getElementById("admBrbModal").classList.add("open");
  document.getElementById("brbNombre").focus();
}

function admEditBrb(id) {
  const b = DATOS.equipo.find((x) => x.id === id);
  if (!b) return;
  editBrbId = id;
  document.getElementById("admBrbModalTitle").textContent = "Editar Barbero";
  document.getElementById("brbNombre").value = b.nombre;
  document.getElementById("brbRol").value = b.rol;
  document.getElementById("brbBio").value = b.bio;
  document.getElementById("brbTags").value = b.tags.join(", ");
  document.getElementById("admBrbModal").classList.add("open");
}

function admDeleteBrb(id) {
  if (!confirm("¿Eliminar a este barbero?")) return;
  DATOS.equipo = DATOS.equipo.filter((x) => x.id !== id);
  guardar();
  admRenderEquipo();
  admToast("Barbero eliminado");
}

function admSaveBrb() {
  const nombre = document.getElementById("brbNombre").value.trim();
  const rol = document.getElementById("brbRol").value.trim();
  const bio = document.getElementById("brbBio").value.trim();
  const tags = document
    .getElementById("brbTags")
    .value.split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (!nombre || !rol) {
    alert("Nombre y rol son obligatorios");
    return;
  }
  if (editBrbId) {
    const b = DATOS.equipo.find((x) => x.id === editBrbId);
    Object.assign(b, { nombre, rol, bio, tags });
    admToast("Barbero actualizado");
  } else {
    const newId = Math.max(0, ...DATOS.equipo.map((x) => x.id)) + 1;
    DATOS.equipo.push({ id: newId, nombre, rol, bio, tags });
    admToast("Barbero agregado");
  }
  guardar();
  admRenderEquipo();
  admCloseBrbModal();
}

function admCloseBrbModal(e) {
  if (
    !e ||
    e.target === document.getElementById("admBrbModal") ||
    e.target.classList.contains("adm-modal-x")
  ) {
    document.getElementById("admBrbModal").classList.remove("open");
  }
}

/* ══════════════════════════
   NEGOCIO
══════════════════════════ */
function admSaveNegocio() {
  if (!DATOS.negocio) DATOS.negocio = {};
  DATOS.negocio.nombre = document.getElementById("negNombre").value;
  DATOS.negocio.direccion = document.getElementById("negDireccion").value;
  DATOS.negocio.telefono = document.getElementById("negTelefono").value;
  DATOS.negocio.whatsapp = document.getElementById("negWhatsapp").value;
  DATOS.negocio.ig = document.getElementById("negIg").value;
  DATOS.negocio.fb = document.getElementById("negFb").value;
  DATOS.negocio.email = document.getElementById("negEmail").value;
  DATOS.negocio.slogan = document.getElementById("negSlogan").value;
  DATOS.negocio.anticipacion = document.getElementById("negAnticipacion").value;
  DATOS.negocio.cancelacion = document.getElementById("negCancelacion").value;
  DATOS.negocio.politica = document.getElementById("negPolitica").value;
  guardar();
  admToast("Información del negocio guardada");
}

/* ══════════════════════════
   ASISTENTE IA
══════════════════════════ */
function admRenderIA() {
  const d = DATOS.ia;
  document.getElementById("iaNombre").value = d.nombre || "Vazco";
  document.getElementById("iaTono").value = d.tono || "profesional y amigable";
  document.getElementById("iaBienvenida").value = d.bienvenida || "";
  // system prompt from BSC
  document.getElementById("iaSystemPrompt").value =
    typeof BSC !== "undefined" ? BSC.SYSTEM : "";
  admRenderQuickBtns();
}

function admRenderQuickBtns() {
  const container = document.getElementById("iaQuickBtns");
  container.innerHTML = "";
  (DATOS.ia.quickBtns || []).forEach((btn, idx) => {
    const row = document.createElement("div");
    row.className = "adm-quick-row";
    row.innerHTML = `
      <input class="adm-form-input" value="${btn}" onchange="DATOS.ia.quickBtns[${idx}]=this.value" />
      <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="admRemoveQuickBtn(${idx})">✕</button>
    `;
    container.appendChild(row);
  });
}

function admAddQuickBtn() {
  DATOS.ia.quickBtns.push("Nueva pregunta rápida");
  admRenderQuickBtns();
}

function admRemoveQuickBtn(idx) {
  DATOS.ia.quickBtns.splice(idx, 1);
  admRenderQuickBtns();
}

function admSaveIA() {
  DATOS.ia.nombre = document.getElementById("iaNombre").value;
  DATOS.ia.tono = document.getElementById("iaTono").value;
  DATOS.ia.bienvenida = document.getElementById("iaBienvenida").value;
  const newPrompt = document.getElementById("iaSystemPrompt").value;
  // actualiza el system prompt del chatbot en vivo
  if (typeof BSC !== "undefined") {
    BSC.SYSTEM = newPrompt;
  }
  // actualiza botones rápidos del chat
  const bscQuickEl = document.getElementById("bscQuick");
  if (bscQuickEl) {
    bscQuickEl.innerHTML = "";
    (DATOS.ia.quickBtns || []).forEach((q) => {
      const btn = document.createElement("button");
      btn.className = "bsc-q-btn";
      btn.textContent = q;
      btn.onclick = () => bscQuick(q);
      bscQuickEl.appendChild(btn);
    });
  }
  // actualiza mensaje de bienvenida en próxima apertura del chat
  if (typeof BSC !== "undefined") {
    BSC._bienvenida = DATOS.ia.bienvenida;
    BSC.history = []; // reset para que use el nuevo saludo
  }
  guardar();
  admToast("Configuración del asistente guardada");
}

/* ══════════════════════════
   CITAS
══════════════════════════ */
function admRenderCitas() {
  const container = document.getElementById("admCitasTable");
  const filtro = document.getElementById("citasFiltro")?.value || "";
  const todasCitas = DATOS.citas || [];
  const citas = filtro
    ? todasCitas.filter((c) => c.estado === filtro)
    : todasCitas;

  if (todasCitas.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:3rem 0;color:var(--gray-mid);font-size:.85rem">Aún no hay citas registradas. Las reservaciones del formulario aparecerán aquí.</div>`;
    return;
  }
  if (citas.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:3rem 0;color:var(--gray-mid);font-size:.85rem">No hay citas con el estado seleccionado.</div>`;
    return;
  }

  const estadoColor = {
    Pendiente: "background:rgba(201,168,76,.18);color:var(--gold-light)",
    Confirmada: "background:rgba(60,179,113,.18);color:#6ed9a0",
    Completada: "background:rgba(100,149,237,.18);color:#93b8f5",
    Cancelada: "background:rgba(200,80,80,.18);color:#f08080",
  };

  function fmtFecha(iso) {
    if (!iso || iso === "—") return "—";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    const meses = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];
    return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`;
  }

  let html = `<table class="adm-table"><thead><tr>
    <th>Cliente</th><th>Servicio</th><th>Barbero</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Notas</th><th></th>
  </tr></thead><tbody>`;

  citas.forEach((c) => {
    // obtener índice real en DATOS.citas para operaciones
    const realIdx = todasCitas.indexOf(c);
    const estados = ["Pendiente", "Confirmada", "Completada", "Cancelada"];
    const estadoStyle = estadoColor[c.estado] || estadoColor.Pendiente;
    const notasTxt = c.notas
      ? `<span title="${c.notas.replace(/"/g, "&quot;")}" style="cursor:help;border-bottom:1px dashed var(--gray-mid)">Ver nota</span>`
      : `<span style="color:var(--gray-mid)">—</span>`;

    html += `<tr>
      <td style="color:var(--cream)">
        <div style="font-weight:500">${c.nombre}</div>
        <div style="font-size:.72rem;color:var(--gray-light);margin-top:.15rem">${c.telefono || ""}</div>
      </td>
      <td style="font-size:.8rem">${c.servicio || "—"}</td>
      <td style="font-size:.8rem">${c.barbero || "Cualquiera"}</td>
      <td style="font-size:.8rem">${fmtFecha(c.fecha)}</td>
      <td style="font-size:.8rem">${c.hora || "—"}</td>
      <td>
        <select class="adm-form-select" style="padding:.3rem .6rem;font-size:.72rem;width:auto;${estadoStyle};border:none;border-radius:4px" onchange="admCambiarEstado(${realIdx},this.value)">
          ${estados.map((e) => `<option value="${e}" ${c.estado === e ? "selected" : ""}>${e}</option>`).join("")}
        </select>
      </td>
      <td style="font-size:.8rem">${notasTxt}</td>
      <td><button class="adm-btn adm-btn-danger adm-btn-sm" onclick="admDeleteCita(${realIdx})" title="Eliminar cita">✕</button></td>
    </tr>`;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function admCambiarEstado(idx, estado) {
  DATOS.citas[idx].estado = estado;
  guardar();
  admUpdateDashCitas();
  admRenderCitas();
  admToast("Estado actualizado");
}

function admDeleteCita(idx) {
  if (!confirm("¿Eliminar esta cita?")) return;
  DATOS.citas.splice(idx, 1);
  guardar();
  admRenderCitas();
  admUpdateDashCitas();
  admToast("Cita eliminada");
}

function admClearCitas() {
  if (!confirm("¿Limpiar todas las citas?")) return;
  DATOS.citas = [];
  guardar();
  admRenderCitas();
  admUpdateDashCitas();
  admToast("Citas borradas");
}

/* ══════════════════════════
   DASHBOARD — STATS CITAS
══════════════════════════ */
function admUpdateDashCitas() {
  const citas = DATOS.citas || [];
  const total = citas.length;
  const pendientes = citas.filter((c) => c.estado === "Pendiente").length;
  const hoy = new Date().toISOString().split("T")[0];
  const citasHoy = citas.filter((c) => c.fecha === hoy).length;

  const elTotal = document.getElementById("dashCitasTotal");
  const elPend = document.getElementById("dashCitasPendientes");
  const elHoy = document.getElementById("dashCitasHoy");
  if (elTotal) elTotal.textContent = total;
  if (elPend) elPend.textContent = pendientes + " pendientes";
  if (elHoy) elHoy.textContent = citasHoy + " hoy";

  // Badge en sidebar
  const badge = document.getElementById("sbCitasBadge");
  if (badge) {
    if (pendientes > 0) {
      badge.textContent = pendientes;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }
}

/* ══════════════════════════
   INTERCEPTAR FORMULARIO
   para registrar citas
══════════════════════════ */
window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("aptForm");
  if (form) {
    // Escuchar submit y guardar en DATOS.citas usando IDs de campo
    form.addEventListener(
      "submit",
      (e) => {
        const cita = {
          nombre: document.getElementById("aptNombre")?.value?.trim() || "—",
          telefono:
            document.getElementById("aptTelefono")?.value?.trim() || "—",
          servicio: document.getElementById("aptServicio")?.value || "—",
          barbero:
            document.getElementById("aptBarbero")?.value || "Cualquier barbero",
          fecha: document.getElementById("dateIn")?.value || "—",
          hora: document.getElementById("aptHora")?.value || "—",
          notas: document.getElementById("aptNotas")?.value?.trim() || "",
          estado: "Pendiente",
          timestamp: new Date().toISOString(),
          id: Date.now(),
        };
        if (!DATOS.citas) DATOS.citas = [];
        DATOS.citas.unshift(cita);
        guardar();
        admUpdateDashCitas();
      },
      true,
    ); // capture=true para correr ANTES del submit handler del main
  }
});

/* ══════════════════════════
   TOAST
══════════════════════════ */
function admToast(msg) {
  const t = document.getElementById("admToast");
  document.getElementById("admToastMsg").textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3500);
}

/* ══════════════════════════
   KEYBOARD ESC
══════════════════════════ */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    adminCloseLogin();
    admCloseSvcModal();
    admCloseBrbModal();
  }
});

/* ════════════════════════════════════════
   NOTIFICACIONES PUSH
════════════════════════════════════════ */

/* Estado de notificaciones en memoria */
const NOTIF = {
  subs: [], // suscriptores (objetos PushSubscription)
  history: [], // historial de envíos
  sentToday: 0,
};

const NOTIF_TPLS = {
  horario: {
    title: "Cambio de horario",
    body: "Hemos actualizado nuestros horarios de atención. ¡Consúltalos en nuestro sitio!",
    icon: "clock",
  },
  promo: {
    title: "¡Promoción especial! 🎉",
    body: "Esta semana tenemos un descuento especial en servicios seleccionados. ¡No te lo pierdas!",
    icon: "gift",
  },
  nuevo: {
    title: "Nuevo servicio disponible ✂️",
    body: "Acabamos de agregar un nuevo servicio a nuestro catálogo. ¡Visítanos para conocerlo!",
    icon: "scissors",
  },
  cierre: {
    title: "Aviso de cierre temporal",
    body: "La barbería estará cerrada temporalmente. Disculpa los inconvenientes, ¡pronto regresamos!",
    icon: "alert",
  },
  recordatorio: {
    title: "Recuerda tu cita ⭐",
    body: "Tu próxima visita a Barbería Vázquez se acerca. ¡Te esperamos con gusto!",
    icon: "star",
  },
};

/* ── Registrar Service Worker ── */
async function pushInit() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    admUpdateNotifStatus("No soportado", false);
    return;
  }
  try {
    const reg = await navigator.serviceWorker.register("sw.js");
    window._swReg = reg;
    admUpdateNotifStatus("Listo", true);
    admUpdatePermStatus();
  } catch (err) {
    admUpdateNotifStatus("Error SW", false);
  }
}

function admUpdateNotifStatus(text, ok) {
  const el = document.getElementById("admNotifStatus");
  if (!el) return;
  el.textContent = "● " + text;
  el.style.color = ok ? "#7ecb96" : "#e07070";
}

function admUpdatePermStatus() {
  const el = document.getElementById("admPermStatus");
  if (!el) return;
  const perm = Notification.permission;
  const map = {
    granted: "✅ Concedido",
    denied: "❌ Bloqueado",
    default: "⏳ Pendiente",
  };
  el.textContent = map[perm] || perm;
  el.style.fontSize = ".85rem";
}

/* ── Solicitar permiso (desde sitio público) ── */
window.pushRequestPermission = async function () {
  if (isIOS() && !isIOSPWA()) {
    pushDismiss();
    return;
  }
  if (!window._swReg) {
    try {
      const reg = await navigator.serviceWorker.register("sw.js");
      window._swReg = reg;
      await navigator.serviceWorker.ready;
    } catch (e) {
      console.warn("SW error:", e);
    }
  }
  let result;
  try {
    result = await Notification.requestPermission();
  } catch {
    result = await new Promise((resolve) =>
      Notification.requestPermission(resolve),
    );
  }
  if (result === "granted") {
    pushSubscribe();
    pushDismiss();
    typeof showToast === "function" && showToast("Notificaciones activadas!");
  } else {
    pushDismiss();
  }
};

async function pushSubscribe() {
  if (!window._swReg) return;
  try {
    // En producción real usarías VAPID keys. Aquí simulamos la suscripción.
    const sub = await window._swReg.pushManager.subscribe({
      userVisibleOnly: true,
      // VAPID key placeholder — reemplazar con clave real al subir a servidor
      applicationServerKey: urlBase64ToUint8Array(
        "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjZkV8-Ls0EhEGYB_bA-FkFX_Glgo",
      ),
    });
    NOTIF.subs.push(sub);
    admUpdateSubCount();
  } catch (e) {
    // En file:// no funciona pushManager.subscribe, se muestra igual la UI
    console.log("Push subscribe (demo mode):", e.message);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function admUpdateSubCount() {
  const el = document.getElementById("admSubCount");
  if (el) el.textContent = NOTIF.subs.length;
}

/* ── Cargar plantilla ── */
window.admLoadTpl = function (key) {
  const t = NOTIF_TPLS[key];
  if (!t) return;
  document.getElementById("notifTitle").value = t.title;
  document.getElementById("notifBody").value = t.body;
  document.getElementById("notifIcon").value = t.icon;
  admToast("Plantilla cargada");
};

/* ── Probar notificación (local) ── */
window.admTestNotif = async function () {
  const title = document.getElementById("notifTitle").value.trim();
  const body = document.getElementById("notifBody").value.trim();
  const icon = document.getElementById("notifIcon").value;
  if (!title || !body) {
    alert("Escribe título y mensaje");
    return;
  }

  const iconMap = {
    clock: "🕐",
    scissors: "✂️",
    gift: "🎁",
    star: "⭐",
    alert: "🔔",
  };
  const perm = await Notification.requestPermission();
  if (perm !== "granted") {
    admToast("Permiso de notificaciones denegado");
    return;
  }

  new Notification((iconMap[icon] || "🔔") + " " + title, {
    body,
    icon: "logo.png",
  });
  admToast("Notificación de prueba enviada");
};

/* ── Enviar a todos los suscritos ── */
window.admSendNotif = async function () {
  const title = document.getElementById("notifTitle").value.trim();
  const body = document.getElementById("notifBody").value.trim();
  const icon = document.getElementById("notifIcon").value;
  if (!title || !body) {
    admToast("Escribe título y mensaje primero");
    return;
  }

  const iconMap = {
    clock: "🕐",
    scissors: "✂️",
    gift: "🎁",
    star: "⭐",
    alert: "🔔",
  };

  const emoji = iconMap[icon] || "🔔";
  admToast("Enviando notificación...");

  try {
    const res = await fetch("/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: emoji + " " + title, body, icon }),
    });

    const data = await res.json();

    if (data.success) {
      const entry = {
        title,
        body,
        icon,
        ts: new Date().toLocaleString("es-MX", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        subs: data.recipients || 0,
      };
      NOTIF.history.unshift(entry);
      NOTIF.sentToday++;
      document.getElementById("admSentToday").textContent = NOTIF.sentToday;
      admRenderNotifHistory();
      admToast("✅ Enviada a " + (data.recipients || 0) + " suscriptor(es)");
      document.getElementById("notifTitle").value = "";
      document.getElementById("notifBody").value = "";
    } else {
      admToast("❌ Error: " + (data.error || "desconocido"));
    }
  } catch (e) {
    console.error(e);
    admToast("❌ Error de conexión");
  }
};

/* ── Historial ── */
function admRenderNotifHistory() {
  const container = document.getElementById("admNotifHistory");
  if (!container) return;
  if (!NOTIF.history.length) {
    container.innerHTML =
      '<div style="text-align:center;padding:2rem 0;color:var(--gray-mid);font-size:.82rem">Aún no se han enviado notificaciones.</div>';
    return;
  }
  const iconMap = {
    clock: "🕐",
    scissors: "✂️",
    gift: "🎁",
    star: "⭐",
    alert: "🔔",
  };
  container.innerHTML = NOTIF.history
    .map(
      (n) => `
    <div class="adm-notif-row">
      <div class="adm-notif-row-icon">${iconMap[n.icon] || "🔔"}</div>
      <div style="flex:1">
        <div class="adm-notif-row-title">${n.title}</div>
        <div class="adm-notif-row-body">${n.body}</div>
        <div class="adm-notif-row-meta">${n.ts} &nbsp;·&nbsp; ${n.subs} suscriptor(es)</div>
      </div>
    </div>
  `,
    )
    .join("");
}

window.admClearNotifHistory = function () {
  if (!confirm("¿Limpiar el historial?")) return;
  NOTIF.history = [];
  NOTIF.sentToday = 0;
  document.getElementById("admSentToday").textContent = "0";
  admRenderNotifHistory();
  admToast("Historial limpiado");
};

/* ── Auto-notificación cuando admin guarda cambios ── */
const _origSaveHorarios = window.admSaveHorarios;
window.admSaveHorarios = function () {
  _origSaveHorarios && _origSaveHorarios();
  admAutoNotif(
    "Cambio de horario",
    "Los horarios de atención han sido actualizados. Consulta los nuevos horarios en nuestro sitio.",
    "clock",
  );
};

const _origSaveNegocio = window.admSaveNegocio;
window.admSaveNegocio = function () {
  _origSaveNegocio && _origSaveNegocio();
  // No auto-notif para info del negocio, podría ser info interna
};

/* Auto-dispara notificación cuando hay cambio relevante */
async function admAutoNotif(title, body, icon) {
  if (Notification.permission !== "granted") return;
  if (!window._swReg) return;
  const iconMap = {
    clock: "🕐",
    scissors: "✂️",
    gift: "🎁",
    star: "⭐",
    alert: "🔔",
  };
  window._swReg.showNotification((iconMap[icon] || "🔔") + " " + title, {
    body,
    icon: "logo.png",
    vibrate: [200, 100, 200],
  });
  const entry = {
    title,
    body,
    icon,
    ts: new Date().toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    }),
    subs: Math.max(NOTIF.subs.length, 1),
  };
  NOTIF.history.unshift(entry);
  NOTIF.sentToday++;
  const sentEl = document.getElementById("admSentToday");
  if (sentEl) sentEl.textContent = NOTIF.sentToday;
  admRenderNotifHistory();
}

/* ── Banner de suscripción en el sitio público ── */
window.pushDismiss = function () {
  const b = document.getElementById("pushBanner");
  if (b) {
    b.classList.remove("show");
  }
};

/* ── Detectar iOS ── */
function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}
function isIOSPWA() {
  return isIOS() && window.navigator.standalone === true;
}

/* Mostrar banner después de 4 segundos si no ha dado permiso */
window.addEventListener("DOMContentLoaded", () => {
  pushInit();
  setTimeout(() => {
    const b = document.getElementById("pushBanner");
    if (!b) return;
    if (isIOS() && !isIOSPWA()) {
      b.classList.add("show");
      const title = b.querySelector(".push-title");
      const sub = b.querySelector(".push-sub");
      const btn = b.querySelector(".push-allow");
      if (title) title.textContent = "Instala la app para recibir avisos";
      if (sub)
        sub.textContent = 'Toca Compartir → "Añadir a inicio" y abre desde ahí';
      if (btn) btn.style.display = "none";
      return;
    }
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      b.classList.add("show");
    }
  }, 4000);
});

/* ── Barra navegación inferior móvil ── */
function admInjectBottomNav() {
  if (document.getElementById("admBottomNav")) return;
  const pages = [
    {
      id: "adm-dashboard",
      label: "Inicio",
      icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    },
    {
      id: "adm-citas",
      label: "Citas",
      icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    },
    {
      id: "adm-servicios",
      label: "Servicios",
      icon: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>',
    },
    {
      id: "adm-equipo",
      label: "Equipo",
      icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    },
    {
      id: "adm-notif",
      label: "Avisos",
      icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    },
  ];
  const nav = document.createElement("div");
  nav.id = "admBottomNav";
  nav.className = "adm-bottom-nav";
  pages.forEach(function (p) {
    var btn = document.createElement("button");
    btn.className = "adm-bottom-nav-item";
    btn.setAttribute("data-page", p.id);
    btn.innerHTML =
      '<svg viewBox="0 0 24 24">' +
      p.icon +
      "</svg><span>" +
      p.label +
      "</span>";
    btn.addEventListener("click", function () {
      admGotoById(p.id);
      nav.querySelectorAll(".adm-bottom-nav-item").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
    });
    nav.appendChild(btn);
  });
  var first = nav.querySelector(".adm-bottom-nav-item");
  if (first) first.classList.add("active");
  document.getElementById("adminPanel").appendChild(nav);
}
