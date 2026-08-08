document.querySelectorAll(".scroll-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Pega aquí la URL /exec de tu aplicación web de Apps Script después de desplegarla.
// Mientras esté vacía, la web conserva los últimos valores visibles.
// Reloj visible del portal. Usa siempre la zona horaria de Venezuela.
const actualizarFechaHora = () => {
  const nodo = document.getElementById("fecha-hora-actual");
  if (!nodo) return;

  const ahora = new Date();
  const fecha = new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ahora);
  const hora = new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(ahora);

  nodo.textContent = `${fecha} · ${hora}`;
};

actualizarFechaHora();
window.setInterval(actualizarFechaHora, 1000);

const ENDPOINT_PRESUPUESTO = "https://script.google.com/macros/s/AKfycbyM3Z3dYBaQcaKEdn588WaTM7wKp_8zE9KHqNciKmfNoqFx76-9TtV8EjHvx8OyVtrG9w/exec";
const usd = (valor) => `$${Number(valor).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const bs = (valor) => `Bs. ${Number(valor).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const poner = (id, valor) => { const nodo = document.getElementById(id); if (nodo) nodo.textContent = valor; };

if (ENDPOINT_PRESUPUESTO) {
  fetch(`${ENDPOINT_PRESUPUESTO}?t=${Date.now()}`)
    .then((respuesta) => respuesta.json())
    .then((datos) => {
      if (datos.error) throw new Error(datos.error);
      poner("cuota-usd", usd(datos.cuotaUsd)); poner("cuota-bs", bs(datos.cuotaBs));
      poner("tasa-bcv", `Tasa BCV: ${bs(datos.tasaBcv)}/$`);
      poner("tasa-bcv-card", `${bs(datos.tasaBcv)}/$`);
      poner("presupuesto-usd", usd(datos.totalUsd)); poner("presupuesto-bs", `${bs(datos.totalBs)} · Actualizado desde Sheets`);
      poner("cuota-usd-resumen", usd(datos.cuotaUsd)); poner("cuota-bs-resumen", `${bs(datos.cuotaBs)} por apartamento`);
      poner("total-presupuesto", `${usd(datos.totalUsd)} · ${bs(datos.totalBs)}`);
      poner("porcentaje-cobrado", `${datos.porcentajeCobrado}%`);
      poner("pagos-aprobados", datos.pagosAprobados === 1 ? "1 pago aprobado" : `${datos.pagosAprobados} pagos aprobados`);
      const listaGastos = document.querySelector(".expenses");
      if (listaGastos && Array.isArray(datos.gastos)) {
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
    .catch(() => console.warn("No se pudo actualizar el presupuesto desde Google Sheets."));
}
