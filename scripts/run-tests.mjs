import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const require=createRequire(import.meta.url);const fromDrizzle=createRequire(require.resolve('drizzle-kit'));const esbuild=fromDrizzle('esbuild');
await mkdir('.test-build',{recursive:true});
await esbuild.build({entryPoints:['tests/acceptance.ts'],outfile:'.test-build/acceptance.mjs',platform:'node',format:'esm',bundle:true,external:['node:*'],target:'node24'});
const r=spawnSync(process.execPath,['.test-build/acceptance.mjs'],{stdio:'inherit'});process.exit(r.status??1);
