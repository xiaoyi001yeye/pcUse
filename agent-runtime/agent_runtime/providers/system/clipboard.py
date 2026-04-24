from __future__ import annotations


def get_clipboard_text() -> str:
    try:
        import tkinter as tk
        root = tk.Tk()
        root.withdraw()
        data = root.clipboard_get()
        root.destroy()
        return data
    except Exception:
        return ""
