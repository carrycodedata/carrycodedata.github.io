import catalogSource from '../course-materials/catalog.json';
import materialsSource from './generated/materials.json';
import type { Catalog, CaseStudy, CaseType, Category, Lesson, ResourceGroup, ResourceItem } from './types';

export const categories = (catalogSource as Catalog).categories;
const materials = materialsSource as { cases: Record<string, ResourceItem[]> };

export const caseTypeLabels: Record<CaseType, string> = {
  main: '主案例',
  guided: '引导练习',
  micro: '微练习',
  composite: '复合执行案例',
  assessment: '综合验收点',
};

export const resourceGroups: ResourceGroup[] = ['raw', 'task', 'output', 'acceptance', 'template'];
export const resourceGroupLabels: Record<ResourceGroup, string> = {
  raw: '原始资料',
  task: '任务卡',
  output: '课堂产出',
  acceptance: '验收记录',
  template: '复现模板',
};

export const getResourcesForCase = (caseId: string): ResourceItem[] => materials.cases[caseId] ?? [];

export function getCaseLocation(caseId: string):
  { category: Category; lesson: Lesson; caseStudy: CaseStudy } | undefined {
  for (const category of categories) {
    for (const lesson of category.lessons) {
      const caseStudy = lesson.cases.find(item => item.id === caseId);
      if (caseStudy) return { category, lesson, caseStudy };
    }
  }
  return undefined;
}
