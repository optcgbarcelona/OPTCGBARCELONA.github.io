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
    ["hot", "Más buscadas", isHot],
    ["alt", "Arte alternativo", isAlt],
    ["lead", "Líderes", function (c) { return c.t === "Leader"; }],
    ["deck", "Para el mazo", function (c) { return c.p < 1 && c.t !== "Leader"; }]
  ];

  var CARDS = [], BYKEY = {}, UPDATED = "";
  var state = { cat: "all", color: "", set: "", q: "", sort: "pd" };
  var cart = {};
  try { cart = JSON.parse(store.get("optcg-cart") || "{}") || {}; } catch (e) { cart = {}; }

  /* ---------------- catálogo ---------------- */
  var DOT = { red: "#e0453c", green: "#22a25c", blue: "#2f7ae0", purple: "#9150cc", black: "#2b2f36", yellow: "#f0c22e" };
  function setName(p) { var s = CARDS.filter(function (c) { return c.c.split("-")[0] === p; }); var n = {}; s.forEach(function (c) { n[c.set] = (n[c.set] || 0) + 1; }); return Object.keys(n).sort(function (a, b) { return n[b] - n[a]; })[0] || ""; }
  var pend = null;
  function countWith(p) { var a = state.color, b = state.set; state.color = p.color; state.set = p.set; var n = list().length; state.color = a; state.set = b; return n; }
  function chips() {
    var sel = pend || state;
    $("cats").innerHTML = CATS.map(function (x) {
      return '<button type="button" class="ctab" data-cat="' + x[0] + '" aria-pressed="' + (state.cat === x[0]) + '">' + x[1] + "</button>";
    }).join("");
    $("colors").innerHTML = COLORS.filter(function (x) { return CARDS.some(function (c) { return c.col.indexOf(x[0]) >= 0; }); }).map(function (x) {
      return '<button type="button" class="fopt" data-color="' + x[0] + '" style="--dot:' + DOT[x[0]] + '" aria-pressed="' + (sel.color === x[0]) + '"><i></i>' + x[1] + "</button>";
    }).join("");
    var pres = []; CARDS.forEach(function (c) { var p = c.c.split("-")[0]; if (pres.indexOf(p) < 0) pres.push(p); });
    pres.sort(function (a, b) { var A = CARDS.filter(function (c) { return c.c.indexOf(a + "-") === 0; }).length, B = CARDS.filter(function (c) { return c.c.indexOf(b + "-") === 0; }).length; return B - A; });
    $("sets").innerHTML = pres.map(function (p) {
      return '<button type="button" class="fopt" data-set="' + p + '" title="' + esc(setName(p)) + '" aria-pressed="' + (sel.set === p) + '">' + p + "</button>";
    }).join("");
    var act = [];
    if (state.color) act.push('<button type="button" class="cchip" data-color="' + state.color + '">' + COLORS.filter(function (x) { return x[0] === state.color; })[0][1] + "<i>✕</i></button>");
    if (state.set) act.push('<button type="button" class="cchip" data-set="' + state.set + '">' + state.set + " · " + esc(setName(state.set)) + "<i>✕</i></button>");
    if (act.length > 1) act.push('<button type="button" class="cclear" id="freset2">Borrar todo</button>');
    $("active").innerHTML = act.join("");
    var n = (state.color ? 1 : 0) + (state.set ? 1 : 0);
    $("fcount").hidden = !n; $("fcount").textContent = n;
    if (pend) $("fdone").textContent = "Ver " + countWith(pend) + " cartas";
  }
  function panel(open, apply) {
    if (open) pend = { color: state.color, set: state.set };
    else { if (apply && pend) { state.color = pend.color; state.set = pend.set; render(); } pend = null; }
    $("fpanel").hidden = !open; $("fscrim").hidden = !open; $("fbtn").setAttribute("aria-expanded", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
    chips();
  }

  function qtyHtml(c) {
    var n = cart[keyOf(c)] || 0;
    if (!n) return '<button type="button" class="shop-add" data-add="' + esc(keyOf(c)) + '" aria-label="Añadir ' + esc(c.n) + ' al pedido">Lo quiero</button>';
    return '<div class="shop-step"><button type="button" data-dec="' + esc(keyOf(c)) + '" aria-label="Quitar una">−</button><span>' + n + '</span><button type="button" data-inc="' + esc(keyOf(c)) + '" aria-label="Añadir una"' + (n >= c.q ? " disabled" : "") + ">+</button></div>";
  }

  function list() {
    var fn = CATS.filter(function (x) { return x[0] === state.cat; })[0][2];
    var s = state.q.trim().toLowerCase();
    var r = CARDS.filter(function (c) {
      return fn(c) && (!state.color || c.col.indexOf(state.color) >= 0) && (!state.set || c.c.indexOf(state.set + "-") === 0) &&
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

  function tag(c) {
    if (c.q === 1) return '<span class="tag tag--red">Última unidad</span>';
    if (c.q <= 3) return '<span class="tag tag--red">Quedan ' + c.q + "</span>";
    if (c.r === "SP" || c.r === "SEC" || c.r === "MR" || c.r === "TR") return '<span class="tag">' + (RARN[c.r] || c.r) + "</span>";
    return "";
  }
  function tile(c) {
    return '<li class="shop-card"' + (isHot(c) ? " data-hot" : "") + ">" +
      '<button type="button" class="shop-thumb" data-zoom="' + esc(keyOf(c)) + '" aria-label="Ver ' + esc(c.n + " " + c.c) + '">' +
      tag(c) + '<span class="shop-rar">' + (RAR[c.r] || c.r) + "</span>" +
      '<img src="' + c.img + '" alt="' + esc(c.n + " " + c.c) + '" loading="lazy" decoding="async" width="300" height="419"></button>' +
      '<div class="shop-meta"><h3 class="shop-name">' + esc(c.n) + '</h3><p class="shop-sub">' + c.c + (c.v === 2 ? " · Alt art" : "") + "</p>" +
      '<div class="shop-buy"><p class="shop-price">' + eur(c.p) + "</p>" + qtyHtml(c) + "</div></div></li>";
  }
  var PREVIEW = 10, expanded = false;
  function render() {
    var r = list();
    $("count").textContent = r.length + (r.length === 1 ? " carta" : " cartas");
    $("empty").hidden = r.length > 0;
    var limit = (expanded || state.q.trim()) ? r.length : PREVIEW;
    $("grid").innerHTML = r.slice(0, limit).map(tile).join("");
    var more = r.length > limit;
    $("more").hidden = !more && !(expanded && r.length > PREVIEW);
    $("grid").classList.toggle("is-cut", more);
    $("more-btn").innerHTML = more ? "Ver las " + r.length + " cartas <span>↓</span>" : "Mostrar menos <span>↑</span>";
    if (CARDS.length) $("top-grid").innerHTML = CARDS.slice().sort(function (a, b) { return b.p - a.p; }).slice(0, 4).map(tile).join("");
    updateDock();
    reveal();
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
    render(); checkGift();
    if (!$("modal").hidden) { if (modalKind === "order") openOrder(); else if (modalKind === "zoom") openZoom(zoomKey); else if (modalKind === "news") openNews(newsOpen); }
  }
  function updateDock() {
    var t = totals();
    $("dock").hidden = !t.n || !$("modal").hidden;
    $("dock-n").textContent = t.n; $("dock-t").textContent = eur(t.t);
    var dg = $("dock-gift"); if (dg) dg.innerHTML = giftHTML(t.t, true);
    $("navbag").hidden = !t.n; $("navbag-n").textContent = t.n;
  }
  /* ---------------- carta sorpresa (regalo) ---------------- */
  var GIFT_AT = 50, wasGift = false;
  var ORDER = String(1000 + Math.floor(Math.random() * 9000));
  function giftHTML(t, small) {
    var pct = Math.min(100, Math.round(t / GIFT_AT * 100)), full = t >= GIFT_AT;
    var left = full ? "¡Carta sorpresa desbloqueada!" : "Te faltan " + eur(GIFT_AT - t) + " para tu carta sorpresa";
    return '<span class="gift' + (full ? " full" : "") + (small ? " gift--sm" : "") + '"><span class="gift__row"><span class="gift__track"><span class="gift__fill" style="width:' + pct + '%"></span></span>' +
      '<span class="gift__card" aria-hidden="true"><span class="gift__face gift__face--b"><b style="height:' + pct + '%"></b><i>?</i></span><span class="gift__face gift__face--f">★</span></span></span>' +
      (small ? "" : '<span class="gift__txt"><span>' + left + "</span><b>" + (full ? "★ ¡Es tuya!" : eur(t).replace(" €", "") + " / " + GIFT_AT + " €") + "</b></span>") + "</span>";
  }
  function confetti() {
    var box = document.createElement("div"); box.className = "confetti"; box.setAttribute("aria-hidden", "true");
    var cols = ["#e1251b", "#0b0b0b", "#ffffff", "#e1251b", "#d6d4ce"], html = "";
    for (var i = 0; i < 70; i++) html += '<i style="left:' + (Math.random() * 100) + "%;background:" + cols[i % cols.length] + ";animation-delay:" + (Math.random() * .5).toFixed(2) + "s;animation-duration:" + (1.6 + Math.random() * 1.4).toFixed(2) + "s;--r:" + Math.round(Math.random() * 720 - 360) + "deg;--x:" + Math.round(Math.random() * 160 - 80) + 'px"></i>';
    box.innerHTML = html; document.body.appendChild(box); setTimeout(function () { box.remove(); }, 3600);
  }
  function checkGift() {
    var t = totals().t, full = t >= GIFT_AT;
    if (full && !wasGift) { toast("★ ¡Carta sorpresa desbloqueada!"); confetti(); }
    wasGift = full;
  }

  function message() {
    var t = totals(), who = (store.get("optcg-buyer") || "").trim();
    var lines = t.it.slice().sort(function (a, b) { return b.c.p - a.c.p; }).map(function (x) {
      return "• " + x.n + "× " + x.c.n + " (" + x.c.c + (x.c.v === 2 ? " alt" : "") + ") - " + eur(x.c.p * x.n);
    });
    return "¡Hola! " + (who ? "Soy " + who + ". " : "") + "Pedido #OB-" + ORDER + " de OPTCG Barcelona, para recoger en mano en Barcelona:\n" + lines.join("\n") +
      "\n\nTotal: " + eur(t.t) + " (" + t.n + (t.n === 1 ? " carta" : " cartas") + ")" + (t.t >= GIFT_AT ? "\n★ Con carta sorpresa (pedido de " + GIFT_AT + " € o más)" : "") + "\n¿Están disponibles?";
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
  /* ---------------- ticket ---------------- */
  function ticket(kind) {
    var t = totals(); if (!t.n) return;
    var hand = kind === "wa", gift = hand && t.t >= GIFT_AT, who = (store.get("optcg-buyer") || "").trim(), code = ORDER;
    var d = new Date(), when = d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) + " · " + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    var lines = t.it.slice().sort(function (a, b) { return b.c.p - a.c.p; }).map(function (x) {
      return '<div class="tkt__li"><span>' + x.n + "× " + esc(x.c.n) + " <em>" + x.c.c + "</em></span><span>" + eur(x.c.p * x.n).replace(" €", "") + "</span></div>";
    }).join("") + (gift ? '<div class="tkt__li tkt__li--gift"><span>★ Carta sorpresa</span><span>0,00</span></div>' : "");
    var big = hand ? ["Recogida en mano en", "Barcelona", "Te contesto por WhatsApp para quedar"] : ["Envío a casa con", "Cardmarket", "Búscalas en mi tienda G11GAB"];
    var note = hand ? "Pagas al recoger" + (gift ? " · ★ Carta sorpresa · SORPRESA-" + code : "") : "Pago y envío en Cardmarket · tienda G11GAB";
    var stamp = hand ? ["Enviado", "por WhatsApp"] : ["A Cardmarket", "G11GAB"];
    var say = gift ? "¡La carta sorpresa va por mí!" : hand ? "¡Nos vemos en Barcelona!" : "¡Gracias por tu compra!";
    cart = {}; store.del("optcg-cart"); wasGift = false; ORDER = String(1000 + Math.floor(Math.random() * 9000)); render();
    showModal("ticket", '<div class="tkt"><div class="tkt__slot"></div><div class="tkt__win"><div class="tkt__paper">' +
      '<div class="tkt__logo">OPTCG<small>Barcelona</small></div>' +
      '<p class="tkt__meta">Singles One Piece Card Game<br>Pedido #OB-' + code + (who ? " · " + esc(who) : "") + "<br>" + esc(when) + "</p><hr>" +
      '<div class="tkt__big"><small>' + big[0] + "</small><strong>" + big[1] + "</strong><small>" + big[2] + "</small></div><hr>" + lines +
      '<div class="tkt__tot"><span>Total</span><span>' + eur(t.t) + '</span></div><div class="tkt__note">' + esc(note) + '</div><div class="tkt__bars"></div><p class="tkt__code">OB' + code + "</p>" +
      '<div class="tkt__stamp">' + stamp[0] + "<small>" + stamp[1] + "</small></div></div></div>" +
      '<p class="tkt__say">' + say + '</p><button type="button" class="tkt__btn" id="tclose">Seguir mirando</button></div>', "Ticket del pedido");
    if (gift) setTimeout(confetti, 1300);
  }

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
      '<div class="giftbox' + (t.t >= GIFT_AT ? " full" : "") + '"><p class="giftbox__k">★ Carta sorpresa</p><p class="giftbox__h">' + (t.t >= GIFT_AT ? "¡Desbloqueada! Te la llevas con tu pedido en mano." : "Pide " + GIFT_AT + " € o más con recogida en mano y te regalo una carta sorpresa.") + "</p>" + giftHTML(t.t) + "</div>" +
      '<h3 class="shop-choose">¿Cómo lo quieres?</h3>' +
      '<section class="shop-opt" aria-labelledby="opt-hand">' +
        '<p class="shop-opt__tag">Opción 1</p><h4 id="opt-hand">Recogida en mano en Barcelona</h4>' +
        "<p>Me mandas el pedido por WhatsApp y quedamos en Barcelona. Pagas al recoger.</p>" +
        '<label class="shop-field" for="who">Tu nombre (opcional)</label><input id="who" class="shop-input" value="' + esc(who) + '" placeholder="Para saber de quién es el pedido">' +
        '<a class="shop-wa" id="wa" target="_blank" rel="noopener noreferrer" href="https://wa.me/' + SHOP.whatsapp + "?text=" + encodeURIComponent(message()) + '">' + WA_ICON + "Pedir por WhatsApp</a>" +
      "</section>" +
      '<section class="shop-opt" aria-labelledby="opt-cm">' +
        '<p class="shop-opt__tag">Opción 2</p><h4 id="opt-cm">Envío a casa con Cardmarket</h4>' +
        "<p>Compra en mi tienda de Cardmarket, usuario G11GAB. Pago protegido y envío con seguimiento a toda Europa.</p>" +
        '<p class="shop-cmhint">La carta sorpresa es solo para pedidos con recogida en mano.</p>' +
        '<ul class="shop-cmlist">' + t.it.map(function (x) { return '<li>' + x.n + "× " + esc(x.c.n) + " <span>" + x.c.c + "</span></li>"; }).join("") + "</ul>" +
        '<p class="shop-cmhint">Búscalas por nombre en mi tienda y añádelas a tu carrito de Cardmarket.</p>' +
        '<a class="shop-cm" id="cmgo" href="' + SHOP.cardmarket + '/Offers/Singles" target="_blank" rel="noopener noreferrer">Ir a mi tienda en Cardmarket</a>' +
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
    if (d.cat) { state.cat = d.cat; expanded = false; chips(); render(); }
    else if (d.color && pend) { pend.color = pend.color === d.color ? "" : d.color; chips(); }
    else if (d.color) { state.color = state.color === d.color ? "" : d.color; chips(); render(); }
    else if (d.set != null && pend) { pend.set = pend.set === d.set ? "" : d.set; chips(); }
    else if (d.set != null) { state.set = state.set === d.set ? "" : d.set; chips(); render(); }
    else if (el.id === "fbtn") panel($("fpanel").hidden);
    else if (el.id === "fdone") { panel(false, true); var ct = $("grid"); if (ct) window.scrollTo({ top: ct.getBoundingClientRect().top + scrollY - 260, behavior: "smooth" }); }
    else if (el.id === "fx") panel(false);
    else if (el.id === "wa" || el.id === "cmgo") { var kk = el.id === "wa" ? "wa" : "cm"; setTimeout(function () { ticket(kk); }, 250); }
    else if (el.id === "tclose") closeModal();
    else if (el.id === "more-btn") { var wasOpen = expanded; expanded = !expanded; render(); if (wasOpen) { var g = $("catalogo"); if (g) g.scrollIntoView({ behavior: "smooth" }); } }
    else if (el.id === "freset" && pend) { pend.set = ""; pend.color = ""; chips(); }
    else if (el.id === "freset2") { state.set = ""; state.color = ""; chips(); render(); }
    else if (d.add) { setQty(d.add, 1); bump(); }
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
  $("fscrim").addEventListener("click", function () { panel(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("modal").hidden) closeModal(); if (e.key === "Escape" && !$("fpanel").hidden) panel(false); });
  document.addEventListener("input", function (e) {
    if (e.target.id === "q") { state.q = e.target.value; render(); }
    if (e.target.id === "who") { store.set("optcg-buyer", e.target.value); var wa = $("wa"); if (wa) wa.href = "https://wa.me/" + SHOP.whatsapp + "?text=" + encodeURIComponent(message()); }
  });
  $("sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });

  /* ---------------- colecciones + abre el sobre ---------------- */
  var SETINFO = [
    ["EB05", "Heroines Ed. Vol.2", "#ec4f9d", "eb05"],
    ["OP17", "Strongest Warriors", "#f08a24", "op17"],
    ["OP16", "The Time of Battle", "#3a1418", "op16"],
    ["OP15", "Kami's Island", "#6a52a2", "op15"],
    ["EB04", "Azure Sea's Seven", "#1f3d8f", "eb04"]
  ];
  function pre(c) { return c.c.split("-")[0]; }
  function sets(byPrice) {
    var html = SETINFO.map(function (s, i) {
      var cs = byPrice.filter(function (c) { return pre(c) === s[0]; });
      if (!cs.length) return "";
      return '<button type="button" class="set-tile" data-pre="' + s[0] + '" style="--c:' + s[2] + ';--i:' + i + '" aria-label="Ver las ' + cs.length + ' cartas de ' + s[0] + '">' +
        '<span class="set-head"><span class="set-code">' + s[0] + '</span><span class="set-sub"><i></i>SINGLES</span><span class="set-n">' + cs.length + " cartas · " + esc(s[1]) + "</span></span>" +
        '<span class="set-go" aria-hidden="true">→</span>' +
        '<span class="set-art" aria-hidden="true"><span class="set-card"><img src="' + cs[0].img + '" alt="" loading="lazy"></span>' +
        '<span class="set-pack"><img src="assets/packs/pack-' + s[3] + '.webp" alt="" loading="lazy"></span></span></button>';
    }).join("");
    $("set-row").innerHTML = html;
    var row = $("set-row");
    if ("IntersectionObserver" in window) { var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { row.classList.add("in"); o.disconnect(); } }); }, { threshold: .35 }); o.observe(row); }
    else row.classList.add("in");
  }
  function packOpen(byPrice) {
    var s = SETINFO[1], cs = byPrice.filter(function (c) { return pre(c) === s[0]; });
    if (cs.length < 3) return;
    var pos = [["-64%", "-58%", "-14deg", ".05s"], ["64%", "-58%", "14deg", ".15s"], ["0%", "-74%", "0deg", ".25s"]];
    var pick = [cs[1], cs[2], cs[0]];
    $("stage").innerHTML = pick.map(function (c, i) {
      return '<div class="cardout" style="--x:' + pos[i][0] + ";--y:" + pos[i][1] + ";--r:" + pos[i][2] + ";--d:" + pos[i][3] + '"><img src="' + c.img + '" alt="' + esc(c.n) + '"></div>';
    }).join("") + '<div class="pk pk--body"><img src="assets/packs/pack-' + s[3] + '.webp" alt="Sobre ' + s[0] + '"></div><div class="pk pk--top"><img src="assets/packs/pack-' + s[3] + '.webp" alt=""></div><div class="cut"></div><div class="finger"></div>';
    $("open-kick").textContent = "OP-17 · The World's Strongest Warriors";
    $("open-go").textContent = "Ver las " + cs.length + " cartas de OP-17 →";
    $("open-go").setAttribute("data-pre", "OP17");
    $("abre").hidden = false;
    var stage = $("stage"), down = null, moved = false;
    function setT(t) { stage.style.setProperty("--t", t); }
    function doOpen() { if (stage.classList.contains("is-open")) return; setT(1); stage.classList.remove("is-cutting"); stage.classList.add("is-open"); $("open-hint").textContent = "¡Ya está! Estas son de verdad, y están a la venta."; }
    stage.addEventListener("pointerdown", function (e) { if (stage.classList.contains("is-open")) return; down = { x: e.clientX, y: e.clientY }; moved = false; });
    stage.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { down = null; return; }
      if (Math.abs(dx) > 6) {
        if (!moved) { moved = true; try { stage.setPointerCapture(e.pointerId); } catch (x) {} }
        var r = stage.getBoundingClientRect(), t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        stage.classList.add("is-cutting"); setT(t); if (t > .9) { down = null; doOpen(); }
      }
    });
    stage.addEventListener("pointerup", function () { if (!down) return; down = null; if (!moved) doOpen(); else if (!stage.classList.contains("is-open")) { setT(0); stage.classList.remove("is-cutting"); } });
    stage.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doOpen(); } });
    $("open-again").addEventListener("click", function () { stage.classList.remove("is-open"); setT(0); $("open-hint").textContent = "Desliza el dedo por arriba o tócalo"; });
  }
  function filterPre(p) {
    state.q = ""; state.cat = "all"; state.set = p; state.color = "";
    var q = $("q"); if (q) q.value = "";
    chips(); render();
    var cat = $("catalogo"); if (cat) cat.scrollIntoView({ behavior: "smooth" });
  }
  document.addEventListener("click", function (e) { var el = e.target.closest("[data-pre]"); if (el) filterPre(el.getAttribute("data-pre")); });

  /* ---------------- news (secundaria) ---------------- */
  var NEWS = null;
  function byCode(code) { var best = null; CARDS.forEach(function (c) { if (c.c === code && (!best || c.p > best.p)) best = c; }); return best; }
  function newsCard(it, i) {
    var k = "nc nc--" + (it.kind || "meta"), inner = '<span class="nk"><span>' + esc(it.label || "") + "</span><span>" + esc(it.date || "") + "</span></span>";
    if (it.big) inner += '<span class="nbig">' + esc(it.big) + "</span>";
    if (it.img && !it.rows) inner += '<img class="nimg" src="' + it.img + '" alt="" loading="lazy">';
    inner += '<span class="nt">' + esc(it.title) + "</span>";
    if (it.rows) inner += '<span class="nrows">' + it.rows.map(function (r) { return '<span class="nrow ' + r[0] + '"><i>' + (r[0] === "up" ? "↑" : "↓") + "</i>" + esc(r[1]) + "<em>" + esc(r[2] || "—") + "</em></span>"; }).join("") + "</span>";
    else if (it.summary) inner += '<span class="ns">' + esc(it.summary) + "</span>";
    var foot = "";
    if (it.stats) foot += '<span class="nstat">' + it.stats.map(function (s) { return "<span><b>" + esc(s[0]) + "</b><small>" + esc(s[1]) + "</small></span>"; }).join("") + "</span>";
    if (it.video) foot += '<span class="nplay" aria-hidden="true"></span>';
    else if (it.body) foot += '<span class="nmore">Leer →</span>';
    if (foot) inner += '<span class="nfoot">' + foot + "</span>";
    var tag = it.body || (it.cards && it.cards.length) ? 'button type="button" data-news="' + esc(it.id) + '"' : "div";
    return "<" + tag + ' class="' + k + '" style="--i:' + i + '">' + inner + "</" + tag.split(" ")[0] + ">";
  }
  function renderNews() {
    if (!NEWS || !NEWS.items || !NEWS.items.length) return;
    $("ngrid").innerHTML = NEWS.items.slice(0, 4).map(newsCard).join("");
    if (NEWS.updated) $("news-upd").textContent = "Actualizado: " + NEWS.updated;
    var cal = NEWS.calendar;
    if (cal && cal.dates) { $("ncal").innerHTML = "<b>" + esc(cal.title) + "</b><ol>" + cal.dates.map(function (d) { return '<li class="' + (d[2] ? "hot" : "") + '"><span>' + esc(d[0]) + "</span>" + esc(d[1]) + "</li>"; }).join("") + "</ol>"; $("ncal").hidden = false; }
    $("news").hidden = false;
    var sec = $("news");
    if ("IntersectionObserver" in window) { var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { sec.classList.add("in"); o.disconnect(); } }); }, { threshold: .15 }); o.observe(sec); } else sec.classList.add("in");
  }
  var newsOpen = "";
  function openNews(id) {
    var it = (NEWS && NEWS.items || []).filter(function (x) { return x.id === id; })[0]; if (!it) return;
    newsOpen = id;
    var kc = { meta: "var(--red)", torneos: "var(--ink)", guia: "#ec4f9d", coleccion: "#1f3d8f" }[it.kind] || "var(--red)";
    var body = (it.body || []).map(function (b) { return (b.h ? "<h4>" + esc(b.h) + "</h4>" : "") + (b.p ? "<p>" + esc(b.p) + "</p>" : "") + (b.li ? "<ul>" + b.li.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul>" : ""); }).join("");
    if (!body && it.summary) body = "<p>" + esc(it.summary) + "</p>";
    var cs = (it.cards || []).map(byCode).filter(Boolean);
    var shop = cs.length ? '<div class="nread__shop"><h5>Cartas de esta ' + (it.video ? "guía" : "noticia") + " que tengo a la venta</h5>" + cs.map(function (c) {
      return '<div class="nread__card"><img src="' + c.img + '" alt="' + esc(c.n) + '" data-zoom="' + esc(keyOf(c)) + '"><div><b>' + esc(c.n) + "</b><small>" + c.c + " · " + eur(c.p) + "</small></div>" + qtyHtml(c) + "</div>";
    }).join("") + "</div>" : "";
    var src = it.sources && it.sources.length ? '<p class="nread__src">Fuentes: ' + it.sources.map(esc).join(" · ") + "</p>" : "";
    showModal("news", '<div class="nread"><div class="nread__hero" style="--k:' + kc + '"><span class="nk"><span>' + esc(it.label || "") + "</span><span>" + esc(it.date || "") + "</span></span><h3>" + esc(it.title) + "</h3>" + (it.img ? '<img src="' + it.img + '" alt="">' : "") + '</div><div class="nread__body">' + body + shop + src + "</div></div>", it.title);
  }
  document.addEventListener("click", function (e) { var el = e.target.closest("[data-news]"); if (el) openNews(el.getAttribute("data-news")); });
  fetch("news.json?v=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { NEWS = d; if (CARDS.length) renderNews(); }).catch(function () {});

  /* ---------------- movimiento ---------------- */
  var SEEN = {};
  var STAR = '<b class="star">✦</b>';
  function loop(html, times) { var out = ""; for (var i = 0; i < times; i++) out += html; return out; }
  function motion(byPrice, last) {
    var sets = [];
    CARDS.forEach(function (c) { var k = (c.c.split("-")[0] || "").replace(/^([A-Z]+)(\d+)$/, "$1-$2"); if (k && sets.indexOf(k) < 0) sets.push(k); });
    sets.sort();
    var a = ["Nuevo drop", CARDS.length + " cartas", last + " últimas unidades", "Recogida en mano en Barcelona", "Envío con Cardmarket", "Inglés · Near Mint", sets.slice(-5).join(" · ")];
    var ta = "<span>" + a.map(esc).join(STAR) + STAR + "</span>";
    $("ticker-a").innerHTML = loop(ta, 4);
    var b = byPrice.slice(0, 10).map(function (c) { return esc(c.n) + " <em>" + eur(c.p) + "</em>"; });
    var tb = "<span>" + b.join(STAR) + STAR + "</span>";
    $("ticker-b").innerHTML = loop(tb, 4);
    var wall = byPrice.slice(0, 18).map(function (c, i) {
      return '<button type="button" class="wall-card" data-zoom="' + esc(keyOf(c)) + '" aria-label="Ver ' + esc(c.n) + '" style="--r:' + ((i % 5) - 2) * 1.6 + 'deg"><img src="' + c.img + '" alt="" loading="lazy" decoding="async" width="300" height="419"></button>';
    }).join("");
    $("wall").innerHTML = wall + wall.replace(/<button /g, '<button tabindex="-1" aria-hidden="true" ');
  }

  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { var t = e.target; t.classList.add("in"); setTimeout(function () { t.style.removeProperty("--d"); }, 900); SEEN[e.target.getAttribute("data-k")] = 1; io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  function reveal() {
    var els = document.querySelectorAll(".shop-card:not(.in)");
    for (var i = 0; i < els.length; i++) {
      var z = els[i].querySelector("[data-zoom]"), k = z ? z.getAttribute("data-zoom") : "";
      els[i].setAttribute("data-k", k);
      if (SEEN[k]) { els[i].classList.add("in"); continue; }
      els[i].style.setProperty("--d", (i % 4) * 70 + "ms");
      if (io) io.observe(els[i]); else els[i].classList.add("in");
    }
  }

  (function tilt() {
    var hero = document.querySelector(".hero"), fan = $("hero-fan");
    if (!hero || !fan || !window.matchMedia("(hover: hover)").matches) return;
    var raf = 0;
    hero.addEventListener("pointermove", function (e) {
      var r = fan.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () { fan.style.setProperty("--mx", x.toFixed(3)); fan.style.setProperty("--my", y.toFixed(3)); });
    });
    hero.addEventListener("pointerleave", function () { fan.style.setProperty("--mx", 0); fan.style.setProperty("--my", 0); });
  })();

  function bump() {
    var d = $("dock"); if (!d) return;
    d.classList.remove("bump"); void d.offsetWidth; d.classList.add("bump");
  }

  /* ---------------- datos ---------------- */
  fetch("stock.json?v=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (data) {
    UPDATED = data.updated;
    CARDS = data.cards.filter(function (c) { return c.q > 0; });
    CARDS.forEach(function (c) { BYKEY[keyOf(c)] = c; });
    var copies = CARDS.reduce(function (a, c) { return a + c.q; }, 0);
    var byPrice = CARDS.slice().sort(function (a, b) { return b.p - a.p; });
    var last = CARDS.filter(function (c) { return c.q === 1; }).length;
    $("hero-fan").innerHTML = [byPrice[2], byPrice[0], byPrice[1]].map(function (c, i) {
      return '<button type="button" class="fan-card fan-card--' + i + '" data-zoom="' + esc(keyOf(c)) + '" aria-label="Ver ' + esc(c.n) + '"><span class="fan-float"><img src="' + c.img + '" alt="' + esc(c.n + " " + c.c) + '"><i class="holo"></i></span></button>';
    }).join("") + '<span class="hero-stamp">' + last + "<small>últimas<br>unidades</small></span>";
    $("hero-stats").innerHTML = '<span><b>' + CARDS.length + "</b> cartas</span><span><b>" + CARDS.filter(isAlt).length + "</b> alt art</span><span><b>" + last + "</b> últimas unidades</span>";
    $("top-grid").innerHTML = byPrice.slice(0, 4).map(tile).join("");
    motion(byPrice, last);
    sets(byPrice); packOpen(byPrice); renderNews();
    $("lede").textContent = CARDS.length + " cartas · " + copies.toLocaleString("es-ES") + " copias. Inglés y Near Mint.";
    $("updated").textContent = "Actualizado: " + UPDATED;
    $("foot").innerHTML = "Precios en euros, actualizados el " + esc(UPDATED) + ". Todas en inglés y Near Mint. También en <a href=\"" + SHOP.cardmarket + "\" target=\"_blank\" rel=\"noopener noreferrer\">Cardmarket</a> (G11GAB).";
    chips(); render();
  }).catch(function () { $("lede").textContent = "No se han podido cargar las cartas. Recarga la página."; });

})();
