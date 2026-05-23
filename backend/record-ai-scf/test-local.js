"use strict";

const assert = require("assert");
const { handleRequest } = require("./index");

(async () => {
  const missingText = await handleRequest({ httpMethod: "POST", body: JSON.stringify({ text: "" }) });
  assert.strictEqual(missingText.statusCode, 400);

  const previousBaseUrl = process.env.RECORD_AI_BASE_URL;
  const previousApiKey = process.env.RECORD_AI_API_KEY;
  const previousModel = process.env.RECORD_AI_MODEL;
  delete process.env.RECORD_AI_BASE_URL;
  delete process.env.RECORD_AI_API_KEY;
  delete process.env.RECORD_AI_MODEL;

  const missingConfig = await handleRequest({
    httpMethod: "POST",
    body: JSON.stringify({ locale: "zh-CN", text: "今天午餐花了 32 元" }),
  });
  assert.strictEqual(missingConfig.statusCode, 500);

  process.env.RECORD_AI_BASE_URL = previousBaseUrl;
  process.env.RECORD_AI_API_KEY = previousApiKey;
  process.env.RECORD_AI_MODEL = previousModel;

  console.log("record-ai local contract tests passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
