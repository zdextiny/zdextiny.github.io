(function () {
  "use strict";

  // Fondo del hero: el combate de Samurai Champloo se reproduce como texto
  // coloreado, ni una sola vez como <video> visible -- el video de abajo
  // esta oculto (1x1px, opacity:0) y solo existe para darle frames al
  // canvas. Cada frame se dibuja downscaleado en un canvas minusculo
  // (cols x rows, uno por celda de texto) y de ahi se lee el color real de
  // cada pixel para elegir un caracter de la rampa de densidad y pintarlo
  // con ese mismo color -- la tecnica "ASCILINE" / ascii-video coloreado.
  var hero = document.getElementById("hero");
  var video = document.getElementById("hero-video");
  var canvas = document.getElementById("hero-ascii-canvas");
  if (!hero || !video || !canvas) return;

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return; // el CSS ya oculta el canvas -- ni arrancamos el video/loop
  }

  var ctx = canvas.getContext("2d", { alpha: true });
  var sample = document.createElement("canvas");
  var sampleCtx = sample.getContext("2d", { willReadFrequently: true });

  // rampa de oscuro -> claro; el espacio al final hace que los pixeles muy
  // quemados de blanco no dibujen caracter (dejan pasar el fondo del hero)
  var RAMP = " .:-=+*#%@";
  // tiene que coincidir con --font-mono de site.css -- ctx.font no puede
  // leer variables CSS directamente
  var FONT_STACK = "'Space Mono', 'SFMono-Regular', Consolas, monospace";
  var CELL_ASPECT = 1.7; // alto/ancho tipico de una celda monoespaciada

  var cols = 0, rows = 0, cellW = 0, cellH = 0, viewW = 0, viewH = 0;
  var rafId = null;
  var lastDraw = 0;
  var FRAME_INTERVAL = 1000 / 20; // 20fps de muestreo -- de sobra para un fondo
  var visible = true;

  function resize() {
    var rect = hero.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewW = Math.max(1, Math.round(rect.width));
    viewH = Math.max(1, Math.round(rect.height));

    var cellPx = viewW < 720 ? 16 : viewW < 1100 ? 13 : 11;
    cols = Math.max(20, Math.floor(viewW / cellPx));
    rows = Math.max(12, Math.floor(viewH / (cellPx * CELL_ASPECT)));
    cellW = viewW / cols;
    cellH = viewH / rows;

    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    canvas.style.width = viewW + "px";
    canvas.style.height = viewH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = Math.ceil(cellH * 0.92) + "px " + FONT_STACK;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    sample.width = cols;
    sample.height = rows;
  }

  function drawFrame() {
    var vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh || !viewW || !viewH) return;

    // recorte tipo "object-fit: cover" para que el video llene el hero sin
    // deformarse, sea cual sea la relacion de aspecto de la pantalla
    var heroAspect = viewW / viewH;
    var videoAspect = vw / vh;
    var sx, sy, sw, sh;
    if (videoAspect > heroAspect) {
      sh = vh;
      sw = vh * heroAspect;
      sx = (vw - sw) / 2;
      sy = 0;
    } else {
      sw = vw;
      sh = vw / heroAspect;
      sx = 0;
      sy = (vh - sh) / 2;
    }
    sampleCtx.drawImage(video, sx, sy, sw, sh, 0, 0, cols, rows);

    var data;
    try {
      data = sampleCtx.getImageData(0, 0, cols, rows).data;
    } catch (e) {
      return; // frame no decodificado todavia (video:// entre seeks, etc.)
    }

    ctx.clearRect(0, 0, viewW, viewH);
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var i = (y * cols + x) * 4;
        var r = data[i], g = data[i + 1], b = data[i + 2];
        var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        var ch = RAMP[Math.min(RAMP.length - 1, Math.floor(lum * RAMP.length))];
        if (ch === " ") continue;
        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillText(ch, x * cellW + cellW / 2, y * cellH + cellH / 2);
      }
    }
  }

  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (!visible || video.paused) return;
    if (ts - lastDraw < FRAME_INTERVAL) return;
    lastDraw = ts;
    if (video.readyState < 2) return;
    drawFrame();
  }

  function start() {
    if (rafId !== null) return;
    video.play().catch(function () {}); // autoplay mudo bloqueado en algun browser raro -- no rompe nada, solo no anima
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
    video.pause();
  }

  resize();
  video.addEventListener("loadedmetadata", resize);

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  // pausar el video/loop fuera de viewport o con la pestaña oculta -- es
  // un fondo, no vale la pena gastar CPU/batería si nadie lo esta viendo
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting && !document.hidden;
          if (visible) start(); else stop();
        });
      },
      { threshold: 0.05 }
    );
    io.observe(hero);
  } else {
    start();
  }

  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden && visible;
    if (document.hidden) stop(); else start();
  });
})();
