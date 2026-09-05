export type ViewState = 'home' | 'category' | 'course';

export type FileType = 'html' | 'pdf' | 'md';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
}

export interface LessonGroup {
  id: string;
  title: string;
  description?: string;
  courses: Course[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
}
