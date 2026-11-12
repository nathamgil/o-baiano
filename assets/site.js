/* O Baiano — site público (index + cardápio). Lê tudo de dados.js (window.OB). */
(function () {
  'use strict';
  var OB = window.OB; if (!OB) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function a(txt, href, cls, nova) { var l = el('a', 'bt ' + (cls || ''), txt); l.href = href; if (nova) { l.target = '_blank'; l.rel = 'noopener'; } return l; }
  function pill(u) { var s = OB.status(u); return el('span', 'status ' + s.classe, s.texto); }
  var CASA = OB.casa();
  if (CASA.whatsappPlaceholder && CASA.whatsapp === OB.CASA.whatsapp && $('#aviso-demo')) $('#aviso-demo').hidden = false;

  /* ---------- entrada com rolagem ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vista'); io.unobserve(e.target); } });
  }, { threshold: .15 }) : null;
  function observa(n) { if (io) io.observe(n); else n.classList.add('vista'); }
  document.querySelectorAll('.surge').forEach(observa);

  /* ---------- texto que anda com a rolagem ---------- */
  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var corre = Array.prototype.slice.call(document.querySelectorAll('[data-corre]'));
  corre.forEach(function (n) { n.textContent = new Array(6).join(n.textContent + ' '); });
  var palavras = $('#palavras');
  if (palavras) palavras.innerHTML = palavras.textContent.split(' ').map(function (w) { return '<span>' + w + '</span> '; }).join('');
  var pend = false;
  function rola() {
    pend = false;
    var y = window.scrollY || 0;
    if (!reduz) corre.forEach(function (n) { var f = +n.getAttribute('data-corre'); var x = f < 0 ? Math.max(-6000, y * f) : Math.min(0, -6000 + y * f); n.style.transform = 'translateX(' + x + 'px)'; });
    if (palavras) {
      var r = palavras.getBoundingClientRect(), h = window.innerHeight;
      var p = Math.min(1, Math.max(0, (h * .85 - r.top) / (r.height + h * .35)));
      var ws = palavras.children, n = reduz ? ws.length : Math.round(p * ws.length);
      for (var i = 0; i < ws.length; i++) ws[i].classList.toggle('acesa', i < n);
    }
  }
  window.addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(rola); } }, { passive: true });
  rola();

  /* ================= INDEX ================= */
  var fitas = $('#fitas');
  if (fitas) {
    var UN = OB.unidades();
    var mapa = $('#mapa'), legenda = $('#mapa-legenda');
    function verNoMapa(id, rolar) {
      var u = OB.unidade(id); if (!u) return;
      mapa.src = OB.linkEmbed(u);
      legenda.textContent = u.nome + ' · ' + u.end;
      document.querySelectorAll('.fita').forEach(function (f) { f.classList.toggle('ativa', f.id === 'u-' + id); });
      if (rolar) document.getElementById('unidades').scrollIntoView({ behavior: 'smooth' });
    }
    UN.forEach(function (u) {
      var li = el('li', 'fita surge'); li.id = 'u-' + u.id; li.setAttribute('data-cor', u.cor);
      li.appendChild(el('div', 'lembra', 'Lembrança do Baiano'));
      li.appendChild(el('h3', null, u.nome));
      li.appendChild(el('p', 'end', u.end + ' · ' + u.bairro));
      var ln = el('div', 'linha'); ln.appendChild(pill(u)); if (u.nota) ln.appendChild(el('span', 'nota', u.nota)); li.appendChild(ln);
      var ac = el('div', 'acoes');
      ac.appendChild(a('Como chegar', OB.linkRota(u), 'bt-mini bt-preto', true));
      var b = el('button', 'bt bt-mini', 'Ver no mapa'); b.type = 'button'; b.addEventListener('click', function () { verNoMapa(u.id); }); ac.appendChild(b);
      var z = el('button', 'bt bt-mini', 'Reservar aqui'); z.type = 'button'; z.addEventListener('click', function () { escolheUnid(u.id); }); ac.appendChild(z);
      if (u.ifood) ac.appendChild(a('iFood', CASA.ifoodBusca, 'bt-mini', true));
      li.appendChild(ac);
      li.addEventListener('click', function (e) { if (!e.target.closest('a,button')) verNoMapa(u.id); });
      fitas.appendChild(li); observa(li);
    });
    verNoMapa((location.hash.match(/^#u-(\w+)/) || [])[1] || UN[0].id);
    document.querySelectorAll('[data-ver]').forEach(function (l) { l.addEventListener('click', function (e) { e.preventDefault(); verNoMapa(l.getAttribute('data-ver'), true); }); });

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
      var ln = el('p', 'linha'); ln.appendChild(el('span', 'dist', '~' + u.km.toFixed(1).replace('.', ',') + ' km em linha reta  ')); ln.appendChild(pill(u)); esq.appendChild(ln);
      box.appendChild(esq);
      var ac = el('div', 'acoes');
      ac.appendChild(a('Como chegar', OB.linkRota(u), 'bt-preto', true));
      var r = el('button', 'bt', 'Reservar aqui'); r.type = 'button'; r.addEventListener('click', function () { escolheUnid(u.id); }); ac.appendChild(r);
      box.appendChild(ac);
      box.appendChild(el('p', 'outras', 'Depois dela: ' + l.slice(1, 3).map(function (x) { return x.nome + ' (~' + x.km.toFixed(1).replace('.', ',') + ' km)'; }).join(' · ')));
      res.appendChild(box);
      verNoMapa(u.id);
    }
    sel.addEventListener('change', function () { if (sel.value !== '') mostra(OB.BAIRROS[+sel.value], 'Partindo de ' + OB.BAIRROS[+sel.value].nome); });
    $('#btn-local').addEventListener('click', function () {
      var b = this;
      if (!navigator.geolocation) { res.textContent = 'Seu navegador não passa a localização. Escolha o bairro ao lado.'; return; }
      b.textContent = 'Procurando você…';
      navigator.geolocation.getCurrentPosition(function (p) {
        b.textContent = 'Usar minha localização';
        mostra({ lat: p.coords.latitude, lng: p.coords.longitude }, 'Pela sua localização');
      }, function () {
        b.textContent = 'Usar minha localização';
        res.textContent = 'Não deu pra pegar a localização. Escolha o bairro ao lado.';
      }, { timeout: 9000, maximumAge: 600000 });
    });

    /* ---------- shows ---------- */
    var ul = $('#shows'), prox = OB.proximosShows().slice(0, 4);
    if (!prox.length) ul.appendChild(el('li', 'show', 'Agenda nova chegando. Siga @obaianochurrasqueiro.'));
    prox.forEach(function (s) {
      var u = OB.unidade(s.unidade) || { nome: s.unidade };
      var li = el('li', 'show surge'), d = OB.deIso(s.data);
      var dia = el('div', 'dia'); dia.appendChild(el('b', null, String(d.getDate()).padStart(2, '0'))); dia.appendChild(el('span', null, OB.SEMANA[d.getDay()].slice(0, 3) + ' · ' + OB.MESES[d.getMonth()].slice(0, 3))); li.appendChild(dia);
      var t = el('div');
      t.appendChild(el('h3', null, s.titulo + ': ' + s.artista));
      t.appendChild(el('p', null, OB.hm(s.hora) + ' · O Baiano ' + u.nome + (s.couvert ? ' · couvert ' + s.couvert : '')));
      if (s.obs) t.appendChild(el('p', null, s.obs));
      var r = el('button', 'bt bt-mini bt-preto', 'Reservar mesa pra esse dia'); r.type = 'button';
      r.addEventListener('click', function () { escolheUnid(s.unidade, 'show', s.data, s.hora); }); t.appendChild(r);
      li.appendChild(t);
      if (s.cartaz) { var f = el('figure', 'cartaz-mini'); f.style.margin = '0'; var im = el('img'); im.src = s.cartaz; im.alt = 'Cartaz: ' + s.titulo + ', ' + s.artista; im.loading = 'lazy'; f.appendChild(im); li.appendChild(f); }
      ul.appendChild(li); observa(li);
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
    form.addEventListener('input', atualiza); form.addEventListener('change', function (e) {
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
      if (data) $('#p-data').value = data; if (hora) $('#p-hora').value = hora;
      atualiza();
      document.getElementById('pedir').scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () { $('#p-nome').focus({ preventScroll: true }); }, 600);
    }
    window.escolheUnid = escolheUnid;
    var q = new URLSearchParams(location.search);
    if (q.get('unidade') && OB.unidade(q.get('unidade'))) su.value = q.get('unidade');
    var qt = q.get('tipo') && form.querySelector('input[value="' + q.get('tipo') + '"]'); if (qt) qt.checked = true;
    atualiza();
    $('#zap-fixo').addEventListener('click', function (e) { e.preventDefault(); document.getElementById('pedir').scrollIntoView({ behavior: 'smooth' }); });
  }

  /* ================= CARDÁPIO ================= */
  var cats = $('#cats'), corpo = $('#menu');
  if (cats && corpo) {
    var itens = OB.cardapio().filter(function (i) { return i.ativo !== false; });
    OB.CATEGORIAS.forEach(function (c) {
      var lista = itens.filter(function (i) { return i.cat === c.id; }); if (!lista.length) return;
      var lk = el('a', null, c.nome); lk.href = '#' + c.id; cats.appendChild(lk);
      var sec = el('section', 'cat surge'); sec.id = c.id;
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
      sec.appendChild(ul); corpo.appendChild(sec); observa(sec);
    });
  }
})();
