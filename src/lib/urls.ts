const segment = (value: string) => encodeURIComponent(value);

export const categoryPath = (categoryId: string) => `/${segment(categoryId)}`;
export const lessonPath = (categoryId: string, lessonId: string) =>
  `${categoryPath(categoryId)}/lessons/${segment(lessonId)}`;
export const casePath = (categoryId: string, lessonId: string, caseId: string) =>
  `${lessonPath(categoryId, lessonId)}/cases/${segment(caseId)}`;
export const resourcePath = (categoryId: string, lessonId: string, caseId: string, resourceId: string) =>
  `${casePath(categoryId, lessonId, caseId)}/resources/${segment(resourceId)}`;

/** Keep Chinese filenames, spaces, # and ? safe without losing path separators. */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.split('/').map(segment).join('/')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
