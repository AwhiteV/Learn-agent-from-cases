import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  buildAdvancedViewModel,
  getCollapsedAdvancedSections,
} from "../components/learning-assistant";

interface LearningStepContract {
  title: string;
  type: "action" | "observation" | "comparison" | "term" | "checkpoint";
  targetId?: string;
  beginner: {
    doThis: string;
    watchHere: string;
    notice: string;
    whyItMatters: string;
    termNote?: string;
  };
  advanced?: {
    trigger: string;
    visibleEffect: string;
    internals: string;
    files: Array<{ path: string; role: string }>;
    functions?: Array<{ name: string; file: string; role: string }>;
    dataFlow: string[];
    relationships?: string[];
  };
}

interface LearningScriptContract {
  chapterId: string;
  chapterTitle: string;
  summary: string;
  steps: LearningStepContract[];
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptPath = path.join(projectRoot, "lib", "learning-assistant-script.ts");

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertAdvancedArtifacts(step: LearningStepContract) {
  if (!step.advanced) {
    return;
  }

  for (const file of step.advanced.files) {
    assert.equal(
      fs.existsSync(path.join(projectRoot, file.path)),
      true,
      `Expected advanced file "${file.path}" to exist in 06`,
    );
  }

  for (const fn of step.advanced.functions ?? []) {
    const source = fs.readFileSync(path.join(projectRoot, fn.file), "utf8");
    const escapedName = escapeRegExp(fn.name);
    const declarationPattern = new RegExp(
      String.raw`(?:export\s+)?(?:async\s+)?function\s+${escapedName}\b|(?:public|protected|private)?\s*${escapedName}\s*\(|const\s+${escapedName}\s*=`,
      "m",
    );

    assert.equal(
      declarationPattern.test(source),
      true,
      `Expected function "${fn.name}" to be declared in ${fn.file}`,
    );
  }
}

async function loadLearningScript(): Promise<LearningScriptContract> {
  assert.equal(
    fs.existsSync(scriptPath),
    true,
    "Expected 06 learning-assistant-script.ts to exist",
  );

  const loadedModule = (await import(pathToFileURL(scriptPath).href)) as {
    learningScript: LearningScriptContract;
  };

  return loadedModule.learningScript;
}

test("learning script defines the remote-and-multi-provider walkthrough contract", async () => {
  const learningScript = await loadLearningScript();

  assert.equal(learningScript.chapterId, "06-remote-and-multi-provider");
  assert.equal(learningScript.chapterTitle, "远程与多 Provider 学习助手");
  assert.equal(learningScript.steps.length, 5);
  assert.equal(typeof learningScript.steps[0].beginner.doThis, "string");
  assert.deepEqual(learningScript.steps[2].advanced?.dataFlow, [
    "provider switcher",
    "chat console state",
    "/api/chat",
    "provider registry",
    "provider inspector",
  ]);
  assert.deepEqual(
    learningScript.steps.map((step) => ({
      title: step.title,
      type: step.type,
      targetId: step.targetId ?? null,
    })),
    [
      {
        title: "选择一个 provider",
        type: "action",
        targetId: "provider-switcher",
      },
      {
        title: "发送同一条请求",
        type: "action",
        targetId: "chat-input",
      },
      {
        title: "查看稳定抽象层",
        type: "term",
        targetId: "provider-inspector",
      },
      {
        title: "对比 transcript 输出",
        type: "comparison",
        targetId: "transcript-panel",
      },
      {
        title: "检查 provider 专属说明",
        type: "checkpoint",
        targetId: "provider-inspector",
      },
    ],
  );
  assert.equal(
    learningScript.steps[1].advanced?.functions?.some(
      (fn) => fn.name === "handleSubmit",
    ),
    true,
  );
  assert.equal(
    learningScript.steps[1].advanced?.functions?.some((fn) => fn.name === "POST"),
    true,
  );
  assert.equal(
    learningScript.steps[1].advanced?.functions?.some(
      (fn) => fn.name === "getProviderById",
    ),
    true,
  );

  for (const step of learningScript.steps) {
    assertAdvancedArtifacts(step);
  }
});

test("learning target ids stay mounted in the remote-and-multi-provider UI", async () => {
  const learningScript = await loadLearningScript();
  const chatConsole = fs.readFileSync(
    path.join(projectRoot, "components", "chat-console.tsx"),
    "utf8",
  );
  const providerSwitcher = fs.readFileSync(
    path.join(projectRoot, "components", "provider-switcher.tsx"),
    "utf8",
  );
  const providerInspector = fs.readFileSync(
    path.join(projectRoot, "components", "provider-inspector.tsx"),
    "utf8",
  );

  const actualTargets = new Set(
    Array.from(
      `${chatConsole}\n${providerSwitcher}\n${providerInspector}`.matchAll(
        /data-learning-target="([^"]+)"/g,
      ),
      (match) => match[1],
    ),
  );

  for (const targetId of learningScript.steps
    .map((step) => step.targetId)
    .filter((value): value is string => Boolean(value))) {
    assert.equal(
      actualTargets.has(targetId),
      true,
      `Expected target "${targetId}" to exist in the mounted 06 UI`,
    );
  }
});

test("learning assistant drawer exposes the implementation-view helpers", () => {
  const drawerSource = fs.readFileSync(
    path.join(projectRoot, "components", "learning-assistant.tsx"),
    "utf8",
  );

  assert.equal(drawerSource.includes("操作引导"), true);
  assert.equal(drawerSource.includes("实现视角"), true);
  assert.equal(drawerSource.includes("行为链"), true);
  assert.equal(drawerSource.includes("发生了什么"), true);
  assert.equal(drawerSource.includes("看代码"), true);
  assert.equal(drawerSource.includes("数据流"), true);

  const advancedView = buildAdvancedViewModel({
    trigger: "你切换 provider 后，用同一条 message 再次提交。",
    visibleEffect:
      "provider inspector、execution mode 和 transcript 都会更新，但同一个 chat console 仍然复用。",
    internals:
      "前端先把 activeProviderId 保存在 chat console state，submit 时再把 providerId 交给 /api/chat，由 provider registry 查出具体 provider，并把统一结果交回 inspector。",
    files: [
      { path: "components/provider-switcher.tsx", role: "切换当前 provider" },
      { path: "components/chat-console.tsx", role: "发起统一 chat 请求" },
      { path: "lib/providers/index.ts", role: "提供 provider registry" },
    ],
    functions: [
      {
        name: "handleSubmit",
        file: "components/chat-console.tsx",
        role: "把 providerId 和 message 组装成 chat 请求",
      },
      {
        name: "getProviderById",
        file: "lib/providers/index.ts",
        role: "根据 providerId 找到 provider adapter",
      },
    ],
    dataFlow: [
      "provider switcher",
      "chat console state",
      "/api/chat",
      "provider registry",
      "provider inspector",
    ],
  });

  assert.deepEqual(getCollapsedAdvancedSections(), {
    code: false,
    flow: false,
  });
  assert.equal(advancedView.behaviorChain.title, "行为链");
  assert.equal(advancedView.whatHappened.title, "发生了什么");
  assert.equal(advancedView.code.files.length, 3);
  assert.equal(advancedView.code.functions.length, 2);
  assert.equal(
    advancedView.code.functions.some((fn) => fn.name === "getProviderById"),
    true,
  );
  assert.deepEqual(advancedView.dataFlow, [
    "provider switcher",
    "chat console state",
    "/api/chat",
    "provider registry",
    "provider inspector",
  ]);
});
