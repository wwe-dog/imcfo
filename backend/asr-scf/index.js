"use strict";

const crypto = require("crypto");
const https = require("https");

const allowedFormats = new Set(["m4a", "aac", "mp3", "wav", "ogg-opus", "pcm"]);
const maxAudioBytes = 4 * 1024 * 1024;
const maxDurationMs = 60_000;
const service = "asr";
const host = "asr.tencentcloudapi.com";
const action = "SentenceRecognition";
const version = "2019-06-14";
const defaultRegion = "ap-guangzhou";
const defaultEngine = "16k_zh_dialect";
const defaultHotwords =
  "\u652f\u4ed8\u5b9d|11,\u5fae\u4fe1|11,\u5de5\u8d44|10,\u4fe1\u7528\u5361|10,\u82b1\u5457|10,\u516c\u79ef\u91d1|10,\u623f\u79df|8,\u5348\u9910|8";

const messages = {
  emptyAudio: "\u97f3\u9891\u5185\u5bb9\u4e3a\u7a7a\u3002",
  invalidJson: "\u8bf7\u6c42\u4f53\u4e0d\u662f\u6709\u6548 JSON\u3002",
  invalidDuration: "\u5f55\u97f3\u65f6\u957f\u8d85\u8fc7\u9650\u5236\u3002",
  invalidFormat: "\u97f3\u9891\u683c\u5f0f\u4e0d\u652f\u6301\u3002",
  missingConfig: "\u8bed\u97f3\u8f6c\u5199\u670d\u52a1\u672a\u5b8c\u6210\u914d\u7f6e\u3002",
  providerUnavailable: "\u8bed\u97f3\u8f6c\u5199\u670d\u52a1\u6682\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002",
  noResult: "\u6ca1\u6709\u8bc6\u522b\u5230\u6709\u6548\u5185\u5bb9\uff0c\u8bf7\u91cd\u65b0\u5f55\u97f3\u3002",
  tooLarge: "\u97f3\u9891\u6587\u4ef6\u8d85\u8fc7\u9650\u5236\u3002",
};

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

  if (typeof event.body === "object") {
    return event.body;
  }

  const rawBody = event.isBase64Encoded ? Buffer.from(String(event.body), "base64").toString("utf8") : String(event.body);

  try {
    return JSON.parse(rawBody);
  } catch (_error) {
    throw new RequestError("ASR_PROVIDER_ERROR", messages.invalidJson, 400);
  }
};

const validateInput = ({ audioBase64, durationMs, format }) => {
  if (!allowedFormats.has(format)) {
    throw new RequestError("ASR_PROVIDER_ERROR", messages.invalidFormat, 400);
  }

  if (!Number.isFinite(durationMs) || durationMs <= 0 || durationMs > maxDurationMs) {
    throw new RequestError("AUDIO_TOO_LARGE", messages.invalidDuration, 400);
  }

  if (typeof audioBase64 !== "string" || audioBase64.trim().length === 0) {
    throw new RequestError("ASR_EMPTY_RESULT", messages.emptyAudio, 400);
  }

  const audioBuffer = Buffer.from(audioBase64, "base64");
  if (audioBuffer.length === 0) {
    throw new RequestError("ASR_EMPTY_RESULT", messages.emptyAudio, 400);
  }

  if (audioBuffer.length > maxAudioBytes) {
    throw new RequestError("AUDIO_TOO_LARGE", messages.tooLarge, 400);
  }

  return { audioBuffer };
};

const sha256Hex = (value) => crypto.createHash("sha256").update(value, "utf8").digest("hex");

const hmac = (key, value, encoding) => crypto.createHmac("sha256", key).update(value, "utf8").digest(encoding);

const utcDate = (timestamp) => new Date(timestamp * 1000).toISOString().slice(0, 10);

const buildAuthorization = ({ payload, region, secretId, secretKey, timestamp }) => {
  const date = utcDate(timestamp);
  const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\n`;
  const signedHeaders = "content-type;host";
  const hashedPayload = sha256Hex(payload);
  const canonicalRequest = ["POST", "/", "", canonicalHeaders, signedHeaders, hashedPayload].join("\n");
  const credentialScope = `${date}/${service}/tc3_request`;
  const stringToSign = ["TC3-HMAC-SHA256", timestamp, credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const secretDate = hmac(`TC3${secretKey}`, date);
  const secretService = hmac(secretDate, service);
  const secretSigning = hmac(secretService, "tc3_request");
  const signature = hmac(secretSigning, stringToSign, "hex");

  return {
    authorization: `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    headers: {
      Authorization: `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      "Content-Type": "application/json; charset=utf-8",
      Host: host,
      "X-TC-Action": action,
      "X-TC-Region": region,
      "X-TC-Timestamp": String(timestamp),
      "X-TC-Version": version,
    },
  };
};

const postTencentAsr = ({ payload, region, secretId, secretKey }) =>
  new Promise((resolve, reject) => {
    const requestBody = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000);
    const { headers } = buildAuthorization({
      payload: requestBody,
      region,
      secretId,
      secretKey,
      timestamp,
    });

    const request = https.request(
      {
        headers: {
          ...headers,
          "Content-Length": Buffer.byteLength(requestBody),
        },
        hostname: host,
        method: "POST",
        path: "/",
        timeout: 25_000,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          try {
            const data = raw ? JSON.parse(raw) : {};
            resolve({ data, statusCode: response.statusCode || 0 });
          } catch (error) {
            reject(new Error(`Tencent ASR returned invalid JSON: ${error.message}`));
          }
        });
      },
    );

    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy(new Error("Tencent ASR request timed out."));
    });
    request.write(requestBody);
    request.end();
  });

const createAsrPayload = ({ audioBase64, format }) => ({
  ConvertNumMode: 1,
  Data: audioBase64,
  EngSerViceType: process.env.TENCENT_ASR_ENGINE || defaultEngine,
  FilterModal: 1,
  FilterPunc: 0,
  HotwordList: process.env.TENCENT_ASR_HOTWORDS || defaultHotwords,
  SourceType: 1,
  UsrAudioKey: `imcfo-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
  VoiceFormat: format,
  WordInfo: 0,
});

const handleRequest = async (event) => {
  const method = event?.httpMethod || event?.requestContext?.httpMethod || event?.requestContext?.http?.method;
  if (method === "OPTIONS") {
    return jsonResponse(204, {});
  }

  const startedAt = Date.now();
  let audioBytes = 0;

  try {
    const body = parseBody(event);
    const format = String(body.format || "").toLowerCase();
    const durationMs = Number(body.durationMs);
    const { audioBuffer } = validateInput({
      audioBase64: body.audioBase64,
      durationMs,
      format,
    });
    audioBytes = audioBuffer.length;

    const secretId = process.env.TENCENT_SECRET_ID;
    const secretKey = process.env.TENCENT_SECRET_KEY;
    if (!secretId || !secretKey) {
      throw new RequestError("ASR_PROVIDER_ERROR", messages.missingConfig, 500);
    }

    const region = process.env.TENCENT_ASR_REGION || defaultRegion;
    const engine = process.env.TENCENT_ASR_ENGINE || defaultEngine;
    const payload = createAsrPayload({
      audioBase64: body.audioBase64,
      format,
    });
    const { data, statusCode } = await postTencentAsr({
      payload,
      region,
      secretId,
      secretKey,
    });

    const response = data.Response || {};
    if (response.Error || statusCode < 200 || statusCode >= 300) {
      console.error("asr_provider_error", {
        audioBytes,
        elapsedMs: Date.now() - startedAt,
        providerCode: response.Error?.Code || "HTTP_ERROR",
        requestId: response.RequestId || null,
        statusCode,
      });
      return jsonResponse(502, {
        code: "ASR_PROVIDER_ERROR",
        message: response.Error?.Message || messages.providerUnavailable,
      });
    }

    const text = String(response.Result || "").trim();
    if (!text) {
      console.info("asr_empty_result", {
        audioBytes,
        elapsedMs: Date.now() - startedAt,
        requestId: response.RequestId || null,
      });
      return jsonResponse(422, {
        code: "ASR_EMPTY_RESULT",
        message: messages.noResult,
      });
    }

    console.info("asr_request_success", {
      audioBytes,
      elapsedMs: Date.now() - startedAt,
      requestId: response.RequestId || null,
    });

    return jsonResponse(200, {
      durationMs,
      engine,
      provider: "tencent-asr",
      requestId: response.RequestId || "",
      text,
    });
  } catch (error) {
    if (error instanceof RequestError) {
      console.info("asr_request_rejected", {
        code: error.code,
        elapsedMs: Date.now() - startedAt,
      });
      return jsonResponse(error.statusCode, {
        code: error.code,
        message: error.message,
      });
    }

    console.error("asr_request_failed", {
      audioBytes,
      elapsedMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return jsonResponse(500, {
      code: "ASR_PROVIDER_ERROR",
      message: messages.providerUnavailable,
    });
  }
};

exports.main = handleRequest;
exports.main_handler = handleRequest;
