# dsh-proxy-panel

DSH web 插件：在 3080 的 DSH 界面 **设置** 页提供一个 **代理状态** 面板，实时显示本机 mihomo（proxy-gate）的节点 / 延迟 / 运行状态 / 监听端口。

## 功能

- **运行状态**：mihomo 控制 API 是否可达（`running`）
- **监听端口**：mihomo mixed-port（默认 7890）
- **代理组 / 当前节点**：组名（默认 `Ghelper`）与正式选中的节点（如 `🇸🇬 新加坡`）
- **延迟**：面板每 5 秒自动刷新延迟；也可点「测延迟」立即触发一次
- **只读**：不修改任何 mihomo / 代理配置，仅读取状态

## 安装

```sh
# 从 Git 源安装（需先构建产物在仓库中，本包已提交预构建 lib/）
dsh plugin --profile web add github:<you>/dsh-proxy-panel#<commit-sha>

# 或从 npm / tarball 安装预构建版
dsh plugin --profile web add dsh-proxy-panel
```

安装后重启 web profile 并硬刷新浏览器，打开 **设置 → 代理状态**。

## 配置（可选）

默认配置即可工作（`controller: http://127.0.0.1:54438`, `group: Ghelper`）。如需覆盖，在 profile 的 `cordis.patch.yml` 中按 `id: proxy-panel` 覆盖：

```yaml
- id: proxy-panel
  config:
    controller: http://127.0.0.1:54438
    group: Ghelper
```

## 前置

- 本机运行 mihomo，且 `external-controller` 指向面板的 `controller`（默认 127.0.0.1:54438）。proxy-gate 的 `config.yaml` 默认即此地址。

## 权限

- 面板通过 DSH 宿主的 `webServer` 暴露只读 `/_dsh/proxy-panel/status` 路由，再由浏览器同源访问。
- 插件不做代理变更、不写文件、不碰系统代理设置。
- 唯一的外部依赖是 mihomo 控制 API（TCP 127.0.0.1:54438 同源回环）。

## 卸载

```sh
dsh plugin --profile web remove dsh-proxy-panel
```

## 源码构建

```sh
pnpm install
pnpm build   # 产出 lib/（index.mjs 宿主 + client.js 浏览器端）
```

## 许可

MIT
