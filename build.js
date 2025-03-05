const esbuild = require('esbuild')

esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    outfile: 'main.js',
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    minify: true,
}).catch(() => process.exit(1)) 