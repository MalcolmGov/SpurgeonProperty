#!/usr/bin/env node

import { build } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building production application...');

try {
  // Clean dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Build frontend with optimized config
  console.log('Building frontend...');
  await build({
    mode: 'production',
    build: {
      outDir: 'dist/public',
      emptyOutDir: true,
      minify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
  });
  
  // Build backend
  console.log('Building backend...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify', { stdio: 'inherit' });
  
  // Copy static assets
  console.log('Copying static assets...');
  const staticFiles = ['spurgeon-logo.png', 'spurgeon-property-logo.png'];
  staticFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join('dist/public', file));
    }
  });
  
  // Create uploads directory
  if (!fs.existsSync('dist/uploads')) {
    fs.mkdirSync('dist/uploads', { recursive: true });
  }
  
  // Copy existing uploads
  if (fs.existsSync('uploads')) {
    execSync('cp -r uploads/* dist/uploads/', { stdio: 'inherit' });
  }
  
  console.log('Production build completed successfully!');
  
  // Show build size
  const stats = fs.statSync('dist/index.js');
  console.log(`Backend bundle size: ${(stats.size / 1024).toFixed(1)}KB`);
  
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}