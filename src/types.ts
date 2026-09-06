export type CaseType = 'main' | 'guided' | 'micro' | 'composite' | 'assessment';
export type ResourceGroup = 'raw' | 'task' | 'output' | 'acceptance' | 'template';
export type FileType = 'html' | 'pdf' | 'md' | 'xlsx' | 'csv' | 'json' | 'zip' | 'txt' | 'file';

export interface ResourceItem {
  id: string;
  title: string;
  type: FileType;
  group: ResourceGroup;
  /** Unencoded path relative to the deployed site root. */
  path: string;
  sizeBytes: number;
  updatedAt: string;
  description?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  type: CaseType;
  description?: string;
  sourcePage?: string;
  durationMinutes?: number;
  relatedCaseIds?: string[];
  relatedCaseNote?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  hours: number;
  cases: CaseStudy[];
}

export interface Category {
  id: string;
  code: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Catalog {
  categories: Category[];
}
