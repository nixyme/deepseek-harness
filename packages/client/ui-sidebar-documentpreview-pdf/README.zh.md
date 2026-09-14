---
description: "右侧 Sidebar 文档预览的懒加载 PDF 渲染器：仅在读者打开 PDF 时加载完整 PDF.js 渲染能力。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-sidebar-documentpreview-pdf

[English](README.md) | 中文

## 概述

本包是 `ui-sidebar-documentpreview` 的懒加载伴生插件，用于在右侧 Sidebar 渲染 PDF。Host 会把这个不可变 bundle 保留在客户端模块图中，以便浏览器缓存和热更新；但不会把它放入首屏批次，也不会在启动时激活。轻量文档预览在打开 PDF 时请求本包，显示本地化加载进度，并在激活失败时提供重试。bundle 拥有 PDF.js、worker、cmap、标准字体、wasm 解码器、许可证以及 PDF 文档 store。

## 模型体验

无。这是仅运行在浏览器中的查看器，不注册工具、prompt 区块或 session 事件。

#### KV Cache 影响

没有直接影响；渲染所需的 PDF 字节和页面不会进入模型请求。

## 已知限制与延期工作

- **激活只属于当前浏览器。** 关闭标签页会释放渲染器 UI 状态；不可变插件 bundle 仍会留在浏览器 HTTP 缓存中。
- **只支持完整文件。** PDF 读取遵循文档预览的 `maxFileBytes` 上限。
- **应用层懒加载。** bundle 首次下载后，再次打开其他 PDF 不会重复下载。

<a id="dev-note"></a>
## 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

`dsh.client.lazy` 是启动协议中的一个加载层级，不是 PDF 渲染器的特殊逻辑。Host 组合会让该行保持可寻址，但不放入任何 application combo；`bootClient` 会跳过它；文档预览按需创建对应的 Cordis entry。

</details>

**运行时不变式：** PDF 元数据和 keyed body 只在懒激活后注册；轻量预览永远不会导入本包的运行时代码。不发布运行时不变式伴生入口，因为激活、注册、释放和渲染只能通过文档预览 slot 集成观察，相关行为已由测试覆盖。
