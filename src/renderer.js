const STORAGE_KEY = "rupee-nest-state-v1";

const categories = ["Food", "Travel", "Shopping", "Bills", "Groceries", "Rent", "Health", "Investments"];

const defaultState = {
  profile: {
    name: "Arun",
    month: "April 2026",
    lastSync: "Today, 7:42 PM"
  },
  sources: [
    { id: "hdfc", name: "HDFC Salary Account", kind: "Bank account", status: "Connected", balance: 184250 },
    { id: "icici-card", name: "ICICI Amazon Pay Card", kind: "Credit card", status: "Connected", balance: -18490 },
    { id: "upi", name: "PhonePe UPI", kind: "UPI", status: "Needs review", balance: 0 },
    { id: "csv", name: "CSV imports", kind: "Statements", status: "Ready", balance: 0 }
  ],
  transactions: [
    { id: "txn-1", merchant: "Swiggy", category: "Food", source: "PhonePe UPI", amount: 620, type: "Expense", date: "2026-04-19", notes: "Dinner" },
    { id: "txn-2", merchant: "BigBasket", category: "Groceries", source: "HDFC Salary Account", amount: 2480, type: "Expense", date: "2026-04-18", notes: "Weekly order" },
    { id: "txn-3", merchant: "Uber", category: "Travel", source: "ICICI Amazon Pay Card", amount: 540, type: "Expense", date: "2026-04-17", notes: "Airport pickup" },
    { id: "txn-4", merchant: "Zerodha SIP", category: "Investments", source: "HDFC Salary Account", amount: 15000, type: "Expense", date: "2026-04-15", notes: "Index fund SIP" },
    { id: "txn-5", merchant: "Salary", category: "Income", source: "HDFC Salary Account", amount: 285000, type: "Income", date: "2026-04-01", notes: "Monthly salary" }
  ],
  budgets: [
    { id: "food", category: "Food", limit: 18000 },
    { id: "travel", category: "Travel", limit: 12000 },
    { id: "shopping", category: "Shopping", limit: 25000 },
    { id: "bills", category: "Bills", limit: 22000 },
    { id: "groceries", category: "Groceries", limit: 16000 }
  ],
  bills: [
    { id: "bill-1", name: "Home rent", dueDate: "2026-04-25", amount: 52000 },
    { id: "bill-2", name: "ICICI credit card", dueDate: "2026-04-27", amount: 18490 },
    { id: "bill-3", name: "Jio Fiber", dueDate: "2026-04-29", amount: 1178 }
  ]
};

const state = {
  data: null,
  filter: "All"
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const shortDate = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short"
});

const selectors = {
  profileMonth: document.querySelector(".topbar .eyebrow"),
  greeting: document.querySelector(".topbar h2"),
  lastSync: document.getElementById("last-sync"),
  syncCount: document.getElementById("sync-count"),
  availableBalance: document.getElementById("available-balance"),
  netWorthNote: document.getElementById("net-worth-note"),
  monthSpend: document.getElementById("month-spend"),
  spendNote: document.getElementById("spend-note"),
  monthSaved: document.getElementById("month-saved"),
  saveNote: document.getElementById("save-note"),
  upcomingBills: document.getElementById("upcoming-bills"),
  billsNote: document.getElementById("bills-note"),
  categoryFilter: document.getElementById("category-filter"),
  transactionList: document.getElementById("transaction-list"),
  sourceList: document.getElementById("source-list"),
  budgetList: document.getElementById("budget-list"),
  billList: document.getElementById("bill-list"),
  expenseForm: document.getElementById("expense-form"),
  categoryInput: document.getElementById("category"),
  sourceInput: document.getElementById("source"),
  dateInput: document.getElementById("date"),
  addExpenseButton: document.getElementById("add-expense-button"),
  syncButton: document.getElementById("sync-button"),
  transactionTemplate: document.getElementById("transaction-template"),
  sourceTemplate: document.getElementById("source-template"),
  budgetTemplate: document.getElementById("budget-template"),
  billTemplate: document.getElementById("bill-template")
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return structuredClone(defaultState);
  }

  try {
    return JSON.parse(saved);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function formatMoney(value) {
  return currency.format(value);
}

function dateLabel(dateString) {
  return shortDate.format(new Date(`${dateString}T00:00:00`));
}

function expenseTotal(category) {
  return state.data.transactions
    .filter((transaction) => transaction.type === "Expense")
    .filter((transaction) => !category || transaction.category === category)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
}

function incomeTotal() {
  return state.data.transactions
    .filter((transaction) => transaction.type === "Income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
}

function populateControls() {
  selectors.categoryFilter.innerHTML = '<option value="All">All categories</option>';
  selectors.categoryInput.innerHTML = "";
  selectors.sourceInput.innerHTML = "";

  categories.forEach((category) => {
    selectors.categoryFilter.append(new Option(category, category));
    selectors.categoryInput.append(new Option(category, category));
  });

  state.data.sources.forEach((source) => {
    selectors.sourceInput.append(new Option(source.name, source.name));
  });
}

function renderSummary() {
  const available = state.data.sources.reduce((sum, source) => sum + source.balance, 0);
  const spent = expenseTotal();
  const income = incomeTotal();
  const saved = Math.max(income - spent, 0);
  const billsDue = state.data.bills.reduce((sum, bill) => sum + Number(bill.amount), 0);
  const connected = state.data.sources.filter((source) => source.status === "Connected").length;

  selectors.profileMonth.textContent = state.data.profile.month;
  selectors.greeting.textContent = `Good evening, ${state.data.profile.name}`;
  selectors.lastSync.textContent = state.data.profile.lastSync;
  selectors.syncCount.textContent = `${connected}/${state.data.sources.length} sources connected`;

  selectors.availableBalance.textContent = formatMoney(available);
  selectors.netWorthNote.textContent = "Across bank, card, UPI, and imports";
  selectors.monthSpend.textContent = formatMoney(spent);
  selectors.spendNote.textContent = `${state.data.transactions.length} transactions tracked`;
  selectors.monthSaved.textContent = formatMoney(saved);
  selectors.saveNote.textContent = income > 0 ? `${Math.round((saved / income) * 100)}% of income retained` : "Add income to calculate savings";
  selectors.upcomingBills.textContent = formatMoney(billsDue);
  selectors.billsNote.textContent = `${state.data.bills.length} payments before month end`;
}

function renderTransactions() {
  selectors.transactionList.innerHTML = "";

  const transactions = state.data.transactions
    .filter((transaction) => state.filter === "All" || transaction.category === state.filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  transactions.forEach((transaction) => {
    const item = selectors.transactionTemplate.content.cloneNode(true);
    const signedAmount = transaction.type === "Income" ? transaction.amount : -transaction.amount;

    item.querySelector(".transaction-icon").textContent = transaction.category.slice(0, 1);
    item.querySelector(".transaction-merchant").textContent = transaction.merchant;
    item.querySelector(".transaction-meta").textContent = `${transaction.category} • ${transaction.source} • ${dateLabel(transaction.date)}`;
    item.querySelector(".transaction-amount").textContent = formatMoney(signedAmount);
    item.querySelector(".transaction-amount").classList.toggle("is-income", transaction.type === "Income");
    selectors.transactionList.append(item);
  });
}

function renderSources() {
  selectors.sourceList.innerHTML = "";

  state.data.sources.forEach((source) => {
    const item = selectors.sourceTemplate.content.cloneNode(true);
    item.querySelector(".source-name").textContent = source.name;
    item.querySelector(".source-kind").textContent = `${source.kind} • ${formatMoney(source.balance)}`;
    item.querySelector(".source-status").textContent = source.status;
    item.querySelector(".source-status").classList.toggle("needs-review", source.status === "Needs review");
    selectors.sourceList.append(item);
  });
}

function renderBudgets() {
  selectors.budgetList.innerHTML = "";

  state.data.budgets.forEach((budget) => {
    const used = expenseTotal(budget.category);
    const percent = Math.min(Math.round((used / budget.limit) * 100), 100);
    const item = selectors.budgetTemplate.content.cloneNode(true);

    item.querySelector(".budget-category").textContent = budget.category;
    item.querySelector(".budget-value").textContent = `${formatMoney(used)} / ${formatMoney(budget.limit)}`;
    item.querySelector(".progress-fill").style.width = `${percent}%`;
    item.querySelector(".progress-fill").classList.toggle("is-high", percent >= 80);
    selectors.budgetList.append(item);
  });
}

function renderBills() {
  selectors.billList.innerHTML = "";

  state.data.bills
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .forEach((bill) => {
      const item = selectors.billTemplate.content.cloneNode(true);
      item.querySelector(".bill-name").textContent = bill.name;
      item.querySelector(".bill-date").textContent = `Due ${dateLabel(bill.dueDate)}`;
      item.querySelector(".bill-amount").textContent = formatMoney(bill.amount);
      selectors.billList.append(item);
    });
}

function render() {
  renderSummary();
  renderTransactions();
  renderSources();
  renderBudgets();
  renderBills();
}

selectors.expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const form = new FormData(selectors.expenseForm);
  const transaction = {
    id: crypto.randomUUID(),
    merchant: form.get("merchant").trim(),
    amount: Number(form.get("amount")),
    category: form.get("category"),
    source: form.get("source"),
    date: form.get("date"),
    type: form.get("type"),
    notes: form.get("notes").trim()
  };

  state.data.transactions.unshift(transaction);
  saveState();
  selectors.expenseForm.reset();
  selectors.dateInput.valueAsDate = new Date();
  render();
});

selectors.categoryFilter.addEventListener("change", () => {
  state.filter = selectors.categoryFilter.value;
  renderTransactions();
});

selectors.addExpenseButton.addEventListener("click", () => {
  document.getElementById("merchant").focus();
});

selectors.syncButton.addEventListener("click", () => {
  state.data.profile.lastSync = "Just now";
  state.data.sources = state.data.sources.map((source) => (
    source.status === "Needs review" ? { ...source, status: "Connected" } : source
  ));
  saveState();
  render();
});

function init() {
  state.data = loadState();
  populateControls();
  selectors.dateInput.valueAsDate = new Date();
  render();
}

init();
