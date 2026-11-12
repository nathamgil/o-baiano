/* =====================================================================
   Painel do gerente — O Baiano.
   Unidades (horário, WhatsApp, iFood, recado) · Shows de axé · Cardápio
   (tem/não tem, preço opcional) · Pedidos que vieram do site · Ajustes.
   Demo: grava no localStorage (ob_) via dados.js.
   Login de DEMONSTRAÇÃO (não é segurança): gerente / obaiano.
   ===================================================================== */
(function () {
  'use strict';
  var OB = window.OB; if (!OB) return;
  var LOGIN = { user: 'gerente', senha: 'obaiano' }, K = 'ob_sessao';
  function $(s, r) { return (r || document).querySelector(s); }
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function bt(txt, cls, fn) { var b = el('button', 'bt bt-mini ' + (cls || ''), txt); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; }
  function campo(rot, input) { var d = el('div'), id = 'c' + Math.random().toString(36).slice(2, 8); input.id = id; var l = el('label', null, rot); l.htmlFor = id; d.appendChild(l); d.appendChild(input); return d; }
  function inp(tipo, val, ph) { var i = el('input'); i.type = tipo || 'text'; if (val != null) i.value = val; if (ph) i.placeholder = ph; return i; }
  var tT; function toast(t) { var n = $('#toast'); n.textContent = t; n.hidden = false; clearTimeout(tT); tT = setTimeout(function () { n.hidden = true; }, 2400); }

  /* ---------- login ---------- */
  function logado() { try { return sessionStorage.getItem(K) === '1'; } catch (e) { return false; } }
  function entra() { $('#tela-login').hidden = true; $('#tela-painel').hidden = false; abre(new URLSearchParams(location.search).get('aba') || 'unidades'); }
  $('#form-login').addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('#l-user').value.trim().toLowerCase() === LOGIN.user && $('#l-senha').value === LOGIN.senha) { try { sessionStorage.setItem(K, '1'); } catch (x) {} entra(); }
    else $('#login-erro').textContent = 'Usuário ou senha não batem. Olha o quadro acima.';
  });
  $('#btn-sair').addEventListener('click', function () { try { sessionStorage.removeItem(K); } catch (x) {} location.reload(); });

  /* ---------- abas ---------- */
  var ABAS = { unidades: unidades, shows: shows, cardapio: cardapio, pedidos: pedidos, ajustes: ajustes };
  document.querySelectorAll('.abas button').forEach(function (b) { b.addEventListener('click', function () { abre(b.getAttribute('data-aba')); }); });
  function abre(id) {
    if (!ABAS[id]) id = 'unidades';
    document.querySelectorAll('.aba').forEach(function (s) { s.hidden = s.id !== 'aba-' + id; });
    document.querySelectorAll('.abas button').forEach(function (b) { if (b.getAttribute('data-aba') === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    ABAS[id]($('#aba-' + id)); badge(); window.scrollTo(0, 0);
  }
  function badge() { var n = OB.pedidos().filter(function (p) { return p.status === 'novo'; }).length, b = $('#badge'); b.hidden = !n; b.textContent = n; }
  function cab(sec, tit, txt) { sec.innerHTML = ''; sec.appendChild(el('h2', null, tit)); if (txt) sec.appendChild(el('p', null, txt)); }

  /* ---------- unidades ---------- */
  function unidades(sec) {
    cab(sec, 'Unidades', 'Hora de abrir e fechar alimenta o "aberto agora" do site. Deixe "fecha" vazio se não quiser mostrar.');
    var lista = OB.unidades();
    lista.forEach(function (u, i) {
      var c = el('div', 'cartao'); c.appendChild(el('h3', null, u.nome));
      var g = el('div', 'campos');
      var fAbre = inp('time', u.abre || ''), fFecha = inp('time', u.fecha || ''), fZap = inp('tel', u.whatsapp || '', 'usa o geral'), fNota = inp('text', u.nota || '', 'Ex.: hoje tem axé'), fEnd = inp('text', u.end);
      g.appendChild(campo('Abre', fAbre)); g.appendChild(campo('Fecha', fFecha)); g.appendChild(campo('WhatsApp (55 71…)', fZap)); g.appendChild(campo('Recado na fita', fNota));
      var ce = campo('Endereço', fEnd); ce.style.gridColumn = '1 / -1'; g.appendChild(ce);
      c.appendChild(g);
      var ck = el('label', 'check'); var cb = inp('checkbox'); cb.checked = !!u.ifood; ck.appendChild(cb); ck.appendChild(document.createTextNode('Tem iFood')); ck.style.marginTop = '12px'; c.appendChild(ck);
      var st = el('p'); st.style.margin = '10px 0 0'; var s = OB.status(u); st.appendChild(el('span', 'status ' + s.classe, s.texto)); c.appendChild(st);
      var lb = el('div', 'linha-bt');
      lb.appendChild(bt('Salvar ' + u.nome, 'bt-preto', function () {
        var l = OB.unidades(); Object.assign(l[i], { abre: fAbre.value || null, fecha: fFecha.value || null, whatsapp: fZap.value.replace(/\D/g, '') || null, nota: fNota.value.trim(), end: fEnd.value.trim() || u.end, ifood: cb.checked });
        OB.grava('unidades', l); toast(u.nome + ' salva'); unidades(sec);
      }));
      c.appendChild(lb); sec.appendChild(c);
    });
  }

  /* ---------- shows ---------- */
  function shows(sec) {
    cab(sec, 'Shows de axé', 'O que entra aqui aparece em "Quinta tem axé" no site, com botão de reservar mesa.');
    var c = el('div', 'cartao'); c.appendChild(el('h3', null, 'Novo show'));
    var g = el('div', 'campos'), uSel = el('select');
    OB.unidades().forEach(function (u) { var o = el('option', null, u.nome); o.value = u.id; uSel.appendChild(o); }); uSel.value = 'pituba';
    var fD = inp('date', OB.hoje()), fH = inp('time', '18:00'), fA = inp('text', '', 'Banda / artista'), fT = inp('text', 'Axé de quinta'), fC = inp('text', '', 'Ex.: R$ 25'), fO = inp('text', 'Couvert + pulseira.');
    [['Unidade', uSel], ['Dia', fD], ['Hora', fH], ['Artista', fA], ['Nome da noite', fT], ['Couvert', fC], ['Observação', fO]].forEach(function (x) { g.appendChild(campo(x[0], x[1])); });
    c.appendChild(g);
    var lb = el('div', 'linha-bt'); lb.appendChild(bt('Adicionar show', 'bt-preto', function () {
      if (!fA.value.trim() || !fD.value) { toast('Falta artista ou dia'); return; }
      var l = OB.le('shows', []); l.push({ id: OB.novoId(), data: fD.value, hora: fH.value, unidade: uSel.value, artista: fA.value.trim(), titulo: fT.value.trim() || 'Axé', couvert: fC.value.trim(), cartaz: '', obs: fO.value.trim() });
      OB.grava('shows', l); toast('Show adicionado'); shows(sec);
    })); c.appendChild(lb); sec.appendChild(c);
    var ul = el('ul', 'lista-adm'), prox = OB.proximosShows();
    if (!prox.length) ul.appendChild(el('li', null, 'Nenhum show na agenda.'));
    prox.forEach(function (s) {
      var li = el('li'), t = el('div'), u = OB.unidade(s.unidade) || { nome: s.unidade };
      t.appendChild(el('b', null, s.titulo + ': ' + s.artista)); t.appendChild(el('small', null, OB.dataLonga(s.data) + ' · ' + OB.hm(s.hora) + ' · ' + u.nome + (s.couvert ? ' · ' + s.couvert : '')));
      li.appendChild(t);
      li.appendChild(bt('Tirar', '', function () { if (!confirm('Tirar esse show da agenda?')) return; OB.grava('shows', OB.le('shows', []).filter(function (x) { return x.id !== s.id; })); shows(sec); }));
      ul.appendChild(li);
    });
    sec.appendChild(ul);
  }

  /* ---------- cardápio ---------- */
  function cardapio(sec) {
    cab(sec, 'Cardápio', 'Desligue o que acabou. Preço é opcional: vazio aparece "preço no balcão".');
    var ul = el('ul', 'lista-adm');
    OB.cardapio().forEach(function (it, i) {
      var li = el('li' , it.ativo === false ? 'off' : ''), t = el('div');
      t.appendChild(el('b', null, it.nome)); t.appendChild(el('small', null, (OB.CATEGORIAS.filter(function (c) { return c.id === it.cat; })[0] || {}).nome || ''));
      var pr = inp('number', it.preco || '', 'R$ (opcional)'); pr.step = '0.01'; pr.min = '0'; pr.style.marginTop = '8px'; pr.setAttribute('aria-label', 'Preço de ' + it.nome);
      pr.addEventListener('change', function () { var l = OB.cardapio(); l[i].preco = pr.value ? +pr.value : null; OB.grava('cardapio', l); toast('Preço salvo'); });
      t.appendChild(pr); li.appendChild(t);
      li.appendChild(bt(it.ativo === false ? 'Voltou' : 'Acabou', it.ativo === false ? 'bt-preto' : '', function () { var l = OB.cardapio(); l[i].ativo = l[i].ativo === false; OB.grava('cardapio', l); cardapio(sec); }));
      ul.appendChild(li);
    });
    sec.appendChild(ul);
    var c = el('div', 'cartao'); c.style.marginTop = '16px'; c.appendChild(el('h3', null, 'Item novo'));
    var g = el('div', 'campos'), cs = el('select'); OB.CATEGORIAS.forEach(function (x) { var o = el('option', null, x.nome); o.value = x.id; cs.appendChild(o); });
    var fN = inp('text', '', 'Nome do prato'), fDs = inp('text', '', 'Descrição curta'), fP = inp('number', '', 'opcional'); fP.step = '0.01';
    [['Categoria', cs], ['Nome', fN], ['Descrição', fDs], ['Preço', fP]].forEach(function (x) { g.appendChild(campo(x[0], x[1])); });
    c.appendChild(g);
    var lb = el('div', 'linha-bt'); lb.appendChild(bt('Adicionar', 'bt-preto', function () {
      if (!fN.value.trim()) { toast('Bota o nome'); return; }
      var l = OB.cardapio(); l.push({ id: OB.novoId(), cat: cs.value, nome: fN.value.trim(), desc: fDs.value.trim(), preco: fP.value ? +fP.value : null, ativo: true }); OB.grava('cardapio', l); toast('Item adicionado'); cardapio(sec);
    })); c.appendChild(lb); sec.appendChild(c);
  }

  /* ---------- pedidos ---------- */
  function pedidos(sec) {
    cab(sec, 'Pedidos do site', 'Cada pedido ou reserva que alguém manda pelo site fica anotado aqui (além de ir pro WhatsApp).');
    var ul = el('ul', 'lista-adm'), l = OB.pedidos();
    if (!l.length) ul.appendChild(el('li', null, 'Nada por enquanto.'));
    l.forEach(function (p) {
      var li = el('li'), t = el('div'), u = OB.unidade(p.unidade) || { nome: p.unidade };
      var tg = el('span', 'tag' + (p.status === 'novo' ? ' novo' : ''), p.status === 'novo' ? 'Novo' : 'Visto');
      t.appendChild(tg); t.appendChild(el('b', null, OB.nomeTipo(p.tipo) + ' · ' + p.nome));
      t.appendChild(el('small', null, u.nome + ' · ' + OB.dataLonga(p.data) + ', ' + OB.hm(p.hora) + (p.pessoas ? ' · ' + p.pessoas + ' pessoas' : '')));
      if (p.obs) t.appendChild(el('small', null, '“' + p.obs + '”'));
      li.appendChild(t);
      if (p.status === 'novo') li.appendChild(bt('Marcar visto', 'bt-preto', function () { var x = OB.pedidos(); x.forEach(function (y) { if (y.id === p.id) y.status = 'visto'; }); OB.grava('pedidos', x); pedidos(sec); badge(); }));
      ul.appendChild(li);
    });
    sec.appendChild(ul);
  }

  /* ---------- ajustes ---------- */
  function ajustes(sec) {
    cab(sec, 'Ajustes', 'Número geral do WhatsApp e link da playlist de axé.');
    var cs = OB.casa(), c = el('div', 'cartao'), g = el('div', 'campos');
    var fZ = inp('tel', cs.whatsapp), fP = inp('url', cs.playlist, 'https://open.spotify.com/playlist/…');
    g.appendChild(campo('WhatsApp geral (55 71 9…)', fZ)); g.appendChild(campo('Link da playlist', fP)); c.appendChild(g);
    var lb = el('div', 'linha-bt');
    lb.appendChild(bt('Salvar', 'bt-preto', function () { OB.grava('casa', { whatsapp: fZ.value.replace(/\D/g, '') || OB.CASA.whatsapp, playlist: fP.value.trim() }); toast('Ajustes salvos'); }));
    lb.appendChild(bt('Voltar dados de exemplo', '', function () { if (confirm('Apagar o que foi mexido e voltar ao exemplo?')) { OB.semear(true); toast('Exemplo restaurado'); ajustes(sec); } }));
    c.appendChild(lb); sec.appendChild(c);
  }

  if (logado()) entra();
})();
