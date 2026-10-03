(() => {
  "use strict";

  /* ---------- Versioning (Semantic Versioning: MAJOR.MINOR.PATCH) ----------
     MAJOR: breaking changes (e.g. data format changes that need migration)
     MINOR: new features that are backwards compatible
     PATCH: backwards-compatible fixes and polish (e.g. wording, styling)
     Update only this constant; the footer renders it automatically. */
  const APP_VERSION = "1.2.0";

  const STORAGE_KEY = "payday_records";
  const LANG_KEY = "payday_lang";
  const THEME_KEY = "payday_theme";
  const READONLY_KEY = "payday_readonly";
  const TAB_KEY = "payday_tab";
  const SHOP_BUDGET_KEY = "payday_shop_budget";
  const SHOP_ITEMS_KEY = "payday_shop_items";
  const DEBTS_KEY = "payday_debts";
  const DEBT_BUDGET_KEY = "payday_debt_budget";
  const QUOTES_URL = "quotes.json";

  const TABS = ["ledger", "shopping", "debts", "analytics"];

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
     Note: ledger record types remain "save" / "withdraw" internally so
     existing localStorage data and backups stay compatible.
     They are displayed as "Deposit" / "Withdrawal". */
  const i18n = {
    en: {
      title: "PayDay",
      description: "Track your monthly income, deposits and expenses with precision.",

      // Tabs
      tabsLabel: "Application sections",
      tabLedger: "Salary Ledger",
      tabShopping: "Shopping Budget",
      tabDebts: "Debt Tracker",
      tabAnalytics: "Analytics",

      // Salary ledger
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
      depositLabel: "Deposit",
      withdrawalLabel: "Withdrawal",
      confirmDelete: "Delete this transaction? This action cannot be undone.",
      invalidAmount: "Please enter a valid amount greater than zero.",
      rowHintEdit: "Click to view transaction details and edit",
      rowHintView: "Click to view transaction details",
      saveChanges: "Save changes",
      cancel: "Discard changes",
      del: "Delete transaction",
      readOnly: "Read-Only Mode",
      detailsTitle: "Transaction Details",
      closeDetails: "Close details",
      openingBalance: "Opening Balance",
      txnAmount: "Transaction Amount",
      closingBalance: "Closing Balance",

      // Shopping budget
      shopBudgetTitle: "Purchase Budget",
      shopBudgetLabel: "Allocated Budget (DZD)",
      statSpent: "Total Expenditure",
      statRemaining: "Remaining Allowance",
      statPending: "Pending Estimates",
      shopFormTitle: "New Purchase Item",
      shopItem: "Item Description",
      shopItemPlaceholder: "e.g. Monthly groceries",
      shopCost: "Estimated Cost (DZD)",
      shopDate: "Purchase Date",
      shopAdd: "Add Item",
      shopListTitle: "Shopping List",
      shopEmpty: "No purchase items yet. Add your first item above.",
      purchased: "Purchased",
      pending: "Pending",
      markPurchased: "Mark as purchased",
      markPending: "Mark as pending",
      deleteItem: "Delete item",
      confirmDeleteItem: "Delete this item from the shopping list?",
      invalidItem: "Please enter an item description.",
      budgetUsed: "{n}% of budget used",
      budgetNone: "No budget set",
      budgetOk: "Within budget",
      budgetOver: "Over budget",

      // Debt tracker
      debtOverviewTitle: "Debt Overview",
      debtBudgetLabel: "Debt Repayment Budget (DZD)",
      statDebtTotal: "Total Outstanding Debt",
      statDebtAllocated: "Allocated Repayment Amount",
      statDebtRemaining: "Remaining Debt Post-Allocation",
      statDebtSettled: "Settled Amount",
      debtFormTitle: "New Liability",
      debtCreditor: "Creditor Name",
      debtCreditorPlaceholder: "e.g. Ahmed B.",
      debtAmount: "Principal Amount (DZD)",
      debtDate: "Due/Settlement Date",
      debtAdd: "Record Liability",
      debtListTitle: "Debt & Liabilities",
      debtEmpty: "No liabilities recorded. Your debt register is clear.",
      settled: "Settled",
      unsettled: "Unsettled",
      markSettled: "Mark as settled",
      markUnsettled: "Mark as unsettled",
      deleteDebt: "Delete liability",
      confirmDeleteDebt: "Delete this liability record? This action cannot be undone.",
      invalidCreditor: "Please enter the creditor name.",
      debtCoverage: "Allocation covers {n}% of outstanding debt",
      debtStatusNone: "No liabilities",
      debtStatusClear: "Fully settled",
      debtFunded: "Fully funded",
      debtPartial: "Partially funded",
      debtUnfunded: "Not funded",

      // Analytics
      analyticsTitle: "Financial Insights & Analytics",
      analyticsIntro: "Live statistics from your Salary Ledger, Shopping Budget and Debt Tracker.",
      statIncome: "Total Income",
      statExpenses: "Total Expenses",
      statNet: "Net Cash Flow",
      statEfficiency: "Net Cash Flow Efficiency",
      cashFlowTitle: "Cash Flow Ratio",
      cashFlowSub: "Salary Ledger statistics",
      incomeLabel: "Income (Deposits)",
      expenseLabel: "Expenses (Withdrawals)",
      netEfficiency: "Net Efficiency",
      attrTitle: "Expense Attribution Analysis",
      attrSub: "Withdrawals cross-referenced with the Shopping Budget and Debt Tracker",
      allocTitle: "Fund Allocation Breakdown",
      catShopping: "Shopping Budget",
      catDebt: "Debt Settlement",
      catGeneral: "Uncategorized / General",
      attributed: "Attributed",
      linkedCount: "{a} of {b} withdrawals linked to a shopping item or liability",
      detailsAttrTitle: "Attribution Details",
      linkedTo: "Linked to",
      noMemo: "No description",
      attrEmpty: "No withdrawals recorded yet.",
      noData: "No data",
      countLabel: "Transactions: {n}",

      // Master backup
      backupTitle: "Master Data Backup",
      backupDesc: "Export or restore all modules (ledger, shopping, debts and settings) in a single JSON file.",
      exportJson: "Export Master Backup (JSON)",
      importJson: "Import Master Backup (JSON)",
      confirmImport: "Restoring this backup will replace the current data in all modules. Continue?",
      importOk: "Master backup restored successfully.",
      importErr: "Import failed: the selected file is not a valid PayDay master backup.",
      importLocked: "Disable Read-Only Mode to import data",

      // Shared
      currency: "DZD",
      newQuote: "New quote",
      quoteLoading: "Loading…",
      footerPrefix: "Developed with love",
      footerBy: "by",
      author: "Haitham Aouati"
    },
    ar: {
      title: "يوم الراتب",
      description: "تتبّع دخلك الشهري وإيداعاتك ومصروفاتك بدقة.",

      // Tabs
      tabsLabel: "أقسام التطبيق",
      tabLedger: "سجل الراتب",
      tabShopping: "ميزانية التسوق",
      tabDebts: "سجل الديون",
      tabAnalytics: "الإحصائيات",

      // Salary ledger
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
      depositLabel: "إيداع",
      withdrawalLabel: "سحب",
      confirmDelete: "هل تريد حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.",
      invalidAmount: "الرجاء إدخال مبلغ صحيح أكبر من الصفر.",
      rowHintEdit: "انقر لعرض تفاصيل المعاملة وتعديلها",
      rowHintView: "انقر لعرض تفاصيل المعاملة",
      saveChanges: "حفظ التعديلات",
      cancel: "تجاهل التعديلات",
      del: "حذف المعاملة",
      readOnly: "وضع القراءة فقط",
      detailsTitle: "تفاصيل المعاملة",
      closeDetails: "إغلاق التفاصيل",
      openingBalance: "رصيد الافتتاح",
      txnAmount: "مبلغ المعاملة",
      closingBalance: "رصيد الإغلاق",

      // Shopping budget
      shopBudgetTitle: "ميزانية التسوق",
      shopBudgetLabel: "الميزانية المخصصة للتسوق (دج)",
      statSpent: "إجمالي المشتريات",
      statRemaining: "المتبقي من الميزانية",
      statPending: "التكاليف المقدرة المعلّقة",
      shopFormTitle: "سلعة جديدة",
      shopItem: "بيان السلعة",
      shopItemPlaceholder: "مثال: مواد غذائية شهرية",
      shopCost: "التكلفة المقدرة (دج)",
      shopDate: "تاريخ الشراء",
      shopAdd: "إضافة سلعة",
      shopListTitle: "قائمة المشتريات",
      shopEmpty: "لا توجد سلع بعد. أضف أول سلعة من الأعلى.",
      purchased: "تم الشراء",
      pending: "قيد الشراء",
      markPurchased: "تحديد كمُشتراة",
      markPending: "إعادة إلى قيد الشراء",
      deleteItem: "حذف السلعة",
      confirmDeleteItem: "هل تريد حذف هذه السلعة من قائمة المشتريات؟",
      invalidItem: "الرجاء إدخال بيان السلعة.",
      budgetUsed: "تم استهلاك {n}% من الميزانية",
      budgetNone: "لم تُحدَّد ميزانية",
      budgetOk: "ضمن الميزانية",
      budgetOver: "تجاوز الميزانية",

      // Debt tracker
      debtOverviewTitle: "نظرة عامة على الديون",
      debtBudgetLabel: "الميزانية المخصصة لسداد الديون (دج)",
      statDebtTotal: "إجمالي المديونية",
      statDebtAllocated: "المبلغ المخصص/المسدد للديون",
      statDebtRemaining: "الرصيد المتبقي من الدين بعد التخصيص",
      statDebtSettled: "المبلغ المسدَّد",
      debtFormTitle: "التزام جديد",
      debtCreditor: "اسم الدائن",
      debtCreditorPlaceholder: "مثال: أحمد ب.",
      debtAmount: "قيمة الدين (دج)",
      debtDate: "تاريخ الاستحقاق/السداد",
      debtAdd: "تسجيل الالتزام",
      debtListTitle: "سجل الديون والالتزامات",
      debtEmpty: "لا توجد التزامات مسجّلة. سجل الديون فارغ.",
      settled: "مسدَّد",
      unsettled: "غير مسدَّد",
      markSettled: "تحديد كمسدَّد",
      markUnsettled: "إعادة إلى غير مسدَّد",
      deleteDebt: "حذف الالتزام",
      confirmDeleteDebt: "هل تريد حذف سجل هذا الالتزام؟ لا يمكن التراجع عن هذا الإجراء.",
      invalidCreditor: "الرجاء إدخال اسم الدائن.",
      debtCoverage: "التخصيص يغطي {n}% من الدين القائم",
      debtStatusNone: "لا توجد التزامات",
      debtStatusClear: "مسدَّدة بالكامل",
      debtFunded: "ممولة بالكامل",
      debtPartial: "ممولة جزئيًا",
      debtUnfunded: "غير ممولة",

      // Analytics
      analyticsTitle: "قسم الإحصائيات والمخططات البيانية",
      analyticsIntro: "إحصائيات مباشرة من سجل الراتب وميزانية التسوق وسجل الديون.",
      statIncome: "إجمالي الدخل",
      statExpenses: "إجمالي المصروفات",
      statNet: "صافي التدفق النقدي",
      statEfficiency: "كفاءة صافي التدفق النقدي",
      cashFlowTitle: "نسبة التدفق النقدي",
      cashFlowSub: "إحصائيات كشف الراتب",
      incomeLabel: "الدخل (الإيداعات)",
      expenseLabel: "المصروفات (السحوبات)",
      netEfficiency: "كفاءة الصافي",
      attrTitle: "تحليل توزيع المصروفات",
      attrSub: "ربط وإحصاء السحوبات بميزانية التسوق والديون",
      allocTitle: "مخطط تخصيص الأموال",
      catShopping: "ميزانية التسوق",
      catDebt: "سداد الديون",
      catGeneral: "مصروفات عامة غير مصنفة",
      attributed: "المُسنَد",
      linkedCount: "تم ربط {a} من أصل {b} سحب بسلعة أو التزام",
      detailsAttrTitle: "تفاصيل التوزيع",
      linkedTo: "مرتبط بـ",
      noMemo: "بدون بيان",
      attrEmpty: "لا توجد سحوبات مسجّلة بعد.",
      noData: "لا توجد بيانات",
      countLabel: "عدد المعاملات: {n}",

      // Master backup
      backupTitle: "نسخ احتياطي شامل للبيانات",
      backupDesc: "صدّر أو استعد بيانات جميع الأقسام (سجل الراتب، المشتريات، الديون والإعدادات) في ملف JSON واحد.",
      exportJson: "تصدير النسخة الاحتياطية (JSON)",
      importJson: "استيراد النسخة الاحتياطية (JSON)",
      confirmImport: "ستؤدي استعادة هذه النسخة إلى استبدال البيانات الحالية في جميع الأقسام. هل تريد المتابعة؟",
      importOk: "تمت استعادة النسخة الاحتياطية الشاملة بنجاح.",
      importErr: "فشل الاستيراد: الملف المحدد ليس نسخة احتياطية صالحة لتطبيق PayDay.",
      importLocked: "عطّل وضع القراءة فقط لاستيراد البيانات",

      // Shared
      currency: "دج",
      newQuote: "اقتباس جديد",
      quoteLoading: "جارٍ التحميل…",
      footerPrefix: "طُوِّر بكل حب",
      footerBy: "بواسطة",
      author: "هيثم أواتي"
    }
  };

  /* ---------- Storage helpers & normalizers ---------- */
  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const round2 = (n) => Math.round(n * 100) / 100;
  const cleanMoney = (v) => { const n = Number(v); return isFinite(n) && n > 0 ? round2(n) : 0; };

  let seq = 0;
  const uid = () => Date.now() * 1000 + (seq++ % 1000);

  // Gives every record a unique numeric id, keeping the incoming one when valid
  function withIds(list) {
    const used = new Set();
    return list.map((x) => {
      let id = Number(x.id);
      if (!isFinite(id) || used.has(id)) id = uid();
      used.add(id);
      return { ...x, id };
    });
  }

  function normalizeLedger(list) {
    if (!Array.isArray(list)) return [];
    const typeMap = { save: "save", deposit: "save", income: "save",
                      withdraw: "withdraw", withdrawal: "withdraw", expense: "withdraw" };
    return withIds(list
      .filter((r) => r && typeMap[String(r.type).toLowerCase()] &&
        isFinite(Number(r.amount)) && Number(r.amount) > 0 && ISO_DATE.test(r.date))
      .map((r) => ({
        id: r.id,
        type: typeMap[String(r.type).toLowerCase()],
        amount: Number(r.amount),
        date: r.date,
        note: typeof r.note === "string" ? r.note : ""
      })));
  }

  function normalizeShop(list) {
    if (!Array.isArray(list)) return [];
    return withIds(list
      .filter((x) => x && typeof x.name === "string" && x.name.trim() &&
        isFinite(Number(x.cost)) && Number(x.cost) > 0 && ISO_DATE.test(x.date))
      .map((x) => ({ id: x.id, name: x.name.trim(), cost: Number(x.cost), date: x.date, done: !!x.done })));
  }

  function normalizeDebts(list) {
    if (!Array.isArray(list)) return [];
    return withIds(list
      .filter((x) => x && typeof x.creditor === "string" && x.creditor.trim() &&
        isFinite(Number(x.amount)) && Number(x.amount) > 0 && ISO_DATE.test(x.date))
      .map((x) => ({ id: x.id, creditor: x.creditor.trim(), amount: Number(x.amount), date: x.date, settled: !!x.settled })));
  }

  /* ---------- State ---------- */
  let lang = localStorage.getItem(LANG_KEY) === "ar" ? "ar" : "en";
  let theme = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  let activeTab = TABS.includes(localStorage.getItem(TAB_KEY)) ? localStorage.getItem(TAB_KEY) : "ledger";

  // Salary ledger
  let records = normalizeLedger(readJSON(STORAGE_KEY));
  let editingId = null;
  let selectedId = null;                       // row shown in the details card
  let readOnly = localStorage.getItem(READONLY_KEY) === "1";

  // Shopping budget
  let shopBudget = cleanMoney(localStorage.getItem(SHOP_BUDGET_KEY));
  let shopItems = normalizeShop(readJSON(SHOP_ITEMS_KEY));

  // Debt tracker
  let debtBudget = cleanMoney(localStorage.getItem(DEBT_BUDGET_KEY));
  let debts = normalizeDebts(readJSON(DEBTS_KEY));

  // Quotes
  let quotes = { en: [], ar: [] };
  let lastQuoteIndex = { en: -1, ar: -1 };
  let quotesReady = false;
  let quoteTimer = null;

  /* ---------- Elements ---------- */
  const $ = (id) => document.getElementById(id);

  // Shared / header
  const datetimeEl = $("datetime");
  const langBtn = $("langToggle");
  const themeBtn = $("themeToggle");
  const versionEl = $("appVersion");
  const quoteBody = $("quoteBody");
  const quoteTextEl = $("quoteText");
  const quoteAuthorEl = $("quoteAuthor");
  const quoteRefreshBtn = $("quoteRefresh");

  // Tabs
  const tabsEl = $("tabs");
  const tabBtns = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));

  // Ledger
  const form = $("actionForm");
  const typeEl = $("type");
  const amountEl = $("amount");
  const dateEl = $("date");
  const noteEl = $("note");
  const tbody = $("tableBody");
  const tableWrap = $("tableWrap");
  const emptyMsg = $("emptyMsg");
  const readOnlyToggle = $("readOnlyToggle");
  const detailsCard = $("detailsCard");
  const detailsList = $("detailsList");
  const detailsClose = $("detailsClose");

  // Shopping
  const shopForm = $("shopForm");
  const shopBudgetEl = $("shopBudget");
  const shopNameEl = $("shopName");
  const shopCostEl = $("shopCost");
  const shopDateEl = $("shopDate");
  const shopList = $("shopList");
  const shopEmpty = $("shopEmpty");
  const shopSpentEl = $("shopSpent");
  const shopRemainingEl = $("shopRemaining");
  const shopPendingEl = $("shopPending");
  const shopBar = $("shopBar");
  const shopUsedEl = $("shopUsed");
  const shopStatusEl = $("shopStatus");

  // Debts
  const debtForm = $("debtForm");
  const debtBudgetEl = $("debtBudget");
  const debtCreditorEl = $("debtCreditor");
  const debtAmountEl = $("debtAmount");
  const debtDateEl = $("debtDate");
  const debtList = $("debtList");
  const debtEmpty = $("debtEmpty");
  const debtTotalEl = $("debtTotal");
  const debtAllocatedEl = $("debtAllocated");
  const debtRemainingEl = $("debtRemaining");
  const debtSettledEl = $("debtSettled");
  const debtBar = $("debtBar");
  const debtPctEl = $("debtPct");
  const debtStatusEl = $("debtStatus");

  // Analytics
  const anIncomeEl = $("anIncome");
  const anExpensesEl = $("anExpenses");
  const anNetEl = $("anNet");
  const anEfficiencyEl = $("anEfficiency");
  const cashFlowChart = $("cashFlowChart");
  const attrChart = $("attrChart");
  const attrSummary = $("attrSummary");
  const attrList = $("attrList");
  const attrEmpty = $("attrEmpty");

  // Backup
  const exportBtn = $("exportBtn");
  const importBtn = $("importBtn");
  const importFile = $("importFile");

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

  function fmtPct(n) {
    return new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(n) + "%";
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

  function pill(cls, icon, text) {
    return `<span class="pill ${cls}"><i class="fa-solid ${icon}"></i>${text}</span>`;
  }

  /* ---------- Version ---------- */
  function renderVersion() {
    // Strict display format: "Version: MAJOR.MINOR.PATCH"
    const semver = /^\d+\.\d+\.\d+$/;
    versionEl.textContent = "Version: " + (semver.test(APP_VERSION) ? APP_VERSION : "0.0.0");
  }

  /* ---------- Tabs ---------- */
  function setTab(name, focusTab) {
    if (!TABS.includes(name)) name = "ledger";
    activeTab = name;
    localStorage.setItem(TAB_KEY, name);

    tabBtns.forEach((btn) => {
      const on = btn.dataset.tab === name;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
      if (on && focusTab) btn.focus();
    });
    panels.forEach((p) => { p.hidden = p.dataset.panel !== name; });

    renderAnalytics();     // charts are only drawn while their tab is visible
  }

  tabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (btn) setTab(btn.dataset.tab, false);
  });

  // Keyboard navigation (arrow keys follow the visual order, so they flip in RTL)
  tabsEl.addEventListener("keydown", (e) => {
    const idx = TABS.indexOf(activeTab);
    const rtl = document.documentElement.dir === "rtl";
    let next = null;

    if (e.key === "ArrowRight") next = idx + (rtl ? -1 : 1);
    else if (e.key === "ArrowLeft") next = idx + (rtl ? 1 : -1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;

    e.preventDefault();
    setTab(TABS[(next + TABS.length) % TABS.length], true);
  });

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

  /* =====================================================================
     SALARY LEDGER
     ===================================================================== */
  function persist() {
    writeJSON(STORAGE_KEY, records);
  }

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
      rec.amount = round2(amount);
      rec.date = row.querySelector(".edit-date").value || rec.date;
      rec.note = row.querySelector(".edit-note").value.trim();
      persist();
    }
    editingId = null;
    renderTable();       // details card refreshes with the updated values
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = parseFloat(amountEl.value);
    if (!isFinite(amount) || amount <= 0) {
      alert(t("invalidAmount"));
      return;
    }
    records.push({
      id: uid(),
      type: typeEl.value,
      amount: round2(amount),
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

  function applyReadOnly() {
    readOnlyToggle.checked = readOnly;
    tableWrap.classList.toggle("is-readonly", readOnly);
    importBtn.disabled = readOnly;       // importing replaces all data, so it is locked too
    importBtn.title = readOnly ? t("importLocked") : "";
  }

  /* =====================================================================
     SHARED ENTRY RENDERER (shopping items + debts)
     ===================================================================== */
  function entryHTML(o) {
    return `
      <li class="entry${o.done ? " done" : ""}">
        <button type="button" class="toggle-btn" data-action="toggle" data-id="${o.id}"
          aria-pressed="${o.done ? "true" : "false"}"
          aria-label="${esc(o.toggleLabel)}" title="${esc(o.toggleLabel)}">
          <i class="fa-solid fa-check"></i>
        </button>
        <div class="entry-main">
          <span class="entry-title">${esc(o.title)}</span>
          <span class="entry-meta">
            <span class="meta-date"><i class="fa-regular fa-calendar"></i>${formatDate(o.date)}</span>
            ${o.badge}
          </span>
        </div>
        <span class="entry-amount ${o.amountClass}">${formatMoney(o.amount)}</span>
        <button type="button" class="act-btn del-btn" data-action="delete" data-id="${o.id}"
          aria-label="${esc(o.deleteLabel)}" title="${esc(o.deleteLabel)}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </li>`;
  }

  /* =====================================================================
     SHOPPING BUDGET
     ===================================================================== */
  function persistShop() {
    writeJSON(SHOP_ITEMS_KEY, shopItems);
  }

  function renderShopping() {
    const spent = round2(shopItems.reduce((s, x) => x.done ? s + x.cost : s, 0));
    const pending = round2(shopItems.reduce((s, x) => x.done ? s : s + x.cost, 0));
    const hasBudget = shopBudget > 0;
    const remaining = round2(shopBudget - spent);
    const pct = hasBudget ? Math.round((spent / shopBudget) * 100) : 0;

    // Summary cards
    shopSpentEl.textContent = formatMoney(spent);
    shopPendingEl.textContent = formatMoney(pending);
    if (hasBudget) {
      shopRemainingEl.textContent = formatMoney(remaining);
      shopRemainingEl.className = "stat-value " + (remaining < 0 ? "red" : "yellow");
    } else {
      shopRemainingEl.textContent = "—";
      shopRemainingEl.className = "stat-value";
    }

    // Progress + status
    shopBar.style.width = Math.min(100, pct) + "%";
    shopBar.className = "progress-bar" + (pct > 100 ? " over" : pct >= 80 ? " warn" : "");
    shopUsedEl.textContent = hasBudget ? t("budgetUsed").replace("{n}", pct) : "";

    if (!hasBudget) {
      shopStatusEl.className = "pill";
      shopStatusEl.innerHTML = `<i class="fa-solid fa-circle-info"></i>${t("budgetNone")}`;
    } else if (remaining < 0) {
      shopStatusEl.className = "pill red";
      shopStatusEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i>${t("budgetOver")}`;
    } else {
      shopStatusEl.className = "pill green";
      shopStatusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i>${t("budgetOk")}`;
    }

    // List: pending items first, then purchased; each group by date
    const sorted = [...shopItems].sort((a, b) =>
      (Number(a.done) - Number(b.done)) || a.date.localeCompare(b.date) || (a.id - b.id));

    shopList.innerHTML = sorted.map((x) => entryHTML({
      id: x.id,
      title: x.name,
      date: x.date,
      amount: x.cost,
      done: x.done,
      amountClass: x.done ? "red" : "",
      badge: x.done
        ? pill("green", "fa-circle-check", t("purchased"))
        : pill("yellow", "fa-hourglass-half", t("pending")),
      toggleLabel: x.done ? t("markPending") : t("markPurchased"),
      deleteLabel: t("deleteItem")
    })).join("");

    shopEmpty.classList.toggle("hidden", sorted.length > 0);
  }

  shopBudgetEl.addEventListener("input", () => {
    shopBudget = cleanMoney(shopBudgetEl.value);
    localStorage.setItem(SHOP_BUDGET_KEY, String(shopBudget));
    renderShopping();                    // does not touch the input, so typing is never interrupted
  });

  shopForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = shopNameEl.value.trim();
    const cost = parseFloat(shopCostEl.value);

    if (!name) { alert(t("invalidItem")); shopNameEl.focus(); return; }
    if (!isFinite(cost) || cost <= 0) { alert(t("invalidAmount")); shopCostEl.focus(); return; }

    shopItems.push({
      id: uid(),
      name,
      cost: round2(cost),
      date: shopDateEl.value || todayISO(),
      done: false
    });
    persistShop();
    renderShopping();

    shopNameEl.value = "";
    shopCostEl.value = "";
    shopNameEl.focus();
  });

  shopList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);

    if (btn.dataset.action === "toggle") {
      const item = shopItems.find((x) => x.id === id);
      if (item) { item.done = !item.done; persistShop(); renderShopping(); }
    } else if (btn.dataset.action === "delete") {
      if (!confirm(t("confirmDeleteItem"))) return;
      shopItems = shopItems.filter((x) => x.id !== id);
      persistShop();
      renderShopping();
    }
  });

  /* =====================================================================
     DEBT TRACKER
     Outstanding = liabilities not yet marked as settled.
     Repayment budget is money earmarked to pay the outstanding balance.
     Remaining post-allocation = max(0, outstanding - repayment budget).
     ===================================================================== */
  function persistDebts() {
    writeJSON(DEBTS_KEY, debts);
  }

  function renderDebts() {
    const total = round2(debts.reduce((s, x) => s + x.amount, 0));
    const settled = round2(debts.reduce((s, x) => x.settled ? s + x.amount : s, 0));
    const outstanding = round2(total - settled);
    const remaining = round2(Math.max(0, outstanding - debtBudget));
    const covered = Math.min(debtBudget, outstanding);
    const pct = outstanding > 0 ? Math.round((covered / outstanding) * 100) : 0;

    // Summary cards
    debtTotalEl.textContent = formatMoney(outstanding);
    debtAllocatedEl.textContent = formatMoney(debtBudget);
    debtRemainingEl.textContent = formatMoney(remaining);
    debtRemainingEl.className = "stat-value " + (remaining > 0 ? "yellow" : "green");
    debtSettledEl.textContent = formatMoney(settled);

    // Progress (share of the outstanding debt covered by the allocation) + status
    debtBar.style.width = pct + "%";
    debtBar.className = "progress-bar" + (pct > 0 && pct < 100 ? " warn" : "");
    debtPctEl.textContent = outstanding > 0 ? t("debtCoverage").replace("{n}", pct) : "";

    if (total === 0) {
      debtStatusEl.className = "pill";
      debtStatusEl.innerHTML = `<i class="fa-solid fa-circle-info"></i>${t("debtStatusNone")}`;
    } else if (outstanding === 0) {
      debtStatusEl.className = "pill green";
      debtStatusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i>${t("debtStatusClear")}`;
    } else if (pct >= 100) {
      debtStatusEl.className = "pill green";
      debtStatusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i>${t("debtFunded")}`;
    } else if (pct > 0) {
      debtStatusEl.className = "pill yellow";
      debtStatusEl.innerHTML = `<i class="fa-solid fa-circle-half-stroke"></i>${t("debtPartial")}`;
    } else {
      debtStatusEl.className = "pill red";
      debtStatusEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i>${t("debtUnfunded")}`;
    }

    // List: unsettled first, then settled; each group by date
    const sorted = [...debts].sort((a, b) =>
      (Number(a.settled) - Number(b.settled)) || a.date.localeCompare(b.date) || (a.id - b.id));

    debtList.innerHTML = sorted.map((x) => entryHTML({
      id: x.id,
      title: x.creditor,
      date: x.date,
      amount: x.amount,
      done: x.settled,
      amountClass: x.settled ? "green" : "red",
      badge: x.settled
        ? pill("green", "fa-circle-check", t("settled"))
        : pill("red", "fa-circle-exclamation", t("unsettled")),
      toggleLabel: x.settled ? t("markUnsettled") : t("markSettled"),
      deleteLabel: t("deleteDebt")
    })).join("");

    debtEmpty.classList.toggle("hidden", sorted.length > 0);
  }

  debtBudgetEl.addEventListener("input", () => {
    debtBudget = cleanMoney(debtBudgetEl.value);
    localStorage.setItem(DEBT_BUDGET_KEY, String(debtBudget));
    renderDebts();
  });

  debtForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const creditor = debtCreditorEl.value.trim();
    const amount = parseFloat(debtAmountEl.value);

    if (!creditor) { alert(t("invalidCreditor")); debtCreditorEl.focus(); return; }
    if (!isFinite(amount) || amount <= 0) { alert(t("invalidAmount")); debtAmountEl.focus(); return; }

    debts.push({
      id: uid(),
      creditor,
      amount: round2(amount),
      date: debtDateEl.value || todayISO(),
      settled: false
    });
    persistDebts();
    renderDebts();

    debtCreditorEl.value = "";
    debtAmountEl.value = "";
    debtCreditorEl.focus();
  });

  debtList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);

    if (btn.dataset.action === "toggle") {
      const debt = debts.find((x) => x.id === id);
      if (debt) { debt.settled = !debt.settled; persistDebts(); renderDebts(); }
    } else if (btn.dataset.action === "delete") {
      if (!confirm(t("confirmDeleteDebt"))) return;
      debts = debts.filter((x) => x.id !== id);
      persistDebts();
      renderDebts();
    }
  });

  /* =====================================================================
     ANALYTICS
     ===================================================================== */

  /* ----- Text normalization & fuzzy matching (English + Arabic) ----- */
  function norm(s) {
    return String(s)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")          // Latin diacritics
      .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // Arabic diacritics + tatweel (also strips hamza marks)
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه");
  }

  // Generic words that should never create a link on their own
  const STOP = new Set((
    "the and for with from new buy bought pay paid payment purchase purchased item items to of in on at my our an is it dzd " +
    "من في على الى عن مع هذا هذه شراء دفع سداد تسديد مبلغ دج و"
  ).split(" ").map(norm));

  function tokens(text) {
    const seen = new Set();
    norm(text).split(/[^a-z0-9\u0600-\u06FF]+/).forEach((tok) => {
      if (!tok || /^[\d\u0660-\u0669]+$/.test(tok)) return;       // ignore pure numbers
      if (tok.length > 3 && tok.startsWith("ال")) tok = tok.slice(2);  // Arabic definite article
      if (tok.length < 2 || STOP.has(tok)) return;
      seen.add(tok);
    });
    return [...seen];
  }

  // Equal tokens, or near-equal stems ("phone" ~ "phones")
  const tokEq = (a, b) =>
    a === b ||
    (a.length >= 4 && b.length >= 4 && Math.abs(a.length - b.length) <= 2 &&
      (a.startsWith(b) || b.startsWith(a)));

  function overlap(aTokens, bTokens) {
    let n = 0;
    aTokens.forEach((a) => { if (bTokens.some((b) => tokEq(a, b))) n++; });
    return n;
  }

  /* ----- Cross-module attribution -----
     Each salary WITHDRAWAL is linked to the shopping item or liability whose
     name shares the most meaningful words with the withdrawal description.
     An identical amount adds a small tie-breaking bonus. A link always needs
     at least one shared word; otherwise the withdrawal is "general". */
  function buildAttribution() {
    const shopIdx = shopItems.map((x) => ({ label: x.name, tokens: tokens(x.name), amount: x.cost }));
    const debtIdx = debts.map((x) => ({ label: x.creditor, tokens: tokens(x.creditor), amount: x.amount }));

    const withdrawals = records
      .filter((r) => r.type === "withdraw")
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);   // newest first

    const rows = withdrawals.map((r) => {
      const memoTokens = tokens(r.note || "");
      let best = null;

      const consider = (cat, list) => list.forEach((c) => {
        const n = overlap(memoTokens, c.tokens);
        if (n === 0) return;
        const score = n + (Math.abs(c.amount - r.amount) < 0.005 ? 0.5 : 0);
        if (!best || score > best.score) best = { cat, label: c.label, score };
      });

      if (memoTokens.length) {
        consider("shopping", shopIdx);
        consider("debt", debtIdx);      // strict ">" keeps shopping on exact ties
      }
      return { r, cat: best ? best.cat : "general", match: best ? best.label : null };
    });

    const totals = { shopping: 0, debt: 0, general: 0 };
    const counts = { shopping: 0, debt: 0, general: 0 };
    rows.forEach(({ r, cat }) => { totals[cat] += r.amount; counts[cat]++; });
    Object.keys(totals).forEach((k) => { totals[k] = round2(totals[k]); });

    return { rows, totals, counts, total: round2(totals.shopping + totals.debt + totals.general) };
  }

  /* ----- SVG doughnut chart ----- */
  function renderDonut(container, cfg) {
    const total = cfg.segments.reduce((s, x) => s + x.value, 0);
    const segs = cfg.segments.map((s) => ({ ...s, pct: total > 0 ? (s.value / total) * 100 : 0 }));

    let cum = 0;
    const circles = segs.map((s, i) => {
      if (s.pct <= 0) return "";
      const html = `<circle class="seg k-${s.key}" data-seg="${i}" cx="21" cy="21" r="15.9155" fill="none"
        stroke-width="6" stroke-dasharray="${s.pct.toFixed(3)} ${(100 - s.pct).toFixed(3)}"
        stroke-dashoffset="${(25 - cum).toFixed(3)}"><title>${esc(s.label)}: ${fmtPct(s.pct)}</title></circle>`;
      cum += s.pct;
      return html;
    }).join("");

    const centerValue = total > 0 ? cfg.centerValue : "—";
    const centerLabel = total > 0 ? cfg.centerLabel : t("noData");

    const legend = segs.map((s, i) => `
      <li class="legend-item" data-seg="${i}" tabindex="0">
        <span class="dot k-${s.key}"></span>
        <span class="legend-text">
          <span class="legend-label">${esc(s.label)}</span>
          <span class="legend-sub">${esc(s.sub)}</span>
        </span>
        <span class="legend-vals">
          <strong class="legend-pct">${fmtPct(s.pct)}</strong>
          <span class="legend-amt">${formatMoney(s.value)}</span>
        </span>
      </li>`).join("");

    container.innerHTML = `
      <div class="donut-wrap">
        <svg class="donut-svg" viewBox="0 0 42 42" role="img" aria-label="${esc(cfg.ariaLabel)}">
          <circle class="donut-track" cx="21" cy="21" r="15.9155" fill="none" stroke-width="6"></circle>
          ${circles}
        </svg>
        <div class="donut-center">
          <strong class="donut-value">${centerValue}</strong>
          <span class="donut-label">${esc(centerLabel)}</span>
        </div>
      </div>
      <ul class="legend">${legend}</ul>`;

    container._donut = { segs, centerValue, centerLabel };
  }

  function setDonutActive(container, index) {
    const d = container._donut;
    if (!d || !d.segs[index]) return;
    const s = d.segs[index];
    container.querySelector(".donut-value").textContent = fmtPct(s.pct);
    container.querySelector(".donut-label").textContent = s.label;
    container.querySelector(".donut-wrap").classList.add("has-active");
    container.querySelectorAll("[data-seg]").forEach((el) =>
      el.classList.toggle("active", Number(el.dataset.seg) === index));
  }

  function clearDonutActive(container) {
    const d = container._donut;
    if (!d) return;
    container.querySelector(".donut-value").textContent = d.centerValue;
    container.querySelector(".donut-label").textContent = d.centerLabel;
    container.querySelector(".donut-wrap").classList.remove("has-active");
    container.querySelectorAll("[data-seg]").forEach((el) => el.classList.remove("active"));
  }

  // Hover / focus interaction (bound once; works across re-renders)
  [cashFlowChart, attrChart].forEach((container) => {
    container.addEventListener("mouseover", (e) => {
      const el = e.target.closest("[data-seg]");
      if (el) setDonutActive(container, Number(el.dataset.seg));
      else clearDonutActive(container);
    });
    container.addEventListener("mouseleave", () => clearDonutActive(container));
    container.addEventListener("focusin", (e) => {
      const el = e.target.closest("[data-seg]");
      if (el) setDonutActive(container, Number(el.dataset.seg));
    });
    container.addEventListener("focusout", () => clearDonutActive(container));
  });

  function renderAnalytics() {
    if (activeTab !== "analytics") return;

    /* --- Cash flow --- */
    const deposits = records.filter((r) => r.type === "save");
    const withdrawals = records.filter((r) => r.type === "withdraw");
    const income = round2(deposits.reduce((s, r) => s + r.amount, 0));
    const expenses = round2(withdrawals.reduce((s, r) => s + r.amount, 0));
    const net = round2(income - expenses);
    const efficiency = income > 0 ? (net / income) * 100 : null;   // share of income retained

    anIncomeEl.textContent = formatMoney(income);
    anExpensesEl.textContent = formatMoney(expenses);
    anNetEl.textContent = formatMoney(net);
    anNetEl.className = "stat-value " + (net < 0 ? "red" : "yellow");
    anEfficiencyEl.textContent = efficiency === null ? "—" : fmtPct(efficiency);
    anEfficiencyEl.className = "stat-value " + (efficiency === null ? "" : efficiency < 0 ? "red" : "green");

    renderDonut(cashFlowChart, {
      segments: [
        { key: "income", label: t("incomeLabel"), value: income, sub: t("countLabel").replace("{n}", deposits.length) },
        { key: "expense", label: t("expenseLabel"), value: expenses, sub: t("countLabel").replace("{n}", withdrawals.length) }
      ],
      centerValue: efficiency === null ? "—" : fmtPct(efficiency),
      centerLabel: t("netEfficiency"),
      ariaLabel: t("cashFlowTitle")
    });

    /* --- Expense attribution --- */
    const attr = buildAttribution();
    const linkedAmount = round2(attr.totals.shopping + attr.totals.debt);
    const linkedCount = attr.counts.shopping + attr.counts.debt;
    const attributedPct = attr.total > 0 ? (linkedAmount / attr.total) * 100 : null;

    renderDonut(attrChart, {
      segments: [
        { key: "shopping", label: t("catShopping"), value: attr.totals.shopping, sub: t("countLabel").replace("{n}", attr.counts.shopping) },
        { key: "debt", label: t("catDebt"), value: attr.totals.debt, sub: t("countLabel").replace("{n}", attr.counts.debt) },
        { key: "general", label: t("catGeneral"), value: attr.totals.general, sub: t("countLabel").replace("{n}", attr.counts.general) }
      ],
      centerValue: attributedPct === null ? "—" : fmtPct(attributedPct),
      centerLabel: t("attributed"),
      ariaLabel: t("allocTitle")
    });

    const totalRows = attr.rows.length;
    attrSummary.textContent = totalRows
      ? t("linkedCount").replace("{a}", linkedCount).replace("{b}", totalRows)
      : "";

    const catMeta = {
      shopping: { cls: "shop", icon: "fa-cart-shopping", label: t("catShopping") },
      debt: { cls: "debt", icon: "fa-hand-holding-dollar", label: t("catDebt") },
      general: { cls: "general", icon: "fa-layer-group", label: t("catGeneral") }
    };

    attrList.innerHTML = attr.rows.map(({ r, cat, match }) => {
      const m = catMeta[cat];
      return `
        <li class="attr-row">
          <div class="attr-main">
            <span class="attr-memo">${r.note ? esc(r.note) : esc(t("noMemo"))}</span>
            <span class="attr-meta">
              <span><i class="fa-regular fa-calendar"></i>${formatDate(r.date)}</span>
              ${match ? `<span><i class="fa-solid fa-link"></i>${t("linkedTo")}: ${esc(match)}</span>` : ""}
            </span>
          </div>
          ${pill(m.cls, m.icon, m.label)}
          <span class="attr-amount red">${formatMoney(r.amount)}</span>
        </li>`;
    }).join("");

    attrEmpty.classList.toggle("hidden", totalRows > 0);
  }

  /* =====================================================================
     MASTER BACKUP (export / import across every module)
     ===================================================================== */
  function buildMasterBackup() {
    let balance = 0;
    const transactions = sortedRecords().map((r) => {
      balance = round2(balance + (r.type === "save" ? r.amount : -r.amount));
      return { id: r.id, type: r.type, amount: r.amount, date: r.date, note: r.note || "", balance };
    });

    const totalDeposits = round2(records.filter((r) => r.type === "save").reduce((s, r) => s + r.amount, 0));
    const totalWithdrawals = round2(records.filter((r) => r.type === "withdraw").reduce((s, r) => s + r.amount, 0));

    return {
      app: "PayDay",
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      salaryLedger: {
        currency: "DZD",
        transactions,
        summary: { totalDeposits, totalWithdrawals, availableBalance: round2(totalDeposits - totalWithdrawals) }
      },
      shoppingList: {
        budget: shopBudget,
        items: shopItems.map((x) => ({ id: x.id, name: x.name, cost: x.cost, date: x.date, done: x.done }))
      },
      debtTracker: {
        repaymentBudget: debtBudget,
        debts: debts.map((x) => ({ id: x.id, creditor: x.creditor, amount: x.amount, date: x.date, settled: x.settled }))
      },
      appSettings: { theme, language: lang, readOnly }
    };
  }

  // Validates the file and returns only the modules it contains.
  // Also accepts the legacy ledger-only export (a plain array of transactions).
  function parseMaster(data) {
    const out = {};
    if (Array.isArray(data)) { out.ledger = normalizeLedger(data); return out; }
    if (!data || typeof data !== "object") throw new Error("Not a backup object");

    const known = ["salaryLedger", "shoppingList", "debtTracker", "appSettings"];
    if (!known.some((k) => k in data)) throw new Error("Unrecognized backup structure");

    if ("salaryLedger" in data) {
      const sl = data.salaryLedger;
      const arr = Array.isArray(sl) ? sl : (sl && Array.isArray(sl.transactions) ? sl.transactions : null);
      if (!arr) throw new Error("Invalid salaryLedger");
      out.ledger = normalizeLedger(arr);
    }

    if ("shoppingList" in data) {
      const s = data.shoppingList;
      if (!s || typeof s !== "object" || (s.items !== undefined && !Array.isArray(s.items))) {
        throw new Error("Invalid shoppingList");
      }
      out.shop = { budget: cleanMoney(s.budget), items: normalizeShop(s.items) };
    }

    if ("debtTracker" in data) {
      const d = data.debtTracker;
      if (!d || typeof d !== "object" || (d.debts !== undefined && !Array.isArray(d.debts))) {
        throw new Error("Invalid debtTracker");
      }
      out.debt = { budget: cleanMoney(d.repaymentBudget), debts: normalizeDebts(d.debts) };
    }

    if ("appSettings" in data) {
      const a = data.appSettings;
      if (!a || typeof a !== "object") throw new Error("Invalid appSettings");
      out.settings = {};
      if (a.theme === "light" || a.theme === "dark") out.settings.theme = a.theme;
      if (a.language === "en" || a.language === "ar") out.settings.language = a.language;
      if (typeof a.readOnly === "boolean") out.settings.readOnly = a.readOnly;
    }
    return out;
  }

  // Writes every module to localStorage, then re-renders the whole UI
  function applyMaster(parsed) {
    if (parsed.ledger) {
      records = parsed.ledger;
      persist();
    }
    if (parsed.shop) {
      shopBudget = parsed.shop.budget;
      shopItems = parsed.shop.items;
      localStorage.setItem(SHOP_BUDGET_KEY, String(shopBudget));
      persistShop();
    }
    if (parsed.debt) {
      debtBudget = parsed.debt.budget;
      debts = parsed.debt.debts;
      localStorage.setItem(DEBT_BUDGET_KEY, String(debtBudget));
      persistDebts();
    }

    let langChanged = false;
    if (parsed.settings) {
      const s = parsed.settings;
      if (s.theme) { theme = s.theme; localStorage.setItem(THEME_KEY, theme); }
      if (s.language && s.language !== lang) {
        lang = s.language;
        localStorage.setItem(LANG_KEY, lang);
        langChanged = true;
      }
      if (typeof s.readOnly === "boolean") {
        readOnly = s.readOnly;
        localStorage.setItem(READONLY_KEY, readOnly ? "1" : "0");
      }
    }

    editingId = null;
    selectedId = null;
    shopBudgetEl.value = shopBudget > 0 ? shopBudget : "";
    debtBudgetEl.value = debtBudget > 0 ? debtBudget : "";

    applyTheme();
    applyReadOnly();
    applyLanguage();                     // re-renders ledger, shopping, debts and analytics
    setTab(activeTab, false);
    if (langChanged) showQuote(true);
  }

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(buildMasterBackup(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payday_master_backup_${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener("click", () => {
    if (!readOnly) importFile.click();
  });

  importFile.addEventListener("change", () => {
    const file = importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseMaster(JSON.parse(reader.result));    // validate before touching any data
        if (confirm(t("confirmImport"))) {
          applyMaster(parsed);
          alert(t("importOk"));
        }
      } catch (err) {
        console.warn("PayDay: import failed.", err);
        alert(t("importErr"));
      }
      importFile.value = "";
    };
    reader.readAsText(file);
  });

  /* =====================================================================
     GLOBAL: language, theme, clock, background
     ===================================================================== */
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

    tabsEl.setAttribute("aria-label", t("tabsLabel"));
    quoteRefreshBtn.setAttribute("aria-label", t("newQuote"));
    quoteRefreshBtn.title = t("newQuote");
    detailsClose.setAttribute("aria-label", t("closeDetails"));
    detailsClose.title = t("closeDetails");
    if (!quotesReady) quoteTextEl.textContent = t("quoteLoading");

    langBtn.textContent = lang === "ar" ? "EN" : "AR";
    applyReadOnly();    // refreshes the localized tooltip on the import button

    // Re-render every module in the new language
    renderTable();      // also re-renders the details card
    renderShopping();
    renderDebts();
    renderAnalytics();
    renderDateTime();
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme);
    themeBtn.innerHTML = theme === "dark"
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }

  langBtn.addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem(LANG_KEY, lang);
    applyLanguage();
    showQuote(true);                     // new quote in the newly selected language
  });

  themeBtn.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, theme);
    applyTheme();                        // chart colors follow CSS variables, so no redraw is needed
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
  const today = todayISO();
  dateEl.value = today;
  shopDateEl.value = today;
  debtDateEl.value = today;
  shopBudgetEl.value = shopBudget > 0 ? shopBudget : "";
  debtBudgetEl.value = debtBudget > 0 ? debtBudget : "";

  renderVersion();
  applyTheme();
  applyReadOnly();
  applyLanguage();
  setTab(activeTab, false);
  initBackground();
  loadQuotes();
  setInterval(renderDateTime, 1000);
})();