(() => {
  "use strict";

  /* ---------- Versioning (Semantic Versioning: MAJOR.MINOR.PATCH) ----------
     MAJOR: breaking changes (e.g. data format changes that need migration)
     MINOR: new features that are backwards compatible
     PATCH: backwards-compatible fixes and polish (e.g. wording, styling)
     Update only this constant; the footer renders it automatically. */
  const APP_VERSION = "1.0.2";

  const STORAGE_KEY = "payday_records";
  const LANG_KEY = "payday_lang";
  const THEME_KEY = "payday_theme";
  const READONLY_KEY = "payday_readonly";
  const QUOTES_URL = "quotes.json";

  // Used per language only if quotes.json cannot be loaded (e.g. opened via file://)
  const FALLBACK_QUOTES = {
    en: [
      { quote: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
      { quote: "A penny saved is a penny earned.", author: "Benjamin Franklin" },
      { quote: "The habit of saving is itself an education.", author: "T. T. Munger" }
    ],
    ar: [
      { quote: "القرش الأبيض ينفع في اليوم الأسود.", author: "مثل عربي" },
      { quote: "على قدر لحافك مدّ رجليك.", author: "مثل عربي" },
      { quote: "ما قلّ وكفى خيرٌ مما كثر وألهى.", author: "مثل عربي" }
    ]
  };

  /* ---------- Translations (FinTech terminology) ----------
     Note: the stored record types remain "save" / "withdraw" internally so
     existing localStorage data and exported JSON files stay compatible.
     They are displayed as "Deposit" / "Withdrawal". */
  const i18n = {
    en: {
      title: "PayDay",
      description: "Track your monthly income, deposits and expenses with precision.",
      newTransaction: "New Transaction",
      txnType: "Transaction Type",
      deposit: "Deposit (Income)",
      withdrawal: "Withdrawal (Expense)",
      amount: "Amount (DZD)",
      date: "Transaction Date",
      memo: "Description (optional)",
      memoPlaceholder: "e.g. Electricity bill payment",
      submit: "Post Transaction",
      ledgerTitle: "Transaction Ledger",
      colType: "Transaction Type",
      colAmount: "Amount",
      colDate: "Date",
      colMemo: "Description",
      colBalance: "Available Balance",
      empty: "No transactions recorded yet. Post your first transaction above.",
      exportJson: "Export Ledger (JSON)",
      importJson: "Import Ledger (JSON)",
      footerPrefix: "Developed with love",
      footerBy: "by",
      author: "Haitham Aouati",
      depositLabel: "Deposit",
      withdrawalLabel: "Withdrawal",
      currency: "DZD",
      confirmDelete: "Delete this transaction? This action cannot be undone.",
      importOk: "Ledger imported successfully.",
      importErr: "Import failed: the selected file is not a valid JSON ledger.",
      invalidAmount: "Please enter a valid amount greater than zero.",
      rowHintEdit: "Click to view transaction details and edit",
      rowHintView: "Click to view transaction details",
      saveChanges: "Save changes",
      cancel: "Discard changes",
      del: "Delete transaction",
      newQuote: "New quote",
      quoteLoading: "Loading…",
      readOnly: "Read-Only Mode",
      detailsTitle: "Transaction Details",
      closeDetails: "Close details",
      openingBalance: "Opening Balance",
      txnAmount: "Transaction Amount",
      closingBalance: "Closing Balance"
    },
    ar: {
      title: "يوم الراتب",
      description: "تتبّع دخلك الشهري وإيداعاتك ومصروفاتك بدقة.",
      newTransaction: "معاملة جديدة",
      txnType: "نوع المعاملة",
      deposit: "إيداع (دخل)",
      withdrawal: "سحب (مصروف)",
      amount: "المبلغ (دج)",
      date: "تاريخ المعاملة",
      memo: "البيان (اختياري)",
      memoPlaceholder: "مثال: سداد فاتورة الكهرباء",
      submit: "تسجيل المعاملة",
      ledgerTitle: "سجل المعاملات",
      colType: "نوع المعاملة",
      colAmount: "المبلغ",
      colDate: "التاريخ",
      colMemo: "البيان",
      colBalance: "الرصيد المتاح",
      empty: "لا توجد معاملات مسجّلة بعد. سجّل أول معاملة من الأعلى.",
      exportJson: "تصدير السجل (JSON)",
      importJson: "استيراد السجل (JSON)",
      footerPrefix: "طُوِّر بكل حب",
      footerBy: "بواسطة",
      author: "هيثم عواطي",
      depositLabel: "إيداع",
      withdrawalLabel: "سحب",
      currency: "دج",
      confirmDelete: "هل تريد حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.",
      importOk: "تم استيراد السجل بنجاح.",
      importErr: "فشل الاستيراد: الملف المحدد ليس سجلًا بصيغة JSON صالحة.",
      invalidAmount: "الرجاء إدخال مبلغ صحيح أكبر من الصفر.",
      rowHintEdit: "انقر لعرض تفاصيل المعاملة وتعديلها",
      rowHintView: "انقر لعرض تفاصيل المعاملة",
      saveChanges: "حفظ التعديلات",
      cancel: "تجاهل التعديلات",
      del: "حذف المعاملة",
      newQuote: "اقتباس جديد",
      quoteLoading: "جارٍ التحميل…",
      readOnly: "وضع القراءة فقط",
      detailsTitle: "تفاصيل المعاملة",
      closeDetails: "إغلاق التفاصيل",
      openingBalance: "رصيد الافتتاح",
      txnAmount: "مبلغ المعاملة",
      closingBalance: "رصيد الإغلاق"
    }
  };

  /* ---------- State ---------- */
  let lang = localStorage.getItem(LANG_KEY) === "ar" ? "ar" : "en";
  let theme = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  let records = loadRecords();
  let editingId = null;
  let selectedId = null;                       // row shown in the details card
  let readOnly = localStorage.getItem(READONLY_KEY) === "1";

  let quotes = { en: [], ar: [] };
  let lastQuoteIndex = { en: -1, ar: -1 };
  let quotesReady = false;
  let quoteTimer = null;

  /* ---------- Elements ---------- */
  const $ = (id) => document.getElementById(id);
  const form = $("actionForm");
  const typeEl = $("type");
  const amountEl = $("amount");
  const dateEl = $("date");
  const noteEl = $("note");
  const tbody = $("tableBody");
  const tableWrap = $("tableWrap");
  const emptyMsg = $("emptyMsg");
  const datetimeEl = $("datetime");
  const langBtn = $("langToggle");
  const themeBtn = $("themeToggle");
  const importBtn = $("importBtn");
  const importFile = $("importFile");
  const readOnlyToggle = $("readOnlyToggle");
  const detailsCard = $("detailsCard");
  const detailsList = $("detailsList");
  const detailsClose = $("detailsClose");
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

  function typeBadge(isDeposit) {
    return isDeposit
      ? `<span class="badge green"><i class="fa-solid fa-arrow-down"></i> ${t("depositLabel")}</span>`
      : `<span class="badge red"><i class="fa-solid fa-arrow-up"></i> ${t("withdrawalLabel")}</span>`;
  }

  /* ---------- Version ---------- */
  function renderVersion() {
    // Strict display format: "Version: MAJOR.MINOR.PATCH"
    const semver = /^\d+\.\d+\.\d+$/;
    versionEl.textContent = "Version: " + (semver.test(APP_VERSION) ? APP_VERSION : "0.0.0");
  }

  /* ---------- Quotes (bilingual) ---------- */
  function isValidQuote(q) {
    return q && typeof q.quote === "string" && q.quote.trim() &&
           typeof q.author === "string" && q.author.trim();
  }

  async function loadQuotes() {
    let data = null;
    try {
      const res = await fetch(QUOTES_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      data = await res.json();
    } catch (err) {
      console.warn("PayDay: could not load quotes.json, using fallback quotes.", err);
    }

    // Expected shape: { "en": [ {quote, author}, ... ], "ar": [ ... ] }
    ["en", "ar"].forEach((code) => {
      const list = data && Array.isArray(data[code]) ? data[code].filter(isValidQuote) : [];
      quotes[code] = list.length ? list : FALLBACK_QUOTES[code];
    });

    quotesReady = true;
    showQuote(false);
  }

  // Always picks from the CURRENT app language, never repeating the last one shown
  function pickQuote() {
    const list = quotes[lang] || [];
    if (!list.length) return null;
    if (list.length === 1) return list[0];
    let i;
    do {
      i = Math.floor(Math.random() * list.length);
    } while (i === lastQuoteIndex[lang]);
    lastQuoteIndex[lang] = i;
    return list[i];
  }

  function renderQuote(q) {
    quoteTextEl.lang = lang;
    quoteAuthorEl.lang = lang;
    quoteTextEl.textContent = q.quote;       // textContent: safe from injected HTML
    quoteAuthorEl.textContent = "— " + q.author;
  }

  function showQuote(animate) {
    if (!quotesReady) return;
    clearTimeout(quoteTimer);

    if (!animate) {
      const q = pickQuote();
      if (q) renderQuote(q);
      return;
    }

    quoteRefreshBtn.disabled = true;
    quoteRefreshBtn.classList.add("spinning");
    quoteBody.classList.add("is-fading");

    quoteTimer = setTimeout(() => {
      const q = pickQuote();                 // picked after the fade, so it matches the latest language
      if (q) renderQuote(q);
      quoteBody.classList.remove("is-fading");
      quoteRefreshBtn.disabled = false;
      quoteRefreshBtn.classList.remove("spinning");
    }, 250);
  }

  quoteRefreshBtn.addEventListener("click", () => showQuote(true));

  /* ---------- Data helpers ---------- */
  function sortedRecords() {
    // Chronological: by date, then by creation order (id)
    return [...records].sort((a, b) =>
      a.date === b.date ? a.id - b.id : a.date.localeCompare(b.date)
    );
  }

  // Opening / closing balance for one transaction, based on chronological order
  function getDetailsData(id) {
    let balance = 0;
    for (const r of sortedRecords()) {
      const opening = balance;
      balance += r.type === "save" ? r.amount : -r.amount;
      if (r.id === id) return { r, opening, closing: balance };
    }
    return null;
  }

  /* ---------- Rendering ---------- */
  function viewRowHTML(r, balance) {
    const isDeposit = r.type === "save";
    const hint = readOnly ? t("rowHintView") : t("rowHintEdit");

    return `
      <tr class="row${r.id === selectedId ? " selected" : ""}" data-id="${r.id}" tabindex="0" title="${esc(hint)}">
        <td>${typeBadge(isDeposit)}</td>
        <td class="num ${isDeposit ? "green" : "red"}">${formatMoney(r.amount)}</td>
        <td>${formatDate(r.date)}</td>
        <td class="note-cell">${r.note ? esc(r.note) : "—"}</td>
        <td class="num yellow">${formatMoney(balance)}</td>
        <td class="row-actions">
          <button class="act-btn del-btn" data-id="${r.id}" aria-label="${esc(t("del"))}" title="${esc(t("del"))}" ${readOnly ? "disabled" : ""}>
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
            <option value="save" ${r.type === "save" ? "selected" : ""}>${t("deposit")}</option>
            <option value="withdraw" ${r.type === "withdraw" ? "selected" : ""}>${t("withdrawal")}</option>
          </select>
        </td>
        <td><input type="number" class="edit-amount" min="0.01" step="0.01" value="${r.amount}"></td>
        <td><input type="date" class="edit-date" value="${esc(r.date)}"></td>
        <td><input type="text" class="edit-note" value="${esc(r.note || "")}" placeholder="${esc(t("memoPlaceholder"))}"></td>
        <td class="num yellow">${formatMoney(balance)}</td>
        <td class="row-actions">
          <button class="act-btn save-btn" aria-label="${esc(t("saveChanges"))}" title="${esc(t("saveChanges"))}"><i class="fa-solid fa-check"></i></button>
          <button class="act-btn cancel-btn" aria-label="${esc(t("cancel"))}" title="${esc(t("cancel"))}"><i class="fa-solid fa-xmark"></i></button>
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
    renderDetails();
  }

  function renderDetails() {
    const data = selectedId != null ? getDetailsData(selectedId) : null;

    if (!data) {
      selectedId = null;
      detailsCard.hidden = true;
      detailsList.innerHTML = "";
      return;
    }

    const { r, opening, closing } = data;
    const isDeposit = r.type === "save";

    detailsList.innerHTML = `
      <div class="d-row">
        <span class="d-label"><i class="fa-solid fa-clock-rotate-left"></i>${t("openingBalance")}</span>
        <span class="d-value yellow">${formatMoney(opening)}</span>
      </div>
      <div class="d-row">
        <span class="d-label"><i class="fa-solid fa-right-left"></i>${t("colType")}</span>
        <span class="d-value">${typeBadge(isDeposit)}</span>
      </div>
      <div class="d-row">
        <span class="d-label"><i class="fa-solid fa-coins"></i>${t("txnAmount")}</span>
        <span class="d-value ${isDeposit ? "green" : "red"}">${formatMoney(r.amount)}</span>
      </div>
      <div class="d-row">
        <span class="d-label"><i class="fa-solid fa-calendar-days"></i>${t("date")}</span>
        <span class="d-value plain">${formatDate(r.date)}</span>
      </div>
      <div class="d-row">
        <span class="d-label"><i class="fa-solid fa-file-lines"></i>${t("colMemo")}</span>
        <span class="d-value plain">${r.note ? esc(r.note) : "—"}</span>
      </div>
      <div class="d-row closing">
        <span class="d-label"><i class="fa-solid fa-scale-balanced"></i>${t("closingBalance")}</span>
        <span class="d-value yellow">${formatMoney(closing)}</span>
      </div>`;

    detailsCard.hidden = false;
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
    detailsClose.setAttribute("aria-label", t("closeDetails"));
    detailsClose.title = t("closeDetails");
    if (!quotesReady) quoteTextEl.textContent = t("quoteLoading");

    langBtn.textContent = lang === "ar" ? "EN" : "AR";
    renderTable();      // also re-renders the details card in the new language
    renderDateTime();
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme);
    themeBtn.innerHTML = theme === "dark"
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }

  function applyReadOnly() {
    readOnlyToggle.checked = readOnly;
    tableWrap.classList.toggle("is-readonly", readOnly);
    importBtn.disabled = readOnly;     // importing replaces the whole ledger, so it is locked too
  }

  /* ---------- Row selection & inline editing ---------- */
  // Clicking a row always shows its details; outside read-only mode it also opens the editor
  function openRow(id, viaKeyboard) {
    selectedId = id;
    editingId = readOnly ? null : id;
    renderTable();

    if (!readOnly) {
      const input = tbody.querySelector("tr.editing .edit-amount");
      if (input) { input.focus(); input.select(); }
    } else {
      if (viaKeyboard) {
        const row = tbody.querySelector(`tr.row[data-id="${id}"]`);
        if (row) row.focus();
      }
      detailsCard.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
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
    renderTable();       // details card refreshes with the updated values
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
      if (readOnly) return;
      if (!confirm(t("confirmDelete"))) return;
      const id = Number(del.dataset.id);
      records = records.filter((r) => r.id !== id);
      if (editingId === id) editingId = null;
      if (selectedId === id) selectedId = null;
      persist();
      renderTable();
      return;
    }

    // Save / cancel inside the edit row
    if (e.target.closest(".save-btn")) { saveEdit(); return; }
    if (e.target.closest(".cancel-btn")) { cancelEdit(); return; }

    // Click on a normal row: show details (and edit, unless read-only)
    const row = e.target.closest("tr.row");
    if (row) openRow(Number(row.dataset.id), false);
  });

  tbody.addEventListener("keydown", (e) => {
    const inEdit = e.target.closest("tr.editing");
    if (inEdit) {
      if (e.key === "Enter") { e.preventDefault(); saveEdit(); }
      else if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
      return;
    }
    // Keyboard access: Enter on a focused row opens it
    if (e.key === "Enter" && e.target.matches("tr.row")) {
      openRow(Number(e.target.dataset.id), true);
    }
  });

  detailsClose.addEventListener("click", () => {
    selectedId = null;
    renderTable();
  });

  readOnlyToggle.addEventListener("change", () => {
    readOnly = readOnlyToggle.checked;
    localStorage.setItem(READONLY_KEY, readOnly ? "1" : "0");
    if (readOnly) editingId = null;      // discard any open editor
    applyReadOnly();
    renderTable();
  });

  langBtn.addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem(LANG_KEY, lang);
    applyLanguage();
    showQuote(true);                     // new quote in the newly selected language
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
  importBtn.addEventListener("click", () => {
    if (!readOnly) importFile.click();
  });

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
        selectedId = null;
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
      const goesDown = i % 2 === 0; // green falls (incoming), red rises (outgoing)
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
  applyReadOnly();
  applyLanguage();
  initBackground();
  loadQuotes();
  setInterval(renderDateTime, 1000);
})();