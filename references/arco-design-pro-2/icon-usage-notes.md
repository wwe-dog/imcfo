# IMCFO 图标使用说明

## 当前实现

本项目没有直接引入 Arco Design Web 组件库，也没有安装 `@arco-design/web-react`、`@arco-design/web-vue` 或其他 Arco 运行时依赖。

当前移动端图标系统位于：

```text
D:\imcfo\mobile\src\components\AppIcon.tsx
```

实现方式：

- 使用项目已安装的 `react-native-svg`。
- 采用 Arco Design icons 常见的克制线性风格作为视觉参考。
- 图标为项目内语义化移动端图标封装，不直接复制 Arco 图标包运行时代码。
- 不引入 React DOM 或 Web/Admin UI 依赖。

## 使用边界

- 图标仅服务移动端信息层级、导航识别和列表可读性。
- 不使用微信、支付宝等彩色品牌 Logo，统一使用通用钱包/支付图标。
- 不改变会计公式、交易规则、存储 schema、报表计算或种子数据。
- 后续如果需要直接采用 Arco Design icons 的 SVG path，应先确认其 MIT License，并只保留 IMCFO 必需的小型子集。
