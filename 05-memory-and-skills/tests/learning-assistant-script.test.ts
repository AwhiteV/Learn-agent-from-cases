import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

interface LearningStepContract {
  title: string;
  type: "action" | "observation" | "comparison" | "term" | "checkpoint";
  targetId?: string;
}

interface LearningScriptContract {
  chapterId: string;
  chapterTitle: string;
  summary: string;
  steps: LearningStepContract[];
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptPath = path.join(projectRoot, "lib", "learning-assistant-script.ts");

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
