"use strict";

const assert = require("node:assert/strict");
const { main, main_handler } = require("./index");

const invoke = (body, extraEvent = {}) =>
  main_handler({
    body: JSON.stringify(body),
    httpMethod: "POST",
    isBase64Encoded: false,
    ...extraEvent,
  });

(async () => {
  assert.equal(typeof main, "function");
  assert.equal(typeof main_handler, "function");

  const objectBody = await main_handler({
    body: {
      audioBase64: "",
      durationMs: 1000,
      format: "m4a",
    },
    httpMethod: "POST",
  });
  assert.equal(objectBody.statusCode, 400);
  assert.match(objectBody.body, /ASR_EMPTY_RESULT/);

  const encodedBody = await main_handler({
    body: Buffer.from(
      JSON.stringify({
        audioBase64: "",
        durationMs: 1000,
        format: "m4a",
      }),
    ).toString("base64"),
    httpMethod: "POST",
    isBase64Encoded: true,
  });
  assert.equal(encodedBody.statusCode, 400);
  assert.match(encodedBody.body, /ASR_EMPTY_RESULT/);

  const empty = await invoke({
    audioBase64: "",
    durationMs: 1000,
    format: "m4a",
  });
  assert.equal(empty.statusCode, 400);
  assert.match(empty.body, /ASR_EMPTY_RESULT/);

  const longAudio = await invoke({
    audioBase64: Buffer.from("fake").toString("base64"),
    durationMs: 61_000,
    format: "m4a",
  });
  assert.equal(longAudio.statusCode, 400);
  assert.match(longAudio.body, /AUDIO_TOO_LARGE/);

  const badFormat = await invoke({
    audioBase64: Buffer.from("fake").toString("base64"),
    durationMs: 1000,
    format: "webm",
  });
  assert.equal(badFormat.statusCode, 400);
  assert.match(badFormat.body, /ASR_PROVIDER_ERROR/);

  const missingSecret = await invoke({
    audioBase64: Buffer.from("fake").toString("base64"),
    durationMs: 1000,
    format: "m4a",
  });
  assert.equal(missingSecret.statusCode, 500);
  assert.match(missingSecret.body, /ASR_PROVIDER_ERROR/);

  const options = await main_handler({
    body: "",
    httpMethod: "OPTIONS",
  });
  assert.equal(options.statusCode, 204);

  console.log("asr-scf local validation tests passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
