(function () {
  "use strict";

  // Cache de duracion de gifs (leida abajo, en getGifLoopDuration) -- va
  // arriba de todo porque buildProjectCard corre antes que el resto del
  // archivo termine de ejecutarse, y "var" sin esto queda undefined hasta
  // llegar a su linea original.
  var gifDurationCache = {};

  // ---------- Ano en el footer ----------
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Galeria del hero: rotacion con fade, desincronizada por celda ----------
  // Pool de assets propios (carpeta D:\PixelArt123\Best) -- cada cuadro de
  // la grilla cicla su propia baraja mezclada de este mismo pool, cada uno
  // con su propio intervalo (5-7.5s) y arranque escalonado, para que nunca
  // cambien todos juntos.
  var HERO_GALLERY_POOL = [
    "images/hero-bender.gif", "images/hero-cuarto.png", "images/hero-h2o1.png",
    "images/hero-picocad.gif", "images/hero-carta.png",
    "images/hero-gallery/dextiny-productions.png", "images/hero-gallery/hero-art.png",
    "images/hero-gallery/honey-heist.png", "images/hero-gallery/nige-ciudad-luna.png",
    "images/hero-gallery/zdextiny-avatar.png", "images/hero-gallery/among.png",
    "images/hero-gallery/colosso.png", "images/hero-gallery/cooking-demon.gif",
    "images/hero-gallery/demon-tattoo.png", "images/hero-gallery/luna.png",
    "images/hero-gallery/pc-stream.gif", "images/hero-gallery/pez-koi.png",
    "images/hero-gallery/picocad-1.gif", "images/hero-gallery/picocad-25.gif",
    "images/hero-gallery/picocad-3.gif", "images/hero-gallery/picocad-33.gif",
    "images/hero-gallery/porito.png", "images/hero-gallery/ps2.gif",
    "images/hero-gallery/rubik.png", "images/hero-gallery/siren.png",
    "images/hero-gallery/tank-icon.png",
  ];

  function shuffledCopy(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  var heroGalleryCells = document.querySelectorAll(".hero__gallery-item");
  // Estado compartido entre TODAS las celdas -- lo que cada una esta
  // mostrando ahora mismo. Antes cada celda elegia su siguiente imagen a
  // ciegas, sin fijarse en las demas, y podian coincidir dos celdas con la
  // misma imagen al mismo tiempo. Reservando el src ACA (antes de arrancar
  // el fade) ninguna otra celda lo puede volver a elegir mientras este visible.
  var heroGalleryCurrent = [];
  heroGalleryCells.forEach(function (cell, i) {
    heroGalleryCurrent.push(cell.getAttribute("src"));
    // revelado inicial escalonado (ver .is-visible en site.css) -- via
    // transicion, no animation, para no pisar el fade de la rotacion despues
    setTimeout(function () {
      cell.classList.add("is-visible");
    }, i * 100);
  });

  // Un solo "turno" global en vez de un timer independiente por celda --
  // antes cada celda tenia su propio intervalo (5-7.5s) con arranque
  // escalonado, pero con 5 celdas eso terminaba agrupando varios cambios
  // casi juntos (a ~1s de diferencia) en vez de sentirse parejo. Ahora hay
  // UN cambio cada 3s, siempre en una celda distinta (recorrido aleatorio
  // sin repetir hasta pasar por todas), asi se ve mas seguido en general
  // pero de a una imagen genuinamente a la vez.
  var galleryQueues = [];
  var galleryQueueIdx = [];
  heroGalleryCells.forEach(function () {
    galleryQueues.push(shuffledCopy(HERO_GALLERY_POOL));
    galleryQueueIdx.push(0);
  });

  function isGifSrc(src) {
    return /\.gif(\?|$)/i.test(src || "");
  }

  function pickNextFor(idx) {
    // Regla: siempre tiene que haber al menos un gif visible entre las 5
    // celdas (para que nunca quede todo estatico). Si ninguna de las OTRAS
    // celdas es gif ahora mismo, esta celda esta obligada a elegir un gif.
    var othersHaveGif = heroGalleryCurrent.some(function (src, i) {
      return i !== idx && isGifSrc(src);
    });
    var mustBeGif = !othersHaveGif;

    var queue = galleryQueues[idx];
    var qi = galleryQueueIdx[idx];
    var maxAttempts = HERO_GALLERY_POOL.length * 2;
    for (var attempt = 0; attempt < maxAttempts; attempt++) {
      if (qi >= queue.length) {
        queue = shuffledCopy(HERO_GALLERY_POOL);
        galleryQueues[idx] = queue;
        qi = 0;
      }
      var candidate = queue[qi++];
      if (mustBeGif && !isGifSrc(candidate)) continue;
      var inUseElsewhere = heroGalleryCurrent.some(function (src, i) {
        return i !== idx && src === candidate;
      });
      if (candidate !== heroGalleryCurrent[idx] && !inUseElsewhere) {
        galleryQueueIdx[idx] = qi;
        return candidate;
      }
    }
    galleryQueueIdx[idx] = qi;
    return null;
  }

  function advanceCell(idx) {
    var cell = heroGalleryCells[idx];
    var nextSrc = pickNextFor(idx);
    if (!nextSrc) return;
    heroGalleryCurrent[idx] = nextSrc;
    var preload = new Image();
    preload.onload = function () {
      cell.classList.add("is-fading");
      setTimeout(function () {
        cell.src = nextSrc;
        cell.classList.remove("is-fading");
      }, 280);
    };
    preload.src = nextSrc;
  }

  var cellIndices = [];
  for (var ci = 0; ci < heroGalleryCells.length; ci++) cellIndices.push(ci);
  var cellTurnOrder = [];
  function nextCellTurn() {
    if (!cellTurnOrder.length) {
      cellTurnOrder = shuffledCopy(cellIndices);
    }
    return cellTurnOrder.shift();
  }

  if (heroGalleryCells.length) {
    setInterval(function () {
      var idx = nextCellTurn();
      if (idx !== undefined) advanceCell(idx);
    }, 3000);
  }

  // ---------- Nav: toggle mobile + resaltar link activo ----------
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------- Imagen central del caso Wikimedia: pantalla de titulo fija
  // los primeros 2s, despues carrusel infinito entre 2 gifs de gameplay ----
  (function () {
    var central = document.getElementById("feature-wikimedia-central");
    if (!central) return;
    var WIKIMEDIA_CENTRAL_LOOP = ["images/museo-anim-13.gif", "images/museo-anim-15.gif"];

    function cycle(idx) {
      var nextSrc = WIKIMEDIA_CENTRAL_LOOP[idx % WIKIMEDIA_CENTRAL_LOOP.length];
      var preload = new Image();
      preload.onload = function () {
        central.classList.add("is-fading");
        setTimeout(function () {
          central.src = nextSrc;
          central.classList.remove("is-fading");
          getGifLoopDuration(nextSrc).then(function (ms) {
            setTimeout(function () { cycle(idx + 1); }, ms || 4000);
          });
        }, 260);
      };
      preload.src = nextSrc;
    }

    setTimeout(function () { cycle(0); }, 2000);
  })();

  // ---------- Reproductor inline del caso Wikimedia (feature__player) ----------
  // Build WebGL exportado a games/wikimedia-museo/ (misma convencion que los
  // juegos de la grilla de proyectos, ver js/game-player.js) -- pero acá el
  // juego se abre ADENTRO de la seccion, no en un overlay de pantalla completa.
  (function () {
    var featureRoot = document.getElementById("feature-wikimedia");
    var gallery = document.getElementById("feature-wikimedia-gallery");
    var info = document.getElementById("feature-wikimedia-info");
    var player = document.getElementById("feature-wikimedia-player");
    if (!featureRoot || !player) return;

    var playBtn = document.getElementById("feature-wikimedia-play");
    var closeBtn = document.getElementById("feature-wikimedia-close");
    var fsBtn = document.getElementById("feature-wikimedia-fullscreen");
    var frame = document.getElementById("feature-wikimedia-frame");
    var frameWrap = frame.parentElement;
    var loading = document.getElementById("feature-wikimedia-loading");
    var GAME_PATH = "games/wikimedia-museo/index.html";

    function fsElement() {
      return document.fullscreenElement || document.webkitFullscreenElement || null;
    }

    frame.addEventListener("load", function () {
      loading.hidden = true;
    });

    playBtn.addEventListener("click", function () {
      gallery.hidden = true;
      info.hidden = true;
      player.hidden = false;
      featureRoot.classList.add("is-playing");
      loading.hidden = false;
      frame.src = GAME_PATH;
      player.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    closeBtn.addEventListener("click", function () {
      if (fsElement()) {
        var exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) exit.call(document);
      }
      player.hidden = true;
      gallery.hidden = false;
      info.hidden = false;
      featureRoot.classList.remove("is-playing");
      frame.src = "about:blank";
    });

    if (fsBtn) {
      fsBtn.addEventListener("click", function () {
        if (fsElement()) {
          var exit = document.exitFullscreen || document.webkitExitFullscreen;
          if (exit) exit.call(document);
          return;
        }
        var req = frameWrap.requestFullscreen || frameWrap.webkitRequestFullscreen;
        if (req) {
          try { req.call(frameWrap); } catch (e) {}
        }
      });
    }
  })();

  // ---------- Tarjetas de proyectos (ver js/projects.js) ----------
  // OJO: esto tiene que correr ANTES de armar el scroll-reveal de abajo
  // -- si no, querySelectorAll(".reveal") solo agarra lo que ya estaba
  // en el HTML original y las tarjetas (agregadas despues, dinamico)
  // quedan con opacity:0 para siempre, nunca observadas.
  var grid = document.getElementById("project-grid");
  if (grid && typeof PROJECTS !== "undefined") {
    PROJECTS.forEach(function (project) {
      grid.appendChild(buildProjectCard(project));
    });
  }

  // ---------- Ampliar tarjeta (click en la portada) ----------
  // La portada recorta la imagen (object-fit: cover) para que todas las
  // tarjetas midan lo mismo -- clickearla la agranda mostrando la imagen
  // COMPLETA (object-fit: contain) y encoge el resto de las tarjetas. Un
  // solo listener delegado en el grid, asi funciona para todas las
  // tarjetas (incluso las que se agreguen a projects.js despues).
  if (grid) {
    var collapseExpanded = function () {
      grid.classList.remove("is-focused");
      grid.querySelectorAll(".project-card").forEach(function (c) {
        c.classList.remove("project-card--focused", "project-card--minimized");
      });
    };
    grid.addEventListener("click", function (e) {
      if (e.target.closest(".project-card__arrow, .project-card__dots")) return;
      var closeBtn = e.target.closest(".js-expand-close");
      var cover = closeBtn ? closeBtn.closest(".project-card__cover") : e.target.closest(".project-card__cover");
      if (!cover) return;
      var card = cover.closest(".project-card");
      var wasFocused = card.classList.contains("project-card--focused");
      collapseExpanded();
      if (closeBtn || wasFocused) return;
      grid.classList.add("is-focused");
      card.classList.add("project-card--focused");
      grid.querySelectorAll(".project-card").forEach(function (c) {
        if (c !== card) c.classList.add("project-card--minimized");
      });
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && grid.classList.contains("is-focused")) collapseExpanded();
    });
  }

  // ---------- Scroll reveal (reemplaza animate.css + waypoints) ----------
  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            setTimeout(function () {
              el.classList.add("is-visible");
            }, (i % 6) * 60);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealItems.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // ---------- Duracion de un gif (para el auto-avance del carrusel) ----------
  // No existe un evento "ended" para <img> con gif -- hay que leer los bytes
  // del archivo y sumar el delay de cada frame (Graphic Control Extension)
  // para saber cuanto dura UN loop completo. Cacheado por URL (gifDurationCache
  // declarado arriba de todo, ver comentario ahi).
  function getGifLoopDuration(url) {
    if (!gifDurationCache[url]) {
      gifDurationCache[url] = fetch(url)
        .then(function (res) { return res.arrayBuffer(); })
        .then(parseGifLoopDurationMs)
        .catch(function () { return 0; });
    }
    return gifDurationCache[url];
  }

  function skipGifSubBlocks(view, offset) {
    while (offset < view.byteLength) {
      var size = view.getUint8(offset);
      offset += 1;
      if (size === 0) break;
      offset += size;
    }
    return offset;
  }

  function parseGifLoopDurationMs(buffer) {
    var view = new DataView(buffer);
    var packed = view.getUint8(10);
    var offset = 13;
    if (packed & 0x80) {
      offset += 3 * Math.pow(2, (packed & 0x07) + 1); // global color table
    }
    var totalMs = 0;
    while (offset < view.byteLength) {
      var blockType = view.getUint8(offset);
      if (blockType === 0x21) {
        var label = view.getUint8(offset + 1);
        offset += 2;
        if (label === 0xf9) {
          var size = view.getUint8(offset);
          var delayCs = view.getUint16(offset + 2, true);
          // los navegadores tratan un delay de 0/1 (<=10ms) como 100ms para
          // no fundir la CPU -- sumamos lo mismo que realmente se ve.
          totalMs += delayCs <= 1 ? 100 : delayCs * 10;
          offset += 1 + size;
          offset = skipGifSubBlocks(view, offset);
        } else {
          offset = skipGifSubBlocks(view, offset);
        }
      } else if (blockType === 0x2c) {
        offset += 9; // separador + left/top/width/height
        var packedId = view.getUint8(offset);
        offset += 1;
        if (packedId & 0x80) {
          offset += 3 * Math.pow(2, (packedId & 0x07) + 1); // local color table
        }
        offset += 1; // LZW min code size
        offset = skipGifSubBlocks(view, offset);
      } else {
        break; // trailer (0x3b) u otra cosa -- listo
      }
    }
    return totalMs;
  }

  function buildProjectCard(project) {
    var card = document.createElement("article");
    card.className = "project-card reveal";
    card.id = "project-" + project.id;

    var tagsHtml = (project.tags || [])
      .map(function (t) {
        return '<span class="chip chip--ghost">' + t + "</span>";
      })
      .join("");

    var downloadsHtml = "";
    if (project.downloads && project.downloads.length) {
      downloadsHtml = project.downloads
        .map(function (d) {
          return (
            '<a class="btn btn--ghost btn--small" href="' +
            d.url +
            '" target="_blank" rel="noopener">' +
            d.label +
            "</a>"
          );
        })
        .join("");
    }

    // project.play es opcional -- proyectos como Bazado-DS (una ROM, no
    // se puede jugar en el navegador) solo tienen "downloads".
    var playHtml = "";
    if (project.play && project.play.type === "webgl") {
      playHtml =
        '<button type="button" class="btn btn--accent btn--small js-play-webgl">' +
        (project.play.label || "Jugar aca") +
        "</button>";
    } else if (project.play && project.play.type === "embed") {
      playHtml =
        '<button type="button" class="btn btn--accent btn--small js-play-toggle">' +
        (project.play.label || "Jugar aca") +
        "</button>";
    } else if (project.play) {
      playHtml =
        '<a class="btn btn--accent btn--small" href="' +
        project.play.url +
        '" target="_blank" rel="noopener">' +
        (project.play.label || "Jugar") +
        "</a>";
    }

    var gallery = project.gallery && project.gallery.length ? project.gallery : [project.cover];
    var dotsHtml = "";
    var arrowsHtml = "";
    if (gallery.length > 1) {
      dotsHtml =
        '<div class="project-card__dots">' +
        gallery
          .map(function (_, i) {
            return '<button type="button" class="dot' + (i === 0 ? " is-active" : "") + '" data-i="' + i + '" aria-label="Imagen ' + (i + 1) + '"></button>';
          })
          .join("") +
        "</div>";
      arrowsHtml =
        '<button type="button" class="project-card__arrow project-card__arrow--prev js-gallery-prev" aria-label="Imagen anterior">‹</button>' +
        '<button type="button" class="project-card__arrow project-card__arrow--next js-gallery-next" aria-label="Imagen siguiente">›</button>';
    }

    card.innerHTML =
      '<div class="project-card__cover">' +
      '<img src="' + gallery[0] + '" alt="' + project.title + '" loading="lazy">' +
      arrowsHtml +
      dotsHtml +
      '<button type="button" class="project-card__expand-close js-expand-close" aria-label="Cerrar vista ampliada">✕</button>' +
      "</div>" +
      '<div class="project-card__body">' +
      '<p class="meta-row meta-row--tight"><span>' + project.year + "</span><span>" + project.role + "</span><span>" + project.engine + "</span></p>" +
      "<h3>" + project.title + "</h3>" +
      '<p class="chips chips--tight">' + tagsHtml + "</p>" +
      "<p>" + project.description + "</p>" +
      '<div class="project-card__actions">' + playHtml + downloadsHtml + "</div>" +
      '<div class="project-card__embed" hidden></div>' +
      "</div>";

    if (gallery.length > 1) {
      var coverImg = card.querySelector(".project-card__cover img");
      var dots = card.querySelectorAll(".project-card__dots .dot");
      var current = 0;
      var fading = false;
      var autoAdvanceTimer = null;
      // Si la imagen actual es un gif, lo dejamos terminar UN loop completo
      // y recien ahi pasamos a la siguiente sola -- se cancela apenas el
      // usuario navega a mano (showImage siempre reprograma esto al final).
      var scheduleAutoAdvance = function (url, forIndex) {
        clearTimeout(autoAdvanceTimer);
        if (!/\.gif(\?|$)/i.test(url)) return;
        getGifLoopDuration(url).then(function (ms) {
          if (!ms || current !== forIndex) return;
          autoAdvanceTimer = setTimeout(function () {
            showImage(current + 1);
          }, ms);
        });
      };
      // Lerp leve entre una imagen y la otra (fade, no corte en seco) --
      // precarga la siguiente ANTES de arrancar el fade-out, asi el
      // fade-in de despues nunca espera de red, solo se ve la transicion.
      var showImage = function (i) {
        var next = (i + gallery.length) % gallery.length;
        if (next === current || fading) return;
        fading = true;
        clearTimeout(autoAdvanceTimer);
        var preload = new Image();
        preload.onload = function () {
          coverImg.classList.add("is-fading");
          setTimeout(function () {
            coverImg.src = gallery[next];
            current = next;
            dots.forEach(function (d, di) {
              d.classList.toggle("is-active", di === current);
            });
            coverImg.classList.remove("is-fading");
            fading = false;
            scheduleAutoAdvance(gallery[current], current);
          }, 260);
        };
        preload.src = gallery[next];
      };
      card.querySelector(".js-gallery-prev").addEventListener("click", function () {
        showImage(current - 1);
      });
      card.querySelector(".js-gallery-next").addEventListener("click", function () {
        showImage(current + 1);
      });
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showImage(parseInt(dot.dataset.i, 10));
        });
      });
      scheduleAutoAdvance(gallery[0], 0);
    }

    if (project.play && project.play.type === "webgl") {
      var webglBtn = card.querySelector(".js-play-webgl");
      webglBtn.addEventListener("click", function () {
        if (window.GamePlayer) window.GamePlayer.open(project);
      });
    }

    if (project.play && project.play.type === "embed") {
      var toggleBtn = card.querySelector(".js-play-toggle");
      var embedBox = card.querySelector(".project-card__embed");
      toggleBtn.addEventListener("click", function () {
        var isOpen = !embedBox.hidden;
        if (isOpen) {
          embedBox.hidden = true;
          embedBox.innerHTML = "";
          toggleBtn.textContent = project.play.label || "Jugar aca";
        } else {
          embedBox.hidden = false;
          if (!embedBox.querySelector("iframe")) {
            var iframe = document.createElement("iframe");
            iframe.src = project.play.url;
            iframe.loading = "lazy";
            iframe.allow = "gamepad; fullscreen";
            iframe.title = project.title + " — jugable";
            embedBox.appendChild(iframe);
          }
          toggleBtn.textContent = "Cerrar";
          embedBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    }

    return card;
  }
})();
