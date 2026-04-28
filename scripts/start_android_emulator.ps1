$ErrorActionPreference = "Stop"

# Use the Android Studio bundled JBR so sdk/emulator tools do not depend on the system Java version.
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# Keep the Android SDK and AVD data on D: to avoid filling the system drive.
$env:ANDROID_HOME = "D:\android-studio\Sdk"
$env:ANDROID_SDK_ROOT = "D:\android-studio\Sdk"
$env:ANDROID_USER_HOME = "D:\android-studio\.android"
$env:ANDROID_AVD_HOME = "D:\android-studio\.android\avd"

# Expose sdkmanager/avdmanager, adb and emulator on PATH for this PowerShell session.
$env:PATH = "D:\android-studio\Sdk\cmdline-tools\latest\bin;D:\android-studio\Sdk\platform-tools;D:\android-studio\Sdk\emulator;$env:PATH"

# Show available AVDs first so it is obvious what can be launched.
$avds = & emulator -list-avds
if (-not $avds) {
    Write-Error "No Android Virtual Device found. Create one in Android Studio or with avdmanager first."
}

Write-Host "Available AVDs:"
$avds | ForEach-Object { Write-Host " - $_" }

# Default to the Expo-friendly Pixel emulator created during setup.
$defaultAvd = "Pixel_8_API_36"
$targetAvd = if ($avds -contains $defaultAvd) { $defaultAvd } else { $avds[0] }

Write-Host "Starting AVD: $targetAvd"
Start-Process -FilePath "D:\android-studio\Sdk\emulator\emulator.exe" `
    -ArgumentList @("-avd", $targetAvd) `
    -WindowStyle Normal

