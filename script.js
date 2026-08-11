// --- MODO OSCURO AUTOMÁTICO ---
const themeToggle = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";
}
themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", newTheme);
});

// --- SCROLL SUAVE ---
document.querySelectorAll(".scroll-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// --- RELOJ EN VIVO ---
const actualizarFechaHora = () => {
  const nodo = document.getElementById("fecha-hora-actual");
  if (!nodo) return;
  const ahora = new Date();
  const fecha = new Intl.DateTimeFormat("es-VE", { timeZone: "America/Caracas", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(ahora);
  const hora = new Intl.DateTimeFormat("es-VE", { timeZone: "America/Caracas", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(ahora);
  nodo.textContent = `${fecha} · ${hora}`;
  nodo.classList.remove("skeleton");
};
actualizarFechaHora();
window.setInterval(actualizarFechaHora, 1000);

// --- CONEXIÓN AL BACKEND ---
const ENDPOINT_PRESUPUESTO = "https://script.google.com/macros/s/AKfycbyM3Z3dYBaQcaKEdn588WaTM7wKp_8zE9KHqNciKmfNoqFx76-9TtV8EjHvx8OyVtrG9w/exec";
const usd = (valor) => `$${Number(valor).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const bs = (valor) => `Bs. ${Number(valor).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const poner = (id, valor) => { 
  const nodo = document.getElementById(id); 
  if (nodo) {
    nodo.textContent = valor; 
    nodo.classList.remove("skeleton");
  }
};

// --- ANIMACIÓN DEL TERMÓMETRO ---
const animarTermometro = (porcentaje) => {
  const anilla = document.querySelector('.progress-ring');
  if (!anilla) return;
  
  // Salud financiera (Colores)
  let progressColor = "var(--mint)";
  if (porcentaje < 40) progressColor = "#ef4444"; // Rojo (Peligro)
  else if (porcentaje < 75) progressColor = "#f59e0b"; // Naranja (Regular)
  
  anilla.style.setProperty('--progress-color', progressColor);
  
  // Rueda animada 3D
  let currentAngle = 0;
  const targetAngle = (porcentaje / 100) * 360;
  const interval = setInterval(() => {
    if(currentAngle >= targetAngle) {
      clearInterval(interval);
    } else {
      currentAngle += 5;
      if(currentAngle > targetAngle) currentAngle = targetAngle;
      anilla.style.setProperty('--progress-angle', `${currentAngle}deg`);
    }
  }, 15);
};

if (ENDPOINT_PRESUPUESTO) {
  fetch(`${ENDPOINT_PRESUPUESTO}?t=${Date.now()}`)
    .then((respuesta) => respuesta.json())
    .then((datos) => {
      if (datos.error) throw new Error(datos.error);
      
      poner("cuota-usd", usd(datos.cuotaUsd)); 
      poner("cuota-bs", bs(datos.cuotaBs));
      poner("tasa-bcv", `Tasa BCV: ${bs(datos.tasaBcv)}/$`);
      poner("tasa-bcv-card", `${bs(datos.tasaBcv)}/$`);
      
      const periodo = String(datos.periodo || "").trim();
      const mes = periodo ? periodo.split(" ")[0].toUpperCase() : "PERÍODO ACTIVO";
      
      poner("periodo-hero", `ADMINISTRACIÓN · ${periodo ? periodo.toUpperCase() : "PERÍODO ACTIVO"}`);
      poner("mes-presupuesto", mes);
      poner("fecha-limite", datos.fechaLimite || "Fecha por definir");
      poner("apartamentos", datos.apartamentos || 0);
      poner("presupuesto-usd", usd(datos.totalUsd)); 
      poner("presupuesto-bs", `${bs(datos.totalBs)} · ${periodo || "Actualizado desde Sheets"}`);
      poner("cuota-usd-resumen", usd(datos.cuotaUsd)); 
      poner("cuota-bs-resumen", `${bs(datos.cuotaBs)} por apartamento`);
      poner("total-presupuesto", `${usd(datos.totalUsd)} · ${bs(datos.totalBs)}`);
      
      const porcentajeReal = parseInt(datos.porcentajeCobrado) || 0;
      poner("porcentaje-cobrado", `${porcentajeReal}%`);
      animarTermometro(porcentajeReal);
      
      poner("pagos-aprobados", datos.pagosAprobados === 1 ? "1 pago aprobado" : `${datos.pagosAprobados} pagos aprobados`);
      
      const listaGastos = document.querySelector(".expenses");
      if (listaGastos && Array.isArray(datos.gastos)) {
        listaGastos.innerHTML = ""; // Limpiar skeletons
        listaGastos.replaceChildren(...datos.gastos.map((gasto) => {
          const fila = document.createElement("div");
          const concepto = document.createElement("span");
          const monto = document.createElement("b");
          concepto.textContent = gasto.concepto;
          monto.textContent = `${usd(gasto.usd)} · ${bs(gasto.bs)}`;
          fila.append(concepto, monto);
          return fila;
        }));
      }
    })
    .catch(() => {
      console.warn("No se pudo actualizar el presupuesto desde Google Sheets.");
      poner("periodo-hero", "ADMINISTRACIÓN · ERROR DE CONEXIÓN");
      poner("mes-presupuesto", "SIN DATOS");
      poner("tasa-bcv", "Tasa BCV: No disponible");
      poner("tasa-bcv-card", "No disponible");
      poner("fecha-limite", "Error de conexión");
      poner("cuota-usd", "Error");
      poner("presupuesto-usd", "Error");
      document.querySelectorAll(".skeleton").forEach(el => el.classList.remove("skeleton"));
    });
}
