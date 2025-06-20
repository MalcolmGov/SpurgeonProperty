const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting fast build process...');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}

// Build frontend with minimal configuration
try {
  console.log('Building frontend...');
  execSync('NODE_ENV=production vite build --minify false --sourcemap false', { 
    stdio: 'inherit',
    timeout: 60000
  });
  
  console.log('Building backend...');
  // Build backend
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify', {
    stdio: 'inherit',
    timeout: 30000
  });
  
  console.log('Build completed successfully!');
  
  // Check if build artifacts exist
  if (fs.existsSync('dist/public') && fs.existsSync('dist/index.js')) {
    console.log('✅ Build artifacts created successfully');
    console.log('- Frontend:', fs.readdirSync('dist/public').length, 'files');
    console.log('- Backend: index.js created');
  } else {
    console.log('❌ Build artifacts missing');
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}