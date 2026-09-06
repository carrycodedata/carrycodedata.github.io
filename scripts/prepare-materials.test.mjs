import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { prepareMaterials } from './prepare-materials.mjs';

const CASE_ONE = 'S-S07-C01';
const CASE_TWO = 'S-S07-C02';
const caseDir = (id) => `course-materials/sales/S07/${id}`;
const resource = (overrides = {}) => ({
  id: 'website', title: '训练网页', type: 'html', group: 'raw', path: '00_原始资料/site/index.html', ...overrides,
});

async function fixture(t) {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'carrycode-materials-'));
  t.after(() => rm(rootDir, { recursive: true, force: true }));
  const write = async (filename, contents) => {
    const destination = path.join(rootDir, filename);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, typeof contents === 'object' ? JSON.stringify(contents) : contents);
  };
  const manifest = async (id, resources) => write(`${caseDir(id)}/manifest.json`, { caseId: id, resources });
  const catalog = { categories: [{ id: 'sales', code: 'S', title: '销售', lessons: [{
    id: 'S07', title: '第7次课', hours: 2,
    cases: [{ id: CASE_ONE, title: '案例一', type: 'main' }, { id: CASE_TWO, title: '案例二', type: 'guided' }],
  }] }] };
  await write('course-materials/catalog.json', catalog);
  await manifest(CASE_ONE, [resource()]);
  await write(`${caseDir(CASE_ONE)}/00_原始资料/site/index.html`, '<link href="../shared/site.css" rel="stylesheet"><script src="app.js"></script>');
  return {
    rootDir, write, manifest, catalog,
    build: () => prepareMaterials({ rootDir }),
    read: (filename) => readFile(path.join(rootDir, filename), 'utf8'),
  };
}

test('publishes the complete HTML dependency tree while only indexing manifest entries', async (t) => {
  const f = await fixture(t);
  await f.write(`${caseDir(CASE_ONE)}/00_原始资料/shared/site.css`, 'body { color: red }');
  await f.write(`${caseDir(CASE_ONE)}/00_原始资料/site/app.js`, "fetch('activities.json')");
  await f.write(`${caseDir(CASE_ONE)}/00_原始资料/site/activities.json`, [{ title: '活动' }]);
  await f.write(`${caseDir(CASE_ONE)}/00_原始资料/site/menu.html`, '<h1>菜单</h1>');
  for (const filename of ['generate.py', 'start.sh', 'requirements.txt', '.private.json', '.cache/secret.json']) {
    await f.write(`${caseDir(CASE_ONE)}/00_原始资料/${filename}`, 'do not publish');
  }
  const result = await f.build();
  assert.deepEqual(result, { caseCount: 2, publishedCaseCount: 1, resourceCount: 1, assetCount: 5 });
  const index = JSON.parse(await f.read('src/generated/materials.json'));
  assert.equal(index.cases[CASE_ONE][0].path, `materials/sales/S07/${CASE_ONE}/00_原始资料/site/index.html`);
  assert.equal(index.cases[CASE_ONE][0].sizeBytes, Buffer.byteLength(await f.read(`${caseDir(CASE_ONE)}/00_原始资料/site/index.html`)));
  assert.deepEqual(index.cases[CASE_TWO], []);
  assert.equal(await f.read(`public/materials/sales/S07/${CASE_ONE}/00_原始资料/shared/site.css`), 'body { color: red }');
  await assert.rejects(f.read(`public/materials/sales/S07/${CASE_ONE}/00_原始资料/generate.py`), { code: 'ENOENT' });
});

test('a second case can add a local file and share another case resource without duplicating its files', async (t) => {
  const f = await fixture(t);
  await f.manifest(CASE_TWO, [
    { id: 'shared-site', title: '共用训练网页', type: 'html', group: 'raw', resourceRef: { caseId: CASE_ONE, resourceId: 'website' } },
    { id: 'task', title: '任务卡', type: 'md', group: 'task', path: '01_任务卡/任务说明.md', updatedAt: '2026-09-06' },
  ]);
  await f.write(`${caseDir(CASE_TWO)}/01_任务卡/任务说明.md`, '# 新案例任务');
  await f.build();
  const { cases } = JSON.parse(await f.read('src/generated/materials.json'));
  assert.equal(cases[CASE_TWO].length, 2);
  assert.equal(cases[CASE_TWO][0].path, cases[CASE_ONE][0].path);
  assert.equal(cases[CASE_TWO][0].title, '共用训练网页');
  assert.equal(cases[CASE_TWO][1].updatedAt, '2026-09-06');
  assert.match(cases[CASE_TWO][1].path, /S-S07-C02/);
});

test('missing files and forbidden paths fail before any generated assets are changed', async (t) => {
  const f = await fixture(t);
  await f.build();
  const original = await f.read('src/generated/materials.json');
  for (const [filename, expected] of [
    ['00_原始资料/missing.html', /资料文件不存在/],
    ['../outside.html', /安全相对路径/],
    ['/tmp/outside.html', /安全相对路径/],
    ['00_原始资料/%2e%2e/outside.html', /安全相对路径/],
    ['00_原始资料/site/index.html?x=1', /安全相对路径/],
  ]) {
    await f.manifest(CASE_ONE, [resource({ path: filename })]);
    await assert.rejects(f.build(), expected);
    assert.equal(await f.read('src/generated/materials.json'), original);
  }
});

test('duplicate resource IDs, invalid groups and mismatched file types are rejected', async (t) => {
  const f = await fixture(t);
  await f.manifest(CASE_ONE, [resource(), resource()]);
  await assert.rejects(f.build(), /重复资源 ID/);
  await f.manifest(CASE_ONE, [resource({ group: 'unknown' })]);
  await assert.rejects(f.build(), /无效资料分组/);
  await f.manifest(CASE_ONE, [resource({ group: 'task' })]);
  await assert.rejects(f.build(), /资料路径与分组/);
  await f.manifest(CASE_ONE, [resource({ type: 'pdf' })]);
  await assert.rejects(f.build(), /资源类型与文件扩展名/);
});

test('catalog and manifest case membership are validated', async (t) => {
  const f = await fixture(t);
  const lesson = f.catalog.categories[0].lessons[0];
  lesson.cases.push({ ...lesson.cases[0] });
  await f.write('course-materials/catalog.json', f.catalog);
  await assert.rejects(f.build(), /重复案例 ID/);
  lesson.cases.pop();
  lesson.cases[0].id = 'S-S06-C01';
  await f.write('course-materials/catalog.json', f.catalog);
  await assert.rejects(f.build(), /案例编号与所属课次/);
  lesson.cases[0].id = CASE_ONE;
  await f.write('course-materials/catalog.json', f.catalog);
  await f.write(`${caseDir(CASE_ONE)}/manifest.json`, { caseId: CASE_TWO, resources: [] });
  await assert.rejects(f.build(), /资料清单目录与所属课次/);
});

test('unknown and circular resource references are rejected', async (t) => {
  const f = await fixture(t);
  const shared = (caseId, resourceId = 'shared') => ({ id: 'shared', title: '共用资料', type: 'html', group: 'raw', resourceRef: { caseId, resourceId } });
  await f.manifest(CASE_ONE, [shared(CASE_TWO)]);
  await assert.rejects(f.build(), /资源引用不存在/);
  await f.manifest(CASE_TWO, [shared(CASE_ONE)]);
  await assert.rejects(f.build(), /循环资源引用/);
});

test('teaching relationships do not create file dependencies', async (t) => {
  const f = await fixture(t);
  f.catalog.categories[0].lessons[0].cases[0].relatedCaseIds = [CASE_TWO];
  await f.write('course-materials/catalog.json', f.catalog);
  await f.build();
  assert.equal(JSON.parse(await f.read('src/generated/materials.json')).cases[CASE_TWO].length, 0);
  f.catalog.categories[0].lessons[0].cases[0].relatedCaseIds = ['S-S07-C99'];
  await f.write('course-materials/catalog.json', f.catalog);
  await assert.rejects(f.build(), /无效或重复关联案例/);
});

test('rebuilding removes only recorded stale files and preserves unrelated user assets', async (t) => {
  const f = await fixture(t);
  await f.write(`${caseDir(CASE_ONE)}/00_原始资料/old.csv`, 'old');
  await f.build();
  await f.write('public/materials/user-note.txt', 'keep me');
  await rm(path.join(f.rootDir, `${caseDir(CASE_ONE)}/00_原始资料/old.csv`));
  await f.build();
  assert.equal(await f.read('public/materials/user-note.txt'), 'keep me');
  await assert.rejects(f.read(`public/materials/sales/S07/${CASE_ONE}/00_原始资料/old.csv`), { code: 'ENOENT' });
});

test('modified generated files and pre-existing destination files are not overwritten', async (t) => {
  const f = await fixture(t);
  const destination = `public/materials/sales/S07/${CASE_ONE}/00_原始资料/site/index.html`;
  await f.write(destination, 'user original');
  await assert.rejects(f.build(), /已有非生成文件/);
  assert.equal(await f.read(destination), 'user original');
  await rm(path.join(f.rootDir, destination));
  await f.build();
  await f.write(destination, 'user edit');
  await assert.rejects(f.build(), /已被手工修改/);
  assert.equal(await f.read(destination), 'user edit');
});

test('symbolic links in case assets cannot escape the source directory', async (t) => {
  const f = await fixture(t);
  await f.write('outside.txt', 'private');
  await symlink(path.join(f.rootDir, 'outside.txt'), path.join(f.rootDir, `${caseDir(CASE_ONE)}/00_原始资料/leak.txt`));
  await assert.rejects(f.build(), /不允许符号链接/);
});
