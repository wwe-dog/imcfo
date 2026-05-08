$ErrorActionPreference = "Stop"

$endpoint = "https://1429401867-03bgnxsdav.ap-guangzhou.tencentscf.com"
$payload = @{
  audioBase64 = "dGVzdA=="
  format = "m4a"
  durationMs = 1000
}
$json = $payload | ConvertTo-Json -Compress
$bodyFile = Join-Path $PSScriptRoot ".function-url-body.tmp.json"
$headersFile = Join-Path $PSScriptRoot ".function-url-response-headers.tmp.txt"
$responseFile = Join-Path $PSScriptRoot ".function-url-response-body.tmp.txt"

Write-Output "Endpoint: $endpoint"
Write-Output "Request JSON: $json"

try {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($bodyFile, $json, $utf8NoBom)

  $statusCode = & curl.exe `
    -sS `
    -o $responseFile `
    -D $headersFile `
    -w "%{http_code}" `
    -X POST `
    $endpoint `
    -H "Content-Type: application/json" `
    --data-binary "@$bodyFile"

  if ($LASTEXITCODE -ne 0) {
    throw "curl.exe failed with exit code $LASTEXITCODE"
  }

  $headersText = if (Test-Path -LiteralPath $headersFile) { Get-Content -Raw -LiteralPath $headersFile } else { "" }
  $responseBody = if (Test-Path -LiteralPath $responseFile) { Get-Content -Raw -LiteralPath $responseFile } else { "" }
  $requestIdMatch = [regex]::Match($headersText, "(?im)^X-Scf-Request-Id:\s*(.+?)\s*$")
  $requestId = if ($requestIdMatch.Success) { $requestIdMatch.Groups[1].Value } else { "" }
} finally {
  foreach ($file in @($bodyFile, $headersFile, $responseFile)) {
    if (Test-Path -LiteralPath $file) {
      Remove-Item -LiteralPath $file -Force
    }
  }
}

Write-Output "HTTP status: $statusCode"
Write-Output "X-Scf-Request-Id: $requestId"
Write-Output "Response body: $responseBody"
