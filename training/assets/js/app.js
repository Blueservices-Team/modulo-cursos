/**
 * TRAINING MODULE - Shared JS Utilities
 */

const API_BASE = '../api/training';

const LOCATIONS = {
  1: 'Lugar 1',
  2: 'Lugar 2',
  3: 'Lugar 3',
  4: 'Lugar 4',
};

/* ── Fetch helpers ──────────────────────── */

async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Error desconocido');
  return json.data;
}

async function apiPost(endpoint, body) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Error desconocido');
  return json.data;
}

async function apiPut(endpoint, body) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Error desconocido');
  return json.data;
}

async function apiDelete(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Error desconocido');
  return json.data;
}

/* ── Alert helpers ──────────────────────── */

function showAlert(id, message, type = 'success') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.textContent = message;
  setTimeout(() => { el.classList.remove('show'); }, 5000);
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

/* ── Date / format helpers ──────────────── */

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dtStr) {
  if (!dtStr) return '—';
  const d = new Date(dtStr);
  return d.toLocaleString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function locationName(code) {
  return LOCATIONS[code] || `Lugar ${code}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ── DOM helpers ────────────────────────── */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') node.className = v;
    else if (k === 'textContent') node.textContent = v;
    else if (k === 'innerHTML') node.innerHTML = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  for (const child of children) {
    if (typeof child === 'string') node.appendChild(document.createTextNode(child));
    else if (child) node.appendChild(child);
  }
  return node;
}

/* ── Modal helpers ──────────────────────── */

function openModal(id) {
  document.getElementById(id).classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

/* ── Simple pagination ──────────────────── */

function paginate(items, page, perPage = 10) {
  const totalPages = Math.ceil(items.length / perPage);
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    totalPages,
    page,
  };
}

function renderPagination(containerId, totalPages, currentPage, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (totalPages <= 1) return;

  const prevBtn = el('button', {
    textContent: 'Anterior',
    disabled: currentPage <= 1 ? 'disabled' : undefined,
    onClick: () => onPageChange(currentPage - 1),
  });
  container.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = el('button', {
      textContent: String(i),
      className: i === currentPage ? 'active' : '',
      onClick: () => onPageChange(i),
    });
    container.appendChild(btn);
  }

  const nextBtn = el('button', {
    textContent: 'Siguiente',
    disabled: currentPage >= totalPages ? 'disabled' : undefined,
    onClick: () => onPageChange(currentPage + 1),
  });
  container.appendChild(nextBtn);
}

/* ── Sidebar icons (SVG) ───────────────── */

const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  training: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  certificate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
};

/**
 * Build sidebar HTML for the given role
 */
function buildSidebar(role) {
  let links = '';
  if (role === 'ADMIN_MASTER') {
    links = `
      <a class="sidebar-link" href="corporate_planner.html" title="Planeacion">${ICONS.calendar}</a>
      <a class="sidebar-link" href="corporate_attendance.html" title="Pase de lista">${ICONS.clipboard}</a>
      <a class="sidebar-link" href="corporate_history.html" title="Historico">${ICONS.history}</a>
    `;
  } else {
    links = `
      <a class="sidebar-link" href="dealer_technicians.html" title="Tecnicos">${ICONS.users}</a>
      <a class="sidebar-link" href="dealer_planner.html" title="Planeacion">${ICONS.calendar}</a>
      <a class="sidebar-link" href="dealer_certificates.html" title="Certificados">${ICONS.certificate}</a>
    `;
  }
  return `
    <div class="sidebar-logo">CH</div>
    <nav class="sidebar-nav">
      <a class="sidebar-link" href="#" title="Dashboard">${ICONS.dashboard}</a>
      ${links}
    </nav>
  `;
}

/**
 * Build header HTML
 */
function buildHeader(breadcrumbItems, userName) {
  const bc = breadcrumbItems.map((item, i) => {
    if (i === breadcrumbItems.length - 1) return `<span>${item}</span>`;
    return `${item} / `;
  }).join('');

  const initials = (userName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return `
    <div class="header-left">
      <div class="breadcrumb">${bc}</div>
    </div>
    <div class="header-right">
      <select class="lang-select">
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>
      <div class="user-badge">
        <div class="user-avatar">${initials}</div>
        <span>${userName || 'Usuario'}</span>
      </div>
    </div>
  `;
}

/**
 * Initialize page shell
 */
function initPage(role, breadcrumb, userName) {
  const sidebar = document.getElementById('sidebar');
  const header = document.getElementById('header');
  if (sidebar) sidebar.innerHTML = buildSidebar(role);
  if (header) header.innerHTML = buildHeader(breadcrumb, userName);

  // Highlight current sidebar link
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}
