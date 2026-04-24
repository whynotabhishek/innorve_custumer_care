import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const from = resolve(process.cwd(), 'dist-admin', 'admin.html');
const to = resolve(process.cwd(), 'dist-admin', 'index.html');

try {
    await copyFile(from, to);
    console.log('Copied admin.html to dist-admin/index.html');
} catch (error) {
    console.error('Failed to copy admin.html to dist-admin/index.html', error);
    process.exit(1);
}
