# 提交到 GitHub 的方式

```powershell
git clone https://github.com/xiaoyi001yeye/pcUse.git
cd pcUse

# 将本压缩包解压后的内容复制到仓库根目录，然后执行：
git add .
git commit -m "feat: implement PC-Use Agent local MVP"
git push origin main
```

## 本地运行

```powershell
corepack enable
pnpm install
python -m venv agent-runtime/.venv
agent-runtime/.venv/Scripts/python -m pip install -r agent-runtime/requirements.txt
pnpm dev:desktop
```

## 打包

```powershell
git tag v0.2.0
git push origin v0.2.0
```

GitHub Actions 会在 Windows runner 上构建前端、打包 Python Runtime，并通过 Tauri 生成 EXE/MSI。
