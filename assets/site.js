/* O Baiano — site público v2 (index + cardápio). Lê tudo de dados.js (window.OB).
   Cenas de rolagem com GSAP + ScrollTrigger (cdnjs). Sem GSAP ou com prefers-reduced-motion,
   a página fica no estado final, sem seção presa. */
(function () {
  'use strict';
  var OB = window.OB; if (!OB) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function a(txt, href, cls, nova) { var l = el('a', 'bt ' + (cls || ''), txt); l.href = href; if (nova) { l.target = '_blank'; l.rel = 'noopener'; } return l; }
  function pill(u) { var s = OB.status(u); return el('span', 'status ' + s.classe, s.texto); }
  function kmTxt(k) { return '~' + k.toFixed(1).replace('.', ',') + ' km'; }
  var CASA = OB.casa();
  if (CASA.whatsappPlaceholder && CASA.whatsapp === OB.CASA.whatsapp && $('#aviso-demo')) $('#aviso-demo').hidden = false;

  var reduz = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var temGsap = !reduz && window.gsap && window.ScrollTrigger;

  /* ================= INDEX ================= */
  var fitas = $('#fitas');
  if (fitas) {
    var UN = OB.unidades();

    /* ---------- carvões (SVG gerado; pedra escura + brasa por cima) ---------- */
    var svg = $('#carvoes'), NS = 'http://www.w3.org/2000/svg', semente = 7;
    function rnd() { semente = (semente * 9301 + 49297) % 233280; return semente / 233280; }
    function pedra(cx, cy, rx, ry) {
      var pts = [], n = 8;
      for (var i = 0; i < n; i++) { var ang = Math.PI * 2 * i / n + rnd() * .4, k = .72 + rnd() * .35; pts.push((cx + Math.cos(ang) * rx * k).toFixed(1) + ',' + (cy + Math.sin(ang) * ry * k).toFixed(1)); }
      return 'M' + pts.join('L') + 'Z';
    }
    if (svg) {
      [[300, 72, 46], [345, 92, 52]].forEach(function (fila) {
        for (var x = -20; x < 1040; x += fila[1] * .9 + rnd() * 30) {
          var rx = fila[1] * (.55 + rnd() * .3), ry = fila[2] * (.5 + rnd() * .35), d = pedra(x, fila[0], rx, ry);
          var g = document.createElementNS(NS, 'g');
          var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', 'pedra'); g.appendChild(p);
          var ac = document.createElementNS(NS, 'g'); ac.setAttribute('class', 'acende');
          var b = document.createElementNS(NS, 'path'); b.setAttribute('d', d); b.setAttribute('fill', 'url(#gBrasa)'); ac.appendChild(b);
          var r = document.createElementNS(NS, 'path'); r.setAttribute('class', 'racha');
          r.setAttribute('d', 'M' + (x - rx * .4).toFixed(1) + ',' + (fila[0] - 4) + 'l' + (rx * .3).toFixed(1) + ',' + (ry * .2).toFixed(1) + 'l' + (rx * .35).toFixed(1) + ',-' + (ry * .25).toFixed(1));
          ac.appendChild(r); g.appendChild(ac); svg.appendChild(g);
        }
      });
    }

    /* ---------- folha da unidade ---------- */
    var folha = $('#folha'), fundo = $('#folha-fundo'), mapa = $('#mapa'), voltaFoco = null;
    function marcaFita(id) { $$('.fita').forEach(function (f) { f.classList.toggle('ativa', f.getAttribute('data-id') === id); }); }
    function abreFolha(id) {
      var u = OB.unidade(id); if (!u) return;
      voltaFoco = document.activeElement;
      $('#folha-fita').setAttribute('data-cor', u.cor);
      $('#folha-nome').textContent = u.nome;
      $('#folha-end').textContent = u.end + ' · ' + u.bairro;
      var st = $('#folha-status'); st.innerHTML = ''; st.appendChild(pill(u)); if (u.nota) st.appendChild(el('span', 'nota', u.nota));
      var ac = $('#folha-acoes'); ac.innerHTML = '';
      ac.appendChild(a('Como chegar', OB.linkRota(u), 'bt-preto', true));
      var r = el('button', 'bt', 'Reservar aqui'); r.type = 'button'; r.addEventListener('click', function () { fechaFolha(); escolheUnid(u.id); }); ac.appendChild(r);
      if (u.ifood) ac.appendChild(a('iFood', CASA.ifoodBusca, '', true));
      var src = OB.linkEmbed(u); if (mapa.getAttribute('src') !== src) mapa.src = src;
      folha.hidden = false; fundo.hidden = false; document.body.style.overflow = 'hidden';
      marcaFita(id);
      $('#folha-fecha').focus();
    }
    function fechaFolha() {
      if (folha.hidden) return;
      folha.hidden = true; fundo.hidden = true; document.body.style.overflow = '';
      if (voltaFoco && voltaFoco.focus) voltaFoco.focus({ preventScroll: true });
    }
    $('#folha-fecha').addEventListener('click', fechaFolha);
    fundo.addEventListener('click', fechaFolha);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechaFolha(); });

    /* ---------- fitas no gradil ---------- */
    UN.forEach(function (u) {
      var li = el('li', 'fita-item'); li.id = 'u-' + u.id; li.setAttribute('data-cor', u.cor);
      li.appendChild(el('span', 'no'));
      var b = el('button', 'fita'); b.type = 'button'; b.setAttribute('data-id', u.id); b.setAttribute('aria-haspopup', 'dialog');
      b.setAttribute('aria-label', 'Unidade ' + u.nome + ': ' + OB.status(u).texto);
      var lb = el('span', 'lembra', 'Lembrança do Baiano'); lb.setAttribute('aria-hidden', 'true'); b.appendChild(lb);
      b.appendChild(el('span', 'nome', u.nome));
      b.appendChild(el('span', 'ponto ' + OB.status(u).classe));
      b.addEventListener('click', function () { abreFolha(u.id); });
      li.appendChild(b); fitas.appendChild(li);
    });
    $$('[data-ver]').forEach(function (l) { l.addEventListener('click', function (e) { e.preventDefault(); abreFolha(l.getAttribute('data-ver')); }); });

    /* ---------- mais perto ---------- */
    var sel = $('#sel-bairro'), res = $('#perto-res');
    OB.BAIRROS.forEach(function (b, i) { var o = el('option', null, b.nome); o.value = i; sel.appendChild(o); });
    function mostra(pos, origem) {
      var l = OB.maisPerto(pos), u = l[0];
      res.innerHTML = '';
      var box = el('div', 'achou');
      var esq = el('div');
      esq.appendChild(el('div', 'lembra', origem));
      esq.appendChild(el('p', 'disp', u.nome));
      esq.appendChild(el('p', null, u.end + ' · ' + u.bairro));
      var ln = el('p', 'linha'); ln.appendChild(el('span', 'dist', kmTxt(u.km) + ' em linha reta')); ln.appendChild(pill(u)); esq.appendChild(ln);
      box.appendChild(esq);
      var ac = el('div', 'acoes');
      ac.appendChild(a('Como chegar', OB.linkRota(u), 'bt-preto', true));
      var f = el('button', 'bt', 'Abrir a fita'); f.type = 'button'; f.addEventListener('click', function () { abreFolha(u.id); }); ac.appendChild(f);
      var r = el('button', 'bt', 'Reservar aqui'); r.type = 'button'; r.addEventListener('click', function () { escolheUnid(u.id); }); ac.appendChild(r);
      box.appendChild(ac);
      box.appendChild(el('p', 'outras', 'Depois dela: ' + l.slice(1, 3).map(function (x) { return x.nome + ' (' + kmTxt(x.km) + ')'; }).join(' · ')));
      res.appendChild(box);
      marcaFita(u.id);
    }
    sel.addEventListener('change', function () { if (sel.value !== '') mostra(OB.BAIRROS[+sel.value], 'Partindo de ' + OB.BAIRROS[+sel.value].nome); });
    $('#btn-local').addEventListener('click', function () {
      var b = this;
      if (!navigator.geolocation) { res.textContent = 'Seu navegador não passa a localização. Escolha o bairro.'; return; }
      b.textContent = 'Procurando você…';
      navigator.geolocation.getCurrentPosition(function (p) {
        b.textContent = 'Usar minha localização';
        mostra({ lat: p.coords.latitude, lng: p.coords.longitude }, 'Pela sua localização');
      }, function () {
        b.textContent = 'Usar minha localização';
        res.textContent = 'Não deu pra pegar a localização. Escolha o bairro.';
      }, { timeout: 9000, maximumAge: 600000 });
    });

    /* ---------- axé: pulseiras de evento ---------- */
    var ul = $('#shows'), prox = OB.proximosShows().slice(0, 4);
    if (!prox.length) ul.appendChild(el('li', 'pulseira', 'Agenda nova chegando. Siga @obaianochurrasqueiro.'));
    prox.forEach(function (s, i) {
      var u = OB.unidade(s.unidade) || { nome: s.unidade };
      var li = el('li', 'pulseira' + (i === 0 ? ' principal' : '')), d = OB.deIso(s.data);
      var banda = el('div', 'banda');
      var dia = el('div', 'dia'); dia.appendChild(el('b', null, String(d.getDate()).padStart(2, '0'))); dia.appendChild(el('span', null, OB.SEMANA[d.getDay()].slice(0, 3) + ' · ' + OB.MESES[d.getMonth()].slice(0, 3))); banda.appendChild(dia);
      var info = el('div', 'info');
      info.appendChild(el('strong', null, s.titulo + ' · ' + s.artista));
      info.appendChild(el('span', null, OB.hm(s.hora) + ' · O Baiano ' + u.nome + (s.couvert ? ' · couvert ' + s.couvert : '')));
      banda.appendChild(info);
      var fe = el('div', 'fecho'); fe.setAttribute('aria-hidden', 'true'); banda.appendChild(fe);
      li.appendChild(banda);
      if (s.obs) li.appendChild(el('p', 'obs', s.obs));
      var r = el('button', 'bt bt-mini bt-amarelo', 'Reservar mesa pra esse dia'); r.type = 'button';
      r.addEventListener('click', function () { escolheUnid(s.unidade, 'show', s.data, s.hora); }); li.appendChild(r);
      if (s.cartaz) { var f = el('figure', 'cartaz'); var im = el('img'); im.src = s.cartaz; im.alt = 'Cartaz: ' + s.titulo + ', ' + s.artista; im.loading = 'lazy'; f.appendChild(im); li.appendChild(f); }
      ul.appendChild(li);
    });

    /* ---------- radiola ---------- */
    var rad = $('#radiola'), ra = $('#radiola-acao');
    if (CASA.playlist) {
      var lp = a('Tocar a playlist de axé', CASA.playlist, 'bt-amarelo', true);
      lp.addEventListener('click', function () { rad.classList.add('tocando'); });
      ra.appendChild(lp);
    } else {
      ra.appendChild(el('span', 'aviso', 'O link da playlist entra aqui assim que a casa mandar (é o mesmo da bio).'));
      rad.addEventListener('mouseenter', function () { rad.classList.add('tocando'); });
      rad.addEventListener('mouseleave', function () { rad.classList.remove('tocando'); });
    }

    /* ---------- Praia do Forte: palavras acendem com a rolagem ---------- */
    var palavras = $('#palavras');
    if (palavras) {
      palavras.innerHTML = palavras.textContent.split(' ').map(function (w) { return '<span>' + w + '</span>'; }).join(' ');
      var pend = false;
      var acende = function () {
        pend = false;
        var r = palavras.getBoundingClientRect(), h = window.innerHeight;
        var p = Math.min(1, Math.max(0, (h * .85 - r.top) / (r.height + h * .35)));
        var ws = palavras.children, n = reduz ? ws.length : Math.round(p * ws.length);
        for (var i = 0; i < ws.length; i++) ws[i].classList.toggle('acesa', i < n);
      };
      window.addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(acende); } }, { passive: true });
      acende();
    }

    /* ---------- pedido / reserva ---------- */
    var form = $('#form-pedido'), tipos = $('#tipos'), su = $('#p-unid');
    OB.TIPOS_PEDIDO.forEach(function (t, i) {
      var l = el('label'), r = el('input'); r.type = 'radio'; r.name = 'tipo'; r.value = t.id; if (!i) r.checked = true;
      l.appendChild(r); l.appendChild(el('span', null, t.nome)); tipos.appendChild(l);
    });
    UN.forEach(function (u) { var o = el('option', null, u.nome); o.value = u.id; su.appendChild(o); });
    $('#p-data').value = OB.hoje(); $('#p-data').min = OB.hoje();
    function tipo() { return (form.querySelector('input[name=tipo]:checked') || {}).value || 'mesa'; }
    function msg() {
      var u = OB.unidade(su.value), t = tipo();
      var linhas = ['Fala, Baiano! ' + OB.nomeTipo(t) + ' na unidade ' + u.nome + '.',
        'Nome: ' + ($('#p-nome').value.trim() || '—'),
        'Dia: ' + ($('#p-data').value ? OB.dataLonga($('#p-data').value) : '—') + ', ' + OB.hm($('#p-hora').value),
        (t === 'retira' ? '' : 'Pessoas: ' + ($('#p-pessoas').value || '—'))];
      var p = $('#p-pedido').value.trim(); if (p) linhas.push((t === 'retira' ? 'Pedido: ' : 'Recado: ') + p);
      return linhas.filter(Boolean).join('\n');
    }
    function atualiza() {
      var t = tipo(), u = OB.unidade(su.value);
      $('#l-pedido').textContent = t === 'retira' ? 'O que vai querer' : 'Recado';
      $('#p-pedido').placeholder = t === 'retira' ? 'Ex.: carne com batata raiz pra 2' : 'Ex.: mesa na calçada';
      $('#p-pessoas').closest('div').hidden = t === 'retira';
      var ifd = $('#p-ifood'); ifd.hidden = !(t === 'retira' && u && u.ifood); ifd.href = CASA.ifoodBusca;
      $('#previa').textContent = msg();
    }
    form.addEventListener('input', atualiza);
    form.addEventListener('change', function (e) {
      if (e.target.name === 'tipo' && e.target.value === 'show') { su.value = 'pituba'; var q = OB.proximosShows()[0]; if (q) { $('#p-data').value = q.data; $('#p-hora').value = q.hora; } }
      atualiza();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!$('#p-nome').value.trim()) { $('#p-erro').textContent = 'Bota seu nome aí, migo.'; $('#p-nome').focus(); return; }
      if (!$('#p-data').value) { $('#p-erro').textContent = 'Escolhe o dia.'; return; }
      $('#p-erro').textContent = '';
      var u = OB.unidade(su.value);
      OB.addPedido({ tipo: tipo(), unidade: u.id, data: $('#p-data').value, hora: $('#p-hora').value, pessoas: +$('#p-pessoas').value || null, nome: $('#p-nome').value.trim(), obs: $('#p-pedido').value.trim() });
      window.open(OB.linkWa(msg(), OB.zapDe(u)), '_blank', 'noopener');
    });
    function escolheUnid(id, t, data, hora) {
      su.value = id;
      if (t) { var r = form.querySelector('input[value="' + t + '"]'); if (r) r.checked = true; }
      if (data) $('#p-data').value = data;
      if (hora) $('#p-hora').value = hora;
      atualiza();
      document.getElementById('pedir').scrollIntoView({ behavior: reduz ? 'auto' : 'smooth' });
      setTimeout(function () { $('#p-nome').focus({ preventScroll: true }); }, 600);
    }
    window.escolheUnid = escolheUnid;
    var q = new URLSearchParams(location.search);
    if (q.get('unidade') && OB.unidade(q.get('unidade'))) su.value = q.get('unidade');
    var qt = q.get('tipo') && form.querySelector('input[value="' + q.get('tipo') + '"]'); if (qt) qt.checked = true;
    atualiza();
    $('#zap-fixo').addEventListener('click', function (e) { e.preventDefault(); document.getElementById('pedir').scrollIntoView({ behavior: reduz ? 'auto' : 'smooth' }); });

    /* link direto pra uma fita: index.html#u-forte */
    var hashU = (location.hash.match(/^#u-(\w+)/) || [])[1];
    if (hashU && OB.unidade(hashU)) setTimeout(function () { abreFolha(hashU); }, 400);

    /* ================= CENAS (GSAP) ================= */
    if (temGsap) cenas();
  }

  function cenas() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    document.documentElement.classList.add('cena');

    /* --- 1. Acende a brasa --- */
    var acendes = $$('#carvoes .acende'), brilhoFinal = acendes.map(function () { return .55 + Math.random() * .45; });
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#brasa', start: 'top top', end: 'bottom bottom', scrub: .5 } });
    tl.fromTo('.rola-dica', { autoAlpha: 1 }, { autoAlpha: 0, duration: .08 }, 0)
      .fromTo(acendes, { opacity: 0 }, { opacity: function (i) { return brilhoFinal[i]; }, duration: .12, stagger: { each: .013, from: 'random' } }, .02)
      .fromTo('.brilho', { opacity: 0 }, { opacity: 1, duration: .35 }, .05)
      .fromTo('.fagulhas', { opacity: 0 }, { opacity: 1, duration: .1 }, .25)
      .fromTo('.grelha', { clipPath: 'inset(50% 50% 50% 50% round 18px)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', scale: 1, duration: .26, ease: 'power2.out' }, .2)
      .fromTo('.vapor', { opacity: 0 }, { opacity: 1, duration: .1 }, .42)
      .fromTo('.brasa-sobre', { autoAlpha: 0 }, { autoAlpha: 1, duration: .08 }, .3);
    $$('.frufru .l').forEach(function (l, i) {
      var s = .5 + i * .055, t = $('.t', l), f = $('.f', l);
      tl.fromTo(t, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -10, duration: .04 }, s + .015)
        .fromTo(f, { opacity: 0, yPercent: 0, scale: 1 }, { opacity: 1, duration: .025 }, s)
        .to(f, { opacity: 0, yPercent: -60, scale: .6, duration: .05 }, s + .03);
    });
    tl.fromTo('.frufru .vazio', { scaleX: 0 }, { scaleX: 1, duration: .06 }, .86)
      .fromTo('.banguela', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .06 }, .88)
      .fromTo('.brasa-acoes', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .06 }, .92)
      .to({}, { duration: .04 }, .96);

    /* --- 2. Fitas sendo amarradas no gradil --- */
    var tl2 = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#unidades', start: 'top top', end: 'bottom bottom', scrub: .5 } });
    $$('.fita-item').forEach(function (it, i) {
      var s = .04 + i * .11;
      tl2.fromTo($('.no', it), { scale: 0 }, { scale: 1, duration: .05, ease: 'back.out(3)' }, s)
        .fromTo($('.fita', it), { scaleY: 0, rotation: i % 2 ? 7 : -7 }, { scaleY: 1, rotation: 0, duration: .14, ease: 'power1.out' }, s + .03);
    });
    tl2.fromTo('.gradil-dica', { autoAlpha: 0 }, { autoAlpha: 1, duration: .06 }, .82).to({}, { duration: .1 }, .9);

    /* --- miudezas: fotos entrando na frase, pulseiras se fechando --- */
    gsap.from('.em-linha', { scale: 0, rotation: -25, duration: .6, stagger: .18, ease: 'back.out(2)', scrollTrigger: { trigger: '.assa-frase', start: 'top 75%', once: true } });
    $$('.pulseira .banda').forEach(function (b) {
      gsap.fromTo(b, { clipPath: 'inset(0% 100% 0% 0% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: .9, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 88%', once: true } });
    });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  }

  /* ================= CARDÁPIO ================= */
  var cats = $('#cats'), corpo = $('#menu');
  if (cats && corpo) {
    var itens = OB.cardapio().filter(function (i) { return i.ativo !== false; });
    OB.CATEGORIAS.forEach(function (c) {
      var lista = itens.filter(function (i) { return i.cat === c.id; }); if (!lista.length) return;
      var lk = el('a', null, c.nome); lk.href = '#' + c.id; cats.appendChild(lk);
      var sec = el('section', 'cat'); sec.id = c.id;
      sec.appendChild(el('h2', null, c.nome)); sec.appendChild(el('p', 'nota-cat', c.nota));
      var ul = el('ul', 'itens');
      lista.forEach(function (i) {
        var li = el('li', 'item' + (i.destaque ? ' destaque' : ''));
        var t = el('div'); t.appendChild(el('h3', null, i.nome)); if (i.desc) t.appendChild(el('p', null, i.desc)); li.appendChild(t);
        var p = el('div', 'preco');
        if (i.preco) p.textContent = 'R$ ' + Number(i.preco).toFixed(2).replace('.', ',');
        else { p.textContent = 'Preço no balcão'; p.appendChild(el('small', null, 'pergunte na unidade')); }
        li.appendChild(p); ul.appendChild(li);
      });
      sec.appendChild(ul); corpo.appendChild(sec);
    });
  }
})();
