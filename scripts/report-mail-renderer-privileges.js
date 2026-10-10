/*
 * Static inventory of inherited desktop privileges. Informational only:
 * these matches include trusted browser-process code and are not a renderer
 * call-graph or evidence that context isolation has been achieved.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const roots = ['app/src', 'app/internal_packages'];
const patterns = [
  { name: 'electron-imports', regex: /(?:from\s*['"]electron['"]|require\(['"]electron['"]\))/g },
  { name: 'electron-remote', regex: /@electron\/remote/g },
  { name: 'ipc-renderer', regex: /\bipcRenderer\b/g },
  { name: 'node-process', regex: /\b(?:process\.env|process\.versions|process\.platform)\b/g },
  { name: 'filesystem-or-process-imports', regex: /require\(['"](?:fs|fs\/promises|child_process|os|net)['"]\)/g },
];
const results = Object.fromEntries(patterns.map(({ name }) => [name, []]));
let inspected = 0;

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
    } else if (entry.isFile() && /\.(?:js|jsx|ts|tsx)$/.test(entry.name)) {
      const source = fs.readFileSync(full, 'utf8');
      const filename = path.relative(root, full).split(path.sep).join('/');
      inspected += 1;
      for (const { name, regex } of patterns) {
        regex.lastIndex = 0;
        const matches = source.match(regex);
        if (matches) results[name].push({ path: filename, matches: matches.length });
      }
    }
  }
}
roots.forEach((rel) => scan(path.join(root, rel)));

const windowPath = path.join(root, 'app/src/browser/mailspring-window.ts');
const windowSource = fs.readFileSync(windowPath, 'utf8');
const report = {
  product: 'GoreeCloud Mail',
  scope: 'Static lexical inventory, not installed-app security acceptance',
  inspectedFiles: inspected,
  mainRendererFlags: {
    nodeIntegrationEnabledInSource: /nodeIntegration:\s*true/.test(windowSource),
    contextIsolationDisabledInSource: /contextIsolation:\s*false/.test(windowSource),
  },
  patterns: Object.fromEntries(
    patterns.map(({ name }) => [
      name,
      {
        files: results[name].length,
        occurrences: results[name].reduce((total, item) => total + item.matches, 0),
        samplePaths: results[name].slice(0, 25).map((item) => item.path),
      },
    ])
  ),
};
console.log(JSON.stringify(report, null, 2));
console.log('Inventory is informational. Privileged renderer P0 remains open until tested preload/IPC isolation.');
