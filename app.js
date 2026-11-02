/* OPTCG Barcelona — catálogo de cartas. Los datos vienen de stock.json, que se
   regenera automáticamente desde Cardmarket. */
(function () {
  "use strict";

  var SHOP = {
    // Número de WhatsApp con prefijo, sin "+" ni espacios (ej. 34600111222).
    whatsapp: "34603420373",
    cardmarket: "https://www.cardmarket.com/en/OnePiece/Users/G11GAB"
  };

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]; }); };
  var eur = function (n) { return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"; };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) { /* sin almacenamiento */ } }
  };

  /* ---------------- iconos de color ---------------- */
  var GLYPH = {
    red: "M12 3.2c.6 2.6 3.9 4.4 3.9 8.4a3.9 3.9 0 0 1-7.8 0c0-1.6.8-2.8 1.8-3.6-.1 1.4.5 2.4 1.4 2.8-.4-2.6.3-5.4.7-7.6Z",
    green: "M18.5 5.5C11 5.3 6.2 9.3 6.4 15.2c0 .9.2 1.7.5 2.4L5 19.5l1 1 1.9-1.9c.7.3 1.5.5 2.4.5 5.9.2 9.9-4.6 8.2-13.6ZM8.9 17.1c1.6-3.4 4.1-5.8 7-7.4-2.6 2.1-4.6 4.6-5.8 7.6Z",
    blue: "M3.5 14.6c1.6 0 2.4-1.1 3.3-2.3 1-1.4 2.3-3.2 4.9-3.2 2.4 0 3.8 1.5 3.8 3.2 0 1.2-.8 2-1.9 2-1 0-1.6-.6-1.6-1.4 0-.4.2-.8.5-1-1.6-.2-2.6 1.3-3.4 2.6-.9 1.3-2 2.8-4 2.8h12.4c1.3 0 2.5-.6 3.2-1.6v3.1H3.5Z",
    purple: "M13.6 2.8 5.8 13.4h5l-1.5 7.8 8.9-11.3h-5.3Z",
    black: "M12 3a2.3 2.3 0 0 0-1 4.4v1.4H8.4v1.8H11v8.2c-2.6-.4-4.5-2.1-5-4.2l1.6.6-2.5-4-1.3 4.6 1.2-.7c.6 3.4 3.8 5.9 7 5.9s6.4-2.5 7-5.9l1.2.7-1.3-4.6-2.5 4 1.6-.6c-.5 2.1-2.4 3.8-5 4.2v-8.2h2.6V8.8H13V7.4A2.3 2.3 0 0 0 12 3Zm0 1.5a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Z",
    yellow: "M12 7.6a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8ZM11.1 2.5h1.8v3h-1.8Zm0 16h1.8v3h-1.8ZM2.5 11.1h3v1.8h-3Zm16 0h3v1.8h-3ZM5 6.3l1.3-1.3 2.1 2.1-1.3 1.3Zm10.6 10.6 1.3-1.3 2.1 2.1-1.3 1.3ZM5 17.7l2.1-2.1 1.3 1.3L6.3 19Zm10.6-10.6 2.1-2.1L19 6.3l-2.1 2.1Z"
  };
  var COLORS = [["red", "Rojo"], ["green", "Verde"], ["blue", "Azul"], ["purple", "Morado"], ["black", "Negro"], ["yellow", "Amarillo"]];
  var CNAME = {}; COLORS.forEach(function (c) { CNAME[c[0]] = c[1]; });
  function icon(k, size) {
    if (!GLYPH[k]) return "";
    return '<svg class="color-icon color-icon--' + k + '" width="' + size + '" height="' + size + '" viewBox="0 0 32 32" aria-hidden="true">' +
      '<circle cx="16" cy="16" r="14.5" class="color-icon__ring"/><circle cx="16" cy="16" r="12" class="color-icon__fill"/>' +
      '<path d="M7.5 11.5a10 10 0 0 1 6-6" class="color-icon__shine"/><g transform="translate(4 4)"><path d="' + GLYPH[k] + '" class="color-icon__glyph"/></g></svg>';
  }
  function dots(c) {
    return '<span class="shop-dots" aria-label="' + c.col.map(function (k) { return CNAME[k] || k; }).join(" / ") + '">' + c.col.map(function (k) { return icon(k, 16); }).join("") + "</span>";
  }

  var RAR = { C: "C", UC: "UC", R: "R", SR: "SR", SEC: "SEC", L: "LÍDER", AA: "ALT ART", SP: "SP", TR: "TR", MR: "MANGA" };
  var RARN = { C: "Común", UC: "Infrecuente", R: "Rara", SR: "Súper rara", SEC: "Secreta", L: "Líder", AA: "Arte alternativo", SP: "Special", TR: "Treasure", MR: "Manga" };
  var TYPES = { Character: "Personaje", Leader: "Líder", Event: "Evento", Stage: "Escenario" };
  var isHot = function (c) { return c.p >= 1; };
  var isAlt = function (c) { return c.v === 2 || ["AA", "SP", "SEC", "MR", "TR"].indexOf(c.r) >= 0; };
  var keyOf = function (c) { return c.c + "#" + c.v; };
  var CATS = [
    ["all", "Todas", function () { return true; }],
    ["hot", "Destacadas", isHot],
    ["alt", "Arte alternativo", isAlt],
    ["lead", "Líderes", function (c) { return c.t === "Leader"; }],
    ["deck", "Para el mazo", function (c) { return c.p < 1 && c.t !== "Leader"; }]
  ];

  var CARDS = [], BYKEY = {}, UPDATED = "";
  var state = { cat: "all", color: "", set: "", q: "", sort: "pd" };
  var cart = {};
  try { cart = JSON.parse(store.get("optcg-cart") || "{}") || {}; } catch (e) { cart = {}; }

  /* ---------------- catálogo ---------------- */
  function chips() {
    $("cats").innerHTML = CATS.map(function (x) {
      return '<button type="button" class="shop-tab" data-cat="' + x[0] + '" aria-pressed="' + (state.cat === x[0]) + '">' + x[1] + "<span>" + CARDS.filter(x[2]).length + "</span></button>";
    }).join("");
    $("colors").innerHTML = COLORS.filter(function (x) { return CARDS.some(function (c) { return c.col.indexOf(x[0]) >= 0; }); }).map(function (x) {
      return '<button type="button" class="shop-color" data-color="' + x[0] + '" aria-pressed="' + (state.color === x[0]) + '">' + icon(x[0], 30) + "<span>" + x[1] + "</span></button>";
    }).join("");
    var sets = []; CARDS.forEach(function (c) { if (sets.indexOf(c.set) < 0) sets.push(c.set); });
    $("sets").innerHTML = sets.map(function (s) {
      return '<button type="button" class="shop-set" data-set="' + esc(s) + '" aria-pressed="' + (state.set === s) + '">' + esc(s) + "</button>";
    }).join("");
  }

  function qtyHtml(c) {
    var n = cart[keyOf(c)] || 0;
    if (!n) return '<button type="button" class="shop-add" data-add="' + esc(keyOf(c)) + '" aria-label="Añadir ' + esc(c.n) + '"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>';
    return '<div class="shop-step"><button type="button" data-dec="' + esc(keyOf(c)) + '" aria-label="Quitar una">−</button><span>' + n + '</span><button type="button" data-inc="' + esc(keyOf(c)) + '" aria-label="Añadir una"' + (n >= c.q ? " disabled" : "") + ">+</button></div>";
  }

  function list() {
    var fn = CATS.filter(function (x) { return x[0] === state.cat; })[0][2];
    var s = state.q.trim().toLowerCase();
    var r = CARDS.filter(function (c) {
      return fn(c) && (!state.color || c.col.indexOf(state.color) >= 0) && (!state.set || c.set === state.set) &&
        (!s || (c.n + " " + c.c + " " + c.set).toLowerCase().indexOf(s) >= 0);
    });
    r.sort(function (a, b) {
      if (state.sort === "pd") return b.p - a.p || a.n.localeCompare(b.n);
      if (state.sort === "pa") return a.p - b.p || a.n.localeCompare(b.n);
      if (state.sort === "na") return a.n.localeCompare(b.n);
      return a.c.localeCompare(b.c);
    });
    return r;
  }

  function render() {
    var r = list();
    $("count").textContent = r.length + (r.length === 1 ? " carta" : " cartas");
    $("empty").hidden = r.length > 0;
    $("grid").innerHTML = r.map(function (c) {
      return '<li class="shop-card"' + (isHot(c) ? " data-hot" : "") + ">" +
        '<button type="button" class="shop-thumb" data-zoom="' + esc(keyOf(c)) + '" aria-label="Ver ' + esc(c.n + " " + c.c) + '">' +
        '<img src="' + c.img + '" alt="' + esc(c.n + " " + c.c) + '" loading="lazy" decoding="async" width="300" height="419">' +
        '<span class="shop-rar">' + (RAR[c.r] || c.r) + "</span></button>" +
        '<div class="shop-meta"><h3 class="shop-name">' + esc(c.n) + '</h3><p class="shop-sub">' + dots(c) + c.c + (c.v === 2 ? " · alt" : "") + "</p>" +
        '<div class="shop-buy"><p class="shop-price">' + eur(c.p) + "<small>" + c.q + (c.q === 1 ? " disponible" : " disponibles") + "</small></p>" + qtyHtml(c) + "</div></div></li>";
    }).join("");
    updateDock();
  }

  /* ---------------- pedido ---------------- */
  function items() {
    return Object.keys(cart).map(function (k) { return { c: BYKEY[k], n: cart[k] }; })
      .filter(function (x) { return x.c && x.c.q > 0; })
      .map(function (x) { return { c: x.c, n: Math.min(x.n, x.c.q) }; });
  }
  function totals() {
    var it = items();
    return { it: it, n: it.reduce(function (a, x) { return a + x.n; }, 0), t: it.reduce(function (a, x) { return a + x.n * x.c.p; }, 0) };
  }
  function setQty(key, n) {
    var c = BYKEY[key]; if (!c) return;
    n = Math.max(0, Math.min(c.q, n));
    if (n) cart[key] = n; else delete cart[key];
    store.set("optcg-cart", JSON.stringify(cart));
    render();
    if (!$("modal").hidden) { if (modalKind === "order") openOrder(); else if (modalKind === "zoom") openZoom(zoomKey); }
  }
  function updateDock() {
    var t = totals();
    $("dock").hidden = !t.n || !$("modal").hidden;
    $("dock-n").textContent = t.n; $("dock-t").textContent = eur(t.t);
    $("navbag").hidden = !t.n; $("navbag-n").textContent = t.n;
  }
  function message() {
    var t = totals(), who = (store.get("optcg-buyer") || "").trim();
    var lines = t.it.slice().sort(function (a, b) { return b.c.p - a.c.p; }).map(function (x) {
      return "• " + x.n + "× " + x.c.n + " (" + x.c.c + (x.c.v === 2 ? " alt" : "") + ") - " + eur(x.c.p * x.n);
    });
    return "¡Hola! " + (who ? "Soy " + who + ". " : "") + "Quiero estas cartas de OPTCG Barcelona para recogerlas en mano en Barcelona:\n" + lines.join("\n") +
      "\n\nTotal: " + eur(t.t) + " (" + t.n + (t.n === 1 ? " carta" : " cartas") + ")\n¿Están disponibles?";
  }

  /* ---------------- ventanas ---------------- */
  var modalKind = "", zoomKey = "", lastFocus = null;
  function showModal(kind, html, label) {
    modalKind = kind; $("modal-body").innerHTML = html; $("modal").setAttribute("aria-label", label);
    if ($("modal").hidden) { lastFocus = document.activeElement; $("modal").hidden = false; $("modal-x").focus(); }
    updateDock();
  }
  function closeModal() {
    $("modal").hidden = true; modalKind = ""; updateDock();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function openZoom(key) {
    var c = BYKEY[key]; if (!c) return; zoomKey = key;
    showModal("zoom", '<div class="shop-zoom"><img src="' + c.img + '" alt="' + esc(c.n + " " + c.c) + '"><div>' +
      '<h3 class="shop-zoom__name">' + esc(c.n) + "</h3>" +
      '<p class="shop-sub">' + dots(c) + c.c + (c.v === 2 ? " · arte alternativo" : "") + " · " + (RARN[c.r] || c.r) + " · " + (TYPES[c.t] || c.t) + "</p>" +
      '<p class="shop-sub">' + esc(c.set) + " · Inglés · Near Mint · " + c.q + (c.q === 1 ? " disponible" : " disponibles") + "</p>" +
      '<div class="shop-buy"><p class="shop-price shop-price--big">' + eur(c.p) + "</p>" + qtyHtml(c) + "</div></div></div>", c.n);
  }
  var WA_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.1Z"/></svg>';
  var cmName = function (c) { return SHOP.cardmarket + "/Offers/Singles?name=" + encodeURIComponent(c.n); };
  function openOrder() {
    var t = totals();
    if (!t.n) { closeModal(); return; }
    var who = store.get("optcg-buyer") || "";
    showModal("order", '<div class="shop-order"><h2 class="shop-order__title">Tu pedido.</h2><ul class="shop-lines">' +
      t.it.map(function (x) {
        return '<li><img src="' + x.c.img + '" alt="" width="44" height="61"><div><strong>' + esc(x.c.n) + "</strong><span>" + x.c.c + " · " + eur(x.c.p) + " c/u</span></div>" +
          '<div class="shop-lines__r"><b>' + eur(x.c.p * x.n) + "</b>" + qtyHtml(x.c) + "</div></li>";
      }).join("") + "</ul>" +
      '<p class="shop-sum"><span>' + t.n + (t.n === 1 ? " carta" : " cartas") + "</span><b>" + eur(t.t) + "</b></p>" +
      '<h3 class="shop-choose">¿Cómo lo quieres?</h3>' +
      '<section class="shop-opt" aria-labelledby="opt-hand">' +
        '<p class="shop-opt__tag">Opción 1</p><h4 id="opt-hand">Recogida en mano en Barcelona</h4>' +
        "<p>Me mandas el pedido por WhatsApp y quedamos en Barcelona. Pagas al recoger.</p>" +
        '<label class="shop-field" for="who">Tu nombre (opcional)</label><input id="who" class="shop-input" value="' + esc(who) + '" placeholder="Para saber de quién es el pedido">' +
        '<a class="shop-wa" id="wa" target="_blank" rel="noopener noreferrer" href="https://wa.me/' + SHOP.whatsapp + "?text=" + encodeURIComponent(message()) + '">' + WA_ICON + "Pedir por WhatsApp</a>" +
      "</section>" +
      '<section class="shop-opt" aria-labelledby="opt-cm">' +
        '<p class="shop-opt__tag">Opción 2</p><h4 id="opt-cm">Envío a casa con Cardmarket</h4>' +
        "<p>Compra en mi tienda de Cardmarket. Pago protegido y envío con seguimiento a toda Europa.</p>" +
        '<ul class="shop-cmlist">' + t.it.map(function (x) { return '<li><a href="' + cmName(x.c) + '" target="_blank" rel="noopener noreferrer">' + esc(x.c.n) + " <span>" + x.c.c + "</span></a></li>"; }).join("") + "</ul>" +
        '<a class="shop-cm" href="' + SHOP.cardmarket + '/Offers/Singles" target="_blank" rel="noopener noreferrer">Ir a mi tienda en Cardmarket</a>' +
      "</section>" +
      '<div class="shop-actions"><button type="button" class="shop-copy" id="copy">Copiar el pedido</button><button type="button" class="shop-clear" id="clear">Vaciar pedido</button></div>' +
      '<pre class="shop-msg" id="msg" hidden></pre></div>', "Tu pedido");
  }
  function toast(t) {
    var e = document.createElement("div"); e.className = "shop-toast"; e.setAttribute("role", "status"); e.textContent = t;
    document.body.appendChild(e); setTimeout(function () { e.remove(); }, 2200);
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("button, a"); if (!el) return;
    var d = el.dataset;
    if (d.cat) { state.cat = d.cat; chips(); render(); }
    else if (d.color) { state.color = state.color === d.color ? "" : d.color; chips(); render(); }
    else if (d.set != null && el.classList.contains("shop-set")) { state.set = state.set === d.set ? "" : d.set; chips(); render(); }
    else if (d.add) setQty(d.add, 1);
    else if (d.inc) setQty(d.inc, (cart[d.inc] || 0) + 1);
    else if (d.dec) setQty(d.dec, (cart[d.dec] || 0) - 1);
    else if (d.zoom) openZoom(d.zoom);
    else if (el.id === "dock-btn") openOrder();
    else if (el.id === "navbag") { e.preventDefault(); openOrder(); }
    else if (el.id === "modal-x") closeModal();
    else if (el.id === "clear") { cart = {}; store.del("optcg-cart"); render(); closeModal(); }
    else if (el.id === "copy") {
      var txt = message();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { toast("Mensaje copiado"); }, function () { $("msg").textContent = txt; $("msg").hidden = false; toast("Mantén pulsado el texto para copiarlo"); });
      } else { $("msg").textContent = txt; $("msg").hidden = false; }
    }
  });
  $("modal").addEventListener("click", function (e) { if (e.target === $("modal")) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("modal").hidden) closeModal(); });
  document.addEventListener("input", function (e) {
    if (e.target.id === "q") { state.q = e.target.value; render(); }
    if (e.target.id === "who") { store.set("optcg-buyer", e.target.value); var wa = $("wa"); if (wa) wa.href = "https://wa.me/" + SHOP.whatsapp + "?text=" + encodeURIComponent(message()); }
  });
  $("sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });

  /* ---------------- datos ---------------- */
  fetch("stock.json?v=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (data) {
    UPDATED = data.updated;
    CARDS = data.cards.filter(function (c) { return c.q > 0; });
    CARDS.forEach(function (c) { BYKEY[keyOf(c)] = c; });
    var copies = CARDS.reduce(function (a, c) { return a + c.q; }, 0);
    $("lede").textContent = CARDS.length + " cartas. " + copies.toLocaleString("es-ES") + " copias. Toca una para verla de cerca.";
    $("count-title").textContent = CARDS.length + " cartas";
    var sets = []; CARDS.forEach(function (c) { var s = c.c.split("-")[0]; if (sets.indexOf(s) < 0 && /^(OP|EB)/.test(s)) sets.push(s); });
    $("set-tags").innerHTML = sets.sort().slice(-5).map(function (s) { return "<li>" + s + "</li>"; }).join("");
    $("foot").innerHTML = "Precios en euros, actualizados el " + esc(UPDATED) + ". Todas en inglés y Near Mint. También en <a href=\"" + SHOP.cardmarket + "\" target=\"_blank\" rel=\"noopener noreferrer\">Cardmarket</a>.";
    chips(); render();
  }).catch(function () { $("lede").textContent = "No se han podido cargar las cartas. Recarga la página."; });

  /* ---------------- película con scroll ---------------- */
  var journey = $("journey"), film = $("film"), bar = $("jbar");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var target = 0, current = 0, ready = false, ticking = false;
  function progress() {
    var r = journey.getBoundingClientRect(), total = journey.offsetHeight - window.innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
  }
  function onScroll() {
    var p = progress(); bar.style.setProperty("--p", p.toFixed(4));
    var chapters = ["c1", "c2", "c3"], idx = Math.min(2, Math.floor(p * 3));
    document.querySelectorAll(".journey__dots a").forEach(function (a, i) { a.setAttribute("aria-current", i === idx ? "true" : "false"); });
    if (ready) { target = p * (film.duration - 0.05); if (!ticking) { ticking = true; requestAnimationFrame(tick); } }
  }
  function tick() {
    current += (target - current) * 0.18;
    if (Math.abs(target - current) < 0.01) current = target;
    if (Math.abs(film.currentTime - current) > 1 / 60) { try { film.currentTime = current; } catch (e) { /* busy */ } }
    if (current !== target) requestAnimationFrame(tick); else ticking = false;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
  if (!reduce) {
    var mobile = window.matchMedia("(max-width: 860px)").matches;
    var src = mobile ? "assets/film/film-mobile.mp4" : "assets/film/film.mp4";
    fetch(src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function (b) {
      film.src = URL.createObjectURL(b);
      film.addEventListener("loadeddata", function () {
        ready = true; var pp = film.play(); if (pp && pp.then) pp.then(function () { film.pause(); onScroll(); }, function () {}); else film.pause(); film.classList.add("is-ready"); onScroll();
      }, { once: true });
      film.load();
    }).catch(function () { /* se queda el póster */ });
  }
})();
