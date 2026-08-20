// Datos de "Personal Projects" -- agregar un juego nuevo es sumar un
// objeto a este array, nada de copiar/pegar markup. js/site.js lee
// esto y arma las tarjetas.
//
// play.type: "webgl"  -> build de WebGL subida al propio repo (ver carpeta
//                         games/). Al apretar jugar se abre un reproductor
//                         de pantalla completa (js/game-player.js), no un
//                         iframe chico adentro de la tarjeta.
//                         path: ruta al index.html del build, ej.
//                         "games/gun-gambit/index.html".
//                         Convencion: cada build va en su propia carpeta
//                         games/<id-del-proyecto>/ con TODO lo que exporta
//                         el motor (index.html, Build/, TemplateData/, etc)
//                         intacto, sin tocar nombres de archivo.
//                         OJO Unity: en Publishing Settings poner Compression
//                         Format en "Disabled" -- GitHub Pages no manda el
//                         header Content-Encoding que un build comprimido
//                         (gzip/brotli) necesita, y el juego no carga.
//            "embed"  -> abre un iframe adentro de la tarjeta apuntando a
//                         una URL externa (el juego tiene que permitir ser
//                         embebido -- Netlify/GitHub Pages andan bien).
//            "external" -> boton que abre el link en pestaña nueva
//                           (itch.io no siempre expone una URL de embed
//                           estable sin entrar a buscarla a mano).
// downloads: opcional, lista de {label, url} -- botones aparte del de jugar.
const PROJECTS = [
  
  
  {
    id: "lagrima",
    title: "L'agrima, The Eternal Sword",
    year: "2023",
    role: "Solo project",
    engine: "Unity · Windows",
    tags: ["3D", "Isometrico", "Combate"],
    cover: "images/portada.jpg",
    gallery: ["images/portada.jpg", "images/screenshot1.jpg", "images/screenshot2.jpg", "images/screenshot4.jpg", "images/screenshot5.jpg", "images/screenshot6.jpg"],
    description:
      "Fantasia isometrica estilo Diablo. Prototipo enfocado en IA de combate: jefes con maquina de estados, sistema de compra/mejora de habilidades y cinematicas en un entorno 3D.",
    play: { type: "external", url: "https://zdextiny.itch.io/lagrima-the-eternal-sword", label: "Jugar en itch.io ↗" },
  },
 {
    id: "bazado-ds",
    title: "BazaDS",
    year: "2026",
    role: "Solo project",
    engine: "Nintendo DS · libnds (C)",
    tags: ["Homebrew", "Nintendo DS", "C", "Port"],
    cover: "images/bazado-ds-anim-1.gif",
    gallery: ["images/bazado-ds-anim-1.gif", "images/bazado-ds-anim-2.gif", "images/bazado-ds-anim-3.gif"],
    description:
      "Port completo de El Bazado a un homebrew de Nintendo DS en C puro. Usando desde las capaciades touch hasta el microfono de la consola. Totalmente funcional en el dispositivo original como emuladores",
    downloads: [
      { label: "Descargar ROM (.nds)", url: "https://github.com/zdextiny/Bazado-DS/releases" },
      { label: "Codigo fuente", url: "https://github.com/zdextiny/Bazado-DS" },
    ],
  },

  {
    id: "el-bazado",
    title: "El Bazado",
    year: "2026",
    role: "Solo project",
    engine: "HTML5 / WebGL · Electron",
    tags: ["Cartas", "Online", "Web", "Crossplay"],
    cover: "images/el-bazado-anim-1.gif",
    gallery: ["images/el-bazado-anim-1.gif", "images/el-bazado-anim-2.gif", "images/el-bazado-anim-3.gif"],
    description:
      "Juego de bazas tanto Online como contra la maquina en distintas dificultades. Proyecto para probar crear un entorno online simple ademas de tener croosplay entre celular y pc.",
    play: { type: "external", url: "https://el-bazado.netlify.app", label: "Jugar Online" },
  },
  {
    id: "astrocat",
    title: "AstroCat Catcher",
    year: "2022",
    role: "Solo project",
    engine: "Unity · Windows / WebGL",
    tags: ["Arcade", "2D", "Pixel art"],
    cover: "images/astrocat-anim-1.gif",
    gallery: ["images/astrocat-anim-1.gif", "images/astrocat-anim-2.gif", "images/astrocat-anim-3.gif"],
    description:
      "Arcade 2D inspirado en Snake. Practica de particulas, shaders y ritmo en un espacio controlado - todo el arte es propio.",
    play: { type: "webgl", path: "games/astrocat-catcher/index.html", label: "Jugar aca" },
    downloads: [
      { label: "Codigo fuente", url: "https://github.com/zdextiny/AstroCat-Catcher" },
    ],
  },
  {
    id: "gun-gambit",
    title: "Gun Gambit",
    year: "2023",
    role: "Grupal",
    engine: "Unity · Windows / WebGL",
    tags: ["Top-down", "Accion"],
    cover: "images/gun1.png",
    gallery: ["images/gun1.gif", "images/gun2.png", "images/gun3.png"],
    description:
      "Top-down estilo Hotline Miami. En este proyecto estuve en el area deesting, pulido, optimizacion, la version WebGL y el diseño de niveles.",
    play: { type: "external", url: "https://zdextiny.itch.io/gun-ganbit", label: "Jugar en itch.io ↗" },
  },
 
];
