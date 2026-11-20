import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');
const appDir = path.join(androidDir, 'app');
const resDir = path.join(appDir, 'src', 'main', 'res');
const mainActivityPath = path.join(
  appDir,
  'src',
  'main',
  'java',
  'com',
  'garczustudios',
  'rapempire',
  'MainActivity.java'
);

if (!fs.existsSync(androidDir)) {
  console.error('Brak katalogu android/. Uruchom najpierw: npx cap add android');
  process.exit(1);
}

// 1. Patch MainActivity.java: allow quiet soundtrack autoplay immediately on launch & dark system bars
const mainActivityJava = `package com.garczustudios.rapempire;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getWindow() != null) {
            int darkBg = Color.parseColor("#06060a");
            getWindow().setStatusBarColor(darkBg);
            getWindow().setNavigationBarColor(darkBg);
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.setBackgroundColor(Color.parseColor("#06060a"));
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
    }
}
`;

fs.mkdirSync(path.dirname(mainActivityPath), { recursive: true });
fs.writeFileSync(mainActivityPath, mainActivityJava, 'utf8');
console.log('[prepare-android] Zaktualizowano MainActivity.java (autoplay muzyki + ciemne paski systemowe)');

// 2. Patch app/build.gradle versionName & versionCode
const appGradlePath = path.join(appDir, 'build.gradle');
if (fs.existsSync(appGradlePath)) {
  let gradle = fs.readFileSync(appGradlePath, 'utf8');
  const buildNum = Number(process.env.GITHUB_RUN_NUMBER || '1');
  gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${Number.isFinite(buildNum) ? buildNum : 1}`);
  gradle = gradle.replace(/versionName\s+"[^"]+"/, 'versionName "0.9.4-beta"');
  fs.writeFileSync(appGradlePath, gradle, 'utf8');
  console.log(`[prepare-android] Ustawiono wersje APK: 0.9.4-beta (build ${buildNum})`);
}

// 3. Ensure dark launch background in values/colors.xml and values/ic_launcher_background.xml
const valuesDir = path.join(resDir, 'values');
fs.mkdirSync(valuesDir, { recursive: true });

const icBgXmlPath = path.join(valuesDir, 'ic_launcher_background.xml');
fs.writeFileSync(
  icBgXmlPath,
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#06060a</color>
</resources>
`,
  'utf8'
);

const stylesPath = path.join(valuesDir, 'styles.xml');
if (fs.existsSync(stylesPath)) {
  let styles = fs.readFileSync(stylesPath, 'utf8');
  if (!styles.includes('android:windowBackground')) {
    styles = styles.replace(
      /(<style name="AppTheme\.NoActionBar"[^>]*>)/,
      `$1\n        <item name="android:windowBackground">#06060a</item>`
    );
  }
  styles = styles.replace(
    /<item name="android:background">@drawable\/splash<\/item>/,
    '<item name="android:background">#06060a</item>'
  );
  fs.writeFileSync(stylesPath, styles, 'utf8');
}

// 4. Generate Rap Empire launcher icons from emblem image if ImageMagick is available
const iconSource = path.join(rootDir, 'src', 'assets', 'images', 'rap_empire_emblem_1795105432966.jpg');
function detectMagickCmd() {
  for (const cmd of ['magick', 'convert']) {
    try {
      execSync(`which ${cmd}`, { stdio: 'ignore' });
      return cmd;
    } catch {
      // try next
    }
  }
  return null;
}

const magickCmd = detectMagickCmd();
if (magickCmd && fs.existsSync(iconSource)) {
  const densities = [
    { name: 'mipmap-mdpi', launcher: 48, foreground: 108 },
    { name: 'mipmap-hdpi', launcher: 72, foreground: 162 },
    { name: 'mipmap-xhdpi', launcher: 96, foreground: 216 },
    { name: 'mipmap-xxhdpi', launcher: 144, foreground: 324 },
    { name: 'mipmap-xxxhdpi', launcher: 192, foreground: 432 },
  ];

  for (const d of densities) {
    const dir = path.join(resDir, d.name);
    fs.mkdirSync(dir, { recursive: true });

    const launcherOut = path.join(dir, 'ic_launcher.png');
    const roundOut = path.join(dir, 'ic_launcher_round.png');
    const fgOut = path.join(dir, 'ic_launcher_foreground.png');

    execSync(
      `${magickCmd} "${iconSource}" -resize ${d.launcher}x${d.launcher}^ -gravity center -extent ${d.launcher}x${d.launcher} "${launcherOut}"`
    );
    execSync(
      `${magickCmd} "${iconSource}" -resize ${d.launcher}x${d.launcher}^ -gravity center -extent ${d.launcher}x${d.launcher} "${roundOut}"`
    );
    // Adaptive icon foreground (safe inner 70% zone on transparent canvas)
    const inner = Math.round(d.foreground * 0.72);
    execSync(
      `${magickCmd} "${iconSource}" -resize ${inner}x${inner}^ -gravity center -extent ${inner}x${inner} -background none -gravity center -extent ${d.foreground}x${d.foreground} "${fgOut}"`
    );
  }
  console.log('[prepare-android] Wygenerowano ikony aplikacji Rap Empire dla wszystkich rozdzielczosci Androida');
} else {
  console.log('[prepare-android] ImageMagick niedostepny — pominieto generowanie niestandardowych ikon');
}

console.log('[prepare-android] Gotowe! Projekt Android jest przygotowany do kompilacji Gradle.');
