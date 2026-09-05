import { Category, FileItem, LessonGroup } from './types';

export const categories: Category[] = [
  { id: 'admin', title: 'codex管理后台', description: '管理后台相关操作文档与系统说明资源' },
  { id: 'marketing', title: 'codex市场宣传', description: '市场推广方案、品牌视觉规范及宣传物料' },
  { id: 'sales', title: 'codex销售', description: '销售体系赋能、课程原始资料与客户沟通话术' },
];

export const mockLessonGroups: Record<string, LessonGroup[]> = {
  'sales': [
    {
      id: 'S-Lesson-01',
      title: '第1次课：客户应对实务',
      description: '快速回复、需求整理与跟进记录 (1小时)',
      courses: [
        { id: 'S-S01-C01', title: '商谈记录转客户需求、下一步与负责人' },
        { id: 'S-S01-C02', title: '提案前资料齐不齐？一键检查' },
        { id: 'S-S01-C03', title: '杂乱拜访记录转CRM客户记录' },
        { id: 'S-S01-C04', title: '客户问询及时回复与真人口吻' },
        { id: 'S-S01-C05', title: '客户版与内部版文件防误发' },
        { id: 'S-S01-C06', title: '发送前30秒致命错误检查' },
        { id: 'S-S01-C07', title: '客户全生命周期责任与修改日志' },
      ]
    },
    {
      id: 'S-Lesson-02',
      title: '第2次课：客户管理实务',
      description: '线索整理、邮件分类、问卷分析与轻量CRM (2小时)',
      courses: [
        { id: 'S-S02-C01', title: '潜在客户去重、归属与公共池' },
        { id: 'S-S02-C02', title: '邮件按产品、客户阶段分类跟进' },
        { id: 'S-S02-C03', title: '本地/云端轻量CRM搭建与可用验收' },
        { id: 'S-S02-C04', title: '报价・提案文件批量命名与最新版本识别' },
        { id: 'S-S02-C05', title: '提案前AI预演：缺口、追问与攻击点' },
        { id: 'S-S02-C06', title: '客户调查问卷、匹配度与购买意向评分' },
        { id: 'S-S02-C07', title: '销售人员变更时的客户交接包' },
      ]
    },
    {
      id: 'S-Lesson-03',
      title: '第3次课：提案制作实务',
      description: '把客户需求变成客户看得懂的提案 (3小时)',
      courses: [
        { id: 'S-S03-C01', title: '拜访记录转简单客户提案PPT' },
        { id: 'S-S03-C02', title: '问卷结果转个性化销售方案' },
        { id: 'S-S03-C03', title: '复杂商品用三句话讲明白' },
        { id: 'S-S03-C04', title: '旧提案套模板并更新事实' },
        { id: 'S-S03-C05', title: '客户长需求/询价资料转重点与提案结构' },
        { id: 'S-S03-C06', title: '客户提案中的一张数据图' },
        { id: 'S-S03-C07', title: '把专业话术改成客户听得懂的回答' },
      ]
    },
    {
      id: 'S-Lesson-04',
      title: '第4次课：成交跟进实务',
      description: '合同与承诺检查、方案更新与下一步管理 (2小时)',
      courses: [
        { id: 'S-S04-C01', title: '报价・提案・合同一致性检查' },
        { id: 'S-S04-C02', title: 'NDA与数据条款的销售前置检查' },
        { id: 'S-S04-C03', title: '夸大承诺与高风险说法检查' },
        { id: 'S-S04-C04', title: '客户异议分类与回复策略' },
        { id: 'S-S04-C05', title: '多轮跟进节奏与漏跟进提醒' },
        { id: 'S-S04-C06', title: '口头承诺风险、证据与书面确认闭环' },
        { id: 'S-S04-C07', title: '方案更新后快速通知客户并突出差异' },
      ]
    },
    {
      id: 'S-Lesson-05',
      title: '第5次课：销售内容制作',
      description: '多平台文案、定时发布与高效工作流展示 (3小时)',
      courses: [
        { id: 'S-S05-C01', title: '一页讲清产品：对象、痛点、价值、下一步' },
        { id: 'S-S05-C02', title: '远程产品展示与VR看房行业分支' },
        { id: 'S-S05-C03', title: '同一商品的多平台文案与授权定时发布实操' },
        { id: 'S-S05-C04', title: '同行业痛点故事库' },
        { id: 'S-S05-C05', title: '客户跟进回复包：及时、自然、有下一步' },
        { id: 'S-S05-C06', title: '10～15秒高效工作流展示' },
        { id: 'S-S05-C07', title: '销售素材库：按行业、产品、阶段快速找' },
      ]
    },
    {
      id: 'S-Lesson-06',
      title: '第6次课：销售数据分析',
      description: '每日指标、停滞客户与销售看板 (2小时)',
      courses: [
        { id: 'S-S06-C01', title: '每日销售数据驾驶舱：Pipeline只是一个面板' },
        { id: 'S-S06-C02', title: '每日销售KPI' },
        { id: 'S-S06-C03', title: '转化漏斗与停滞客户提醒' },
        { id: 'S-S06-C04', title: '购买意向评分与实际成交偏差' },
        { id: 'S-S06-C05', title: '回款状态与提醒' },
        { id: 'S-S06-C06', title: '获客渠道、回复及时度与成交表现' },
        { id: 'S-S06-C07', title: '驾驶舱自动更新、异常提醒与行动台账' },
      ]
    },
    {
      id: 'S-Lesson-07',
      title: '第7次课：网页获客实务',
      description: '竞品监控、潜客收集与评论回复 (2小时)',
      courses: [
        { id: 'S-S07-C01', title: '多来源竞品监控：先判断网页类型再选抓取路线' },
        { id: 'S-S07-C02', title: '静态官网与商品详情页：HTTP＋DOM结构化抓取' },
        { id: 'S-S07-C03', title: 'JavaScript动态页、滚动加载与分页：浏览器自动化' },
        { id: 'S-S07-C04', title: '同行获客渠道地图＋公开潜客池' },
        { id: 'S-S07-C05', title: 'Google地图、Tabelog等评论平台：抓取评论并生成真人回复' },
        { id: 'S-S07-C06', title: 'RSS、公开API、PDF与网页快照：每日/隔日竞品更新' },
        { id: 'S-S07-C07', title: '客户问卷网页→自动评分→客户库→公司风格回复Agent' },
      ]
    },
    {
      id: 'S-Lesson-08',
      title: '第8次课：销售AI综合实战',
      description: '从发现客户到提案与跟进 (1小时)',
      courses: [
        { id: 'S-S08-C01', title: '餐饮门店：竞品活动、差评回复与当日驾驶舱' },
        { id: 'S-S08-C02', title: 'B2B新客户：公开获客、问卷评分、CRM与简单提案' },
        { id: 'S-S08-C03', title: '方案迭代：承诺审查、差异通知与漏跟进闭环' },
        { id: 'S-S08-C04', title: '网页抓取路线现场判断' },
        { id: 'S-S08-C05', title: '事实、价格、承诺红线抽检' },
        { id: 'S-S08-C06', title: '自动化失败与人工接管' },
        { id: 'S-S08-C07', title: '最终口头答辩：为什么这样组合' },
      ]
    }
  ],
  'admin': [
    {
      id: 'A-Lesson-01',
      title: '管理后台基础',
      description: '后台管理与配置培训',
      courses: [
        { id: 'A-A01-C01', title: '后台操作指南' },
      ]
    }
  ],
  'marketing': [
    {
      id: 'M-Lesson-01',
      title: '市场宣传基础',
      description: '品牌视觉与宣发策略',
      courses: [
        { id: 'M-M01-C01', title: '品牌VI手册' },
      ]
    }
  ]
};

const mockSpecificFiles: Record<string, FileItem[]> = {
  'S-S01-C01': [
    { id: 'f1', name: '商谈记录转客户需求.md', type: 'md', size: '12 KB', updatedAt: '2026-09-01' },
    { id: 'f2', name: '流程演示与标准SOP.pdf', type: 'pdf', size: '2.4 MB', updatedAt: '2026-09-02' },
    { id: 'f3', name: '客户需求模板展示.html', type: 'html', size: '45 KB', updatedAt: '2026-09-05' },
  ]
};

export const getFilesForCourse = (courseId: string): FileItem[] => {
  if (mockSpecificFiles[courseId]) return mockSpecificFiles[courseId];
  return [
    { id: `${courseId}-f1`, name: `${courseId}_实操指南.md`, type: 'md', size: '15 KB', updatedAt: '2026-09-05' },
    { id: `${courseId}-f2`, name: `${courseId}_演示课件.pdf`, type: 'pdf', size: '1.8 MB', updatedAt: '2026-09-05' },
    { id: `${courseId}-f3`, name: `${courseId}_互动示例.html`, type: 'html', size: '120 KB', updatedAt: '2026-09-05' },
  ];
};
