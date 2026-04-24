# Tool schema

A tool call has this shape:

```json
{
  "id": "call_xxx",
  "tool": "file",
  "action": "open",
  "args": { "path": "C:\\Users\\Public\\Documents\\readme.txt" },
  "title": "Open file",
  "description": "...",
  "risk": "low"
}
```

Supported MVP tools:

- file.open
- file.read_preview
- file.list_dir
- cmd.run
- browser.open_url
- browser.search
- browser.click_selector
- uia.list_windows
- uia.click_text
- vision.screenshot
- system.context
