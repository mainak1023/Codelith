export enum FileType {
  HTML = "html",
  CSS = "css",
  JavaScript = "javascript",
  JSON = "json",
  Markdown = "markdown",
  TypeScript = "typescript",
  Plain = "plaintext",
}

export interface File {
  id: string
  name: string
  content: string
  language: string
  type: FileType
}

