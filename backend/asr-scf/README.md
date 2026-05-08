# IMCFO ASR SCF

Tencent Cloud SCF proxy for IMCFO first-stage speech transcription.

This backend only does:

- accept a short mobile recording payload
- call Tencent Cloud ASR `SentenceRecognition`
- return transcription text

It does not do AI transaction recognition, candidate Draft generation, bookkeeping, storage writes, or accounting/report changes.

## Runtime

- Tencent Cloud SCF
- Node.js 18 or later
- Handler / execution method: `index.main_handler`
- Public HTTP entry: SCF Function URL root path
- No external npm runtime dependency is required

The implementation uses only Node.js built-in modules:

- `https`
- `crypto`

## Environment Variables

Required in Tencent Cloud SCF:

- `TENCENT_SECRET_ID`
- `TENCENT_SECRET_KEY`

Optional:

- `TENCENT_ASR_ENGINE`, defaults to `16k_zh_dialect`
- `TENCENT_ASR_REGION`, defaults to `ap-guangzhou`
- `TENCENT_ASR_HOTWORDS`
- `CORS_ALLOW_ORIGIN`, defaults to `*`

Never put Tencent Cloud secrets in the mobile app.

## Request

Function URL mode:

```text
POST /
```

Body:

```json
{
  "audioBase64": "...",
  "format": "m4a",
  "durationMs": 12000
}
```

Allowed formats:

- `m4a`
- `wav`
- `mp3`
- `aac`
- `ogg-opus`
- `pcm`

Limits:

- `durationMs` must be positive and no greater than `60000`
- decoded audio must be no greater than `4MB`

## Success Response

```json
{
  "text": "今天午餐 32 元，用支付宝",
  "durationMs": 12000,
  "provider": "tencent-asr",
  "engine": "16k_zh_dialect",
  "requestId": "..."
}
```

## Error Response

```json
{
  "code": "ASR_PROVIDER_ERROR",
  "message": "语音转写服务暂不可用，请稍后再试。"
}
```

Expected error codes:

- `AUDIO_TOO_LARGE`
- `ASR_EMPTY_RESULT`
- `ASR_PROVIDER_ERROR`

Invalid audio such as `audioBase64: "test"` should return this proxy's JSON error shape, not a raw SCF event echo.

## Local Check

```powershell
cd D:\imcfo\backend\asr-scf
npm.cmd test
```

The local tests validate request parsing, input limits, handler exports, and structured error responses. They do not require Tencent Cloud secrets.

## Tencent Cloud Console Deploy

1. Open Tencent Cloud SCF console.
2. Create or select an event function using Node.js 18.
3. Region: `ap-guangzhou`, unless your Tencent ASR setup requires another region.
4. Upload the no-deps zip package.
5. Execution method / handler:

```text
index.main_handler
```

6. Set environment variables listed above.
7. Enable SCF Function URL.
8. Use the Function URL root path in the mobile app.

If `POST` returns a raw SCF event object, the running function is still Tencent's default event echo template or the wrong code/handler is configured.

## Zip Structure

The upload zip root must directly contain:

```text
index.js
package.json
package-lock.json
README.md
serverless.yml
test-local.js
```

Do not include:

- `node_modules/`
- `.upload/`
- `.upload-source/`
- `.probe-upload/`
- `.no-deps-upload/`
- an extra `asr-scf/` directory wrapper
- old zip files

## Function URL Smoke Test

```powershell
curl.exe -i -X POST "https://your-function-url" `
  -H "Content-Type: application/json" `
  --data "{\"audioBase64\":\"test\",\"format\":\"m4a\",\"durationMs\":1000}"
```

Expected result after the ASR proxy code is deployed:

- not a raw SCF event echo
- JSON body with `code` and `message`

Real mobile recordings should return the success response shape with `text`.
