(() => {
  "use strict";

  /* ---------- Versioning (Semantic Versioning: MAJOR.MINOR.PATCH) ----------
     MAJOR: breaking changes (e.g. data format changes that need migration)
     MINOR: new features that are backwards compatible
     PATCH: backwards-compatible bug fixes
     Update only this constant; the footer renders it automatically. */
  const APP_VERSION = "1.0.0";

  const STORAGE_KEY = "payday_records";
  const LANG_KEY = "payday_lang";
  const THEME_KEY = "payday_theme";
  const QUOTES_URL = "quotes.json";

  // Used only if quotes.json cannot be loaded (e.g. opened via file://)
  const FALLBACK_QUOTES = [
    { quote: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
    { quote: "A penny saved is a penny earned.", author: "Benjamin Franklin" },
    { quote: "The habit of saving is itself an education.", author: "T. T. Munger" }
  ];

  /* ---------- Translations ---------- */
  const i18n = {
    en: {
      title: "PayDay",
      description: "Manage your monthly salary: save and spend with clarity.",
      actionType: "Action type",
      save: "Save (Income)",
      withdraw: "Withdraw (Expense)",
      amount: "Amount (DZD)",
      date: "Date",
      note: "Note (optional)",
      notePlaceholder: "e.g. Groceries",
      submit: "Execute",
      colType: "Action Type",
      colAmount: "Amount",
      colDate: "Date",
      colNote: "Note",
      colBalance: "Remaining Saved Balance",
      empty: "No records yet. Add your first action above.",
      exportJson: "Export JSON",
      importJson: "Import JSON",
      footerPrefix: "Developed with love",
      footerBy: "by",
      author: "Haitham Aouati",
      savedLabel: "Saved",
      withdrawnLabel: "Withdrawn",
      currency: "DZD",
      confirmDelete: "Delete this record?",
      importOk: "Data imported successfully.",
      importErr: "Invalid JSON file.",
      invalidAmount: "Please enter a valid amount.",
      editHint: "Click to edit",
      saveChanges: "Save changes",
      cancel: "Cancel",
      del: "Delete",
      newQuote: "New quote",
      quoteLoading: "Loading…"
    },
    ar: {
      title: "يوم الدفع",
      description: "أدِر راتبك الشهري: ادخر وأنفق بوضوح.",
      actionType: "نوع العملية",
      save: "ادخار (دخل)",
      withdraw: "سحب (مصروف)",
      amount: "المبلغ (دج)",
      date: "التاريخ",
      note: "ملاحظة (اختياري)",
      notePlaceholder: "مثال: مشتريات",
      submit: "تنفيذ",
      colType: "نوع العملية",
      colAmount: "المبلغ",
      colDate: "التاريخ",
      colNote: "ملاحظة",
      colBalance: "الرصيد المدّخر المتبقي",
      empty: "لا توجد عمليات بعد. أضف أول عملية من الأعلى.",
      exportJson: "تصدير JSON",
      importJson: "استيراد JSON",
      footerPrefix: "طُوِّر بكل حب",
      footerBy: "بواسطة",
      author: "هيثم عواطي",
      savedLabel: "ادخار",
      withdrawnLabel: "سحب",
      currency: "دج",
      confirmDelete: "حذف هذه العملية؟",
      importOk: "تم استيراد البيانات بنجاح.",
      importErr: "ملف JSON غير صالح.",
      invalidAmount: "الرجاء إدخال مبلغ صحيح.",
      editHint: "انقر للتعديل",
      saveChanges: "حفظ التعديلات",
      cancel: "إلغاء",
      del: "حذف",
      newQuote: "اقتباس جديد",
      quoteLoading: "جارٍ التحميل…"
    }
  };

  /* ---------- State ---------- */
  let lang = localStorage.getItem(LANG_KEY) || "en";
  let theme = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  let records = loadRecords();
  let editingId = null;

  let quotes = [];
  let lastQuoteIndex = -1;
  let quotesReady = false;

  /* ---------- Elements ---------- */
  const $ = (id) => document.getElementById(id);
  const form = $("actionForm");
  const typeEl = $("type");
  const amountEl = $("amount");
  const dateEl = $("date");
  const noteEl = $("note");
  const tbody = $("tableBody");
  const emptyMsg = $("emptyMsg");
  const datetimeEl = $("datetime");
  const langBtn = $("langToggle");
  const themeBtn = $("themeToggle");
  const importFile = $("importFile");
  const quoteBody = $("quoteBody");
  const quoteTextEl = $("quoteText");
  const quoteAuthorEl = $("quoteAuthor");
  const quoteRefreshBtn = $("quoteRefresh");
  const versionEl = $("appVersion");

  /* ---------- Storage ---------- */
  function loadRecords() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  /* ---------- Helpers ---------- */
  const t = (key) => i18n[lang][key];
  const locale = () => (lang === "ar" ? "ar-DZ" : "en-GB");

  function todayISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function formatMoney(n) {
    return new Intl.NumberFormat(locale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(n) + " " + t("currency");
  }

  function formatDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat(locale(), {
      year: "numeric", month: "short", day: "numeric"
    }).format(new Date(y, m - 1, d));
  }

  // Escapes text for safe use in HTML content and attribute values
  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ---------- Version ---------- */
  function renderVersion() {
    // Strict display format: "Version: MAJOR.MINOR.PATCH"
    const semver = /^\d+\.\d+\.\d+$/;
    versionEl.textContent = "Version: " + (semver.test(APP_VERSION) ? APP_VERSION : "0.0.0");
  }

  /* ---------- Quotes ---------- */
  function isValidQuote(q) {
    return q && typeof q.quote === "string" && q.quote.trim() &&
           typeof q.author === "string" && q.author.trim();
  }

  async function loadQuotes() {
    try {
      const res = await fetch(QUOTES_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const valid = Array.isArray(data) ? data.filter(isValidQuote) : [];
      if (!valid.length) throw new Error("No valid quotes");
      quotes = valid;
    } catch (err) {
      console.warn("PayDay: could not load quotes.json, using fallback quotes.", err);
      quotes = FALLBACK_QUOTES;
    }
    quotesReady = true;
    showQuote(false);
  }

  function pickQuote() {
    if (quotes.length === 1) return quotes[0];
    let i;
    do {
      i = Math.floor(Math.random() * quotes.length);
    } while (i === lastQuoteIndex);   // never repeat the previous quote
    lastQuoteIndex = i;
    return quotes[i];
  }

  function renderQuote(q) {
    const qLang = q.lang === "ar" ? "ar" : "en";
    quoteTextEl.lang = qLang;
    quoteTextEl.dir = qLang === "ar" ? "rtl" : "ltr";
    quoteTextEl.textContent = q.quote;       // textContent: safe from injected HTML
    quoteAuthorEl.textContent = "— " + q.author;
  }

  function showQuote(animate) {
    if (!quotesReady || !quotes.length) return;
    const next = pickQuote();

    if (!animate) {
      renderQuote(next);
      return;
    }

    quoteRefreshBtn.disabled = true;
    quoteRefreshBtn.classList.add("spinning");
    quoteBody.classList.add("is-fading");

    setTimeout(() => {
      renderQuote(next);
      quoteBody.classList.remove("is-fading");
      quoteRefreshBtn.disabled = false;
      quoteRefreshBtn.classList.remove("spinning");
    }, 250);
  }

  quoteRefreshBtn.addEventListener("click", () => showQuote(true));

  /* ---------- Rendering ---------- */
  function sortedRecords() {
    // Chronological: by date, then by creation order (id)
    return [...records].sort((a, b) =>
      a.date === b.date ? a.id - b.id : a.date.localeCompare(b.date)
    );
  }

  function viewRowHTML(r, balance) {
    const isSave = r.type === "save";
    const typeCell = isSave
      ? `<span class="badge green"><i class="fa-solid fa-arrow-down"></i> ${t("savedLabel")}</span>`
      : `<span class="badge red"><i class="fa-solid fa-arrow-up"></i> ${t("withdrawnLabel")}</span>`;

    return `
      <tr class="row" data-id="${r.id}" tabindex="0" title="${esc(t("editHint"))}">
        <td>${typeCell}</td>
        <td class="num ${isSave ? "green" : "red"}">${formatMoney(r.amount)}</td>
        <td>${formatDate(r.date)}</td>
        <td class="note-cell">${r.note ? esc(r.note) : "—"}</td>
        <td class="num yellow">${formatMoney(balance)}</td>
        <td class="row-actions">
          <button class="act-btn del-btn" data-id="${r.id}" aria-label="${esc(t("del"))}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>`;
  }

  function editRowHTML(r, balance) {
    return `
      <tr class="editing" data-id="${r.id}">
        <td>
          <select class="edit-type">
            <option value="save" ${r.type === "save" ? "selected" : ""}>${t("save")}</option>
            <option value="withdraw" ${r.type === "withdraw" ? "selected" : ""}>${t("withdraw")}</option>
          </select>
        </td>
        <td><input type="number" class="edit-amount" min="0.01" step="0.01" value="${r.amount}"></td>
        <td><input type="date" class="edit-date" value="${esc(r.date)}"></td>
        <td><input type="text" class="edit-note" value="${esc(r.note || "")}" placeholder="${esc(t("notePlaceholder"))}"></td>
        <td class="num yellow">${formatMoney(balance)}</td>
        <td class="row-actions">
          <button class="act-btn save-btn" aria-label="${esc(t("saveChanges"))}"><i class="fa-solid fa-check"></i></button>
          <button class="act-btn cancel-btn" aria-label="${esc(t("cancel"))}"><i class="fa-solid fa-xmark"></i></button>
        </td>
      </tr>`;
  }

  function renderTable() {
    const sorted = sortedRecords();
    let balance = 0;

    tbody.innerHTML = sorted.map((r) => {
      balance += r.type === "save" ? r.amount : -r.amount;
      return r.id === editingId ? editRowHTML(r, balance) : viewRowHTML(r, balance);
    }).join("");

    emptyMsg.classList.toggle("hidden", sorted.length > 0);
  }

  function renderDateTime() {
    datetimeEl.textContent = new Intl.DateTimeFormat(locale(), {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    }).format(new Date());
  }

  function applyLanguage() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t("title");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    quoteRefreshBtn.setAttribute("aria-label", t("newQuote"));
    quoteRefreshBtn.title = t("newQuote");
    if (!quotesReady) quoteTextEl.textContent = t("quoteLoading");

    langBtn.textContent = lang === "ar" ? "EN" : "AR";
    renderTable();
    renderDateTime();
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme);
    themeBtn.innerHTML = theme === "dark"
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }

  /* ---------- Inline editing ---------- */
  function startEdit(id) {
    editingId = id;
    renderTable();
    const input = tbody.querySelector("tr.editing .edit-amount");
    if (input) { input.focus(); input.select(); }
  }

  function cancelEdit() {
    editingId = null;
    renderTable();
  }

  function saveEdit() {
    const row = tbody.querySelector("tr.editing");
    if (!row) return;

    const amount = parseFloat(row.querySelector(".edit-amount").value);
    if (!isFinite(amount) || amount <= 0) {
      alert(t("invalidAmount"));
      row.querySelector(".edit-amount").focus();
      return;
    }

    const rec = records.find((r) => r.id === editingId);
    if (rec) {
      rec.type = row.querySelector(".edit-type").value;
      rec.amount = Math.round(amount * 100) / 100;
      rec.date = row.querySelector(".edit-date").value || rec.date;
      rec.note = row.querySelector(".edit-note").value.trim();
      persist();
    }
    editingId = null;
    renderTable();
  }

  /* ---------- Events ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = parseFloat(amountEl.value);
    if (!isFinite(amount) || amount <= 0) {
      alert(t("invalidAmount"));
      return;
    }
    records.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      type: typeEl.value,
      amount: Math.round(amount * 100) / 100,
      date: dateEl.value || todayISO(),
      note: noteEl.value.trim()
    });
    persist();
    renderTable();

    amountEl.value = "";
    noteEl.value = "";
    amountEl.focus();
  });

  tbody.addEventListener("click", (e) => {
    // Delete
    const del = e.target.closest(".del-btn");
    if (del) {
      if (!confirm(t("confirmDelete"))) return;
      const id = Number(del.dataset.id);
      records = records.filter((r) => r.id !== id);
      if (editingId === id) editingId = null;
      persist();
      renderTable();
      return;
    }

    // Save / cancel inside the edit row
    if (e.target.closest(".save-btn")) { saveEdit(); return; }
    if (e.target.closest(".cancel-btn")) { cancelEdit(); return; }

    // Click on a normal row starts editing
    const row = e.target.closest("tr.row");
    if (row) startEdit(Number(row.dataset.id));
  });

  tbody.addEventListener("keydown", (e) => {
    const inEdit = e.target.closest("tr.editing");
    if (inEdit) {
      if (e.key === "Enter") { e.preventDefault(); saveEdit(); }
      else if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
      return;
    }
    // Keyboard access: Enter on a focused row opens the editor
    if (e.key === "Enter" && e.target.matches("tr.row")) {
      startEdit(Number(e.target.dataset.id));
    }
  });

  langBtn.addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem(LANG_KEY, lang);
    applyLanguage();
  });

  themeBtn.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, theme);
    applyTheme();
  });

  // Export: file named with the current export date (YYYY-MM-DD.json)
  $("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(sortedRecords(), null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // Import
  $("importBtn").addEventListener("click", () => importFile.click());

  importFile.addEventListener("change", () => {
    const file = importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("Not an array");

        records = data
          .filter((r) =>
            r && (r.type === "save" || r.type === "withdraw") &&
            isFinite(Number(r.amount)) && Number(r.amount) > 0 &&
            /^\d{4}-\d{2}-\d{2}$/.test(r.date))
          .map((r, i) => ({
            id: Date.now() + i,
            type: r.type,
            amount: Number(r.amount),
            date: r.date,
            note: typeof r.note === "string" ? r.note : ""
          }));

        editingId = null;
        persist();
        renderTable();
        alert(t("importOk"));
      } catch {
        alert(t("importErr"));
      }
      importFile.value = "";
    };
    reader.readAsText(file);
  });

  /* ---------- Floating $ background ---------- */
  function initBackground() {
    const fx = $("bgFx");
    if (!fx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const count = window.innerWidth < 640 ? 14 : 28;
    const rand = (min, max) => Math.random() * (max - min) + min;

    for (let i = 0; i < count; i++) {
      const goesDown = i % 2 === 0; // green falls, red rises
      const el = document.createElement("span");
      el.className = "fx " + (goesDown ? "fx-down fx-green" : "fx-up fx-red");
      el.textContent = "$";
      el.style.left = rand(0, 96) + "%";
      el.style.fontSize = rand(14, 44).toFixed(0) + "px";
      el.style.opacity = rand(0.12, 0.35).toFixed(2);
      el.style.setProperty("--drift", rand(-40, 40).toFixed(0) + "px");
      el.style.animationDuration = rand(9, 24).toFixed(1) + "s";
      el.style.animationDelay = "-" + rand(0, 24).toFixed(1) + "s"; // start mid-flight
      // New random column each time it loops
      el.addEventListener("animationiteration", () => {
        el.style.left = rand(0, 96) + "%";
      });
      fx.appendChild(el);
    }
  }

  /* ---------- Init ---------- */
  dateEl.value = todayISO();
  renderVersion();
  applyTheme();
  applyLanguage();
  initBackground();
  loadQuotes();
  setInterval(renderDateTime, 1000);
})();