export const TOOL_NAMES = ['file', 'cmd', 'browser', 'uia', 'vision', 'system', 'registry'] as const;
export type ToolName = (typeof TOOL_NAMES)[number];
