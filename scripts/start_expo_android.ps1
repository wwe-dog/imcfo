$ErrorActionPreference = "Stop"

# Reuse the local Android toolchain configured for this workstation.
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "D:\android-studio\Sdk"
$env:ANDROID_SDK_ROOT = "D:\android-studio\Sdk"
$env:ANDROID_USER_HOME = "D:\android-studio\.android"
$env:ANDROID_AVD_HOME = "D:\android-studio\.android\avd"
$env:PATH = "D:\android-studio\Sdk\cmdline-tools\latest\bin;D:\android-studio\Sdk\platform-tools;D:\android-studio\Sdk\emulator;$env:PATH"

# Start adb up front so Expo can detect the emulator faster.
& adb start-server | Out-Host

# Launch the emulator helper script if no emulator is currently connected.
$devices = (& adb devices) -join "`n"
if ($devices -notmatch "emulator-\d+\s+device") {
    & "D:\imcfo\scripts\start_android_emulator.ps1"
    Write-Host "Waiting 20 seconds for the emulator window to initialize..."
    Start-Sleep -Seconds 20
}

# Prefer Expo's default port when it is free, otherwise fall back to 8083 to avoid an interactive prompt.
$expoPort = 8081
if (Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue) {
    $expoPort = 8083
    Write-Host "Port 8081 is already in use. Falling back to port 8083."
}

# Start Expo in the mobile workspace. After Metro is ready, press 'a' if Expo does not auto-open Android.
Set-Location "D:\imcfo\mobile"
npm.cmd start -- --port $expoPort
