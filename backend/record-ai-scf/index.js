"use strict";

const https = require("https");

const maxTextLength = 800;

class RequestError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const jsonResponse = (statusCode, body) => ({
  body: JSON.stringify(body),
  headers: {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Origin": process.env.CORS_ALLOW_ORIGIN || "*",
    "Content-Type": "application/json; charset=utf-8",
  },
  statusCode,
});

const parseBody = (event) => {
  if (!event || event.body == null || event.body === "") return {};
  if (typeof event.body === "object") return event.body;
  const rawBody = event.isBase64Encoded ? Buffer.from(String(event.body), "base64").toString("utf8") : String(event.body);
  try {
    return JSON.parse(rawBody);
  } catch (_error) {
    throw new RequestError("INVALID_JSON", "请求体不是有效 JSON。");
  }
};

const normalizeDraft = (text, payload) => {
  const draft = payload && typeof payload === "object" ? payload : {};
  const amount = typeof draft.amount === "number" && Number.isFinite(draft.amount) ? draft.amount : null;
  const transactionType =
    [
      "income",
      "expense",
      "assetIncrease",
      "assetDecrease",
      "liabilityIncrease",
      "liabilityDecrease",
      "transfer",
      "investmentBuy",
      "investmentSell",
      "repayment",
      "unknown",
    ].includes(draft.transactionType)
      ? draft.transactionType
      : "unknown";
  const direction =
    ["income", "expense", "transfer", "repayment", "unknown"].includes(draft.direction)
      ? draft.direction
      : transactionType === "repayment"
        ? "repayment"
        : "unknown";
  const category = typeof draft.category === "string" && draft.category.trim() ? draft.category.trim() : null;
  const accountName = typeof draft.accountName === "string" && draft.accountName.trim() ? draft.accountName.trim() : null;
  const confidence = typeof draft.confidence === "number" ? Math.max(0, Math.min(1, draft.confidence)) : 0.3;

  return {
    sourceText: text,
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
    provider: process.env.RECORD_AI_PROVIDER || "openai-compatible",
    model: process.env.RECORD_AI_MODEL || "default",
  };
};

const postJson = (url, apiKey, payload) =>
  new Promise((resolve, reject) => {
    const target = new URL(url);
    const body = JSON.stringify(payload);
    const request = https.request(
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(body),
          "Content-Type": "application/json",
        },
        hostname: target.hostname,
        method: "POST",
        path: `${target.pathname}${target.search}`,
        port: target.port || 443,
        timeout: 25_000,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          const data = raw ? JSON.parse(raw) : {};
          resolve({ data, statusCode: response.statusCode || 0 });
        });
      },
    );
    request.on("error", reject);
    request.on("timeout", () => request.destroy(new Error("Record AI request timed out.")));
    request.write(body);
    request.end();
  });

const buildPrompt = (text, context) =>
  [
    "你是 IMCFO 的交易识别服务。只输出 JSON，不要输出解释。",
    "JSON 字段必须是 sourceText, amount, direction, transactionType, category, accountName, dateText, note, confidence, needsReview, impactPreview。",
    "direction 只能是 income, expense, transfer, repayment, unknown。",
    "transactionType 只能是 income, expense, assetIncrease, assetDecrease, liabilityIncrease, liabilityDecrease, transfer, investmentBuy, investmentSell, repayment, unknown。",
    `用户文本: ${text}`,
    `上下文: ${JSON.stringify(context || {})}`,
  ].join("\n");

const callModel = async ({ context, text }) => {
  const baseUrl = (process.env.RECORD_AI_BASE_URL || "").replace(/\/+$/, "");
  const apiKey = process.env.RECORD_AI_API_KEY;
  const model = process.env.RECORD_AI_MODEL;
  if (!baseUrl || !apiKey || !model) {
    throw new RequestError("MISSING_CONFIG", "交易识别服务未完成配置。", 500);
  }

  const { data, statusCode } = await postJson(`${baseUrl}/chat/completions`, apiKey, {
    model,
    temperature: 0.1,
    messages: [
      { role: "system", content: "You extract personal finance transactions and return strict JSON only." },
      { role: "user", content: buildPrompt(text, context) },
    ],
  });

  if (statusCode < 200 || statusCode >= 300) {
    throw new RequestError("PROVIDER_ERROR", "交易识别服务暂时不可用。", 502);
  }

  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (typeof content !== "string") {
    throw new RequestError("PROVIDER_ERROR", "交易识别服务返回了无效结果。", 502);
  }

  return JSON.parse(content.replace(/^```json\s*/i, "").replace(/```$/i, "").trim());
};

const handleRequest = async (event) => {
  const method = event && (event.httpMethod || (event.requestContext && event.requestContext.http && event.requestContext.http.method));
  if (method === "OPTIONS") return jsonResponse(204, {});

  try {
    const body = parseBody(event);
    const text = String(body.text || "").trim();
    if (!text) throw new RequestError("EMPTY_TEXT", "请提供需要识别的文本。");
    if (text.length > maxTextLength) throw new RequestError("TEXT_TOO_LONG", "文本超过识别长度限制。");

    const providerPayload = await callModel({ context: body.context, text });
    return jsonResponse(200, normalizeDraft(text, providerPayload));
  } catch (error) {
    if (error instanceof RequestError) {
      return jsonResponse(error.statusCode, { code: error.code, message: error.message });
    }
    console.error("record_ai_error", { message: error && error.message });
    return jsonResponse(502, { code: "RECOGNITION_FAILED", message: "暂时无法识别这段文本，请稍后重试。" });
  }
};

exports.main = handleRequest;
exports.handler = handleRequest;
exports.handleRequest = handleRequest;
