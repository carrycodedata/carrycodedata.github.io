# Carrycode 课程资料库

React、TypeScript、Vite 构建的静态资料网站，部署到 GitHub Pages。资料按 **业务大类 → 课次 → 案例 → 资料分组 → 文件** 管理。销售大类保留课程总览中的 8 次课、56 个案例；目前 `S-S07-C01` 已接入真实资料，其余案例展示“资料待更新”。

`S-S07-C01` 中，`S` 表示销售大类，`S07` 表示第 7 次课，`C01` 表示第 1 个案例。它是案例编号。

## 本地运行与验证

使用 Node.js 22 和 npm：

```bash
npm ci
npm run dev
```

开发站点默认为 `http://localhost:3000`。`dev`、`lint`、`build` 都会先准备资料，初次启动无需手工生成索引。开发期间修改资料清单或原始文件后，重新执行 `npm run prepare:materials`，或重启开发服务。

```bash
npm run prepare:materials
npm run lint
npm test
npm run build
npm run preview
```

`lint` 执行 TypeScript 检查；测试覆盖资料发布、非法路径、错误清单、跨案例引用、原始网页依赖保留与生成文件保护。构建产物位于 `dist/`。

## 资料源目录

```text
course-materials/
├── catalog.json
└── sales/
    ├── S01/
    ├── ...
    └── S07/
        ├── S-S07-C01/
        │   ├── manifest.json
        │   └── 00_原始资料/
        │       ├── 02_静态竞品官网/
        │       ├── 03_JS动态活动页/
        │       ├── 04_评论平台训练页/
        │       └── ...
        └── S-S07-C02/
            ├── manifest.json
            └── 00_原始资料/
```

目录树展示管理方式；未提供资料的案例不需要创建空文件夹。现有 `S-S07-C01` 原始资料已迁入对应目录，网页之间以及 HTML、CSS、JS、JSON 之间的相对路径保持原样。

`catalog.json` 是课程目录的唯一数据源，保存大类、课次、案例、顺序、时长和教学关联。销售目录来源于仓库根目录的 `260821-V1-B课程-Codex销售支援16小时实战训练营-页面标题内容总览.html`。`sourcePage` 保存原始页码，`durationMinutes` 保存案例时间；总览中的引入页和小结页不另建案例资料包。

案例 `type` 可取 `main`（主案例）、`guided`（引导练习）、`micro`（微练习）、`composite`（复合执行案例）、`assessment`（综合验收点）。第 8 次课的类型单独登记，不按编号自动推断。

## 给已有案例添加资料

1. 在 `course-materials/<大类>/<课次>/<案例编号>/` 放入资料包。
2. 在资料包根目录添加 `manifest.json`，只登记要在网页资料列表中展示的入口。
3. 执行 `npm run prepare:materials` 检查路径、类型、所属课次和引用关系，再运行网站确认资料。

例如为 `S-S07-C02` 添加一个网页：

```json
{
  "caseId": "S-S07-C02",
  "resources": [
    {
      "id": "static-site",
      "title": "静态商品详情页",
      "type": "html",
      "group": "raw",
      "path": "00_原始资料/静态商品页/index.html",
      "description": "用于观察 HTML 结构与字段提取。",
      "updatedAt": "2026-09-06"
    }
  ]
}
```

`id` 是案例内唯一、用于分享链接的稳定标识，建议使用英文小写和连字符。`path` 相对于本案例目录；中文目录和文件名可以保留，路径不能包含 `..`、隐藏目录、反斜杠、`%`、`?`、`#` 或绝对路径。`description` 和 `updatedAt` 可省略，未指定更新时间时使用原始文件的修改日期。

支持的资源类型：`html`、`pdf`、`md`、`xlsx`、`csv`、`json`、`zip`、`txt`、`file`。`file` 用于其他允许发布的文件格式，例如 Word 或 PPTX；文件扩展名必须在准备脚本的 `PUBLIC_EXTENSIONS` 中。

| `group` | 目录 | 界面名称 |
| --- | --- | --- |
| `raw` | `00_原始资料/` | 原始资料 |
| `task` | `01_任务卡/` | 任务卡 |
| `output` | `02_课堂产出/` | 课堂产出 |
| `acceptance` | `03_验收记录/` | 验收记录 |
| `template` | `04_复现模板/` | 复现模板 |

只建立已有内容的分组。`path` 的第一个目录必须与 `group` 一致。

网页用到的 CSS、JavaScript、JSON、图片、字体及其他 HTML 页面随整个案例目录发布，不必逐一列入清单。例如评论页跨目录引用静态官网 CSS 的结构可以原样保留。HTML 使用真实 `src` 地址加载，动态页的 `fetch('activities.json')` 和“加载更多”功能继续按原目录工作。

隐藏文件、`manifest.json`、Python/Shell 脚本、`requirements.txt`、npm 配置以及未列入允许扩展名的文件保留在源资料目录，不进入公开产物。加入清单的文件如果不符合发布规则，构建会直接报错。

## 增加课次或案例

在 `catalog.json` 的对应大类 `lessons` 中增加课次，或者在已有课次的 `cases` 中增加案例：

```json
{
  "id": "S-S07-C08",
  "title": "新的网页分析案例",
  "type": "micro",
  "description": "简要说明本案例的任务。"
}
```

编号必须与大类和课次匹配，并且在总目录中唯一。新增大类时设置单字母大写 `code`（例如销售为 `S`）；课次编号使用该前缀加两位数字。`hours` 是课次小时数，未知可设为 `0`。页面和路由根据目录自动生成，不需要为每个案例写组件。

## 跨案例共用资料

复合案例可通过 `relatedCaseIds` 表达教学关联，界面提供关联案例入口。它不会自动复制或发布另一案例的资料。类似“按本组实际调用记录”这样的选择性关联，可以保存在 `relatedCaseNote`。

如果两个案例确实共用同一份文件，在目标案例清单中使用 `resourceRef`：

```json
{
  "id": "shared-dynamic-activities",
  "title": "共用动态活动页",
  "type": "html",
  "group": "raw",
  "resourceRef": {
    "caseId": "S-S07-C01",
    "resourceId": "dynamic-activities"
  }
}
```

`resourceRef` 与 `path` 只能出现一种；引用类型必须与源资源相同。生成的资料索引使用源文件地址、大小和日期，避免多份副本。无效引用、重复资源 ID、循环引用都会使准备步骤失败。

## 路由与网页地址

站内使用 HashRouter，GitHub Pages 接收的请求仍是站点根页面，因此直接打开、刷新和浏览器前进后退都能恢复对应位置。

| 页面 | 示例路径 |
| --- | --- |
| 首页 | `/` |
| 销售目录 | `/#/sales` |
| 展开第 7 次课 | `/#/sales/lessons/S07` |
| 第 1 个案例 | `/#/sales/lessons/S07/cases/S-S07-C01` |
| 动态网页站内预览 | `/#/sales/lessons/S07/cases/S-S07-C01/resources/dynamic-activities` |
| 独立 HTML | `/materials/sales/S07/S-S07-C01/00_原始资料/03_JS动态活动页/index.html` |

正式域名为 `https://carrycodedata.github.io`。站内链接用于在课程资料库中导航；原始 HTML 链接可以直接交给客户浏览或用于训练中的网页分析。Markdown 在站内阅读，HTML 和 PDF 提供预览，表格及其他文件提供原始文件入口与下载。

## 生成产物与部署

`scripts/prepare-materials.mjs` 读取源资料并生成：

- `public/materials/`：保留案例目录结构的公开文件。
- `src/generated/materials.json`：按案例编号组织的前端资源索引，包括地址、字节大小和更新时间。

只维护 `course-materials/`。生成目录已被 Git 忽略，Vite 在构建时将公开文件复制到 `dist/materials/`。准备脚本记录自己生成的文件；重新构建只清理已登记的旧文件，并保留其他手工资产。如果生成文件被手工修改，脚本会停止，需先把修改保存回资料源再恢复生成文件。

GitHub Actions 在 `main` 收到提交或手动运行时执行 `npm ci`、类型检查、资料测试和正式构建，再将 `dist/` 发布到 GitHub Pages。仓库的 Pages 来源应设置为 **GitHub Actions**。添加新资料后，提交资料源、清单和必要的目录变更即可，无需上传生成的 `public/materials/` 或 `dist/`。
