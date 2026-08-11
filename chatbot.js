// --- CHATBOT RESI ---
var injectChatbot = function() {
  var style = document.createElement("style");
  style.textContent = "#bellobot-container{position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;font-family:Arial,sans-serif}#bellobot-mascot{width:70px;height:70px;cursor:pointer;animation:float 3s ease-in-out infinite;transition:transform .3s;margin-top:15px}#bellobot-mascot:hover{transform:scale(1.1)}.cloud-body{width:100%;height:100%;background:#5c85ff;border-radius:40% 40% 50% 50%;position:relative;box-shadow:0 10px 20px rgba(0,0,0,.2),inset 0 -5px 15px rgba(0,0,0,.2);display:flex;flex-direction:column;align-items:center;justify-content:center}.cloud-body::before,.cloud-body::after{content:'';position:absolute;background:#5c85ff;border-radius:50%}.cloud-body::before{width:40px;height:40px;top:-10px;left:-5px}.cloud-body::after{width:45px;height:45px;top:-15px;right:0}.face{width:40px;height:25px;background:#202b4d;border-radius:8px;z-index:2;display:flex;justify-content:space-evenly;align-items:center;margin-bottom:2px}.eye{width:10px;height:4px;background:#66e0ff;border-radius:4px;transform:rotate(15deg);animation:blink 4s infinite}.eye.right{transform:rotate(-15deg);animation:blinkRight 4s infinite}.prompt-symbol{color:#fff;font-family:monospace;font-weight:700;font-size:12px;z-index:2;letter-spacing:-1px}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes blink{0%,96%,98%{transform:scaleY(1) rotate(15deg)}97%,99%{transform:scaleY(.1) rotate(15deg)}}@keyframes blinkRight{0%,96%,98%{transform:scaleY(1) rotate(-15deg)}97%,99%{transform:scaleY(.1) rotate(-15deg)}}#bellobot-chat-window{width:320px;height:450px;background:#fff;border-radius:20px;box-shadow:0 15px 35px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden;transition:all .3s cubic-bezier(.175,.885,.32,1.275);transform-origin:bottom right}#bellobot-chat-window.hidden{transform:scale(0);opacity:0;pointer-events:none}.chat-header{background:#5c85ff;color:#fff;padding:15px 20px;display:flex;justify-content:space-between;align-items:center}.chat-header h4{margin:0;font-size:1.1rem}#close-chat{background:0 0;border:none;color:#fff;font-size:1.5rem;cursor:pointer}.chat-messages{flex:1;padding:15px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;background:#f8fafc;scroll-behavior:smooth}.message{max-width:80%;padding:10px 15px;border-radius:15px;font-size:.95rem;line-height:1.4;animation:popIn .3s ease-out;word-wrap:break-word}.message.bot{background:#e2e8f0;color:#1e293b;align-self:flex-start;border-bottom-left-radius:2px}.message.user{background:#5c85ff;color:#fff;align-self:flex-end;border-bottom-right-radius:2px}.chat-input-area{display:flex;padding:15px;background:#fff;border-top:1px solid #e2e8f0}.chat-input-area input{flex:1;padding:10px 15px;border:1px solid #cbd5e1;border-radius:20px;outline:0;font-family:Arial,sans-serif}.chat-input-area button{background:#5c85ff;color:#fff;border:none;padding:0 15px;margin-left:10px;border-radius:20px;cursor:pointer;font-weight:700;transition:background .2s}.chat-input-area button:disabled{background:#94a3b8;cursor:not-allowed}@keyframes popIn{from{opacity:0;transform:translateY(10px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}.typing-indicator{display:flex;gap:4px;padding:5px 10px}.typing-indicator span{width:6px;height:6px;background:#94a3b8;border-radius:50%;animation:typing 1s infinite}.typing-indicator span:nth-child(2){animation-delay:.2s}.typing-indicator span:nth-child(3){animation-delay:.4s}@keyframes typing{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@media(max-width:480px){#bellobot-chat-window{width:85vw;height:60vh;bottom:80px;right:20px;position:fixed}}";
  document.head.appendChild(style);
  var c = document.createElement("div");
  c.id = "bellobot-container";
  c.innerHTML = '<div id="bellobot-chat-window" class="hidden"><div class="chat-header"><h4>Resi \uD83C\uDFE0</h4><button id="close-chat">&times;</button></div><div class="chat-messages" id="chat-messages"><div class="message bot">\u00a1Hola! Soy Resi, tu asistente virtual. \u00bfEn qu\u00e9 te puedo ayudar hoy?</div></div><div class="chat-input-area"><input type="text" id="chat-input" placeholder="Escribe tu mensaje..." autocomplete="off" /><button id="send-btn">Enviar</button></div></div><div id="bellobot-mascot"><div class="cloud-body"><div class="face"><div class="eye"></div><div class="eye right"></div></div><div class="prompt-symbol">&gt;_</div></div></div>';
  document.body.appendChild(c);
  var mascot = document.getElementById("bellobot-mascot");
  var chatWindow = document.getElementById("bellobot-chat-window");
  var closeBtn = document.getElementById("close-chat");
  var sendBtn = document.getElementById("send-btn");
  var inputField = document.getElementById("chat-input");
  var msgs = document.getElementById("chat-messages");
  mascot.addEventListener("click", function() { chatWindow.classList.toggle("hidden"); });
  closeBtn.addEventListener("click", function() { chatWindow.classList.add("hidden"); });
  var addMsg = function(text, who) {
    var d = document.createElement("div");
    d.classList.add("message", who);
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  };
  var sendMessage = function() {
    var text = inputField.value.trim();
    if (!text) return;
    addMsg(text, "user");
    inputField.value = "";
    sendBtn.disabled = true;
    var ti = document.createElement("div");
    ti.classList.add("message", "bot");
    ti.id = "typing-indicator";
    ti.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    msgs.appendChild(ti);
    msgs.scrollTop = msgs.scrollHeight;
    fetch(ENDPOINT_PRESUPUESTO, {
      method: "POST",
      body: JSON.stringify({ message: text }),
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var ind = document.getElementById("typing-indicator");
      if (ind) ind.remove();
      if (data.success) { addMsg(data.reply, "bot"); }
      else { addMsg("Disculpa, estoy teniendo problemas. Intenta mas tarde.", "bot"); }
    })
    .catch(function() {
      var ind = document.getElementById("typing-indicator");
      if (ind) ind.remove();
      addMsg("Disculpa, mi conexion fallo. Intenta mas tarde.", "bot");
    })
    .finally(function() { sendBtn.disabled = false; inputField.focus(); });
  };
  sendBtn.addEventListener("click", sendMessage);
  inputField.addEventListener("keypress", function(e) { if (e.key === "Enter") sendMessage(); });
};
if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", injectChatbot); }
else { injectChatbot(); }
