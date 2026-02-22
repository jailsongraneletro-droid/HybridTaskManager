<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1GqO3Uo14a9irnXbyCxFfg2oRiCBgblhK

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Android APK (Capacitor)

This project is configured with Capacitor and an Android native project in `android/`.

### Prerequisites

- Node.js (already used by this project)
- Java JDK 21 (required by Android build)
- Android Studio (with Android SDK + Build Tools installed)
- `JAVA_HOME` pointing to your JDK 17 installation

### Useful scripts

- `npm run android:sync` → builds web app and syncs with Android project
- `npm run android:open` → opens Android project in Android Studio
- `npm run android:run` → builds and runs on connected Android device/emulator
- `npm run apk:debug` → generates debug APK

### Generate debug APK

1. Sync project files:
   `npm run android:sync`
2. Build APK:
   `npm run apk:debug`
3. The APK will be generated at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

## Release signing (APK/AAB)

Por segurança, prefira variáveis de ambiente para as credenciais de assinatura.
O projeto também aceita `android/keystore.properties` como fallback local.

### 1) Create keystore

Run this command and follow the prompts:

`keytool -genkeypair -v -keystore android/app/release.keystore -alias hybridtask -keyalg RSA -keysize 2048 -validity 10000`

### 2) Configure credentials (recommended: environment variables)

PowerShell example:

`$env:ANDROID_KEYSTORE_FILE="android/app/release.keystore"`

`$env:ANDROID_KEYSTORE_PASSWORD="YOUR_STORE_PASSWORD"`

`$env:ANDROID_KEY_ALIAS="YOUR_KEY_ALIAS"`

`$env:ANDROID_KEY_PASSWORD="YOUR_KEY_PASSWORD"`

Fallback local file:

Copy [android/keystore.properties.example](android/keystore.properties.example) to `android/keystore.properties` and fill in your values (arquivo já ignorado no Git).

### 2.1) Rotation checklist (critical)

- Gere nova senha/chave para upload signing imediatamente.
- Atualize credenciais locais (env vars ou `keystore.properties` local).
- Se o app já está na Play Store, solicite **Upload key reset** no Play Console.
- Revogue credenciais antigas e remova qualquer segredo exposto de histórico remoto.

### 3) Build release

- APK (release): `npm run apk:release`
- AAB (release): `npm run aab:release`

Outputs:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Install Android SDK (required once)

1. Open Android Studio.
2. Go to **More Actions** -> **SDK Manager**.
3. Install:
   - Android SDK Platform (latest stable)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
4. Ensure the SDK path matches `sdk.dir` in `android/local.properties`.
   Default path on Windows:
   `C:\Users\<you>\AppData\Local\Android\Sdk`

If your SDK is installed elsewhere, update `android/local.properties` accordingly.

### If build fails with Java version error

If you see an error like "This build uses a Java 8 JVM", update your environment to JDK 17 and set `JAVA_HOME` accordingly.
