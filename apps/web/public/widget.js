/**
 * Embeddable chat widget. Host on your origin; set data-public-id to the client's widget UUID.
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
  var langKey = "cw_lang_" + publicId;
  var convKey = "cw_cid_" + publicId;
  var visitorId = localStorage.getItem(visitorKey);
  if (!visitorId) {
    visitorId = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
    localStorage.setItem(visitorKey, visitorId);
  }
  var conversationId = localStorage.getItem(convKey) || "";
  var pollTimer = null;

  function stopPoll() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function startPoll() {
    if (pollTimer || !conversationId) return;
    pollTimer = setInterval(syncTranscript, 4000);
  }

  function renderTranscriptFromServer(list) {
    clearEmptyHint();
    while (messages.firstChild) messages.removeChild(messages.firstChild);
    if (!list || !list.length) {
      var hint = document.createElement("div");
      hint.textContent = "Ask a question — we use your business knowledge to reply.";
      hint.style.cssText =
        "margin:auto 8px;text-align:center;font-size:13px;color:" + C.zinc500 + ";line-height:1.5;padding:24px 8px;";
      messages.appendChild(hint);
      return;
    }
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      var role = (m.role || "").toLowerCase();
      var text = m.body || "";
      if (role === "user") {
        appendVisitor(text);
      } else if (role === "staff") {
        appendStaff(text);
      } else {
        appendAssistant(text);
      }
    }
  }

  function syncTranscript() {
    if (!conversationId) return;
    fetch(
      base +
        "/api/public/widget/" +
        encodeURIComponent(publicId) +
        "/messages?visitorId=" +
        encodeURIComponent(visitorId) +
        "&conversationId=" +
        encodeURIComponent(conversationId)
    )
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data.messages && Array.isArray(data.messages)) {
          renderTranscriptFromServer(data.messages);
        }
      })
      .catch(function () {});
  }

  /* Zinc neutrals + blue primary (app shell) + emerald accent (send CTA) — matches globals.css */
  var C = {
    primary700: "#1d4ed8",
    primary800: "#1e40af",
    primaryRing: "rgba(29,78,216,0.2)",
    emerald600: "#059669",
    emerald700: "#047857",
    emerald50: "#ecfdf5",
    zinc50: "#fafafa",
    zinc100: "#f4f4f5",
    zinc200: "#e4e4e7",
    zinc500: "#71717a",
    zinc700: "#3f3f46",
    zinc900: "#18181b",
    white: "#ffffff",
  };

  var root = document.createElement("div");
  root.id = "cw-widget-root";
  root.setAttribute("aria-live", "polite");
  root.style.cssText =
    "position:fixed;bottom:20px;right:20px;width:min(380px,calc(100vw - 40px));font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;z-index:2147483646;-webkit-font-smoothing:antialiased;";
  document.body.appendChild(root);

  var panel = document.createElement("div");
  panel.style.cssText =
    "display:none;flex-direction:column;overflow:hidden;border-radius:16px;background:" +
    C.white +
    ";box-shadow:0 25px 50px -12px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.04);max-height:min(520px,calc(100vh - 120px));";

  var header = document.createElement("div");
  header.style.cssText =
    "display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 16px;background:linear-gradient(135deg," +
    C.primary700 +
    " 0%," +
    C.primary800 +
    " 100%);color:" +
    C.white +
    ";";

  var headerText = document.createElement("div");
  var title = document.createElement("div");
  title.textContent = "Chat with us";
  title.style.cssText = "font-weight:700;font-size:16px;letter-spacing:-0.02em;line-height:1.2;";
  var subtitle = document.createElement("div");
  subtitle.textContent = "We reply in moments";
  subtitle.style.cssText = "margin-top:4px;font-size:12px;opacity:0.88;font-weight:500;";
  headerText.appendChild(title);
  headerText.appendChild(subtitle);

  var closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close chat");
  closeBtn.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  closeBtn.style.cssText =
    "flex-shrink:0;margin:-4px -6px 0 0;padding:8px;border:none;background:transparent;color:rgba(255,255,255,.85);cursor:pointer;border-radius:8px;line-height:0;";
  closeBtn.onmouseenter = function () {
    closeBtn.style.background = "rgba(255,255,255,.12)";
    closeBtn.style.color = "#fff";
  };
  closeBtn.onmouseleave = function () {
    closeBtn.style.background = "transparent";
    closeBtn.style.color = "rgba(255,255,255,.85)";
  };

  header.appendChild(headerText);
  header.appendChild(closeBtn);

  var messages = document.createElement("div");
  messages.style.cssText =
    "flex:1;overflow-y:auto;min-height:200px;max-height:340px;padding:14px 12px;background:" +
    C.zinc50 +
    ";display:flex;flex-direction:column;gap:10px;";
  var emptyHint = document.createElement("div");
  emptyHint.textContent = "Ask a question — we use your business knowledge to reply.";
  emptyHint.style.cssText =
    "margin:auto 8px;text-align:center;font-size:13px;color:" + C.zinc500 + ";line-height:1.5;padding:24px 8px;";
  messages.appendChild(emptyHint);

  function clearEmptyHint() {
    if (emptyHint.parentNode) emptyHint.remove();
  }

  var inputRow = document.createElement("div");
  inputRow.style.cssText =
    "display:flex;align-items:center;gap:10px;padding:12px 14px;border-top:1px solid " + C.zinc200 + ";background:" + C.white + ";";

  var input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Write a message…";
  input.setAttribute("aria-label", "Message");
  input.autocomplete = "off";
  input.style.cssText =
    "flex:1;min-width:0;border:1px solid " +
    C.zinc200 +
    ";border-radius:12px;padding:10px 14px;font-size:14px;color:" +
    C.zinc900 +
    ";outline:none;background:" +
    C.white +
    ";";
  input.onfocus = function () {
    input.style.borderColor = C.primary700;
    input.style.boxShadow = "0 0 0 3px " + C.primaryRing;
  };
  input.onblur = function () {
    input.style.borderColor = C.zinc200;
    input.style.boxShadow = "none";
  };

  var sendBtn = document.createElement("button");
  sendBtn.type = "button";
  sendBtn.setAttribute("aria-label", "Send message");
  sendBtn.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  sendBtn.style.cssText =
    "flex-shrink:0;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border:none;border-radius:12px;background:" +
    C.emerald600 +
    ";color:" +
    C.white +
    ";cursor:pointer;transition:background .15s,transform .1s,opacity .15s;";
  sendBtn.addEventListener("mouseenter", function () {
    if (!sendBtn.disabled) sendBtn.style.background = C.emerald700;
  });
  sendBtn.addEventListener("mouseleave", function () {
    sendBtn.style.background = C.emerald600;
    sendBtn.style.transform = "scale(1)";
  });
  sendBtn.addEventListener("mousedown", function () {
    if (!sendBtn.disabled) sendBtn.style.transform = "scale(0.96)";
  });
  sendBtn.addEventListener("mouseup", function () {
    sendBtn.style.transform = "scale(1)";
  });

  inputRow.appendChild(input);
  inputRow.appendChild(sendBtn);

  var langRow = document.createElement("div");
  langRow.style.cssText =
    "display:flex;align-items:center;gap:10px;padding:8px 14px 4px;font-size:12px;color:" + C.zinc500 + ";background:" + C.white + ";";
  var langLabel = document.createElement("span");
  langLabel.textContent = "Language";
  langLabel.style.cssText = "flex-shrink:0;font-weight:600;color:" + C.zinc700 + ";";
  var langSelect = document.createElement("select");
  langSelect.setAttribute("aria-label", "Reply language");
  langSelect.style.cssText =
    "flex:1;min-width:0;border:1px solid " +
    C.zinc200 +
    ";border-radius:10px;padding:6px 10px;font-size:13px;color:" +
    C.zinc900 +
    ";background:" +
    C.white +
    ";";
  [
    ["english", "English"],
    ["hindi", "Hindi"],
    ["hinglish", "Hinglish"],
    ["match_user", "Match my message"],
  ].forEach(function (opt) {
    var o = document.createElement("option");
    o.value = opt[0];
    o.textContent = opt[1];
    langSelect.appendChild(o);
  });
  var storedLang = localStorage.getItem(langKey) || "english";
  if (["english", "hindi", "hinglish", "match_user"].indexOf(storedLang) >= 0) {
    langSelect.value = storedLang;
  }
  langSelect.addEventListener("change", function () {
    try {
      localStorage.setItem(langKey, langSelect.value);
    } catch (_) {}
  });
  langRow.appendChild(langLabel);
  langRow.appendChild(langSelect);

  function bubbleRow(isVisitor) {
    var row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:" + (isVisitor ? "flex-end" : "flex-start") + ";width:100%;";
    var bubble = document.createElement("div");
    bubble.style.cssText =
      "max-width:85%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.45;word-wrap:break-word;white-space:pre-wrap;" +
      (isVisitor
        ? "background:" + C.primary700 + ";color:" + C.white + ";border-bottom-right-radius:4px;"
        : "background:" + C.white + ";color:" + C.zinc700 + ";border:1px solid " + C.zinc200 + ";border-bottom-left-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.04);");
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function appendVisitor(text) {
    clearEmptyHint();
    var b = bubbleRow(true);
    b.textContent = text;
  }

  function appendAssistant(text) {
    var b = bubbleRow(false);
    b.textContent = text;
  }

  function appendStaff(text) {
    clearEmptyHint();
    var b = bubbleRow(false);
    b.style.background = "#fffbeb";
    b.style.color = "#78350f";
    b.style.border = "1px solid #fcd34d";
    b.style.borderBottomLeftRadius = "4px";
    var label = document.createElement("div");
    label.textContent = "Team";
    label.style.cssText =
      "font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#b45309;margin-bottom:6px;";
    var body = document.createElement("div");
    body.textContent = text;
    b.textContent = "";
    b.appendChild(label);
    b.appendChild(body);
  }

  function appendError(text) {
    var b = bubbleRow(false);
    b.style.background = "#fef2f2";
    b.style.color = "#b91c1c";
    b.style.borderColor = "#fecaca";
    b.textContent = text;
  }

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Open chat");
  toggle.innerHTML =
    '<span style="display:flex;align-items:center;gap:8px;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="font-weight:600;font-size:15px;">Chat</span></span>';
  toggle.style.cssText =
    "position:fixed;bottom:20px;right:20px;display:flex;align-items:center;gap:0;padding:14px 20px;border:none;border-radius:9999px;cursor:pointer;color:" +
    C.white +
    ";background:linear-gradient(135deg," +
    C.primary700 +
    " 0%," +
    C.primary800 +
    " 100%);box-shadow:0 10px 40px -10px rgba(29,78,216,.45),0 4px 14px rgba(0,0,0,.12);z-index:2147483647;transition:transform .15s,box-shadow .15s;";
  toggle.onmouseenter = function () {
    toggle.style.transform = "translateY(-2px)";
    toggle.style.boxShadow = "0 14px 44px -10px rgba(29,78,216,.5),0 6px 20px rgba(0,0,0,.14)";
  };
  toggle.onmouseleave = function () {
    toggle.style.transform = "translateY(0)";
    toggle.style.boxShadow = "0 10px 40px -10px rgba(29,78,216,.45),0 4px 14px rgba(0,0,0,.12)";
  };

  function open() {
    panel.style.display = "flex";
    toggle.style.display = "none";
    if (conversationId) {
      syncTranscript();
      startPoll();
    }
    setTimeout(function () {
      input.focus();
    }, 100);
  }

  function closePanel() {
    panel.style.display = "none";
    toggle.style.display = "flex";
    stopPoll();
  }

  toggle.addEventListener("click", open);
  closeBtn.addEventListener("click", closePanel);

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) send();
  });

  function send() {
    var text = input.value.trim();
    if (!text) return;
    appendVisitor(text);
    input.value = "";
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.55";
    sendBtn.style.cursor = "not-allowed";
    fetch(base + "/api/public/widget/" + publicId + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        visitorId: visitorId,
        consent: true,
        replyLanguage: langSelect.value,
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data.error) appendError(data.error);
        else {
          if (data.conversationId) {
            conversationId = data.conversationId;
            try {
              localStorage.setItem(convKey, conversationId);
            } catch (_) {}
            startPoll();
          }
          appendAssistant(data.reply || "");
          syncTranscript();
        }
      })
      .catch(function () {
        appendAssistant("Could not reach the server. Please try again.");
      })
      .finally(function () {
        sendBtn.disabled = false;
        sendBtn.style.opacity = "1";
        sendBtn.style.cursor = "pointer";
      });
  }

  panel.appendChild(header);
  panel.appendChild(messages);
  panel.appendChild(langRow);
  panel.appendChild(inputRow);
  root.appendChild(panel);
  root.appendChild(toggle);

  if (conversationId) {
    startPoll();
  }
})();
