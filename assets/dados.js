/* =====================================================================
   O Baiano Churrasqueiro — dados da casa + "banco" do modo demo.
   ÚNICO lugar com informação da casa. Site e painel leem daqui.
   Modo demo: tudo fica no navegador (localStorage, prefixo ob_).
   O que o gerente muda no painel aparece no site do mesmo aparelho.
   Nada de preço inventado: item sem preço aparece "preço no balcão".
   ===================================================================== */
(function () {
  'use strict';

  var CASA = {
    nome: 'O Baiano',
    nomeCompleto: 'O Baiano Churrasqueiro',
    instagram: 'obaianochurrasqueiro',
    // !!! PLACEHOLDER — NÃO É O NÚMERO DA CASA. Trocar pelo WhatsApp oficial (README > A confirmar).
    whatsapp: '5571900000000',
    whatsappPlaceholder: true,
    // link da playlist de axé que está na bio — ainda não temos (A confirmar). Vazio = botão some.
    playlist: '',
    ifoodBusca: 'https://www.ifood.com.br/busca?q=o%20baiano%20churrasqueiro'
  };

  /* Unidades: endereços tirados do demo do outro dev (A confirmar).
     lat/lng APROXIMADAS (pelo bairro/rua) só para ordenar "mais perto"; confirmar no Maps.
     abre = hora de abrir que o outro demo mostra; fecha = null (não sabemos → painel preenche).
     whatsapp = null → usa o número geral (placeholder). */
  var UNIDADES = [
    { id: 'barra',   nome: 'Barra',               end: 'R. Comendador Bernardo Catarino, 171, Lj 09', bairro: 'Barra · Salvador',       lat: -13.0050, lng: -38.5262, abre: '11:00', fecha: null, ifood: false, cor: 'amarelo',  nota: '' },
    { id: 'morro',   nome: 'Morro do Ipiranga',   end: 'R. Silvino Marques, 31',                      bairro: 'Barra · Salvador',       lat: -13.0040, lng: -38.5205, abre: '11:00', fecha: null, ifood: true,  cor: 'vermelho', nota: '' },
    { id: 'horto',   nome: 'Horto Florestal',     end: 'R. Waldemar Falcão, 335',                     bairro: 'Horto Florestal · Salvador', lat: -12.9945, lng: -38.4935, abre: '11:00', fecha: null, ifood: true, cor: 'verde',  nota: '' },
    { id: 'patamares', nome: 'Patamares',         end: 'Colina A, R. Bicuíba, 564',                   bairro: 'Patamares · Salvador',   lat: -12.9600, lng: -38.4045, abre: '11:00', fecha: null, ifood: true,  cor: 'azul',     nota: '' },
    { id: 'pituba',  nome: 'Pituba',              end: 'R. Alagoas, 92, Lj 4',                        bairro: 'Pituba · Salvador',      lat: -13.0010, lng: -38.4620, abre: '11:00', fecha: null, ifood: true,  cor: 'amarelo',  nota: 'Quinta tem axé ao vivo.' },
    { id: 'forte',   nome: 'Praia do Forte',      end: 'Av. do Farol, 2907 · estacionamento do Projeto Baleia Jubarte', bairro: 'Praia do Forte · Mata de São João', lat: -12.5785, lng: -38.0005, abre: '14:00', fecha: null, ifood: false, cor: 'vermelho', nota: '' },
    { id: 'vilas',   nome: 'Vilas do Atlântico',  end: 'Av. Praia de Itapuã, 1025, Quadra 017',       bairro: 'Vilas do Atlântico · Lauro de Freitas', lat: -12.8890, lng: -38.3150, abre: null, fecha: null, ifood: false, cor: 'verde', nota: 'Novidade!' }
  ];

  // bairros para quem não quer dar a localização (centro aproximado)
  var BAIRROS = [
    { nome: 'Barra / Ondina',        lat: -13.006, lng: -38.520 },
    { nome: 'Graça / Vitória',       lat: -12.999, lng: -38.522 },
    { nome: 'Rio Vermelho',          lat: -13.012, lng: -38.490 },
    { nome: 'Horto / Brotas',        lat: -12.993, lng: -38.495 },
    { nome: 'Pituba / Itaigara',     lat: -13.000, lng: -38.462 },
    { nome: 'Costa Azul / Armação',  lat: -12.990, lng: -38.440 },
    { nome: 'Imbuí / Paralela',      lat: -12.970, lng: -38.430 },
    { nome: 'Patamares / Piatã',     lat: -12.955, lng: -38.400 },
    { nome: 'Itapuã / Stella Maris', lat: -12.935, lng: -38.355 },
    { nome: 'Lauro de Freitas',      lat: -12.894, lng: -38.327 },
    { nome: 'Linha Verde / Praia do Forte', lat: -12.600, lng: -38.010 }
  ];

  var CATEGORIAS = [
    { id: 'brasa',  nome: 'Na brasa',   nota: 'Aqui é assim: você escolhe, a gente assa.' },
    { id: 'lanche', nome: 'Hambúrguer', nota: 'O melhor hambúrguer da sua vida. Palavra do Baiano.' },
    { id: 'acomp',  nome: 'Do lado',    nota: 'Batata raiz, feita com casca. Sem frufru.' },
    { id: 'bebe',   nome: 'Pra beber',  nota: 'Pra você que não come água: Sincorá ou Campo Largo.' }
  ];

  /* preco: null = "preço no balcão". fonte = de onde veio o item (legenda/foto). */
  var CARDAPIO = [
    { id: 'carne-casa', cat: 'brasa',  nome: 'A carne do dia no balcão', desc: 'Você escolhe a peça na geladeira, a gente assa na brasa. "A melhor carne da sua vida."', preco: null, fonte: 'legenda + foto' },
    { id: 'carne-batata', cat: 'brasa', nome: 'Carne com batata raiz',   desc: 'A melhor carne da sua vida com uma batata raiz feita com casca. Vem na tábua.', preco: null, fonte: 'legenda', destaque: true },
    { id: 'osso',       cat: 'brasa',  nome: 'Osso na tábua',            desc: 'Aparece nos vídeos ao lado da carne e da batata. Pergunte no balcão.', preco: null, fonte: 'foto (a confirmar)' },
    { id: 'burger',     cat: 'lanche', nome: 'O hambúrguer do Baiano',   desc: 'O melhor hambúrguer da sua vida. Migo, é pesado. Na moral.', preco: null, fonte: 'legenda', destaque: true },
    { id: 'batata-raiz', cat: 'acomp', nome: 'Batata raiz com casca',    desc: 'Feita com casca, do jeito que tem que ser.', preco: null, fonte: 'legenda' },
    { id: 'batata-pct', cat: 'acomp',  nome: 'Batata O Baiano (pacote)', desc: '"Sua batata sem frufru." O pacote amarelo que aparece na mesa.', preco: null, fonte: 'foto' },
    { id: 'agua',       cat: 'bebe',   nome: 'Água Sincorá ou Campo Largo', desc: 'Pra quem não come água. A escolha é sua.', preco: null, fonte: 'legenda' },
    { id: 'cerveja',    cat: 'bebe',   nome: 'Cerveja gelada',           desc: 'Pergunte as marcas da unidade.', preco: null, fonte: 'foto' },
    { id: 'cachaca',    cat: 'bebe',   nome: 'Dose de cachaça',          desc: 'Pra brindar na porta da Barra.', preco: null, fonte: 'foto (a confirmar)' }
  ];

  var TIPOS_PEDIDO = [
    { id: 'mesa',   nome: 'Reservar mesa' },
    { id: 'retira', nome: 'Pedido pra retirar' },
    { id: 'aniver', nome: 'Aniversário / grupo' },
    { id: 'show',   nome: 'Mesa no axé de quinta (Pituba)' }
  ];

  var SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var PFX = 'ob_';

  /* ---------------- util ---------------- */
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function deIso(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function hoje() { return iso(new Date()); }
  function soma(s, n) { var d = deIso(s); d.setDate(d.getDate() + n); return iso(d); }
  function proximo(dow, aPartir) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + (aPartir || 0)); while (d.getDay() !== dow) d.setDate(d.getDate() + 1); return iso(d); }
  function le(k, pad) { try { var v = localStorage.getItem(PFX + k); return v ? JSON.parse(v) : pad; } catch (e) { return pad; } }
  function grava(k, v) { try { localStorage.setItem(PFX + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function novoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function copia(x) { return JSON.parse(JSON.stringify(x)); }

  /* ---------------- semente do modo demo ---------------- */
  function semear(forcar) {
    var V = 'semeado_v1';
    if (!forcar) { try { if (localStorage.getItem(PFX + V)) return; } catch (e) { return; } }
    grava('unidades', copia(UNIDADES));
    grava('cardapio', CARDAPIO.map(function (i) { return Object.assign({ ativo: true }, i); }));
    grava('casa', { whatsapp: CASA.whatsapp, playlist: CASA.playlist });
    // 12/11/2026: cartaz real (Banda Autorais, couvert R$ 25, "19H" no cartaz).
    // Demais quintas: legenda "Autorais no O Baiano Pituba, quinta-feira, às 18h" — couvert + pulseira, valor a confirmar.
    var shows = [{ id: novoId(), data: '2026-11-12', hora: '19:00', unidade: 'pituba', artista: 'Banda Autorais', titulo: 'Axé do Baiano', couvert: 'R$ 25', cartaz: 'fotos/cartaz-autorais-12nov.jpg', obs: 'Couvert + pulseira.' }];
    var q = proximo(4, 1); if (q <= '2026-11-12') q = soma('2026-11-12', 7);
    for (var i = 0; i < 3; i++) shows.push({ id: novoId(), data: soma(q, 7 * i), hora: '18:00', unidade: 'pituba', artista: 'Autorais', titulo: 'Axé de quinta', couvert: '', cartaz: '', obs: 'Couvert + pulseira (valor a confirmar).' });
    grava('shows', shows);
    grava('pedidos', [
      { id: novoId(), tipo: 'show', unidade: 'pituba', data: shows[1].data, hora: '18:00', pessoas: 6, nome: 'Carla (exemplo)', obs: 'Aniversário do marido, perto do palco se der.', criado: new Date().toISOString(), status: 'novo' },
      { id: novoId(), tipo: 'mesa', unidade: 'barra', data: hoje(), hora: '20:00', pessoas: 4, nome: 'Rafael (exemplo)', obs: '', criado: new Date().toISOString(), status: 'visto' }
    ]);
    try { localStorage.setItem(PFX + V, '1'); } catch (e) { /* sem armazenamento */ }
  }

  function unidades() { return le('unidades', copia(UNIDADES)); }
  function unidade(id) { return unidades().filter(function (u) { return u.id === id; })[0]; }
  function cardapio() { return le('cardapio', CARDAPIO.map(function (i) { return Object.assign({ ativo: true }, i); })); }
  function casa() { return Object.assign({}, CASA, le('casa', {})); }
  function shows() { return le('shows', []).slice().sort(function (a, b) { return (a.data + a.hora).localeCompare(b.data + b.hora); }); }
  function proximosShows() { var h = hoje(); return shows().filter(function (s) { return s.data >= h; }); }
  function pedidos() { return le('pedidos', []); }
  function addPedido(p) { var l = pedidos(); p.id = novoId(); p.criado = new Date().toISOString(); p.status = 'novo'; l.unshift(p); grava('pedidos', l); return p; }

  /* ---------------- horário ---------------- */
  function toMin(t) { var p = String(t).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  function hm(t) { return t ? String(t).replace(':00', 'h').replace(':', 'h') : ''; }
  // devolve { classe, texto } — sem hora de fechar cadastrada, não promete "aberto até".
  function status(u, agora) {
    agora = agora || new Date();
    if (!u.abre) return { classe: 'neutro', texto: 'Horário a confirmar' };
    var m = agora.getHours() * 60 + agora.getMinutes(), a = toMin(u.abre);
    if (u.fecha) {
      var f = toMin(u.fecha); if (f <= a) f += 1440;
      var mm = m < a && m + 1440 < f ? m + 1440 : m;
      if (mm >= a && mm < f) return { classe: 'aberto', texto: 'Aberto agora · fecha ' + hm(u.fecha) };
      return { classe: 'fechado', texto: 'Fechado · abre ' + hm(u.abre) };
    }
    if (m < a) return { classe: 'fechado', texto: 'Abre às ' + hm(u.abre) };
    return { classe: 'aberto', texto: 'Abriu às ' + hm(u.abre) };
  }

  /* ---------------- mapa / distância ---------------- */
  function km(a, b) {
    var R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r;
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function maisPerto(pos) { return unidades().map(function (u) { return Object.assign({ km: km(pos, u) }, u); }).sort(function (a, b) { return a.km - b.km; }); }
  function enderecoMapa(u) { return 'O Baiano Churrasqueiro, ' + u.end + ', ' + u.bairro + ', BA'; }
  function linkRota(u) { return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(enderecoMapa(u)); }
  function linkEmbed(u) { return 'https://maps.google.com/maps?q=' + encodeURIComponent(u.end + ', ' + u.bairro + ', BA') + '&z=16&output=embed'; }
  function zapDe(u) { return (u && u.whatsapp) || casa().whatsapp; }
  function linkWa(txt, numero) { return 'https://wa.me/' + (numero || casa().whatsapp) + '?text=' + encodeURIComponent(txt); }

  function dataLonga(s) { var d = deIso(s); return SEMANA[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()]; }
  function nomeTipo(id) { return (TIPOS_PEDIDO.filter(function (t) { return t.id === id; })[0] || {}).nome || id; }

  semear(false);

  window.OB = {
    CASA: CASA, UNIDADES: UNIDADES, BAIRROS: BAIRROS, CATEGORIAS: CATEGORIAS, TIPOS_PEDIDO: TIPOS_PEDIDO, SEMANA: SEMANA, MESES: MESES,
    iso: iso, deIso: deIso, hoje: hoje, soma: soma, le: le, grava: grava, novoId: novoId, semear: semear,
    unidades: unidades, unidade: unidade, cardapio: cardapio, casa: casa, shows: shows, proximosShows: proximosShows,
    pedidos: pedidos, addPedido: addPedido, status: status, hm: hm, km: km, maisPerto: maisPerto,
    linkRota: linkRota, linkEmbed: linkEmbed, zapDe: zapDe, linkWa: linkWa, dataLonga: dataLonga, nomeTipo: nomeTipo
  };
})();
