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
      `Expected advanced file "${file.path}" to exist in 05`,
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
    "Expected 05 learning-assistant-script.ts to exist",
  );

  const loadedModule = (await import(pathToFileURL(scriptPath).href)) as {
    learningScript: LearningScriptContract;
  };

  return loadedModule.learningScript;
}

test("learning script defines the memory-and-skills walkthrough contract", async () => {
  const learningScript = await loadLearningScript();

  assert.equal(learningScript.chapterId, "05-memory-and-skills");
  assert.equal(learningScript.chapterTitle, "Memory 与 Skills 学习助手");
  assert.equal(learningScript.steps.length, 5);
  assert.equal(typeof learningScript.steps[0].beginner.doThis, "string");
  assert.deepEqual(
    learningScript.steps.map((step) => ({
      title: step.title,
      type: step.type,
      targetId: step.targetId ?? null,
    })),
    [
      {
        title: "保存一条 memory",
        type: "action",
        targetId: "memory-panel",
      },
      {
        title: "切换当前 skill",
        type: "comparison",
        targetId: "skill-selector",
      },
      {
        title: "重新发送同一个问题",
        type: "action",
        targetId: "chat-input",
      },
      {
        title: "对比回答结果",
        type: "observation",
        targetId: "transcript-panel",
      },
      {
        title: "查看组装后的 prompt",
        type: "checkpoint",
        targetId: "prompt-preview",
      },
    ],
  );
  assert.equal(
    learningScript.steps[1].advanced?.functions?.some(
      (fn) => fn.name === "getSkillPresetById",
    ),
    true,
  );
  assert.equal(
    learningScript.steps[1].advanced?.functions?.some(
      (fn) => fn.name === "createSkillSpecificResponse",
    ),
    true,
  );

  for (const step of learningScript.steps) {
    assertAdvancedArtifacts(step);
  }
});

test("learning target ids stay mounted in the memory-and-skills UI", async () => {
  const learningScript = await loadLearningScript();
  const chatInterface = fs.readFileSync(
    path.join(projectRoot, "components", "chat-interface.tsx"),
    "utf8",
  );
  const memoryPanel = fs.readFileSync(
    path.join(projectRoot, "components", "memory-panel.tsx"),
    "utf8",
  );
  const skillSelector = fs.readFileSync(
    path.join(projectRoot, "components", "skill-selector.tsx"),
    "utf8",
  );

  const actualTargets = new Set(
    Array.from(
      `${chatInterface}\n${memoryPanel}\n${skillSelector}`.matchAll(
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
      `Expected target "${targetId}" to exist in the mounted 05 UI`,
    );
  }
});

test("learning assistant drawer exposes the implementation-view smoke labels", () => {
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
    trigger: "切换 skill preset 后重新发送同一个问题。",
    visibleEffect: "prompt preview 和 transcript 会展示不同回答框架。",
    internals:
      "组件先记录 selectedSkillId，再在 submit 时把它发到聊天路由，最后由 chat engine 解析成教学回复。",
    files: [
      { path: "components/skill-selector.tsx", role: "选择当前 skill preset" },
      { path: "components/chat-interface.tsx", role: "提交 chat 请求并保存状态" },
    ],
    functions: [
      {
        name: "getSkillPresetById",
        file: "lib/skill-presets.ts",
        role: "把 skill id 解析成对应 preset",
      },
      {
        name: "createSkillSpecificResponse",
        file: "lib/chat-engine.ts",
        role: "根据 selectedSkill.id 生成不同回答模板",
      },
    ],
    dataFlow: [
      "skill selector",
      "selectedSkillId state",
      "handleSubmit",
      "/api/chat",
      "chat engine",
      "prompt preview",
    ],
  });

  assert.deepEqual(getCollapsedAdvancedSections(), {
    code: false,
    flow: false,
  });
  assert.equal(advancedView.behaviorChain.title, "行为链");
  assert.equal(advancedView.whatHappened.title, "发生了什么");
  assert.equal(advancedView.code.files.length, 2);
  assert.equal(advancedView.code.functions.length, 2);
  assert.equal(
    advancedView.code.functions.some((fn) => fn.name === "getSkillPresetById"),
    true,
  );
  assert.equal(advancedView.dataFlow.includes("prompt preview"), true);
});
