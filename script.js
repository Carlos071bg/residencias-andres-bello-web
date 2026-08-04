// Google Sites a veces no procesa enlaces internos de un bloque incorporado.
// Este controlador fuerza un desplazamiento suave dentro del HTML incrustado.
const formularioPago = document.querySelector("#formulario-pago")?.href;
document.querySelectorAll(".form-link").forEach((link) => {
  if (formularioPago) link.href = formularioPago;
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
