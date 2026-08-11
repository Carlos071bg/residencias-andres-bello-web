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
var usd = function(valor) { return "$" + Number(valor).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
var bs = function(valor) { return "Bs. " + Number(valor).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

var poner = function(id, valor) { 
  var nodo = document.getElementById(id); 
  if (nodo) {
    nodo.textContent = valor; 
    nodo.classList.remove("skeleton");
  }
};

// --- ANIMACION DEL TERMOMETRO ---
var animarTermometro = function(porcentaje) {
  var anilla = document.querySelector(".progress-ring");
  if (!anilla) return;
  var progressColor = "var(--mint)";
  if (porcentaje < 40) progressColor = "#ef4444";
  else if (porcentaje < 75) progressColor = "#f59e0b";
  anilla.style.setProperty("--progress-color", progressColor);
  var currentAngle = 0;
  var targetAngle = (porcentaje / 100) * 360;
  var interval = setInterval(function() {
    if (currentAngle >= targetAngle) {
      clearInterval(interval);
    } else {
      currentAngle += 5;
      if (currentAngle > targetAngle) currentAngle = targetAngle;
      anilla.style.setProperty("--progress-angle", currentAngle + "deg");
    }
  }, 15);
};

if (ENDPOINT_PRESUPUESTO) {
  fetch(ENDPOINT_PRESUPUESTO + "?t=" + Date.now())
    .then(function(respuesta) { return respuesta.json(); })
    .then(function(datos) {
      if (datos.error) throw new Error(datos.error);
      
      poner("cuota-usd", usd(datos.cuotaUsd)); 
      poner("cuota-bs", bs(datos.cuotaBs));
      poner("tasa-bcv", "Tasa BCV: " + bs(datos.tasaBcv) + "/$");
      poner("tasa-bcv-card", bs(datos.tasaBcv) + "/$");
      
      var periodo = String(datos.periodo || "").trim();
      var mes = periodo ? periodo.split(" ")[0].toUpperCase() : "PERIODO ACTIVO";
      
      poner("periodo-hero", "ADMINISTRACION \u00b7 " + (periodo ? periodo.toUpperCase() : "PERIODO ACTIVO"));
      poner("mes-presupuesto", mes);
      poner("fecha-limite", datos.fechaLimite || "Fecha por definir");
      poner("apartamentos", datos.apartamentos || 0);
      poner("presupuesto-usd", usd(datos.totalUsd)); 
      poner("presupuesto-bs", bs(datos.totalBs) + " \u00b7 " + (periodo || "Actualizado desde Sheets"));
      poner("cuota-usd-resumen", usd(datos.cuotaUsd)); 
      poner("cuota-bs-resumen", bs(datos.cuotaBs) + " por apartamento");
      poner("total-presupuesto", usd(datos.totalUsd) + " \u00b7 " + bs(datos.totalBs));
      
      var porcentajeReal = parseInt(datos.porcentajeCobrado) || 0;
      poner("porcentaje-cobrado", porcentajeReal + "%");
      animarTermometro(porcentajeReal);
      
      poner("pagos-aprobados", datos.pagosAprobados === 1 ? "1 pago aprobado" : datos.pagosAprobados + " pagos aprobados");
      
      var listaGastos = document.querySelector(".expenses");
      if (listaGastos && Array.isArray(datos.gastos)) {
        listaGastos.innerHTML = "";
        datos.gastos.forEach(function(gasto) {
          var fila = document.createElement("div");
          var concepto = document.createElement("span");
          var monto = document.createElement("b");
          concepto.textContent = gasto.concepto;
          monto.textContent = usd(gasto.usd) + " \u00b7 " + bs(gasto.bs);
          fila.appendChild(concepto);
          fila.appendChild(monto);
          listaGastos.appendChild(fila);
        });
      }
    })
    .catch(function() {
      console.warn("No se pudo actualizar el presupuesto desde Google Sheets.");
      poner("periodo-hero", "ADMINISTRACION \u00b7 ERROR DE CONEXION");
      poner("mes-presupuesto", "SIN DATOS");
      poner("tasa-bcv", "Tasa BCV: No disponible");
      poner("tasa-bcv-card", "No disponible");
      poner("fecha-limite", "Error de conexion");
      poner("cuota-usd", "Error");
      poner("presupuesto-usd", "Error");
      document.querySelectorAll(".skeleton").forEach(function(el) { el.classList.remove("skeleton"); });
    });
}

// --- CHATBOT RESI ---
var injectChatbot = function() {
  var style = document.createElement("style");
  style.textContent = "#bellobot-container { position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; font-family: Arial, sans-serif; } #bellobot-mascot { width: 70px; height: 70px; cursor: pointer; animation: float 3s ease-in-out infinite; transition: transform 0.3s; margin-top: 15px; } #bellobot-mascot:hover { transform: scale(1.1); } .cloud-body { width: 100%; height: 100%; background: #5c85ff; border-radius: 40% 40% 50% 50%; position: relative; box-shadow: 0 10px 20px rgba(0,0,0,0.2), inset 0 -5px 15px rgba(0,0,0,0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; } .cloud-body::before, .cloud-body::after { content: ''; position: absolute; background: #5c85ff; border-radius: 50%; } .cloud-body::before { width: 40px; height: 40px; top: -10px; left: -5px; } .cloud-body::after { width: 45px; height: 45px; top: -15px; right: 0; } .face { width: 40px; height: 25px; background: #202b4d; border-radius: 8px; z-index: 2; display: flex; justify-content: space-evenly; align-items: center; margin-bottom: 2px; } .eye { width: 10px; height: 4px; background: #66e0ff; border-radius: 4px; transform: rotate(15deg); animation: blink 4s infinite; } .eye.right { transform: rotate(-15deg); animation: blinkRight 4s infinite; } .prompt-symbol { color: white; font-family: monospace; font-weight: bold; font-size: 12px; z-index: 2; letter-spacing: -1px; } @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } } @keyframes blink { 0%, 96%, 98% { transform: scaleY(1) rotate(15deg); } 97%, 99% { transform: scaleY(0.1) rotate(15deg); } } @keyframes blinkRight { 0%, 96%, 98% { transform: scaleY(1) rotate(-15deg); } 97%, 99% { transform: scaleY(0.1) rotate(-15deg); } } #bellobot-chat-window { width: 320px; height: 450px; background: white; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-origin: bottom right; } #bellobot-chat-window.hidden { transform: scale(0); opacity: 0; pointer-events: none; } .chat-header { background: #5c85ff; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; } .chat-header h4 { margin: 0; font-size: 1.1rem; } #close-chat { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; } .chat-messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: #f8fafc; scroll-behavior: smooth; } .message { max-width: 80%; padding: 10px 15px; border-radius: 15px; font-size: 0.95rem; line-height: 1.4; animation: popIn 0.3s ease-out; word-wrap: break-word; } .message.bot { background: #e2e8f0; color: #1e293b; align-self: flex-start; border-bottom-left-radius: 2px; } .message.user { background: #5c85ff; color: white; align-self: flex-end; border-bottom-right-radius: 2px; } .chat-input-area { display: flex; padding: 15px; background: white; border-top: 1px solid #e2e8f0; } .chat-input-area input { flex: 1; padding: 10px 15px; border: 1px solid #cbd5e1; border-radius: 20px; outline: none; font-family: Arial, sans-serif; } .chat-input-area button { background: #5c85ff; color: white; border: none; padding: 0 15px; margin-left: 10px; border-radius: 20px; cursor: pointer; font-weight: bold; transition: background 0.2s; } .chat-input-area button:disabled { background: #94a3b8; cursor: not-allowed; } @keyframes popIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } .typing-indicator { display: flex; gap: 4px; padding: 5px 10px; } .typing-indicator span { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: typing 1s infinite; } .typing-indicator span:nth-child(2) { animation-delay: 0.2s; } .typing-indicator span:nth-child(3) { animation-delay: 0.4s; } @keyframes typing { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } } @media (max-width: 480px) { #bellobot-chat-window { width: 85vw; height: 60vh; bottom: 80px; right: 20px; position: fixed; } }";
  document.head.appendChild(style);

  var chatContainer = document.createElement("div");
  chatContainer.id = "bellobot-container";

  var chatWindowHTML = '<div id="bellobot-chat-window" class="hidden">';
  chatWindowHTML += '<div class="chat-header"><h4>Resi \uD83C\uDFE0</h4><button id="close-chat">&times;</button></div>';
  chatWindowHTML += '<div class="chat-messages" id="chat-messages">';
  chatWindowHTML += '<div class="message bot">\u00a1Hola! Soy Resi, tu asistente virtual. \u00bfEn qu\u00e9 te puedo ayudar hoy?</div>';
  chatWindowHTML += '</div>';
  chatWindowHTML += '<div class="chat-input-area"><input type="text" id="chat-input" placeholder="Escribe tu mensaje..." autocomplete="off" /><button id="send-btn">Enviar</button></div>';
  chatWindowHTML += '</div>';

  var mascotHTML = '<div id="bellobot-mascot"><div class="cloud-body"><div class="face"><div class="eye"></div><div class="eye right"></div></div><div class="prompt-symbol">&gt;_</div></div></div>';

  chatContainer.innerHTML = chatWindowHTML + mascotHTML;
  document.body.appendChild(chatContainer);

  var mascot = document.getElementById("bellobot-mascot");
  var chatWindow = document.getElementById("bellobot-chat-window");
  var closeBtn = document.getElementById("close-chat");
  var sendBtn = document.getElementById("send-btn");
  var inputField = document.getElementById("chat-input");
  var messagesContainer = document.getElementById("chat-messages");

  var toggleChat = function() { chatWindow.classList.toggle("hidden"); };
  mascot.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", function() { chatWindow.classList.add("hidden"); });

  var appendMessage = function(text, sender) {
    var msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  var showTypingIndicator = function() {
    var typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot", "typing-indicator-box");
    typingDiv.id = "typing-indicator";
    typingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  var removeTypingIndicator = function() {
    var indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
  };

  var sendMessage = function() {
    var text = inputField.value.trim();
    if (!text) return;
    appendMessage(text, "user");
    inputField.value = "";
    sendBtn.disabled = true;
    showTypingIndicator();

    fetch(ENDPOINT_PRESUPUESTO, {
      method: "POST",
      body: JSON.stringify({ message: text }),
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
      removeTypingIndicator();
      if (data.success) {
        appendMessage(data.reply, "bot");
      } else {
        appendMessage("Disculpa, estoy teniendo problemas de conexion. Intenta mas tarde.", "bot");
      }
    })
    .catch(function() {
      removeTypingIndicator();
      appendMessage("Disculpa, mi conexion fallo. Intenta mas tarde.", "bot");
    })
    .finally(function() {
      sendBtn.disabled = false;
      inputField.focus();
    });
  };

  sendBtn.addEventListener("click", sendMessage);
  inputField.addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectChatbot);
} else {
  injectChatbot();
}
