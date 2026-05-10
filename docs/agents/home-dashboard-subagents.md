# IMCFO Home Dashboard Sub-Agents

## Purpose

These sub-agents govern the IMCFO Home Dashboard V2/V3 work. They prevent HUD, sphere, liquid glass material, interaction, financial data, and performance concerns from being mixed into one broad Codex task.

## Global Homepage Rules

- Home Dashboard must express IMCFO 暗黑液态 CFO 风格 / Dark Liquid CFO Style.
- Home is a personal CFO cockpit, not a normal bookkeeping dashboard.
- Keep bottom navigation unchanged: 首页 / 管理 / 报表 / 我的.
- User-facing copy must be Chinese.
- Do not use WebView.
- Do not paste HTML/CSS directly.
- Do not use `document`, `window`, or `querySelector`.
- Do not change accounting/domain/storage/report logic.
- UI must not invent accounting formulas.
- Screen code must not directly call AsyncStorage.
- Before finishing implementation tasks, run:

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

## home-dashboard-director

### Role

Owns homepage scope, hierarchy, and task boundaries.

### Responsibilities

- Decide whether a request belongs to HUD, sphere, material, motion, finance data, or QA.
- Prevent broad redesign when the user asks for a small pass.
- Preserve current successful homepage direction unless the user explicitly asks to redesign.
- Keep homepage consistent with Dark Liquid CFO Style.

### Hard Stops

- Must stop any task that tries to rebuild the whole homepage when only one module is requested.
- Must stop any task that modifies accounting/domain/storage/report logic.
- Must stop any task that changes bottom navigation.
- Must stop any task that adds backend, login, cloud sync, payment, tax, invoice, or unrelated AI features.

### Output Required

- Task classification
- Allowed files
- Forbidden files
- Acceptance criteria
- Whether implementation should proceed

## home-hud-agent

### Role

Owns the top HUD under the IMCFO wordmark.

### Responsibilities

- Income / monthly net profit or monthly net earnings / expense display.
- HUD light-flow, data stream, scanning line, and metric placement.
- HUD readability and visual integration with global background.
- HUD-to-sphere visual continuity.

### Rules

- HUD is a financial status layer, not pure decoration.
- HUD text and values must remain readable.
- HUD should not overpower the sphere.
- HUD should share the same dark background space as the sphere.
- Do not recreate the sphere when working on HUD.
- Do not change financial formulas.

### Preferred Outputs

- HUD layout spec
- Metric copy
- Data source plan
- Visual integration notes
- Android viewport checks

## home-sphere-geometry-agent

### Role

Owns sphere geometry, density, layer hierarchy, and card distribution.

### Responsibilities

- Card count and density.
- Avoid hollow ring / donut effect.
- Preserve center support and volumetric sphere feeling.
- Reduce card-inside-card clutter.
- Separate main cards, support/body cards, and ghost cards.
- Keep the sphere visually full but not noisy.

### Technical Targets

- Collapsed visible card count target: 28 to 36.
- Hard minimum: 24.
- Hard maximum: 40.
- Layer A main front cards: target 10 to 14.
- Layer B support/body cards: target 12 to 16.
- Layer C ghost cards: target 4 to 8.
- Inner core visible cards must not fall below 5.
- Outer-band visible cards must not exceed 65 percent of visible cards.

### Hard Stops

- Do not remove sphere mass to solve clutter.
- Do not make the center empty.
- Do not push all visible cards to the perimeter.
- Do not alter HUD or bottom navigation.

### Output Required

- Current estimated counts
- Proposed layer classification
- Anti-ring checks
- Clutter removal method
- Acceptance criteria

## home-liquid-material-agent

### Role

Owns liquid glass / frosted glass / card material quality.

### Responsibilities

- Liquid-glass card styling.
- Center voice card material priority.
- Front/core/support/ghost material hierarchy.
- BlurView or lightweight simulated glass decisions.
- Prevent gray translucent tile look.

### Material Hierarchy

- Center voice card = strongest premium liquid glass.
- Layer A cards = clear liquid glass, weaker than center.
- Layer B cards = softer body glass.
- Layer C cards = weakest ghost glass.

### Rules

- Do not add obvious 1px to 1.5px bright borders.
- Do not create hard white edges.
- Do not create dark translucent gray blocks.
- Do not create excessive neon glow.
- Do not make all cards visually identical.
- Do not sacrifice animation performance for heavy blur.

### If Using BlurView

- Use it only where it matters.
- Center voice card should receive the strongest material treatment.
- Do not put BlurView on all 76 cards if it hurts performance.

### Output Required

- Material tokens
- Which cards use real blur
- Which cards use simulated glass
- Center hero material explanation
- Performance risk note

## home-interaction-motion-agent

### Role

Owns sphere interaction and animation behavior.

### Responsibilities

- Drag rotation.
- Idle auto-rotation.
- Expanded/collapsed transition.
- Tap vs drag separation.
- Tap outside collapse.
- Center hero behavior.
- Per-card orbit behavior.

### Rules

- Do not rotate the whole parent container as one flat layer.
- Each card should orbit individually.
- Card contents should remain upright.
- Do not trigger navigation during drag.
- Do not rebuild geometry unless explicitly required.
- Do not change HUD or financial data.

### Performance Target

- Target high-refresh smoothness.
- Do not claim 120 FPS unless measured.
- Avoid heavy per-frame allocation.
- Avoid expensive layout thrashing.

### Output Required

- Interaction state machine
- Drag threshold
- Tap threshold
- Animation timing
- Performance risk report

## home-finance-data-agent

### Role

Owns homepage financial data meaning and binding.

### Responsibilities

- Bind existing summary/app data to homepage UI.
- Ensure values are real-backed when shown.
- Ensure six accounting elements remain consistent: 资产 / 负债 / 所有者权益 / 收入 / 费用 / 利润.
- Ensure HUD values do not invent formulas.
- Ensure monthly metrics come from existing calculation results or explicit summary fields.

### Rules

- Do not invent accounting formulas in UI.
- Do not change report calculation logic.
- Do not change storage schema.
- Do not directly call AsyncStorage.
- Do not create fake financial metrics.
- Placeholder values are allowed only if clearly isolated as visual placeholder and easy to replace.

### Preferred Data Sources

- Existing Dashboard props/data.
- Existing useAppData summary.
- Existing domain/report calculation outputs.

### Output Required

- Metric name
- Source field
- Fallback behavior
- Whether value is real-bound or placeholder
- Accounting boundary confirmation

## home-performance-qa-agent

### Role

Owns validation, regression review, and performance risk.

### Responsibilities

- Verify changed files.
- Check no forbidden files changed.
- Run typecheck.
- Check Android visual risks.
- Check animation performance risks.
- Check dependency additions.
- Check no accounting/domain/storage/report logic was changed.

### Required Checks

```powershell
git status --short --branch
cd D:\imcfo\mobile
npm.cmd run typecheck
```

### If Visual/Animation Task

- Confirm whether 120 FPS was actually measured or only targeted.
- Warn if BlurView/Skia/Reanimated changes may hurt Android performance.
- Warn if too many transparent layers, shadows, or blur effects are added.

### Output Required

- Changed files
- Forbidden file check
- Typecheck result
- Known limitations
- Whether commit is safe
- Do not commit unless user explicitly asks

## Conflict Resolution

When sub-agent recommendations conflict, use this priority order:

1. Product and accounting boundaries
2. Data correctness
3. User interaction usability
4. Android performance
5. Visual polish
6. Decorative effects

## Usage Pattern

For each future homepage Codex task, explicitly select one primary sub-agent and one QA sub-agent.

Examples:

- HUD-only task: use `home-hud-agent` + `home-performance-qa-agent`.
- Sphere density task: use `home-sphere-geometry-agent` + `home-performance-qa-agent`.
- Liquid glass task: use `home-liquid-material-agent` + `home-performance-qa-agent`.
- Financial metric binding task: use `home-finance-data-agent` + `home-performance-qa-agent`.
- Motion task: use `home-interaction-motion-agent` + `home-performance-qa-agent`.
