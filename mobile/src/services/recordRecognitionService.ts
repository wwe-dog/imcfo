export type CandidateTransactionDirection = "income" | "expense" | "transfer" | "repayment" | "unknown";

export type CandidateTransactionType =
  | "income"
  | "expense"
  | "assetIncrease"
  | "assetDecrease"
  | "liabilityIncrease"
  | "liabilityDecrease"
  | "transfer"
  | "investmentBuy"
  | "investmentSell"
  | "repayment"
  | "unknown";

export interface CandidateTransactionDraft {
  sourceText: string;
  amount: number | null;
  direction: CandidateTransactionDirection;
  transactionType: CandidateTransactionType;
  category: string | null;
  accountName: string | null;
  dateText: string | null;
  note: string | null;
  confidence: number;
  needsReview: boolean;
  impactPreview: string;
  provider?: string;
  model?: string;
}

export class RecordRecognitionError extends Error {
  code: "EMPTY_TEXT" | "AMOUNT_MISSING" | "REMOTE_CONFIG_INVALID" | "RECOGNITION_FAILED";

  constructor(code: RecordRecognitionError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

const amountPattern = /(?:¥|￥)?\s*(\d+(?:[.,]\d+)?)\s*(?:元|块|块钱)?/;
const diningPattern = /午餐|早餐|晚餐|餐|吃饭|咖啡|奶茶/;
const incomePattern = /工资|到账|收入|奖金/;
const repaymentPattern = /信用卡还款|还信用卡|还款/;
const defaultRemoteEndpoint = "";

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

interface RemoteRecognitionErrorResponse {
  code?: string;
  message?: string;
}

const getRemoteEndpoint = (): string =>
  (process?.env?.EXPO_PUBLIC_IMCFO_RECORD_AI_ENDPOINT?.trim() ?? defaultRemoteEndpoint).replace(/\/+$/, "");

const isDeepSeekEndpoint = (endpoint: string): boolean => {
  try {
    return new URL(endpoint).hostname.includes("deepseek.com");
  } catch {
    return false;
  }
};

const getAmount = (text: string): number | null => {
  const match = text.match(amountPattern);
  if (!match) return null;
  const amount = Number(match[1].replace(",", "."));
  return Number.isFinite(amount) ? amount : null;
};

const getAccountName = (text: string): string | null => {
  if (text.includes("支付宝")) return "支付宝";
  if (text.includes("微信")) return "微信";
  if (text.includes("招商银行卡") || text.includes("招商银行")) return "招商银行";
  if (text.includes("银行卡") || text.includes("银行")) return "银行卡";
  return null;
};

const getDateText = (text: string): string | null => {
  if (text.includes("今天")) return "今天";
  if (text.includes("昨天")) return "昨天";
  if (text.includes("明天")) return "明天";
  return null;
};

const getNote = (text: string): string | null => {
  if (text.includes("午餐")) return "午餐";
  if (text.includes("早餐")) return "早餐";
  if (text.includes("晚餐")) return "晚餐";
  if (text.includes("咖啡")) return "咖啡";
  if (text.includes("奶茶")) return "奶茶";
  if (text.includes("工资")) return "工资到账";
  if (text.includes("奖金")) return "奖金";
  if (repaymentPattern.test(text)) return "信用卡还款";
  return null;
};

const getBaseDraft = (sourceText: string): CandidateTransactionDraft => ({
  sourceText,
  amount: getAmount(sourceText),
  direction: "unknown",
  transactionType: "unknown",
  category: null,
  accountName: getAccountName(sourceText),
  dateText: getDateText(sourceText),
  note: getNote(sourceText),
  confidence: 0.42,
  needsReview: true,
  impactPreview: "需要确认交易方向和会计影响",
});

export const recognizeByLocalRules = (inputText: string): CandidateTransactionDraft => {
  const sourceText = inputText.trim();
  if (!sourceText) {
    throw new RecordRecognitionError("EMPTY_TEXT", "请先完成语音转写");
  }

  const draft = getBaseDraft(sourceText);

  if (repaymentPattern.test(sourceText)) {
    draft.direction = "repayment";
    draft.transactionType = "repayment";
    draft.category = "信用卡还款";
    draft.confidence = draft.amount ? 0.86 : 0.62;
    draft.impactPreview = "负债减少，现金减少，筹资活动现金流出";
  } else if (diningPattern.test(sourceText)) {
    draft.direction = "expense";
    draft.transactionType = "expense";
    draft.category = "餐饮";
    draft.confidence = draft.amount ? 0.92 : 0.66;
    draft.impactPreview = "费用增加，现金减少，经营活动现金流出";
  } else if (incomePattern.test(sourceText)) {
    draft.direction = "income";
    draft.transactionType = "income";
    draft.category = sourceText.includes("工资") ? "工资薪金" : "其他收入";
    draft.confidence = draft.amount ? 0.9 : 0.65;
    draft.impactPreview = "收入增加，资产增加，经营活动现金流入";
  }

  draft.needsReview =
    draft.amount === null ||
    draft.direction === "unknown" ||
    draft.transactionType === "unknown" ||
    draft.category === null ||
    draft.accountName === null;

  return draft;
};

const normalizeRemoteDraft = (sourceText: string, payload: unknown): CandidateTransactionDraft => {
  const draft = payload as Partial<CandidateTransactionDraft>;
  const amount = typeof draft.amount === "number" && Number.isFinite(draft.amount) ? draft.amount : null;
  let direction: CandidateTransactionDirection =
    draft.direction === "income" ||
    draft.direction === "expense" ||
    draft.direction === "transfer" ||
    draft.direction === "repayment" ||
    draft.direction === "unknown"
      ? draft.direction
      : "unknown";
  const transactionType: CandidateTransactionType =
    draft.transactionType === "income" ||
    draft.transactionType === "expense" ||
    draft.transactionType === "assetIncrease" ||
    draft.transactionType === "assetDecrease" ||
    draft.transactionType === "liabilityIncrease" ||
    draft.transactionType === "liabilityDecrease" ||
    draft.transactionType === "transfer" ||
    draft.transactionType === "investmentBuy" ||
    draft.transactionType === "investmentSell" ||
    draft.transactionType === "repayment" ||
    draft.transactionType === "unknown"
      ? draft.transactionType
      : "unknown";
  if (transactionType === "repayment" && direction === "expense") {
    direction = "repayment";
  }
  const confidence = typeof draft.confidence === "number" ? Math.max(0, Math.min(1, draft.confidence)) : 0.3;
  const category =
    typeof draft.category === "string" && draft.category.trim()
      ? draft.category.trim()
      : transactionType === "repayment"
        ? "信用卡还款"
        : null;
  const accountName = typeof draft.accountName === "string" && draft.accountName.trim() ? draft.accountName.trim() : null;

  return {
    sourceText,
    amount,
    direction,
    transactionType,
    category,
    accountName,
    dateText: typeof draft.dateText === "string" && draft.dateText.trim() ? draft.dateText.trim() : null,
    note: typeof draft.note === "string" && draft.note.trim() ? draft.note.trim() : null,
    confidence,
    needsReview:
      Boolean(draft.needsReview) ||
      amount === null ||
      direction === "unknown" ||
      transactionType === "unknown" ||
      category === null ||
      accountName === null,
    impactPreview:
      typeof draft.impactPreview === "string" && draft.impactPreview.trim()
        ? draft.impactPreview.trim()
        : "需要确认交易方向和会计影响",
    provider: typeof draft.provider === "string" ? draft.provider : undefined,
    model: typeof draft.model === "string" ? draft.model : undefined,
  };
};

export const recognizeByRemoteModel = async (inputText: string): Promise<CandidateTransactionDraft> => {
  const sourceText = inputText.trim();
  if (!sourceText) {
    throw new RecordRecognitionError("EMPTY_TEXT", "请先完成语音转写");
  }

  const endpoint = getRemoteEndpoint();
  if (!endpoint) {
    throw new RecordRecognitionError("REMOTE_CONFIG_INVALID", "远程识别服务尚未配置。");
  }

  if (isDeepSeekEndpoint(endpoint)) {
    throw new RecordRecognitionError("REMOTE_CONFIG_INVALID", "移动端不能直接调用 DeepSeek，请配置自己的 SCF Function URL。");
  }

  try {
    const response = await fetch(endpoint, {
      body: JSON.stringify({
        locale: "zh-CN",
        text: sourceText,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const payload = (await response.json()) as CandidateTransactionDraft | RemoteRecognitionErrorResponse;

    if (!response.ok || "code" in payload) {
      const message = "message" in payload && payload.message ? payload.message : "暂时无法识别这段文本，请稍后重试";
      throw new RecordRecognitionError("RECOGNITION_FAILED", message);
    }

    return normalizeRemoteDraft(sourceText, payload);
  } catch (error) {
    if (error instanceof RecordRecognitionError) {
      throw error;
    }

    throw new RecordRecognitionError("RECOGNITION_FAILED", "暂时无法识别这段文本，请稍后重试");
  }
};

export const recognizeTransactionDraft = async (inputText: string): Promise<CandidateTransactionDraft> => {
  const localDraft = recognizeByLocalRules(inputText);
  if (localDraft.confidence >= 0.9 && !localDraft.needsReview) {
    return localDraft;
  }

  const hasLocalSignal =
    localDraft.direction !== "unknown" ||
    localDraft.transactionType !== "unknown" ||
    localDraft.category !== null ||
    localDraft.accountName !== null ||
    localDraft.note !== null;

  if (getRemoteEndpoint()) {
    try {
      return await recognizeByRemoteModel(inputText);
    } catch (error) {
      if (localDraft.amount !== null || hasLocalSignal) {
        return localDraft;
      }

      throw error;
    }
  }

  if (localDraft.amount === null) {
    if (hasLocalSignal) return localDraft;
    throw new RecordRecognitionError("AMOUNT_MISSING", "没有识别到金额，请手动修改");
  }

  return localDraft;
};
