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
