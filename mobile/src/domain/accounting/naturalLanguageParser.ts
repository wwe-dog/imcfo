import type { CashFlowType, TransactionType } from "../models";

export type NaturalLanguageTransactionType = Extract<
  TransactionType,
  | "income"
  | "expense"
  | "assetIncrease"
  | "assetDecrease"
  | "liabilityIncrease"
  | "liabilityDecrease"
  | "investmentBuy"
  | "investmentSell"
  | "creditCardExpense"
  | "creditCardRepayment"
>;

export interface ParsedTransactionDraft {
  rawText: string;
  type: NaturalLanguageTransactionType;
  amount: number | null;
  category: string;
  date: string;
  cashFlowType: CashFlowType;
  cashFlowLabel: string;
  impactText: string;
  warning?: string;
}

interface TransactionTypeMeta {
  defaultCategory: string;
  cashFlowType: CashFlowType;
  cashFlowLabel: string;
  impactText: string;
}

export const transactionTypeMeta: Record<NaturalLanguageTransactionType, TransactionTypeMeta> = {
  income: {
    defaultCategory: "收入",
    cashFlowType: "operating",
    cashFlowLabel: "经营活动现金流入",
    impactText: "收入增加，现金增加，计入经营活动现金流入。",
  },
  expense: {
    defaultCategory: "日常支出",
    cashFlowType: "operating",
    cashFlowLabel: "经营活动现金流出",
    impactText: "费用增加，现金减少，计入经营活动现金流出。",
  },
  assetIncrease: {
    defaultCategory: "资产增加",
    cashFlowType: "nonCash",
    cashFlowLabel: "非现金变动",
    impactText: "资产增加，暂不自动确认为收入。",
  },
  assetDecrease: {
    defaultCategory: "资产减少",
    cashFlowType: "nonCash",
    cashFlowLabel: "非现金变动",
    impactText: "资产减少，暂不自动确认为费用。",
  },
  liabilityIncrease: {
    defaultCategory: "借款",
    cashFlowType: "financing",
    cashFlowLabel: "筹资活动现金流入",
    impactText: "负债增加，通常对应现金增加，计入筹资活动现金流入。",
  },
  liabilityDecrease: {
    defaultCategory: "还款",
    cashFlowType: "financing",
    cashFlowLabel: "筹资活动现金流出",
    impactText: "负债减少，现金减少，计入债务偿还现金流出。",
  },
  investmentBuy: {
    defaultCategory: "投资资产",
    cashFlowType: "investing",
    cashFlowLabel: "投资活动现金流出",
    impactText: "投资资产增加，现金减少，不直接影响利润。",
  },
  investmentSell: {
    defaultCategory: "投资资产",
    cashFlowType: "investing",
    cashFlowLabel: "投资活动现金流入",
    impactText: "投资资产减少，现金增加，V0.1 暂不自动计算投资收益。",
  },
  creditCardExpense: {
    defaultCategory: "信用卡",
    cashFlowType: "nonCash",
    cashFlowLabel: "非现金变动",
    impactText: "费用增加，负债增加，不产生现金流。",
  },
  creditCardRepayment: {
    defaultCategory: "信用卡",
    cashFlowType: "financing",
    cashFlowLabel: "筹资活动现金流出",
    impactText: "负债减少，现金减少，计入债务偿还现金流出。",
  },
};

const chineseDigitMap: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

const chineseUnitMap: Record<string, number> = {
  十: 10,
  百: 100,
  千: 1000,
  万: 10000,
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseChineseNumber = (value: string): number | null => {
  let total = 0;
  let currentNumber = 0;
  let matched = false;

  for (const char of value) {
    if (char in chineseDigitMap) {
      currentNumber = chineseDigitMap[char];
      matched = true;
      continue;
    }

    const unit = chineseUnitMap[char];
    if (unit) {
      total += (currentNumber || 1) * unit;
      currentNumber = 0;
      matched = true;
    }
  }

  if (!matched) return null;
  return total + currentNumber;
};

const extractAmount = (text: string): number | null => {
  const withUnit = text.match(/(\d+(?:[.,]\d+)?)\s*(?:元|块钱|块)/);
  const numericMatch = withUnit ?? text.match(/(\d+(?:[.,]\d+)?)/);
  if (numericMatch) {
    const amount = Number(numericMatch[1].replace(",", "."));
    return Number.isFinite(amount) ? amount : null;
  }

  const chineseMatch = text.match(/([零一二两三四五六七八九十百千万]+)\s*(?:元|块钱|块)?/);
  if (!chineseMatch) return null;

  return parseChineseNumber(chineseMatch[1]);
};

const extractDate = (text: string, baseDate: Date): string => {
  const date = new Date(baseDate);

  if (text.includes("前天")) {
    date.setDate(date.getDate() - 2);
    return formatDate(date);
  }

  if (text.includes("昨天")) {
    date.setDate(date.getDate() - 1);
    return formatDate(date);
  }

  return formatDate(date);
};

const detectType = (
  text: string,
): { type: NaturalLanguageTransactionType; warning?: string } => {
  if (/朋友还我|别人还我/.test(text)) {
    return {
      type: "income",
      warning: "这句话可能表示收入，也可能表示应收款收回，请确认或手动修改后再入账。",
    };
  }

  if (/还信用卡|信用卡还款/.test(text)) return { type: "creditCardRepayment" };
  if (/信用卡/.test(text) && /消费|刷卡|买了|支付|付了/.test(text)) return { type: "creditCardExpense" };
  if (/买基金|买股票|买理财/.test(text)) return { type: "investmentBuy" };
  if (/卖基金|卖股票|赎回理财/.test(text)) return { type: "investmentSell" };
  if (/借入|借了我|贷款到账/.test(text)) return { type: "liabilityIncrease" };
  if (/还借款|还贷款|还款/.test(text)) return { type: "liabilityDecrease" };
  if (/工资|到账|收到|收入/.test(text)) return { type: "income" };
  if (/花了|买了|支付|付了|消费/.test(text)) return { type: "expense" };

  return {
    type: "expense",
    warning: "暂时没有明确识别交易类型，已按日常支出生成草稿，请手动确认。",
  };
};

const detectCategory = (text: string, type: NaturalLanguageTransactionType): string => {
  if (/吃饭|午饭|晚饭|早餐|餐|外卖/.test(text)) return "餐饮";
  if (/打车|地铁|公交|加油|交通/.test(text)) return "交通";
  if (/房租|租房/.test(text)) return "居住";
  if (/课程|书|学习|考试/.test(text)) return "学习成长";
  if (/医院|药|看病/.test(text)) return "医疗健康";
  if (/游戏|电影|娱乐/.test(text)) return "娱乐";
  if (/工资/.test(text)) return "工资薪金";
  if (/基金|股票|理财/.test(text)) return "投资资产";
  if (/信用卡/.test(text)) return "信用卡";
  if (/朋友还我|别人还我/.test(text)) return "待确认收入 / 应收款";

  return transactionTypeMeta[type].defaultCategory;
};

export const parseNaturalLanguageTransaction = (
  rawText: string,
  baseDate = new Date(),
): ParsedTransactionDraft => {
  const text = rawText.trim();
  const amount = extractAmount(text);
  const detectedType = detectType(text);
  const meta = transactionTypeMeta[detectedType.type];

  return {
    rawText,
    type: detectedType.type,
    amount,
    category: detectCategory(text, detectedType.type),
    date: extractDate(text, baseDate),
    cashFlowType: meta.cashFlowType,
    cashFlowLabel: meta.cashFlowLabel,
    impactText: detectedType.warning ? "这句话可能有多种会计含义，请确认或手动修改后再入账。" : meta.impactText,
    warning: detectedType.warning,
  };
};
