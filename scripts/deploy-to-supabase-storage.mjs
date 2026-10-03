// Sube el contenido de dist/ a un bucket de Supabase Storage, conservando la
// estructura de carpetas, para servir la landing como sitio estático.
//
// Variables de entorno requeridas:
//   SUPABASE_URL              -> URL del proyecto, ej. https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY -> service role key (NUNCA la publiques ni la subas al repo)
//   SUPABASE_BUCKET           -> nombre del bucket destino (por defecto: "forge-lock-site")
//
// Uso local:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_BUCKET=forge-lock-site node scripts/deploy-to-supabase-storage.mjs
//
// En GitHub Actions estas variables se pasan como Secrets (ver .github/workflows/deploy-supabase.yml).

import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'forge-lock-site';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
    process.exit(1);
}

const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
};

function contentTypeFor(path) {
    const ext = path.slice(path.lastIndexOf('.'));
    return contentTypes[ext] || 'application/octet-stream';
}

async function collectFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await collectFiles(fullPath)));
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function ensureBucket() {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    const exists = buckets?.some((bucket) => bucket.name === SUPABASE_BUCKET);
    if (!exists) {
        const { error: createError } = await supabase.storage.createBucket(SUPABASE_BUCKET, {
            public: true
        });
        if (createError) throw createError;
        console.log(`Bucket "${SUPABASE_BUCKET}" creado (público).`);
    }
}

async function uploadAll() {
    const files = await collectFiles(distDir);
    if (files.length === 0) {
        console.error('dist/ está vacío. Ejecuta "npm run build:dist" primero.');
        process.exit(1);
    }

    for (const filePath of files) {
        const relPath = relative(distDir, filePath).split('\\').join('/');
        const fileBuffer = await readFile(filePath);
        const { error } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .upload(relPath, fileBuffer, {
                contentType: contentTypeFor(filePath),
                upsert: true
            });
        if (error) {
            console.error(`Error subiendo ${relPath}:`, error.message);
            process.exitCode = 1;
        } else {
            console.log(`Subido: ${relPath}`);
        }
    }
}

await ensureBucket();
await uploadAll();

const { data: publicUrl } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl('index.html');
console.log('\nDespliegue completado.');
console.log(`URL pública aproximada: ${publicUrl.publicUrl}`);
