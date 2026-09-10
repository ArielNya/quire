import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extract } from "tar";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dest = resolve(root, "android/capacitor-cordova-android-plugins");
const archive = resolve(
  root,
  "node_modules/@capacitor/cli/assets/capacitor-cordova-android-plugins.tar.gz",
);

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
await extract({ file: archive, cwd: dest });

writeFileSync(
  resolve(dest, "cordova.variables.gradle"),
  `// generated — Capacitor CLI 6 cannot extract this under tar 7
ext {
  cdvMinSdkVersion = project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 22
  cdvPluginPostBuildExtras = []
  cordovaConfig = [:]
}
`,
);

const gradlePath = resolve(dest, "build.gradle");
const gradle = readFileSync(gradlePath, "utf8").replace(
  /(PLUGIN GRADLE EXTENSIONS START)[\s\S]*(\/\/ PLUGIN GRADLE EXTENSIONS END)/,
  "$1\napply from: \"cordova.variables.gradle\"\n$2",
);
writeFileSync(gradlePath, gradle);
