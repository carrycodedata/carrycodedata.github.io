import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RESOURCE_TYPES = new Set(['html', 'pdf', 'md', 'xlsx', 'csv', 'json', 'zip', 'txt', 'file']);
const CASE_TYPES = new Set(['main', 'guided', 'micro', 'composite', 'assessment']);
const GROUP_DIRECTORIES = {
  raw: '00_原始资料', task: '01_任务卡', output: '02_课堂产出',
  acceptance: '03_验收记录', template: '04_复现模板',
};
const PUBLIC_EXTENSIONS = new Set([
  '.html', '.htm', '.css', '.js', '.mjs', '.json', '.csv', '.tsv', '.xml', '.txt', '.md', '.markdown',
  '.pdf', '.xlsx', '.xls', '.ods', '.docx', '.doc', '.pptx', '.ppt', '.png', '.jpg', '.jpeg',
  '.gif', '.webp', '.svg', '.ico', '.avif', '.woff', '.woff2', '.ttf', '.otf', '.mp4', '.webm',
  '.mp3', '.wav', '.zip',
]);
const EXCLUDED_NAMES = new Set(['manifest.json', 'requirements.txt', 'package.json', 'package-lock.json']);
const REGISTRY_NAME = '.generated-files.json';
const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

const fail = (message) => { throw new Error(message); };
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
const text = (value, context) => typeof value === 'string' && value.trim() ? value : fail(`${context} 必须是非空字符串`);
const identifier = (value, context) => ID.test(text(value, context)) ? value : fail(`${context} 包含非法字符`);

function relativePath(value, context) {
  text(value, context);
  if (value.includes('\\') || /[%?#:\u0000-\u001f]/.test(value) || value.split('/').some((part) => !part || part.startsWith('.'))) {
    fail(`${context} 必须是安全相对路径：${value}`);
  }
  return value;
}

async function exists(filename) {
  try { return await lstat(filename); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function json(filename) {
  try { return JSON.parse(await readFile(filename, 'utf8')); }
  catch (error) { fail(`${filename}: ${error.message}`); }
}

function validateCatalog(catalog) {
  if (!Array.isArray(catalog.categories)) fail('catalog.categories 必须是数组');
  const categoryIds = new Set();
  const categoryCodes = new Set();
  const cases = new Map();
  for (const category of catalog.categories) {
    identifier(category.id, 'category.id');
    if (!/^[A-Z]$/.test(category.code)) fail(`${category.id}: category.code 必须是单个大写字母`);
    if (categoryIds.has(category.id) || categoryCodes.has(category.code)) fail(`重复大类 ID 或编号：${category.id}`);
    categoryIds.add(category.id); categoryCodes.add(category.code);
    text(category.title, `${category.id}.title`);
    if (!Array.isArray(category.lessons)) fail(`${category.id}.lessons 必须是数组`);
    const lessonIds = new Set();
    for (const lesson of category.lessons) {
      if (!new RegExp(`^${category.code}\\d{2}$`).test(lesson.id)) fail(`课次编号与大类不一致：${lesson.id}`);
      if (lessonIds.has(lesson.id)) fail(`重复课次 ID：${lesson.id}`);
      lessonIds.add(lesson.id);
      text(lesson.title, `${lesson.id}.title`);
      if (lesson.hours !== undefined && (!Number.isFinite(lesson.hours) || lesson.hours < 0)) fail(`${lesson.id}.hours 必须是非负数`);
      if (!Array.isArray(lesson.cases)) fail(`${lesson.id}.cases 必须是数组`);
      for (const caseStudy of lesson.cases) {
        if (!new RegExp(`^${category.code}-${lesson.id}-C\\d{2}$`).test(caseStudy.id)) fail(`案例编号与所属课次不一致：${caseStudy.id}`);
        if (cases.has(caseStudy.id)) fail(`重复案例 ID：${caseStudy.id}`);
        text(caseStudy.title, `${caseStudy.id}.title`);
        if (!CASE_TYPES.has(caseStudy.type)) fail(`${caseStudy.id}: 无效案例类型 ${caseStudy.type}`);
        cases.set(caseStudy.id, { category, lesson, caseStudy, relativeDir: `${category.id}/${lesson.id}/${caseStudy.id}` });
      }
    }
  }
  for (const { caseStudy } of cases.values()) {
    if (caseStudy.relatedCaseIds !== undefined) {
      if (!Array.isArray(caseStudy.relatedCaseIds)) fail(`${caseStudy.id}.relatedCaseIds 必须是数组`);
      const unique = new Set();
      for (const relatedId of caseStudy.relatedCaseIds) {
        if (!cases.has(relatedId) || relatedId === caseStudy.id || unique.has(relatedId)) fail(`${caseStudy.id}: 无效或重复关联案例 ${relatedId}`);
        unique.add(relatedId);
      }
    }
  }
  return cases;
}

// 不跟随符号链接，防止案例目录之外的文件被意外发布。
async function walk(directory, relative = '') {
  const files = [];
  const info = await exists(directory);
  if (!info) return files;
  if (info.isSymbolicLink() || !info.isDirectory()) fail(`资料目录必须是普通目录：${directory}`);
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const entryPath = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) fail(`资料目录不允许符号链接：${entryPath}`);
    if (entry.isDirectory()) files.push(...await walk(path.join(directory, entry.name), entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function publishable(filename) {
  return !EXCLUDED_NAMES.has(path.posix.basename(filename)) && PUBLIC_EXTENSIONS.has(path.posix.extname(filename).toLowerCase());
}

function dateString(value, context) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) || Number.isNaN(Date.parse(value))) fail(`${context}: 无效更新时间`);
  return value;
}

async function assertNoSymlinks(directory, relative) {
  let current = directory;
  const rootInfo = await exists(current);
  if (rootInfo?.isSymbolicLink()) fail(`输出目录不允许符号链接：${current}`);
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if ((await exists(current))?.isSymbolicLink()) fail(`输出路径不允许符号链接：${current}`);
  }
}

/** Prepare published case assets and a generated, frontend-ready resource index. */
export async function prepareMaterials({ rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') } = {}) {
  const sourceDir = path.join(rootDir, 'course-materials');
  const outputDir = path.join(rootDir, 'public', 'materials');
  const indexPath = path.join(rootDir, 'src', 'generated', 'materials.json');
  const cases = validateCatalog(await json(path.join(sourceDir, 'catalog.json')));
  const allSourceFiles = await walk(sourceDir);
  const manifests = allSourceFiles.filter((name) => path.posix.basename(name) === 'manifest.json');
  const entries = new Map();
  const outputFiles = new Map();

  for (const manifestPath of manifests) {
    const manifest = await json(path.join(sourceDir, manifestPath));
    const info = cases.get(manifest.caseId);
    if (!info) fail(`资料清单引用未登记案例：${manifest.caseId}`);
    if (manifestPath !== `${info.relativeDir}/manifest.json`) fail(`资料清单目录与所属课次不一致：${manifestPath}`);
    if (!Array.isArray(manifest.resources)) fail(`${manifest.caseId}.resources 必须是数组`);
    const caseFiles = allSourceFiles.filter((name) => name.startsWith(`${info.relativeDir}/`));
    for (const filename of caseFiles) {
      if (!publishable(filename)) continue;
      relativePath(filename, '资料文件路径');
      outputFiles.set(filename, await readFile(path.join(sourceDir, filename)));
    }
    for (const resource of manifest.resources) {
      identifier(resource.id, `${manifest.caseId}: resource.id`);
      const key = `${manifest.caseId}/${resource.id}`;
      if (entries.has(key)) fail(`重复资源 ID：${key}`);
      text(resource.title, `${key}.title`);
      if (!RESOURCE_TYPES.has(resource.type)) fail(`${key}: 无效资源类型 ${resource.type}`);
      if (!Object.hasOwn(GROUP_DIRECTORIES, resource.group)) fail(`${key}: 无效资料分组 ${resource.group}`);
      if (resource.updatedAt !== undefined) dateString(resource.updatedAt, key);
      if (resource.resourceRef) {
        if (resource.path !== undefined) fail(`${key}: path 和 resourceRef 不能同时出现`);
        identifier(resource.resourceRef.caseId, `${key}.resourceRef.caseId`);
        identifier(resource.resourceRef.resourceId, `${key}.resourceRef.resourceId`);
      } else {
        relativePath(resource.path, `${key}.path`);
        if (resource.path.split('/')[0] !== GROUP_DIRECTORIES[resource.group]) fail(`${key}: 资料路径与分组 ${resource.group} 不一致`);
        if (!publishable(resource.path)) fail(`${key}: 文件类型不在允许发布范围`);
        const extension = path.posix.extname(resource.path).slice(1).toLowerCase();
        if (resource.type !== 'file' && extension !== resource.type && !(resource.type === 'html' && extension === 'htm')) fail(`${key}: 资源类型与文件扩展名不一致`);
        if (!outputFiles.has(`${info.relativeDir}/${resource.path}`)) fail(`${key}: 资料文件不存在：${resource.path}`);
      }
      entries.set(key, { resource, info });
    }
  }

  const resolved = new Map();
  async function resolve(key, visiting = new Set()) {
    if (resolved.has(key)) return resolved.get(key);
    if (visiting.has(key)) fail(`循环资源引用：${[...visiting, key].join(' → ')}`);
    const entry = entries.get(key);
    if (!entry) fail(`资源引用不存在：${key}`);
    const { resource, info } = entry;
    let metadata;
    if (resource.resourceRef) {
      const target = await resolve(`${resource.resourceRef.caseId}/${resource.resourceRef.resourceId}`, new Set([...visiting, key]));
      if (resource.type !== target.type) fail(`${key}: 引用资源类型不一致`);
      metadata = { path: target.path, sizeBytes: target.sizeBytes, updatedAt: target.updatedAt };
    } else {
      const filename = `${info.relativeDir}/${resource.path}`;
      metadata = {
        path: `materials/${filename}`,
        sizeBytes: outputFiles.get(filename).length,
        updatedAt: (await stat(path.join(sourceDir, filename))).mtime.toISOString().slice(0, 10),
      };
    }
    const item = { id: resource.id, title: resource.title, type: resource.type, group: resource.group, ...metadata };
    if (resource.description) item.description = resource.description;
    if (resource.updatedAt) item.updatedAt = resource.updatedAt;
    resolved.set(key, item);
    return item;
  }
  const index = { cases: Object.fromEntries([...cases.keys()].map((id) => [id, []])) };
  for (const [key, { info }] of entries) index.cases[info.caseStudy.id].push(await resolve(key));

  // 只覆盖和清理此前由本脚本登记且内容未被修改的文件；其他手工资产保持原状。
  const registryPath = path.join(outputDir, REGISTRY_NAME);
  await assertNoSymlinks(path.join(rootDir, 'public'), `materials/${REGISTRY_NAME}`);
  const registry = await exists(registryPath) ? await json(registryPath) : { files: {} };
  if (!registry.files || typeof registry.files !== 'object' || Array.isArray(registry.files)) fail('生成文件登记无效');
  for (const [filename, previousHash] of Object.entries(registry.files)) {
    relativePath(filename, '生成文件登记路径');
    await assertNoSymlinks(outputDir, filename);
    const destination = path.join(outputDir, filename);
    if (await exists(destination)) {
      if (hash(await readFile(destination)) !== previousHash) fail(`生成文件已被手工修改，请先保存修改并更新源资料：${destination}`);
    }
  }
  for (const filename of outputFiles.keys()) {
    await assertNoSymlinks(outputDir, filename);
    if (!Object.hasOwn(registry.files, filename) && await exists(path.join(outputDir, filename))) fail(`发布路径已有非生成文件，不覆盖：${filename}`);
  }
  await assertNoSymlinks(path.join(rootDir, 'src'), 'generated/materials.json');
  for (const filename of Object.keys(registry.files)) {
    if (!outputFiles.has(filename)) await rm(path.join(outputDir, filename), { force: true });
  }
  for (const [filename, contents] of outputFiles) {
    const destination = path.join(outputDir, filename);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }
  await mkdir(outputDir, { recursive: true });
  await writeFile(registryPath, JSON.stringify({ files: Object.fromEntries([...outputFiles].map(([filename, contents]) => [filename, hash(contents)])) }, null, 2) + '\n');
  await mkdir(path.dirname(indexPath), { recursive: true });
  await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n');
  return { caseCount: cases.size, publishedCaseCount: manifests.length, resourceCount: entries.size, assetCount: outputFiles.size };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareMaterials().then((result) => {
    console.log(`资料准备完成：${result.caseCount} 个案例，${result.publishedCaseCount} 个资料包，${result.resourceCount} 份资源，${result.assetCount} 个公开文件。`);
  }).catch((error) => { console.error(`资料准备失败：${error.message}`); process.exitCode = 1; });
}
