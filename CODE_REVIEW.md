# AI陪诊demo Code Review

- 项目：`d:\VibeCodingDemo\AI陪诊demo`
- 技术栈：纯静态 HTML / CSS / JS（零依赖、无构建），`serve.ps1` 自建 HttpListener 静态服务器
- 文件：`index.html`(~349行)、`styles.css`(~614行)、`script.js`(~329行)
- 审查结论：整体结构清晰、交互闭环完整，无高危安全/逻辑漏洞；发现 2 个功能 bug（已修）、1 处不合法 HTML（已修）、若干 i18n 与维护性建议

---

## 一、本轮已修复的问题

| 级别 | 问题 | 处理 |
|---|---|---|
| 功能 Bug | `appendTyping()` 未加 `bubble--typing` 类，打字三点动画完全不可见（气泡空白） | `script.js` 中补上 `bubble--typing` 类，三点动效恢复 |
| 结构 Bug | 病历弹层 `recordModal` 多一个 `</div>`，HTML 不合法 | 删除多余闭合标签，嵌套恢复平衡 |
| 样式冲突 | `.nav-bar` 同时声明 `position: sticky` 与 `position: relative`，前者被后者覆盖成为死代码 | 清理为 `position: relative` |
| i18n 缺口 | 缴费单副标题「缴费单 · Payment Receipt」在英文态仍含中文 | 加 `data-en="Payment Receipt"` |
| i18n 兜底 | 快捷入口/导航按钮找不到回复时的兜底文案英文态仍是中文 | 按当前语言输出 |

> 说明：审查过程中一度怀疑 `styles.css` 的 `:root` 被写成了 `::root`，经逐字节核对（`::root` 全文 0 命中）确认是行号前缀与内容冒号重叠造成的误读，**实际代码正确，未改动**。

---

## 二、需要关注的其它问题（建议后续处理）

### 功能 / 交互
1. **语言切换不追溯已发消息**：切换语言后，已经产生的用户消息、AI 回复、已展示的 toast 保持原语言，仅静态文案与之后的新回复生效。演示可接受，但"全英文体验"不完整。
2. **快捷入口无触发锁**：快速连点会追加多条"打字中 → 回复"，消息重复堆积。`step-card__action` 已做禁用，`quick-link` 未做。
3. `replyByText(text, opts)` 的 `opts.then` 从未被调用，属于无用参数（无害）。

### i18n / 可维护性
4. **文案双份维护**：中文正文与英文以 `data-en` 内联在 HTML 中；第四步与第五步的「查看病历详情」段落 `data-en` 完全相同（重复），后续改文案需改多处。建议收敛为 i18n 字典表 + `data-i18n` key，或至少提取公共常量。（**已优化**：抽为 `MEDICAL_RECORD_PARA` 公共常量，两处占位 `<p class="js-medical-record">` 由 JS 统一渲染，语言切换同步刷新）
5. **无障碍未本地化**：`aria-label`（返回/发送/切换语言）、图片 `alt` 在英文态仍是中文。
6. **病历章节编号跳号**：正文为 一、二、三、四、五、六、八、九（缺「七」），中文英文编号一致，但内容完整性建议确认。

### 样式 / 资源
7. `.msg--typing-wrap` 类在 CSS 中无对应样式（仅作 hook，无害）。
8. 平面图图片在 step2/3/4/5 重复引用同一文件，路径含 `%20` 编码（`file://` 下 Chrome/Edge 可正常解析，换环境需注意 URL 解码）。
9. 按钮普遍缺 `type="button"`（当前无表单，不会误触提交，规范上建议补全）。

### 健壮性 / 安全
10. 动态消息一律用 `textContent` 插入，无 XSS 风险；`applyLang` 使用 `innerHTML` 但内容均为本地静态字符串，风险可控。
11. `el.dataset.zh` 方案在元素间无嵌套 `data-en` 冲突（已核对），切换双向恢复安全。

---

## 三、做得好的地方

- **步骤卡状态机清晰**：`hidden` + `is-done` + `step-card--tap` 分工明确，上一步收起、下一步弹出，交互闭环完整。
- **事件委托设计合理**：`medical-link/bill-link/care-link` 弹层改为 document 级委托，天然兼容语言切换后节点重建，且卡片点击处加了 `closest(...)` 守卫避免误收起。
- **坑的正确处理**：`.msg[hidden]{display:none}` 修复了 `hidden` 被 `display:flex` 覆盖的经典问题。
- **零依赖易部署**：纯静态 + 自建 HttpListener，双击/一条命令即可运行。

---

## 四、优先级建议

1. （如继续打磨）补 `quick-link` 触发锁、本地化 `aria-label`。
2. （中）将重复的 `data-en` 段落抽成公共常量，减少双份维护成本。
3. （低）补齐 `type="button"`、确认病历章节「七」的完整性。
