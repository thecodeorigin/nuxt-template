export function removeEmptyTags(html: string): string {
  // Remove empty <p> tags from tiptap editor
  return html.replace(/<p>\s*<\/p>/g, '')
}
