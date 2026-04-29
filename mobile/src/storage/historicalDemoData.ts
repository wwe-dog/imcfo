import type { CashFlowType, Transaction, TransactionType } from "../domain/models";

export interface HistoricalMonthlySnapshot {
  month: string;
  assets: number;
  liabilities: number;
  netWorth: number;
  income: number;
  expenses: number;
  profit: number;
  operatingCF: number;
  investingCF: number;
  financingCF: number;
  cashNetChange: number;
}

export const historicalMonthlySnapshots: HistoricalMonthlySnapshot[] = [
  { month: "2023-05", assets: 3260000, liabilities: 980000, netWorth: 2280000, income: 65000, expenses: 40900, profit: 24100, operatingCF: 32600, investingCF: -30000, financingCF: -18000, cashNetChange: -15400 },
  { month: "2023-06", assets: 3365000, liabilities: 998000, netWorth: 2367000, income: 72700, expenses: 42300, profit: 30400, operatingCF: 40500, investingCF: -16400, financingCF: -18300, cashNetChange: 5800 },
  { month: "2023-07", assets: 3399000, liabilities: 1013000, netWorth: 2386000, income: 78000, expenses: 39500, profit: 38500, operatingCF: 49900, investingCF: -9500, financingCF: -18400, cashNetChange: 22000 },
  { month: "2023-08", assets: 3450000, liabilities: 1023000, netWorth: 2427000, income: 79400, expenses: 34600, profit: 44800, operatingCF: 57000, investingCF: -12800, financingCF: -18300, cashNetChange: 25900 },
  { month: "2023-09", assets: 3481000, liabilities: 1026000, netWorth: 2455000, income: 76700, expenses: 30700, profit: 46000, operatingCF: 58500, investingCF: -75000, financingCF: -18000, cashNetChange: -34500 },
  { month: "2023-10", assets: 3473000, liabilities: 1024000, netWorth: 2449000, income: 71200, expenses: 45500, profit: 25700, operatingCF: 37800, investingCF: -40700, financingCF: -17700, cashNetChange: -20600 },
  { month: "2023-11", assets: 3536000, liabilities: 1019000, netWorth: 2517000, income: 65100, expenses: 34400, profit: 30700, operatingCF: 41900, investingCF: -52800, financingCF: -17600, cashNetChange: -28500 },
  { month: "2023-12", assets: 3615000, liabilities: 1012000, netWorth: 2603000, income: 115800, expenses: 40300, profit: 75500, operatingCF: 85300, investingCF: -55800, financingCF: -17700, cashNetChange: 11800 },
  { month: "2024-01", assets: 3650000, liabilities: 1008000, netWorth: 2642000, income: 60200, expenses: 44900, profit: 15300, operatingCF: 23600, investingCF: -48700, financingCF: -18000, cashNetChange: -43100 },
  { month: "2024-02", assets: 3718000, liabilities: 1009000, netWorth: 2709000, income: 63800, expenses: 63600, profit: 200, operatingCF: 6900, investingCF: -35000, financingCF: -18300, cashNetChange: -46400 },
  { month: "2024-03", assets: 3763000, liabilities: 1015000, netWorth: 2748000, income: 70600, expenses: 42400, profit: 28200, operatingCF: 33700, investingCF: -21500, financingCF: 71600, cashNetChange: 83800 },
  { month: "2024-04", assets: 3757000, liabilities: 1027000, netWorth: 2730000, income: 78600, expenses: 37400, profit: 41200, operatingCF: 45900, investingCF: -14900, financingCF: -18200, cashNetChange: 12800 },
  { month: "2024-05", assets: 3817000, liabilities: 1044000, netWorth: 2773000, income: 85300, expenses: 33900, profit: 51400, operatingCF: 55900, investingCF: -18400, financingCF: -17900, cashNetChange: 19600 },
  { month: "2024-06", assets: 3900000, liabilities: 1062000, netWorth: 2838000, income: 88700, expenses: 34400, profit: 54300, operatingCF: 59300, investingCF: -80800, financingCF: -17700, cashNetChange: -39200 },
  { month: "2024-07", assets: 3958000, liabilities: 1079000, netWorth: 2879000, income: 87900, expenses: 38800, profit: 49100, operatingCF: 55100, investingCF: -46500, financingCF: -17600, cashNetChange: -9000 },
  { month: "2024-08", assets: 4059000, liabilities: 1092000, netWorth: 2967000, income: 83400, expenses: 44700, profit: 38700, operatingCF: 46100, investingCF: -58400, financingCF: -17800, cashNetChange: -30100 },
  { month: "2024-09", assets: 4129000, liabilities: 1099000, netWorth: 3030000, income: 77300, expenses: 48800, profit: 28500, operatingCF: 37500, investingCF: -61100, financingCF: -18100, cashNetChange: -41700 },
  { month: "2024-10", assets: 4123000, liabilities: 1100000, netWorth: 3023000, income: 71900, expenses: 63900, profit: 8000, operatingCF: 18500, investingCF: -53800, financingCF: -18300, cashNetChange: -53600 },
  { month: "2024-11", assets: 4150000, liabilities: 1096000, netWorth: 3054000, income: 69400, expenses: 45200, profit: 24200, operatingCF: 35900, investingCF: -40100, financingCF: -18400, cashNetChange: -22600 },
  { month: "2024-12", assets: 4183000, liabilities: 1090000, netWorth: 3093000, income: 126100, expenses: 40200, profit: 85900, operatingCF: 98300, investingCF: 18300, financingCF: -18200, cashNetChange: 98400 },
  { month: "2025-01", assets: 4198000, liabilities: 1084000, netWorth: 3114000, income: 76600, expenses: 37300, profit: 39300, operatingCF: 51800, investingCF: -20200, financingCF: 72100, cashNetChange: 103700 },
  { month: "2025-02", assets: 4286000, liabilities: 1082000, netWorth: 3204000, income: 84300, expenses: 56400, profit: 27900, operatingCF: 39800, investingCF: -24000, financingCF: -17600, cashNetChange: -1800 },
  { month: "2025-03", assets: 4371000, liabilities: 1084000, netWorth: 3287000, income: 91900, expenses: 43200, profit: 48700, operatingCF: 59500, investingCF: -36500, financingCF: -17600, cashNetChange: 5400 },
  { month: "2025-04", assets: 4398000, liabilities: 1093000, netWorth: 3305000, income: 97000, expenses: 49000, profit: 48000, operatingCF: 57400, investingCF: -52200, financingCF: -17800, cashNetChange: -12600 },
  { month: "2025-05", assets: 4456000, liabilities: 1108000, netWorth: 3348000, income: 98200, expenses: 52600, profit: 45600, operatingCF: 53400, investingCF: -113900, financingCF: -18100, cashNetChange: -78600 },
  { month: "2025-06", assets: 4498000, liabilities: 1125000, netWorth: 3373000, income: 95300, expenses: 52100, profit: 43200, operatingCF: 49500, investingCF: -66500, financingCF: -18400, cashNetChange: -35400 },
  { month: "2025-07", assets: 4512000, liabilities: 1144000, netWorth: 3368000, income: 89700, expenses: 48000, profit: 41700, operatingCF: 46900, investingCF: -58900, financingCF: -18400, cashNetChange: -30400 },
  { month: "2025-08", assets: 4599000, liabilities: 1159000, netWorth: 3440000, income: 83600, expenses: 43100, profit: 40500, operatingCF: 45100, investingCF: -45100, financingCF: -18200, cashNetChange: -18200 },
  { month: "2025-09", assets: 4694000, liabilities: 1170000, netWorth: 3524000, income: 79500, expenses: 40700, profit: 38800, operatingCF: 43400, investingCF: -31800, financingCF: -17800, cashNetChange: -6200 },
  { month: "2025-10", assets: 4737000, liabilities: 1174000, netWorth: 3563000, income: 79200, expenses: 57400, profit: 21800, operatingCF: 27000, investingCF: -25600, financingCF: -17600, cashNetChange: -16200 },
  { month: "2025-11", assets: 4804000, liabilities: 1173000, netWorth: 3631000, income: 83000, expenses: 47600, profit: 35400, operatingCF: 41800, investingCF: 15400, financingCF: -17600, cashNetChange: 39600 },
  { month: "2025-12", assets: 4833000, liabilities: 1168000, netWorth: 3665000, income: 144900, expenses: 53300, profit: 91600, operatingCF: 99400, investingCF: -42300, financingCF: -17900, cashNetChange: 39200 },
  { month: "2026-01", assets: 4809000, liabilities: 1161000, netWorth: 3648000, income: 97900, expenses: 56400, profit: 41500, operatingCF: 50900, investingCF: -57900, financingCF: -18200, cashNetChange: -25200 },
  { month: "2026-02", assets: 4851000, liabilities: 1156000, netWorth: 3695000, income: 104500, expenses: 73200, profit: 31300, operatingCF: 42200, investingCF: -69500, financingCF: -18400, cashNetChange: -45700 },
  { month: "2026-03", assets: 4914000, liabilities: 1156000, netWorth: 3758000, income: 107600, expenses: 50800, profit: 56800, operatingCF: 68700, investingCF: -71800, financingCF: -18400, cashNetChange: -21500 },
  { month: "2026-04", assets: 5000000, liabilities: 1186000, netWorth: 3814000, income: 93500, expenses: 45600, profit: 47900, operatingCF: 56900, investingCF: -64000, financingCF: -69200, cashNetChange: -76300 },
];

const now = "2026-04-30T00:00:00.000Z";

const roundToHundred = (value: number): number => Math.round(value / 100) * 100;

const sumTransactions = (
  transactions: Transaction[],
  predicate: (transaction: Transaction) => boolean,
): number => transactions.filter(predicate).reduce((sum, transaction) => sum + transaction.amount, 0);

const toCreatedAt = (date: string, hour: number): string =>
  `${date}T${String(hour).padStart(2, "0")}:10:00.000Z`;

const createTransaction = (
  month: string,
  serial: number,
  day: number,
  type: TransactionType,
  amount: number,
  category: string,
  accountId: string,
  cashFlowType: CashFlowType,
  note: string,
  options: Partial<Transaction> = {},
): Transaction => {
  const date = `${month}-${String(day).padStart(2, "0")}`;
  return {
    id: `tx-${month}-${String(serial).padStart(2, "0")}`,
    date,
    amount,
    type,
    category,
    accountId,
    cashFlowType,
    note,
    tags: options.tags ?? [],
    createdAt: toCreatedAt(date, 8 + (serial % 11)),
    updatedAt: now,
    ...options,
  };
};

const getCashFlowDelta = (transaction: Transaction): number => {
  if (transaction.cashFlowType === "nonCash") return 0;
  if (
    transaction.type === "income" ||
    transaction.type === "investmentSell" ||
    transaction.type === "assetIncrease" ||
    transaction.type === "liabilityIncrease" ||
    transaction.type === "receivableCollect"
  ) {
    return transaction.amount;
  }
  return -transaction.amount;
};

const allocateWeighted = (total: number, weights: number[]): number[] => {
  let allocated = 0;
  return weights.map((weight, index) => {
    if (index === weights.length - 1) return total - allocated;
    const amount = roundToHundred(total * weight);
    allocated += amount;
    return amount;
  });
};

const pushIfPositive = (
  list: Transaction[],
  month: string,
  serial: { value: number },
  day: number,
  type: TransactionType,
  amount: number,
  category: string,
  accountId: string,
  cashFlowType: CashFlowType,
  note: string,
  options?: Partial<Transaction>,
): void => {
  if (amount <= 0) return;
  list.push(createTransaction(month, serial.value, day, type, amount, category, accountId, cashFlowType, note, options));
  serial.value += 1;
};

const addSpecialHistoricalTransactions = (
  list: Transaction[],
  snapshot: HistoricalMonthlySnapshot,
  monthIndex: number,
  serial: { value: number },
): void => {
  const { month } = snapshot;

  if (month === "2023-05") {
    pushIfPositive(list, month, serial, 1, "transfer", 3260000, "初始化", "account-cmb-bank", "nonCash", "初始化资产负债", {
      tags: ["初始化", "历史账套"],
    });
  }
  if (month === "2023-06") {
    pushIfPositive(list, month, serial, 20, "investmentBuy", 30000, "宽基ETF", "account-htsc-etf", "investing", "买入宽基 ETF 30000", {
      relatedAssetId: "asset-broad-etf",
      tags: ["投资", "ETF"],
    });
  }
  if (month === "2023-08") {
    pushIfPositive(list, month, serial, 31, "assetIncrease", 18000, "A股股票", "account-eastmoney", "nonCash", "股票账户浮盈 18000", {
      relatedAssetId: "asset-a-share",
      tags: ["浮盈", "非现金"],
    });
  }
  if (month === "2023-09") {
    pushIfPositive(list, month, serial, 10, "investmentBuy", 50000, "债券基金", "account-ttfund", "investing", "买入债券基金 50000", {
      relatedAssetId: "asset-bond-fund",
      tags: ["投资", "债券基金"],
    });
  }
  if (month === "2023-12") {
    pushIfPositive(list, month, serial, 10, "income", 55000, "年终奖", "account-cmb-bank", "operating", "年终奖到账 55000", {
      tags: ["奖金"],
    });
  }
  if (month === "2024-02") {
    pushIfPositive(list, month, serial, 5, "expense", 18000, "家庭支持", "account-icbc-bank", "operating", "春节家庭支持 18000", {
      tags: ["家庭支持"],
    });
  }
  if (month === "2024-03") {
    pushIfPositive(list, month, serial, 15, "liabilityIncrease", 90000, "借款", "account-icbc-bank", "financing", "朋友借我钱 90000", {
      relatedLiabilityId: "liability-friend-borrowing",
      tags: ["借款"],
    });
  }
  if (month === "2024-06") {
    pushIfPositive(list, month, serial, 12, "investmentBuy", 70000, "港美股", "account-futu", "investing", "买入港美股 70000", {
      relatedAssetId: "asset-hk-us-stock",
      tags: ["投资", "港美股"],
    });
    pushIfPositive(list, month, serial, 30, "assetIncrease", 26000, "港美股", "account-futu", "nonCash", "港美股浮盈 26000", {
      relatedAssetId: "asset-hk-us-stock",
      tags: ["浮盈", "非现金"],
    });
  }
  if (month === "2024-09") {
    pushIfPositive(list, month, serial, 20, "investmentBuy", 20000, "黄金", "account-eastmoney", "investing", "买入黄金 ETF 20000", {
      relatedAssetId: "asset-gold",
      tags: ["投资", "黄金"],
    });
  }
  if (month === "2024-10") {
    pushIfPositive(list, month, serial, 3, "creditCardExpense", 28000, "旅行", "account-cmb-credit-card", "nonCash", "旅行消费 28000", {
      relatedLiabilityId: "liability-cmb-credit-card",
      tags: ["信用卡", "旅行"],
    });
  }
  if (month === "2024-12") {
    pushIfPositive(list, month, serial, 6, "investmentSell", 65000, "行业ETF", "account-htsc-etf", "investing", "卖出行业 ETF 65000", {
      relatedAssetId: "asset-sector-etf",
      tags: ["投资", "卖出"],
    });
    pushIfPositive(list, month, serial, 10, "income", 58000, "年终奖", "account-cmb-bank", "operating", "年终奖到账 58000", {
      tags: ["奖金"],
    });
  }
  if (month === "2025-01") {
    pushIfPositive(list, month, serial, 8, "liabilityIncrease", 90000, "借款", "account-icbc-bank", "financing", "新增短期借款 90000", {
      relatedLiabilityId: "liability-friend-borrowing",
      tags: ["借款"],
    });
  }
  if (month === "2025-03") {
    pushIfPositive(list, month, serial, 28, "receivableRecognize", 15000, "应收款", "account-cmb-bank", "nonCash", "公司报销款确认 15000", {
      relatedAssetId: "asset-reimbursement",
      tags: ["应收确认", "报销"],
    });
  }
  if (month === "2025-04") {
    pushIfPositive(list, month, serial, 12, "receivableCollect", 15000, "应收款", "account-cmb-bank", "operating", "公司报销到账 15000", {
      relatedAssetId: "asset-reimbursement",
      tags: ["应收收回", "报销"],
    });
  }
  if (month === "2025-05") {
    pushIfPositive(list, month, serial, 18, "investmentBuy", 80000, "宽基ETF", "account-htsc-etf", "investing", "大额买入宽基 ETF 80000", {
      relatedAssetId: "asset-broad-etf",
      tags: ["投资", "ETF"],
    });
  }
  if (month === "2025-06") {
    pushIfPositive(list, month, serial, 30, "assetIncrease", 50000, "房产", "account-cmb-bank", "nonCash", "房产估值调增 50000", {
      relatedAssetId: "asset-home",
      tags: ["估值调整", "非现金"],
    });
  }
  if (month === "2025-08") {
    pushIfPositive(list, month, serial, 22, "transfer", 30000, "外币资产", "account-cmb-bank", "nonCash", "美元换汇 30000", {
      relatedAssetId: "asset-fx",
      tags: ["换汇", "内部转换"],
    });
  }
  if (month === "2025-10") {
    pushIfPositive(list, month, serial, 2, "expense", 20000, "家庭支持", "account-icbc-bank", "operating", "家庭大额支出 20000", {
      tags: ["家庭支持"],
    });
  }
  if (month === "2025-11") {
    pushIfPositive(list, month, serial, 18, "investmentSell", 90000, "A股股票", "account-eastmoney", "investing", "卖出股票 90000", {
      relatedAssetId: "asset-a-share",
      tags: ["投资", "卖出"],
    });
  }
  if (month === "2025-12") {
    pushIfPositive(list, month, serial, 10, "income", 62000, "年终奖", "account-cmb-bank", "operating", "年终奖到账 62000", {
      tags: ["奖金"],
    });
  }
  if (month === "2026-01") {
    pushIfPositive(list, month, serial, 5, "income", 28000, "项目分红", "account-cmb-bank", "operating", "项目分红到账 28000", {
      tags: ["分红", "副业"],
    });
  }
  if (month === "2026-02") {
    pushIfPositive(list, month, serial, 6, "creditCardExpense", 32000, "旅行", "account-cmb-credit-card", "nonCash", "春节旅行信用卡消费 32000", {
      relatedLiabilityId: "liability-cmb-credit-card",
      tags: ["信用卡", "旅行"],
    });
  }
  if (month === "2026-03") {
    pushIfPositive(list, month, serial, 20, "income", 6800, "投资收益", "account-ttfund", "operating", "基金分红到账 6800", {
      tags: ["基金分红"],
    });
  }

  if (monthIndex % 3 === 0) {
    pushIfPositive(list, month, serial, 24, "payableRecognize", 3000 + (monthIndex % 4) * 500, "应付款", "account-cmb-bank", "nonCash", "应付确认：预提下月账单", {
      relatedLiabilityId: "liability-installment",
      tags: ["应付确认", "非现金"],
    });
  }
  if (monthIndex % 4 === 1) {
    pushIfPositive(list, month, serial, 25, "receivableRecognize", 2500 + (monthIndex % 5) * 600, "应收款", "account-cmb-bank", "nonCash", "朋友欠我钱", {
      relatedAssetId: "asset-friend-receivable",
      tags: ["应收确认", "非现金"],
    });
  }
};

const addIncomeTransactions = (
  list: Transaction[],
  snapshot: HistoricalMonthlySnapshot,
  monthIndex: number,
  serial: { value: number },
): void => {
  const currentIncome = sumTransactions(list, (transaction) => transaction.type === "income");
  const remainingIncome = snapshot.income - currentIncome;
  if (remainingIncome <= 0) return;

  const bankInterest = Math.min(900 + (monthIndex % 5) * 120, remainingIncome);
  const salaryBase = Math.min(roundToHundred(remainingIncome * 0.72), remainingIncome - bankInterest);
  const consulting = Math.max(0, Math.min(roundToHundred(remainingIncome * 0.16), remainingIncome - salaryBase - bankInterest));
  const dividend = Math.max(0, Math.min(roundToHundred(remainingIncome * 0.06), remainingIncome - salaryBase - consulting - bankInterest));
  const sideIncome = remainingIncome - salaryBase - consulting - dividend - bankInterest;

  pushIfPositive(list, snapshot.month, serial, 5, "income", salaryBase, "工资薪金", "account-cmb-bank", "operating", "工资到账", {
    tags: ["主业", "稳定收入"],
  });
  pushIfPositive(list, snapshot.month, serial, 8, "income", consulting, "咨询收入", "account-wechat", "operating", "咨询收入", {
    tags: ["副业"],
  });
  pushIfPositive(list, snapshot.month, serial, 15, "income", dividend, "投资收益", "account-eastmoney", "operating", "基金/股票分红到账", {
    tags: ["投资收益", "分红"],
  });
  pushIfPositive(list, snapshot.month, serial, 28, "income", bankInterest, "利息收入", "account-cmb-bank", "operating", "银行利息到账", {
    tags: ["利息"],
  });
  pushIfPositive(list, snapshot.month, serial, 18, "income", sideIncome, "副业收入", "account-cmb-bank", "operating", "副业收入", {
    tags: ["副业"],
  });
};

const addExpenseTransactions = (
  list: Transaction[],
  snapshot: HistoricalMonthlySnapshot,
  monthIndex: number,
  serial: { value: number },
): void => {
  const currentExpenses = sumTransactions(
    list,
    (transaction) => transaction.type === "expense" || transaction.type === "creditCardExpense",
  );
  const remainingExpenses = snapshot.expenses - currentExpenses;
  if (remainingExpenses <= 0) return;

  const creditCardExpense = Math.min(roundToHundred(remainingExpenses * 0.16), 12000);
  const cashExpenses = remainingExpenses - creditCardExpense;
  const categories = [
    ["房贷利息", "居住", "account-cmb-bank", 0.1, 1],
    ["车贷利息", "车贷利息", "account-icbc-bank", monthIndex >= 24 ? 0.03 : 0.015, 3],
    ["餐饮支出", "餐饮", "account-wechat", 0.18, 6],
    ["交通出行", "交通", "account-alipay", 0.06, 7],
    ["物业水电", "居住", "account-alipay", 0.07, 9],
    ["通讯支出", "通讯", "account-alipay", 0.025, 12],
    ["学习成长", "学习成长", "account-cmb-bank", 0.1, 14],
    ["商业保险缴费", "保险", "account-cmb-bank", 0.08, 16],
    ["家庭支持", "家庭支持", "account-icbc-bank", 0.12, 18],
    ["医疗健康", "医疗健康", "account-cmb-bank", 0.05, 21],
    ["手续费/扣费", "手续费", "account-cmb-bank", 0.015, 26],
  ] as const;

  const weightsTotal = categories.reduce((sum, [, , , weight]) => sum + weight, 0);
  let allocated = 0;
  categories.forEach(([note, category, accountId, weight, day], index) => {
    const amount = index === categories.length - 1 ? cashExpenses - allocated : roundToHundred((cashExpenses * weight) / weightsTotal);
    allocated += amount;
    pushIfPositive(list, snapshot.month, serial, day, "expense", amount, category, accountId, "operating", note, {
      tags: ["日常支出"],
    });
  });

  pushIfPositive(list, snapshot.month, serial, 20, "creditCardExpense", creditCardExpense, "信用卡消费", "account-cmb-credit-card", "nonCash", "信用卡消费", {
    relatedLiabilityId: "liability-cmb-credit-card",
    tags: ["信用卡", "非现金"],
  });
};

const addOperatingCashFlowBalancer = (
  list: Transaction[],
  snapshot: HistoricalMonthlySnapshot,
  serial: { value: number },
): void => {
  const operatingNet = list
    .filter((transaction) => transaction.cashFlowType === "operating")
    .reduce((sum, transaction) => sum + getCashFlowDelta(transaction), 0);
  const diff = snapshot.operatingCF - operatingNet;

  if (diff > 0) {
    pushIfPositive(list, snapshot.month, serial, 23, "receivableCollect", diff, "应收款", "account-cmb-bank", "operating", "应收收回 / 公司报销到账", {
      relatedAssetId: "asset-reimbursement",
      tags: ["应收收回"],
    });
  } else if (diff < 0) {
    pushIfPositive(list, snapshot.month, serial, 23, "payablePay", Math.abs(diff), "应付款", "account-cmb-bank", "operating", "应付支付 / 缴纳应付款", {
      relatedLiabilityId: "liability-tax-payable",
      tags: ["应付支付"],
    });
  }
};

const addInvestingCashFlowBalancer = (
  list: Transaction[],
  snapshot: HistoricalMonthlySnapshot,
  serial: { value: number },
): void => {
  const investingNet = list
    .filter((transaction) => transaction.cashFlowType === "investing")
    .reduce((sum, transaction) => sum + getCashFlowDelta(transaction), 0);
  const diff = snapshot.investingCF - investingNet;

  if (diff > 0) {
    pushIfPositive(list, snapshot.month, serial, 27, "investmentSell", diff, "ETF", "account-htsc-etf", "investing", "卖出ETF", {
      relatedAssetId: "asset-sector-etf",
      tags: ["投资", "卖出"],
    });
  } else if (diff < 0) {
    const [broadEtf, aShare, bondFund] = allocateWeighted(Math.abs(diff), [0.45, 0.35, 0.2]);
    pushIfPositive(list, snapshot.month, serial, 11, "investmentBuy", broadEtf, "宽基ETF", "account-htsc-etf", "investing", "买入宽基ETF", {
      relatedAssetId: "asset-broad-etf",
      tags: ["投资", "ETF"],
    });
    pushIfPositive(list, snapshot.month, serial, 19, "investmentBuy", aShare, "A股股票", "account-eastmoney", "investing", "买入A股股票", {
      relatedAssetId: "asset-a-share",
      tags: ["投资", "A股"],
    });
    pushIfPositive(list, snapshot.month, serial, 22, "investmentBuy", bondFund, "债券基金", "account-ttfund", "investing", "买入债券基金", {
      relatedAssetId: "asset-bond-fund",
      tags: ["投资", "债券基金"],
    });
  }
};

const addFinancingCashFlowBalancer = (
  list: Transaction[],
  snapshot: HistoricalMonthlySnapshot,
  serial: { value: number },
): void => {
  const financingNet = list
    .filter((transaction) => transaction.cashFlowType === "financing")
    .reduce((sum, transaction) => sum + getCashFlowDelta(transaction), 0);
  const diff = snapshot.financingCF - financingNet;

  if (diff > 0) {
    pushIfPositive(list, snapshot.month, serial, 13, "liabilityIncrease", diff, "借款", "account-cmb-bank", "financing", "新增短期借款", {
      relatedLiabilityId: "liability-friend-borrowing",
      tags: ["筹资", "借款"],
    });
    return;
  }

  if (diff < 0) {
    const [mortgage, carLoan, creditCard, margin] = allocateWeighted(Math.abs(diff), [0.42, 0.2, 0.28, 0.1]);
    pushIfPositive(list, snapshot.month, serial, 2, "liabilityDecrease", mortgage, "房贷", "account-cmb-bank", "financing", "房贷本金偿还", {
      relatedLiabilityId: "liability-mortgage",
      tags: ["房贷本金", "还款"],
    });
    pushIfPositive(list, snapshot.month, serial, 4, "liabilityDecrease", carLoan, "车贷", "account-icbc-bank", "financing", "车贷本金偿还", {
      relatedLiabilityId: "liability-car-loan",
      tags: ["车贷本金", "还款"],
    });
    pushIfPositive(list, snapshot.month, serial, 17, "creditCardRepayment", creditCard, "信用卡", "account-cmb-bank", "financing", "信用卡还款", {
      counterAccountId: "account-cmb-credit-card",
      relatedLiabilityId: "liability-cmb-credit-card",
      tags: ["信用卡", "还款"],
    });
    pushIfPositive(list, snapshot.month, serial, 26, "liabilityDecrease", margin, "融资负债", "account-eastmoney", "financing", "归还融资融券负债", {
      relatedLiabilityId: "liability-margin",
      tags: ["融资融券", "还款"],
    });
  }
};

const addNonCashAndTransferSamples = (
  list: Transaction[],
  snapshot: HistoricalMonthlySnapshot,
  monthIndex: number,
  serial: { value: number },
): void => {
  const valuationAmount = 5000 + (monthIndex % 6) * 1200;
  const isGain = monthIndex % 5 !== 2;

  pushIfPositive(
    list,
    snapshot.month,
    serial,
    29,
    isGain ? "assetIncrease" : "assetDecrease",
    valuationAmount,
    monthIndex % 2 === 0 ? "A股股票" : "公募基金",
    monthIndex % 2 === 0 ? "account-eastmoney" : "account-ttfund",
    "nonCash",
    isGain ? "股票账户浮盈 / 基金净值调整" : "股票账户浮亏 / 基金净值调整",
    {
      relatedAssetId: monthIndex % 2 === 0 ? "asset-a-share" : "asset-mutual-fund",
      tags: ["估值调整", "非现金"],
    },
  );
  pushIfPositive(list, snapshot.month, serial, 28, "transfer", 8000 + (monthIndex % 4) * 1000, "账户间转账", "account-alipay", "nonCash", "支付宝转银行卡 / 账户间转账", {
    counterAccountId: "account-cmb-bank",
    tags: ["内部转账"],
  });
  pushIfPositive(list, snapshot.month, serial, 27, "transfer", 6000 + (monthIndex % 3) * 1500, "资产内部转换", "account-cmb-bank", "nonCash", "银行卡转证券账户", {
    counterAccountId: "account-eastmoney",
    tags: ["内部转换"],
  });
};

const validateMonthlySnapshot = (snapshot: HistoricalMonthlySnapshot, transactions: Transaction[]): void => {
  const income = sumTransactions(transactions, (transaction) => transaction.type === "income");
  const expenses = sumTransactions(
    transactions,
    (transaction) => transaction.type === "expense" || transaction.type === "creditCardExpense",
  );
  const operatingCF = transactions
    .filter((transaction) => transaction.cashFlowType === "operating")
    .reduce((sum, transaction) => sum + getCashFlowDelta(transaction), 0);
  const investingCF = transactions
    .filter((transaction) => transaction.cashFlowType === "investing")
    .reduce((sum, transaction) => sum + getCashFlowDelta(transaction), 0);
  const financingCF = transactions
    .filter((transaction) => transaction.cashFlowType === "financing")
    .reduce((sum, transaction) => sum + getCashFlowDelta(transaction), 0);

  if (
    income !== snapshot.income ||
    expenses !== snapshot.expenses ||
    income - expenses !== snapshot.profit ||
    operatingCF !== snapshot.operatingCF ||
    investingCF !== snapshot.investingCF ||
    financingCF !== snapshot.financingCF ||
    operatingCF + investingCF + financingCF !== snapshot.cashNetChange
  ) {
    throw new Error(`历史示例数据生成失败：${snapshot.month} 月度汇总不匹配。`);
  }
};

const generateMonthTransactions = (
  snapshot: HistoricalMonthlySnapshot,
  monthIndex: number,
): Transaction[] => {
  const transactions: Transaction[] = [];
  const serial = { value: 1 };

  addSpecialHistoricalTransactions(transactions, snapshot, monthIndex, serial);
  addIncomeTransactions(transactions, snapshot, monthIndex, serial);
  addExpenseTransactions(transactions, snapshot, monthIndex, serial);
  addOperatingCashFlowBalancer(transactions, snapshot, serial);
  addInvestingCashFlowBalancer(transactions, snapshot, serial);
  addFinancingCashFlowBalancer(transactions, snapshot, serial);
  addNonCashAndTransferSamples(transactions, snapshot, monthIndex, serial);

  validateMonthlySnapshot(snapshot, transactions);
  return transactions.sort((first, second) => {
    if (first.date !== second.date) return first.date.localeCompare(second.date);
    return first.id.localeCompare(second.id);
  });
};

export const generateHistoricalTransactions = (): Transaction[] =>
  historicalMonthlySnapshots
    .filter((snapshot) => snapshot.month !== "2026-04")
    .flatMap((snapshot, index) => generateMonthTransactions(snapshot, index));
