# dsh-proxy-panel

DSH web 插件：在 3080 的 DSH 界面 **设置** 页提供一个 **代理状态** 面板，实时显示本机 mihomo（proxy-gate）的节点 / 延迟 / 运行状态 / 监听端口。

已上架 [DSH Hub](https://dsh-hub.cc) 插件市场（`seconic037/dsh-proxy-panel`）。

## 功能

- **运行状态**：mihomo 控制 API 是否可达（`running`）
- **监听端口**：mihomo mixed-port（默认 7890）
- **代理组 / 当前节点**：组名（默认 `Ghelper`）与正式选中的节点（如 `🇸🇬 新加坡`）
- **延迟**：面板每 5 秒自动刷新延迟；也可点「测延迟」立即触发一次
- **只读**：不修改任何 mihomo / 代理配置，仅读取状态

## 安装

从 GitHub 源安装（锁定 `v0.1.0` tag，仓库已提交预构建 `lib/`，无需生命周期脚本）：

```sh
dsh plugin --profile web add github:seconic037/dsh-proxy-panel#v0.1.0
```

或从 DSH Hub 市场 / npm / tarball 安装预构建版：

```sh
dsh plugin --profile web add seconic037/dsh-proxy-panel
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

- `controller`：mihomo 的 `external-controller` 地址（面板只读它，默认本机 54438）。
- `group`：要监视的代理组名（默认 `Ghelper`，即 mihomo 配置里 `proxy-groups` 中按延迟选优的那个组）。

## 配置 mihomo 接入面板（以 Ghelper 服务商为例）

本插件**不包含**任何代理服务商订阅或节点信息，它只读你本机已运行的 mihomo。要让面板显示数据，你的 mihomo 需要满足三点（**以下示例用占位符 `https://example.com/subscription-url`，请替换成你自己的订阅地址**）：

1. **开启控制 API**（面板读取入口）：

   ```yaml
   # config.yaml
   external-controller: 127.0.0.1:54438   # 面板默认读取这个地址
   mixed-port: 7890                       # 代理监听端口（面板显示用）
   ```

2. **proxy-providers 指向你的订阅文件**（Ghelper 等机场订阅格式通用）：

   ```yaml
   proxy-providers:
     ghelper:
       type: file
       path: /path/to/your-subscription.yml   # 或 type: url + url: 你的订阅链接
   ```

3. **定义一个 url-test 代理组**引用该 provider（`Ghelper` 即面板默认监视的组名）：

   ```yaml
   proxy-groups:
     - name: Ghelper
       type: url-test
       use: [ghelper]
       url: https://www.gstatic.com/generate_204
       interval: 300
   ```

> 若你的机场提供 **Clash 订阅链接**（形如 `https://example.com/api/v1/client/subscribe?token=...`），也可直接：

```yaml
proxy-providers:
  ghelper:
    type: url
    url: https://example.com/api/v1/client/subscribe?token=YOUR_TOKEN_HERE
    interval: 86400
```

**安全提示**：订阅链接内含你的账号令牌，属于私人凭据——请勿写入任何公开仓库 / README / 提交历史。本插件的仓库刻意不包含任何真实订阅信息。

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
