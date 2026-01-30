import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.resolve(__dirname, '..', 'dist-extension');

// Copy manifest
fs.copyFileSync(
  path.join(__dirname, 'manifest.json'),
  path.join(distRoot, 'manifest.json'),
);

// Flatten popup.html if it was output to dist-extension/extension/popup.html
const nestedPopup = path.join(distRoot, 'extension', 'popup.html');
if (fs.existsSync(nestedPopup)) {
  fs.renameSync(nestedPopup, path.join(distRoot, 'popup.html'));
  try {
    fs.rmdirSync(path.join(distRoot, 'extension'));
  } catch {
    // ignore if not empty
  }
}

