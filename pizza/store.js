// store.js — Camada de dados da Pizzaria do Rocha (VANILLA, sem dependências).
// Persistência: localStorage. Usado por todas as páginas via <script type="module">.

const KEY = 'pizzariaRochaDB';
// Vitrine estática (GitHub Pages): senha do painel não é exposta publicamente.
// No app real (servidor Node), a autenticação é feita no backend.
const ADMIN_PASS = '__demo_disabled__';

const STATUS_FLOW = ['recebido', 'preparando', 'forno', 'saiu_entrega', 'entregue'];
const STATUS_LABELS = {
  recebido: 'Pedido recebido',
  preparando: 'Preparando',
  forno: 'No forno',
  saiu_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

// ---- Contato oficial ----
export const CONTATO = {
  nome: 'Pizzaria do Rocha',
  telefone: '+55 31 9186-7625',
  telefoneDigits: '5531918667625',
  whatsapp: 'https://wa.me/5531918667625',
  whatsappMsg: 'https://wa.me/5531918667625?text=' +
    encodeURIComponent('Olá! Gostaria de fazer um pedido na Pizzaria do Rocha.'),
  endereco: 'Rua Hait, nº 155 — Bairro Nova Cidade, Sete Lagoas / MG',
  enderecoCurto: 'Rua Hait, 155 — Nova Cidade, Sete Lagoas/MG',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Rua Hait 155 Nova Cidade Sete Lagoas MG'),
  mapEmbed: 'https://maps.google.com/maps?q=' +
    encodeURIComponent('Rua Hait 155 Nova Cidade Sete Lagoas MG') + '&z=15&output=embed',
};

// ---- Fotos ilustrativas (baixadas em ./images) ----
export const FOTOS = {
  hero: 'images/hero-forno.jpg',
  historia: 'images/historia-pizzaiolo.jpg',
  generica: 'images/pizza-generica.jpg',
  galeria: [
    'images/pizza-margherita.jpg',
    'images/pizza-pepperoni.jpg',
    'images/pizza-calabresa.jpg',
    'images/pizza-quatro.jpg',
    'images/pizza-portuguesa.jpg',
    'images/pizza-frango.jpg',
  ],
};

const FOTO_KEYWORDS = [
  [/marg|mussar|muçar|queijo|napolit/i, 'images/pizza-margherita.jpg'],
  [/pepper|peperoni|pepperoni/i, 'images/pizza-pepperoni.jpg'],
  [/calabr|lingu|bacon/i, 'images/pizza-calabresa.jpg'],
  [/quatro|4 queijo|4queijo|especial|premium/i, 'images/pizza-quatro.jpg'],
  [/portug|lombo|presunto|ovo/i, 'images/pizza-portuguesa.jpg'],
  [/frango|catupiry|chicken/i, 'images/pizza-frango.jpg'],
];

export function photoFor(nome, categoria, foto) {
  if (foto) return foto; // foto explícita do cadastro tem prioridade
  const alvo = `${nome || ''} ${categoria || ''}`;
  for (const [re, url] of FOTO_KEYWORDS) if (re.test(alvo)) return url;
  const base = String(nome || '');
  let hash = 0;
  for (let i = 0; i < base.length; i++) hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
  return FOTOS.galeria[hash % FOTOS.galeria.length];
}

// ---- Seed: pizzas iniciais (só na primeira vez) ----
function seedItems() {
  const base = [
    ['Margherita', 'Tradicionais', 42.9, 'Molho de tomate italiano, muçarela fresca e manjericão.', 'images/pizza-margherita.jpg'],
    ['Pepperoni', 'Tradicionais', 52.9, 'Muçarela, fatias generosas de pepperoni e orégano.', 'images/pizza-pepperoni.jpg'],
    ['Calabresa', 'Tradicionais', 47.9, 'Calabresa artesanal, cebola roxa e azeitonas.', 'images/pizza-calabresa.jpg'],
    ['Quatro Queijos', 'Especiais', 58.9, 'Muçarela, provolone, gorgonzola e parmesão.', 'images/pizza-quatro.jpg'],
    ['Portuguesa', 'Especiais', 54.9, 'Presunto, ovo, cebola, ervilha, azeitona e muçarela.', 'images/pizza-portuguesa.jpg'],
    ['Frango com Catupiry', 'Especiais', 55.9, 'Frango desfiado temperado com catupiry cremoso.', 'images/pizza-frango.jpg'],
  ];
  return base.map(([nome, categoria, preco, descricao, foto], i) => ({
    id: 'seed_' + i,
    nome, categoria, preco, descricao, foto,
    estoque: 20, ativo: true,
  }));
}

function defaultDB() {
  return { items: seedItems(), orders: [], cart: [], seeded: true };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { const db = defaultDB(); save(db); return db; }
    const db = JSON.parse(raw);
    return { items: db.items || [], orders: db.orders || [], cart: db.cart || [], seeded: db.seeded };
  } catch (e) {
    return defaultDB();
  }
}

function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function uid(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---- Itens de cardápio ----
export function getItems() { return load().items; }

export function saveItem(item) {
  const db = load();
  if (item.id) {
    const idx = db.items.findIndex((i) => i.id === item.id);
    if (idx >= 0) db.items[idx] = item; else db.items.push(item);
  } else {
    item.id = uid('item');
    db.items.push(item);
  }
  save(db);
  return item;
}

export function deleteItem(id) {
  const db = load();
  db.items = db.items.filter((i) => i.id !== id);
  db.cart = db.cart.filter((c) => c.itemId !== id);
  save(db);
}

export function adjustStock(id, delta) {
  const db = load();
  const item = db.items.find((i) => i.id === id);
  if (item) item.estoque = Math.max(0, (item.estoque || 0) + delta);
  save(db);
  return item;
}

// ---- Carrinho ----
export function getCart() {
  const db = load();
  return db.cart.map((c) => {
    const item = db.items.find((i) => i.id === c.itemId);
    return item ? { ...c, item } : null;
  }).filter(Boolean);
}

export function addToCart(itemId, qtd = 1) {
  const db = load();
  const line = db.cart.find((c) => c.itemId === itemId);
  if (line) line.qtd += qtd; else db.cart.push({ itemId, qtd });
  save(db);
}

export function setCartQty(itemId, qtd) {
  const db = load();
  if (qtd <= 0) db.cart = db.cart.filter((c) => c.itemId !== itemId);
  else { const line = db.cart.find((c) => c.itemId === itemId); if (line) line.qtd = qtd; }
  save(db);
}

export function removeFromCart(itemId) {
  const db = load();
  db.cart = db.cart.filter((c) => c.itemId !== itemId);
  save(db);
}

export function clearCart() { const db = load(); db.cart = []; save(db); }

export function cartCount() { return load().cart.reduce((s, c) => s + c.qtd, 0); }

export function cartTotal() {
  return getCart().reduce((s, c) => s + c.qtd * (c.item.preco || 0), 0);
}

// ---- Pedidos ----
export function getOrders() {
  return load().orders.slice().sort((a, b) => b.criadoEm - a.criadoEm);
}

export function getOrder(id) { return load().orders.find((o) => o.id === id); }

export function createOrder({ cliente, pagamento }) {
  const db = load();
  const cartLines = db.cart.map((c) => {
    const item = db.items.find((i) => i.id === c.itemId);
    return item ? { itemId: c.itemId, nome: item.nome, qtd: c.qtd, preco: item.preco } : null;
  }).filter(Boolean);
  const total = cartLines.reduce((s, l) => s + l.qtd * l.preco, 0);
  const order = {
    id: uid('ped'),
    numero: Math.floor(1000 + Math.random() * 9000),
    itens: cartLines, total, cliente, pagamento,
    status: 'recebido', criadoEm: Date.now(),
  };
  cartLines.forEach((l) => {
    const item = db.items.find((i) => i.id === l.itemId);
    if (item) item.estoque = Math.max(0, (item.estoque || 0) - l.qtd);
  });
  db.orders.push(order);
  db.cart = [];
  save(db);
  return order;
}

export function updateOrderStatus(id, status) {
  const db = load();
  const order = db.orders.find((o) => o.id === id);
  if (order) order.status = status;
  save(db);
  return order;
}

// Vincula/atualiza os dados de pagamento de um pedido (asaasId, status, simulacao)
export function setOrderPayment(id, patch = {}) {
  const db = load();
  const order = db.orders.find((o) => o.id === id);
  if (order) {
    order.pagamento = { ...(order.pagamento || {}), ...patch };
  }
  save(db);
  return order;
}

// ---- Status ----
export function nextStatus(status) {
  const idx = STATUS_FLOW.indexOf(status);
  if (idx < 0 || idx === STATUS_FLOW.length - 1) return status;
  return STATUS_FLOW[idx + 1];
}
export function statusLabel(status) { return STATUS_LABELS[status] || status; }
export function statusFlow() { return STATUS_FLOW.slice(); }

// ---- Admin ----
export function checkAdminPass(pass) { return pass === ADMIN_PASS; }

// ---- Helpers de formatação ----
export function money(n) { return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ','); }
