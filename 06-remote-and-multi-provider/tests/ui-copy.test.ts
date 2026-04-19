import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("chapter 06 page copy uses Chinese learner-facing labels", () => {
  const layoutSource = read("app/layout.tsx");
  const chatConsoleSource = read("components/chat-console.tsx");
  const providerSwitcherSource = read("components/provider-switcher.tsx");
  const providerInspectorSource = read("components/provider-inspector.tsx");

  assert.equal(layoutSource.includes("第六章：远程与多 Provider"), true);
  assert.equal(layoutSource.includes("lang=\"zh-CN\""), true);
  assert.equal(chatConsoleSource.includes("06 · Remote & Multi-Provider"), true);
  assert.equal(chatConsoleSource.includes("当前 Provider"), true);
  assert.equal(chatConsoleSource.includes("通过当前 Provider 发送"), true);
  assert.equal(providerSwitcherSource.includes("Provider 切换器"), true);
  assert.equal(providerSwitcherSource.includes("选择执行路径"), true);
  assert.equal(providerInspectorSource.includes("Provider 检查面板"), true);
  assert.equal(providerInspectorSource.includes("稳定抽象层"), true);
});
