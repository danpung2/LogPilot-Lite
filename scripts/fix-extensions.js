const fs = require('fs');
const path = require('path');

/**
 * Fix ESM imports by adding .js extensions to relative imports
 * This is required for ESM modules to work properly
 */
function fixExtensions(dir, isESM = false) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixExtensions(filePath, isESM);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');

      if (isESM) {
        // ESM needs .js extensions
        // Fix alias imports: @shared/* → ../shared/*
        content = content.replace(
          /from\s+["']@shared\/([^"']*?)["']/g,
          'from "../shared/$1.js"'
        );
        content = content.replace(
          /from\s+["']@grpc-server\/([^"']*?)["']/g,
          'from "../logpilot-grpc-server/src/$1.js"'
        );
        content = content.replace(
          /from\s+["']@rest-server\/([^"']*?)["']/g,
          'from "../logpilot-rest-server/src/$1.js"'
        );

        // Fix relative imports: from './module' to './module.js'
        content = content.replace(
          /from\s+['"](\.\.?\/[^'"]*)['"]/g,
          (match, importPath) => {
            // Skip if already has extension
            if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
              return match;
            }
            return match.replace(importPath, `${importPath}.js`);
          }
        );
      } else {
        // CommonJS doesn't need extensions
        // Fix alias requires: @shared/* → ../shared/*
        content = content.replace(
          /require\s*\(\s*["']@shared\/([^"']*?)["']\s*\)/g,
          'require("../shared/$1")'
        );
        content = content.replace(
          /require\s*\(\s*["']@grpc-server\/([^"']*?)["']\s*\)/g,
          'require("../logpilot-grpc-server/src/$1")'
        );
        content = content.replace(
          /require\s*\(\s*["']@rest-server\/([^"']*?)["']\s*\)/g,
          'require("../logpilot-rest-server/src/$1")'
        );
      }

      fs.writeFileSync(filePath, content);
    }
  }
}

// Fix CJS modules
if (fs.existsSync('./dist/cjs')) {
  console.log('Fixing CJS import paths...');
  fixExtensions('./dist/cjs');
  console.log('CJS import paths fixed!');
}

// Fix ESM modules
if (fs.existsSync('./dist/esm')) {
  console.log('Fixing ESM import extensions...');
  fixExtensions('./dist/esm', true);
  console.log('ESM import extensions fixed!');
}

// Rename ESM files to .mjs for better compatibility
function renameToMjs(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      renameToMjs(filePath);
    } else if (file.endsWith('.js')) {
      // First update imports in the file to use .mjs
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/from\s+['"](\.\.?\/[^'"]*?)\.js['"]/g, 'from "$1.mjs"');
      content = content.replace(/import\s*\(\s*['"](\.\.?\/[^'"]*?)\.js['"]\s*\)/g, 'import("$1.mjs")');
      fs.writeFileSync(filePath, content);

      // Then rename the file
      const mjsPath = filePath.replace(/\.js$/, '.mjs');
      fs.renameSync(filePath, mjsPath);
    }
  }
}

if (fs.existsSync('./dist/esm')) {
  console.log('Renaming ESM files to .mjs...');
  renameToMjs('./dist/esm');
  console.log('ESM files renamed to .mjs!');
}