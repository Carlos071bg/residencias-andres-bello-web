// Google Sites a veces no procesa enlaces internos de un bloque incorporado.
// Este controlador fuerza un desplazamiento suave dentro del HTML incrustado.
const formularioPago = document.querySelector("#formulario-pago")?.href;
document.querySelectorAll(".form-link").forEach((link) => {
  if (formularioPago) {
    link.href = formularioPago;
    link.target = "_blank";
    link.rel = "noopener";
  }
});

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
      poner("tasa-bcv", `Tasa referencial: ${bs(datos.tasaBcv)}/$`);
      poner("presupuesto-usd", usd(datos.totalUsd)); poner("presupuesto-bs", `${bs(datos.totalBs)} · Actualizado desde Sheets`);
      poner("cuota-usd-resumen", usd(datos.cuotaUsd)); poner("cuota-bs-resumen", `${bs(datos.cuotaBs)} por apartamento`);
      poner("total-presupuesto", `${usd(datos.totalUsd)} · ${bs(datos.totalBs)}`);
      poner("porcentaje-cobrado", `${datos.porcentajeCobrado}%`); poner("pagos-aprobados", `${datos.pagosAprobados} pagos aprobados`);
      document.querySelectorAll(".expenses div").forEach((fila) => {
        const concepto = fila.querySelector("span")?.textContent?.trim().toLowerCase();
        const gasto = datos.gastos.find((item) => item.concepto.toLowerCase() === concepto);
        if (gasto) fila.querySelector("b").textContent = `${usd(gasto.usd)} · ${bs(gasto.bs)}`;
      });
    })
    .catch(() => console.warn("No se pudo actualizar el presupuesto desde Google Sheets."));
}
