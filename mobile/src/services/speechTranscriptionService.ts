import { File } from "expo-file-system";

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

const maxDurationMs = 30_000;
const minDurationMs = 650;
const maxAudioBytes = 2 * 1024 * 1024;
const defaultEndpoint = "";

export type SpeechTranscriptionErrorCode =
  | "CONFIG_MISSING"
  | "NETWORK_ERROR"
  | "AUDIO_TOO_SHORT"
  | "AUDIO_TOO_LARGE"
  | "ASR_EMPTY_RESULT"
  | "ASR_PROVIDER_ERROR";

export interface SpeechTranscriptionInput {
  durationMs: number;
  uri: string;
}

export interface SpeechTranscriptionResult {
  durationMs: number;
  engine?: string;
  provider: "tencent-asr";
  requestId?: string;
  text: string;
}

interface AsrErrorResponse {
  code?: SpeechTranscriptionErrorCode;
  message?: string;
}

interface AsrSuccessResponse extends SpeechTranscriptionResult {
  provider: "tencent-asr";
}

type AsrResponsePayload = AsrSuccessResponse | AsrErrorResponse;

export class SpeechTranscriptionError extends Error {
  code: SpeechTranscriptionErrorCode;

  constructor(code: SpeechTranscriptionErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const getAsrEndpoint = (): string =>
  (process?.env?.EXPO_PUBLIC_IMCFO_ASR_ENDPOINT?.trim() ?? defaultEndpoint).replace(/\/+$/, "");

const mapServiceError = (response: AsrErrorResponse, fallbackStatus: number): SpeechTranscriptionError => {
  const code = response.code ?? "ASR_PROVIDER_ERROR";
  const message = response.message ?? `语音转写服务暂不可用（${fallbackStatus}）`;
  return new SpeechTranscriptionError(code, message);
};

const normalizeAsrPayload = (payload: unknown): AsrResponsePayload => {
  if (payload && typeof payload === "object" && "body" in payload) {
    const wrappedBody = (payload as { body?: unknown }).body;
    if (typeof wrappedBody === "string") {
      try {
        return JSON.parse(wrappedBody) as AsrResponsePayload;
      } catch {
        return {
          code: "ASR_PROVIDER_ERROR",
          message: "云函数返回内容无法解析。",
        };
      }
    }
  }

  return payload as AsrResponsePayload;
};

export const transcribeAudio = async ({
  durationMs,
  uri,
}: SpeechTranscriptionInput): Promise<SpeechTranscriptionResult> => {
  if (durationMs < minDurationMs) {
    throw new SpeechTranscriptionError("AUDIO_TOO_SHORT", "录音太短，请至少说一句完整内容。");
  }

  if (durationMs > maxDurationMs) {
    throw new SpeechTranscriptionError("AUDIO_TOO_LARGE", "录音超过 30 秒，请缩短后重试。");
  }

  const endpoint = getAsrEndpoint();
  if (!endpoint) {
    throw new SpeechTranscriptionError(
      "CONFIG_MISSING",
      "语音转写服务尚未配置，请设置 EXPO_PUBLIC_IMCFO_ASR_ENDPOINT。",
    );
  }

  const recordingFile = new File(uri);

  try {
    const audioBase64 = await recordingFile.base64();
    const estimatedAudioBytes = Math.floor((audioBase64.length * 3) / 4);
    if (estimatedAudioBytes > maxAudioBytes) {
      throw new SpeechTranscriptionError("AUDIO_TOO_LARGE", "音频过大，请缩短后重试。");
    }

    const response = await fetch(endpoint, {
      body: JSON.stringify({
        audioBase64,
        durationMs,
        format: "m4a",
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const payload = normalizeAsrPayload(await response.json());

    if (!response.ok) {
      throw mapServiceError(payload as AsrErrorResponse, response.status);
    }

    if (!("text" in payload) && "audioBase64" in payload) {
      throw new SpeechTranscriptionError("ASR_PROVIDER_ERROR", "云函数没有返回 ASR 结果，请确认 SCF 已部署 ASR 代理代码。");
    }

    const text = "text" in payload ? payload.text.trim() : "";
    if (!text) {
      throw new SpeechTranscriptionError("ASR_EMPTY_RESULT", "没有识别到有效内容，请重新录音。");
    }

    return {
      durationMs,
      engine: "engine" in payload ? payload.engine : undefined,
      provider: "tencent-asr",
      requestId: "requestId" in payload ? payload.requestId : undefined,
      text,
    };
  } catch (error) {
    if (error instanceof SpeechTranscriptionError) {
      throw error;
    }

    throw new SpeechTranscriptionError("NETWORK_ERROR", "网络不可用或语音转写服务暂时无法连接。");
  } finally {
    try {
      if (recordingFile.exists) {
        recordingFile.delete();
      }
    } catch {
      // Temporary recordings are best-effort cleanup only.
    }
  }
};
