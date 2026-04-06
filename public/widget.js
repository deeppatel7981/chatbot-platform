/**
 * Embeddable chat widget (minimal). Host on your origin; set data-public-id to the client's widget UUID.
 *
 * <script src="https://YOUR_DOMAIN/widget.js" data-public-id="WIDGET_UUID" defer></script>
 */
(function () {
  var script = document.currentScript;
  var publicId = script && script.getAttribute("data-public-id");
  if (!publicId) {
    console.error("widget.js: missing data-public-id");
    return;
  }

  var base = new URL(script.src).origin;
  var visitorKey = "cw_vid_" + publicId;
  var visitorId = localStorage.getItem(visitorKey);
  if (!visitorId) {
    visitorId = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
    localStorage.setItem(visitorKey, visitorId);
  }

  var root = document.createElement("div");
  root.id = "cw-widget-root";
  root.style.cssText =
    "position:fixed;bottom:16px;right:16px;width:320px;max-width:calc(100vw - 32px);font-family:system-ui,sans-serif;z-index:99999;";
  document.body.appendChild(root);

  var panel = document.createElement("div");
  panel.style.cssText =
    "background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.12);overflow:hidden;display:none;flex-direction:column;max-height:420px;";
  var header = document.createElement("div");
  header.textContent = "Chat";
  header.style.cssText = "padding:10px 12px;background:#111827;color:#fff;font-weight:600;";
  var messages = document.createElement("div");
  messages.style.cssText = "padding:10px;flex:1;overflow:auto;min-height:200px;font-size:14px;color:#111;";
  var inputRow = document.createElement("div");
  inputRow.style.cssText = "display:flex;gap:8px;padding:8px;border-top:1px solid #eee;";
  var input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type a message…";
  input.style.cssText = "flex:1;border:1px solid #ddd;border-radius:8px;padding:8px;";
  var sendBtn = document.createElement("button");
  sendBtn.type = "button";
  sendBtn.textContent = "Send";
  sendBtn.style.cssText = "background:#111827;color:#fff;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;";
  inputRow.appendChild(input);
  inputRow.appendChild(sendBtn);

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.textContent = "Chat";
  toggle.style.cssText =
    "position:fixed;bottom:16px;right:16px;background:#111827;color:#fff;border:none;border-radius:999px;padding:12px 16px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2);";

  function append(role, text) {
    var line = document.createElement("div");
    line.style.marginBottom = "8px";
    line.innerHTML = "<strong>" + role + ":</strong> " + text.replace(/</g, "&lt;");
    messages.appendChild(line);
    messages.scrollTop = messages.scrollHeight;
  }

  function open() {
    panel.style.display = "flex";
    toggle.style.display = "none";
  }
  function closePanel() {
    panel.style.display = "none";
    toggle.style.display = "block";
  }

  toggle.addEventListener("click", open);
  header.addEventListener("dblclick", closePanel);

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") send();
  });

  function send() {
    var text = input.value.trim();
    if (!text) return;
    append("You", text);
    input.value = "";
    sendBtn.disabled = true;
    fetch(base + "/api/public/widget/" + publicId + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, visitorId: visitorId, consent: true }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data.error) append("Bot", "Error: " + data.error);
        else append("Assistant", data.reply || "");
      })
      .catch(function () {
        append("Assistant", "Network error.");
      })
      .finally(function () {
        sendBtn.disabled = false;
      });
  }

  panel.appendChild(header);
  panel.appendChild(messages);
  panel.appendChild(inputRow);
  root.appendChild(panel);
  root.appendChild(toggle);
})();
