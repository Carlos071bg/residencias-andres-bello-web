// --- MODO OSCURO AUTOMATICO ---
var themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  var savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    themeToggle.textContent = savedTheme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19";
  }
  themeToggle.addEventListener("click", function() {
    var currentTheme = document.documentElement.getAttribute("data-theme");
    var newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    themeToggle.textContent = newTheme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19";
    localStorage.setItem("theme", newTheme);
  });
}

// --- SCROLL SUAVE ---
document.querySelectorAll(".scroll-link").forEach(function(link) {
  link.addEventListener("click", function(event) {
    var targetId = link.getAttribute("href");
    var target = targetId ? document.querySelector(targetId) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// --- RELOJ EN VIVO ---
var actualizarFechaHora = function() {
  var nodo = document.getElementById("fecha-hora-actual");
  if (!nodo) return;
  var ahora = new Date();
  var fecha = new Intl.DateTimeFormat("es-VE", { timeZone: "America/Caracas", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(ahora);
  var hora = new Intl.DateTimeFormat("es-VE", { timeZone: "America/Caracas", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(ahora);
  nodo.textContent = fecha + " \u00b7 " + hora;
  nodo.classList.remove("skeleton");
};
actualizarFechaHora();
window.setInterval(actualizarFechaHora, 1000);

// --- CONEXION AL BACKEND ---
var ENDPOINT_PRESUPUESTO = "https://script.google.com/macros/s/AKfycbyM3Z3dYBaQcaKEdn588WaTM7wKp_8zE9KHqNciKmfNoqFx76-9TtV8EjHvx8OyVtrG9w/exec";
var usd = function(v) { return "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
var bs = function(v) { return "Bs. " + Number(v).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
var poner = function(id, valor) { 
  var n = document.getElementById(id); 
  if (n) { n.textContent = valor; n.classList.remove("skeleton"); }
};

// --- ANIMACION DEL TERMOMETRO ---
var animarTermometro = function(p) {
  var a = document.querySelector(".progress-ring");
  if (!a) return;
  var c = "var(--mint)";
  if (p < 40) c = "#ef4444";
  else if (p < 75) c = "#f59e0b";
  a.style.setProperty("--progress-color", c);
  var cur = 0;
  var tgt = (p / 100) * 360;
  var iv = setInterval(function() {
    if (cur >= tgt) { clearInterval(iv); }
    else { cur += 5; if (cur > tgt) cur = tgt; a.style.setProperty("--progress-angle", cur + "deg"); }
  }, 15);
};

if (ENDPOINT_PRESUPUESTO) {
  fetch(ENDPOINT_PRESUPUESTO + "?t=" + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.error) throw new Error(d.error);
      poner("cuota-usd", usd(d.cuotaUsd)); 
      poner("cuota-bs", bs(d.cuotaBs));
      poner("tasa-bcv", "Tasa BCV: " + bs(d.tasaBcv) + "/$");
      poner("tasa-bcv-card", bs(d.tasaBcv) + "/$");
      var per = String(d.periodo || "").trim();
      var mes = per ? per.split(" ")[0].toUpperCase() : "PERIODO ACTIVO";
      poner("periodo-hero", "ADMINISTRACION \u00b7 " + (per ? per.toUpperCase() : "PERIODO ACTIVO"));
      poner("mes-presupuesto", mes);
      var fl = d.fechaLimite || "";
      if (fl) {
        try { poner("fecha-limite", new Intl.DateTimeFormat("es-VE", { timeZone: "America/Caracas", day: "numeric", month: "long", year: "numeric" }).format(new Date(fl))); }
        catch(e) { poner("fecha-limite", fl); }
      } else { poner("fecha-limite", "Fecha por definir"); }
      poner("apartamentos", d.apartamentos || 0);
      poner("presupuesto-usd", usd(d.totalUsd)); 
      poner("presupuesto-bs", bs(d.totalBs) + " \u00b7 " + (per || "Actualizado"));
      poner("cuota-usd-resumen", usd(d.cuotaUsd)); 
      poner("cuota-bs-resumen", bs(d.cuotaBs) + " por apartamento");
      poner("total-presupuesto", usd(d.totalUsd) + " \u00b7 " + bs(d.totalBs));
      var pr = parseInt(d.porcentajeCobrado) || 0;
      poner("porcentaje-cobrado", pr + "%");
      animarTermometro(pr);
      poner("pagos-aprobados", d.pagosAprobados === 1 ? "1 pago aprobado" : d.pagosAprobados + " pagos aprobados");
      var lg = document.querySelector(".expenses");
      if (lg && Array.isArray(d.gastos)) {
        lg.innerHTML = "";
        d.gastos.forEach(function(g) {
          var f = document.createElement("div");
          var c = document.createElement("span");
          var m = document.createElement("b");
          c.textContent = g.concepto;
          m.textContent = usd(g.usd) + " \u00b7 " + bs(g.bs);
          f.appendChild(c); f.appendChild(m); lg.appendChild(f);
        });
      }
    })
    .catch(function() {
      poner("periodo-hero", "ADMINISTRACION \u00b7 ERROR");
      poner("mes-presupuesto", "SIN DATOS");
      poner("tasa-bcv", "No disponible");
      poner("tasa-bcv-card", "No disponible");
      poner("fecha-limite", "Error de conexion");
      poner("cuota-usd", "Error"); poner("presupuesto-usd", "Error");
      document.querySelectorAll(".skeleton").forEach(function(e) { e.classList.remove("skeleton"); });
    });
}
