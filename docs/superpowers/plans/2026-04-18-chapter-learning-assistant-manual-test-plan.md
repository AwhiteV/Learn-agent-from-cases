# Chapter Learning Assistant Manual Test Plan

## Goal

Verify that the in-page floating button and drawer-style learning assistant works consistently across chapters `01` through `06`, and that each chapter-specific guide points to the right UI and teaching moment.

## Test Scope

- `01-quick-start`
- `02-tools-and-mcp`
- `03-agent-with-permission`
- `04-agent-teams`
- `05-memory-and-skills`
- `06-remote-and-multi-provider`

## General Smoke Test

Run these checks in every chapter before chapter-specific testing:

1. Start the chapter app and confirm the page loads normally.
2. Confirm a `学习助手` button is visible in the bottom-right corner.
3. Click the button and confirm the right-side drawer opens.
4. Confirm the drawer shows the chapter title, summary, current step, and step count.
5. Click `下一步` and `上一步` to confirm step navigation works and the count updates correctly.
6. Click `关闭` and confirm the drawer closes and the floating button returns.
7. Resize the browser to a narrower desktop width and confirm the drawer does not make the main flow unusable.

## Chapter-Specific Checks

### 01 Quick Start

1. Open the learning assistant and confirm the steps reference the chat input, message area, session list, and file explorer.
2. Send one message and confirm the learning assistant guidance still matches the actual streaming UI.
3. Create or switch a session and confirm the referenced session area is easy to find.

### 02 Tools And MCP

1. Send a request that triggers tool usage.
2. Confirm the learning assistant points to the visible tool activity region instead of empty space.
3. Check the tool activity while it is running and again after it completes.
4. Close the learning assistant and confirm the tool region remains readable without permanent obstruction.

### 03 Agent With Permission

1. Send a request that triggers the permission or question flow.
2. Confirm the learning assistant steps match the permission selector or question UI.
3. Test allow, deny, and question-answer paths and confirm the guidance still matches the real behavior.
4. Confirm the short terminology help is accurate and not overly long.

### 04 Agent Teams

1. Send a task that can be decomposed into multiple subtasks.
2. While the run is active, confirm the learning assistant points to a visible team tree.
3. After completion, inspect the historical team view and confirm the hierarchy is still preserved rather than flattened.
4. Check the task list and final aggregated response to confirm the walkthrough order makes sense.

### 05 Memory And Skills

1. Add one memory and confirm the learning assistant first guides attention to the memory panel.
2. Switch the active skill preset and confirm the guidance matches the skill selector.
3. Send the same question twice while changing only memory or skill and confirm the transcript guidance remains correct.
4. Confirm the prompt preview and injected memory block explanation matches the visible debug cards.
5. Open the drawer in its default `操作引导` mode and confirm the 05 chapter copy starts from the expected teaching step.
6. Switch to `实现视角` and confirm the current step number stays unchanged while the content changes to implementation-oriented guidance.
7. Confirm `行为链 / 发生了什么` is visible by default in the implementation view.
8. Expand `看代码 / 数据流` and confirm the panel reveals the code and data-flow explanation without changing the active step.
9. Switch to a different step and confirm any expanded implementation sections reset to the collapsed state.

### 06 Remote And Multi Provider

1. Send one request with one provider, switch providers, and resend the same request.
2. Confirm the learning assistant points to the provider switcher, input area, transcript, and provider inspector in a sensible order.
3. Check that `stable abstraction`, `provider notes`, and `execution mode` explanations match the on-page wording.
4. Confirm switching providers does not reset or break the learning assistant flow.
5. Open the drawer in its default `操作引导` mode and confirm the 06 chapter copy starts from the expected teaching step.
6. Switch to `实现视角` and confirm the current step number stays unchanged while the content changes to implementation-oriented guidance.
7. Confirm `行为链 / 发生了什么` is visible by default in the implementation view.
8. Expand `看代码 / 数据流` and confirm the panel reveals the code and data-flow explanation without changing the active step.
9. Switch to a different step and confirm any expanded implementation sections reset to the collapsed state.

## Interaction And Usability Checks

1. With the drawer open, confirm the main page can still scroll, click, and accept input.
2. Close and reopen the drawer and confirm the current step behavior is as expected.
3. Confirm long step content scrolls inside the drawer instead of overflowing.
4. Refresh the page and confirm the learning assistant starts closed by default.
5. Confirm there are no obvious console errors caused by the learning assistant or `data-learning-target` hooks.

## Edge Cases

1. Without taking any chapter action, step through the drawer and confirm it does not point to UI regions that do not exist on the page.
2. Before messages, tool output, or team activity appear, confirm the guidance uses future-facing observation wording rather than pretending the result already exists.
3. At narrower desktop widths, confirm the drawer does not permanently cover the primary send button or the key region being discussed.

## Pass Criteria

- All six chapters can open and close the learning assistant.
- Step navigation works without blank or broken states.
- Each chapter guide points to real visible UI regions.
- The learning assistant does not block the primary chapter workflow.
- `04-agent-teams` preserves hierarchy in historical team views.
- `05-memory-and-skills` and `06-remote-and-multi-provider` keep their guide copy aligned with the real page behavior.
- `05-memory-and-skills` and `06-remote-and-multi-provider` both expose the extra `实现视角` mode, and its collapsible sections behave consistently across step changes.
