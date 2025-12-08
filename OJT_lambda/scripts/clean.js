#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Recursively delete directory
 */
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach(file => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

/**
 * Clean build artifacts
 */
function clean() {
  console.log('🧹 Cleaning build artifacts...\n');

  const buildDir = path.join(__dirname, '..', 'build');
  
  if (fs.existsSync(buildDir)) {
    deleteFolderRecursive(buildDir);
    console.log('✅ Removed build/ directory');
  } else {
    console.log('ℹ️  No build directory to clean');
  }

  console.log('\n✅ Clean complete!');
}

clean();
