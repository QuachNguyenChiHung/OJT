#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Get target from command line (auth, products, or undefined for all)
const target = process.argv[2];

const FUNCTIONS = {
  auth: ['login', 'signup', 'me'],
  products: ['getProducts', 'getBestSelling', 'getNewest', 'searchProducts']
};

/**
 * Create a ZIP file for Lambda function
 */
async function zipFunction(category, functionName) {
  const buildDir = path.join(__dirname, '..', 'build', category);
  const zipPath = path.join(buildDir, `${functionName}.zip`);
  
  // Create build directory
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`✅ Built ${category}/${functionName}.zip (${archive.pointer()} bytes)`);
      resolve(zipPath);
    });

    archive.on('error', reject);
    archive.pipe(output);

    // Add shared utilities
    archive.directory(path.join(__dirname, '..', 'shared'), 'shared');

    // Add function code
    archive.file(
      path.join(__dirname, '..', category, `${functionName}.js`),
      { name: `${functionName}.js` }
    );

    // Add package.json and node_modules for dependencies
    const sharedPackageJson = path.join(__dirname, '..', 'shared', 'package.json');
    const categoryPackageJson = path.join(__dirname, '..', category, 'package.json');
    
    if (fs.existsSync(sharedPackageJson)) {
      archive.directory(
        path.join(__dirname, '..', 'shared', 'node_modules'),
        'node_modules'
      );
    }
    
    if (fs.existsSync(categoryPackageJson)) {
      archive.directory(
        path.join(__dirname, '..', category, 'node_modules'),
        'node_modules'
      );
    }

    archive.finalize();
  });
}

/**
 * Build Lambda functions
 */
async function build() {
  console.log('🔨 Building Lambda functions...\n');

  try {
    // Determine which categories to build
    const categories = target ? [target] : Object.keys(FUNCTIONS);

    for (const category of categories) {
      if (!FUNCTIONS[category]) {
        console.error(`❌ Unknown category: ${category}`);
        process.exit(1);
      }

      console.log(`📦 Building ${category} functions...`);
      
      for (const functionName of FUNCTIONS[category]) {
        await zipFunction(category, functionName);
      }
      
      console.log('');
    }

    console.log('✅ Build complete! ZIP files are in build/ directory');
    console.log('\nNext steps:');
    console.log('  npm run deploy         # Deploy all functions');
    console.log('  npm run deploy:auth    # Deploy auth functions only');
    console.log('  npm run deploy:products # Deploy products functions only');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
