export interface SharedToolResult {
  ok: boolean;
  output?: unknown;
  error?: string;
  artifacts?: Record<string, string>;
}
