import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildServer() {
  try {
    console.log('Building server for production...');
    
    await build({
      entryPoints: [join(__dirname, 'index.ts')],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outdir: join(__dirname, '..', 'dist'),
      external: [
        'pg',
        'ws',
        '@neondatabase/serverless',
        'bcrypt',
        'express',
        'multer',
        'cheerio',
        'openai',
        '@anthropic-ai/sdk'
      ],
      sourcemap: true,
      minify: false,
      keepNames: true,
      banner: {
        js: `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    
    console.log('Server build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildServer();