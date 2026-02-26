/**
 * patch-ios-config.js
 *
 * Run this after `npx cap sync ios` to ensure WidgetBridgePlugin (a local
 * Capacitor plugin that lives in ios/App/App/) stays in packageClassList.
 *
 * `cap sync` regenerates ios/App/App/capacitor.config.json and only includes
 * plugins discovered in node_modules. Local plugins in the Xcode project are
 * not scanned, so they must be patched back in after every sync.
 *
 * Usage:
 *   node scripts/patch-ios-config.js
 *
 * Or via the npm script:
 *   npm run cap:sync:ios
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../ios/App/App/capacitor.config.json');

if (!fs.existsSync(configPath)) {
  console.error('iOS capacitor.config.json not found — run `npx cap sync ios` first.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

if (!Array.isArray(config.packageClassList)) {
  config.packageClassList = [];
}

const LOCAL_PLUGINS = ['WidgetBridgePlugin'];

let added = 0;
for (const plugin of LOCAL_PLUGINS) {
  if (!config.packageClassList.includes(plugin)) {
    config.packageClassList.push(plugin);
    added++;
    console.log(`Added ${plugin} to packageClassList`);
  }
}

if (added > 0) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, '\t'));
  console.log('ios/App/App/capacitor.config.json patched successfully.');
} else {
  console.log('ios/App/App/capacitor.config.json already up to date.');
}
