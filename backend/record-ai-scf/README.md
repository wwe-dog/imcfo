# IMCFO Record AI SCF

Provider-neutral proxy for turning natural language transaction text into `CandidateTransactionDraft`.

Required environment variables:

- `RECORD_AI_BASE_URL`: OpenAI-compatible API base URL, without trailing slash.
- `RECORD_AI_API_KEY`: server-side model key.
- `RECORD_AI_MODEL`: model name.
- `CORS_ALLOW_ORIGIN`: optional allowed origin.

The mobile app must call this proxy through `EXPO_PUBLIC_IMCFO_RECORD_AI_ENDPOINT`; it must not call model vendors directly.
