(function () {
  "use strict";

  var overlay = document.getElementById("game-player");
  if (!overlay) return;

  var bar = document.getElementById("game-player-bar");
  var titleEl = document.getElementById("game-player-title");
  var frame = document.getElementById("game-player-frame");
  var loading = document.getElementById("game-player-loading");
  var closeBtn = document.getElementById("game-player-close");
  var fsBtn = document.getElementById("game-player-fullscreen");

  var lastFocused = null;
  var idleTimer = null;

  function fsElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function requestFs() {
    var req = overlay.requestFullscreen || overlay.webkitRequestFullscreen;
    if (req) {
      try {
        req.call(overlay);
      } catch (e) {
        /* el navegador puede negar el pedido -- el overlay ya cubre toda
           la ventana igual, asi que el juego queda jugable de todos modos */
      }
    }
  }

  function exitFs() {
    var exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit && fsElement()) {
      try {
        exit.call(document);
      } catch (e) {}
    }
  }

  function armIdle() {
    overlay.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      overlay.classList.add("is-idle");
    }, 2200);
  }

  function open(project) {
    lastFocused = document.activeElement;
    titleEl.textContent = project.title;
    frame.title = project.title + " — jugable";
    loading.hidden = false;
    frame.src = project.play.path;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    armIdle();
    requestFs();
    closeBtn.focus();
  }

  function close() {
    exitFs();
    overlay.hidden = true;
    overlay.classList.remove("is-idle");
    clearTimeout(idleTimer);
    document.body.style.overflow = "";
    frame.src = "about:blank";
    if (lastFocused) lastFocused.focus();
  }

  frame.addEventListener("load", function () {
    loading.hidden = true;
  });

  closeBtn.addEventListener("click", close);
  fsBtn.addEventListener("click", function () {
    if (fsElement()) exitFs();
    else requestFs();
  });

  ["mousemove", "pointerdown", "keydown"].forEach(function (evt) {
    overlay.addEventListener(evt, armIdle);
  });

  document.addEventListener("keydown", function (e) {
    if (overlay.hidden) return;
    if (e.key === "Escape" && !fsElement()) close();
  });

  window.GamePlayer = { open: open, close: close };
})();
