import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const nextStaticDir = path.join(rootDir, '.next', 'static');
const publicDir = path.join(rootDir, 'public');
const releaseDir = path.join(rootDir, 'release');

console.log('🚀 Executing post-build release packaging (after_prepare.js)...');

try {
  // 1. Ensure Next.js standalone build exists
  if (!fs.existsSync(standaloneDir)) {
    throw new Error(
      'Standalone build directory (.next/standalone) not found.\n' +
      'Please run "npm run build" first to generate the Next.js standalone build.'
    );
  }

  // 2. Clean & recreate release directory
  if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true, force: true });
    console.log('🧹 Cleaned existing release directory.');
  }
  fs.mkdirSync(releaseDir, { recursive: true });

  // 3. Copy standalone server, manifests, and pruned node_modules to release/
  console.log('📦 Copying Next.js standalone output to release/...');
  fs.cpSync(standaloneDir, releaseDir, { recursive: true });

  // 4. Next.js standalone requires .next/static inside both .next/standalone/.next/static and release/.next/static
  if (fs.existsSync(nextStaticDir)) {
    const standaloneStatic = path.join(standaloneDir, '.next', 'static');
    const releaseStatic = path.join(releaseDir, '.next', 'static');

    fs.mkdirSync(standaloneStatic, { recursive: true });
    fs.cpSync(nextStaticDir, standaloneStatic, { recursive: true });

    fs.mkdirSync(releaseStatic, { recursive: true });
    fs.cpSync(nextStaticDir, releaseStatic, { recursive: true });
    console.log('📦 Copied .next/static -> release/.next/static and .next/standalone/.next/static');
  } else {
    console.warn('⚠️ Warning: .next/static directory not found.');
  }

  // 5. Next.js standalone requires public/ inside both .next/standalone/public and release/public
  if (fs.existsSync(publicDir)) {
    const standalonePublic = path.join(standaloneDir, 'public');
    const releasePublic = path.join(releaseDir, 'public');

    fs.mkdirSync(standalonePublic, { recursive: true });
    fs.cpSync(publicDir, standalonePublic, { recursive: true });

    fs.mkdirSync(releasePublic, { recursive: true });
    fs.cpSync(publicDir, releasePublic, { recursive: true });
    console.log('📦 Copied public/ -> release/public and .next/standalone/public');
  } else {
    console.warn('⚠️ Warning: public/ directory not found.');
  }

  console.log('\n✨ Production release package successfully created in:');
  console.log(`   📁 release/          (${path.relative(rootDir, releaseDir)})`);
  console.log(`   📁 .next/standalone/ (${path.relative(rootDir, standaloneDir)})`);
  console.log('\n🚀 Ready to run in production with:');
  console.log('   cd release && node server.js');
} catch (error) {
  console.error('❌ Error during release packaging:', error.message);
  process.exit(1);
}
