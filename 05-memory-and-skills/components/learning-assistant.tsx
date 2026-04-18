"use client";

import { useMemo, useState } from "react";

import {
  learningScript,
  type LearningStepAdvancedView,
  type LearningStepAdvancedFunction,
  type LearningStepAdvancedFile,
} from "@/lib/learning-assistant-script";

type AssistantMode = "beginner" | "advanced";
type ExpandedSection = "code" | "flow";

interface AdvancedSectionModel {
  title: string;
  content: string;
}

interface AdvancedCodeModel {
  files: LearningStepAdvancedFile[];
  functions: LearningStepAdvancedFunction[];
}

interface AdvancedViewModel {
  behaviorChain: AdvancedSectionModel;
  whatHappened: AdvancedSectionModel;
  code: AdvancedCodeModel;
  dataFlow: string[];
}

export function getCollapsedAdvancedSections(): Record<ExpandedSection, boolean> {
  return {
    code: false,
    flow: false,
  };
}

export function buildAdvancedViewModel(advanced: LearningStepAdvancedView): AdvancedViewModel {
  return {
    behaviorChain: {
      title: "行为链",
      content: `${advanced.trigger} ${advanced.visibleEffect}`,
    },
    whatHappened: {
      title: "发生了什么",
      content: advanced.internals,
    },
    code: {
      files: advanced.files,
      functions: advanced.functions ?? [],
    },
    dataFlow: advanced.dataFlow,
  };
}

export function LearningAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<AssistantMode>("beginner");
  const [expandedSections, setExpandedSections] = useState<Record<ExpandedSection, boolean>>(
    getCollapsedAdvancedSections(),
  );

  const step = useMemo(() => learningScript.steps[stepIndex], [stepIndex]);

  if (!step) {
    return null;
  }

  const currentBeginner = step.beginner;
  const currentAdvanced = step.advanced;
  const advancedView = currentAdvanced ? buildAdvancedViewModel(currentAdvanced) : null;

  const toggleSection = (section: ExpandedSection) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const moveToStep = (nextStepIndex: number) => {
    setStepIndex(nextStepIndex);
    setExpandedSections(getCollapsedAdvancedSections());
  };

  return (
    <>
      {!isOpen ? (
        <button
          className="fixed bottom-5 right-5 z-40 rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-800"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          学习助手
        </button>
      ) : null}

      {isOpen ? (
        <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                {learningScript.chapterTitle}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-stone-950">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{learningScript.summary}</p>
            </div>
            <button
              className="rounded-full border px-3 py-1 text-sm text-stone-600 transition hover:bg-stone-100"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              关闭
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">
              {step.type}
            </p>
            <div className="mt-4 inline-flex rounded-full border border-stone-200 bg-stone-100 p-1 text-sm font-medium">
              <button
                className={`rounded-full px-4 py-2 transition ${
                  mode === "beginner"
                    ? "bg-white text-stone-950 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
                onClick={() => setMode("beginner")}
                type="button"
              >
                操作引导
              </button>
              <button
                className={`rounded-full px-4 py-2 transition ${
                  mode === "advanced"
                    ? "bg-white text-stone-950 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
                onClick={() => setMode("advanced")}
                type="button"
              >
                实现视角
              </button>
            </div>
          </div>

          <div className="mt-6 flex-1 space-y-4 overflow-y-auto rounded-3xl border bg-stone-50 p-4 text-sm leading-6 text-stone-700">
            {mode === "beginner" ? (
              <>
                <p>
                  <strong>去做什么：</strong>
                  {currentBeginner.doThis}
                </p>
                <p>
                  <strong>看哪里：</strong>
                  {currentBeginner.watchHere}
                </p>
                <p>
                  <strong>你会看到什么：</strong>
                  {currentBeginner.notice}
                </p>
                <p>
                  <strong>这说明什么：</strong>
                  {currentBeginner.whyItMatters}
                </p>
                {currentBeginner.termNote ? (
                  <p>
                    <strong>术语速记：</strong>
                    {currentBeginner.termNote}
                  </p>
                ) : null}
              </>
            ) : advancedView ? (
              <div className="space-y-4">
                <section className="rounded-2xl border border-stone-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-stone-950">
                    {advancedView.behaviorChain.title}
                  </h3>
                  <p className="mt-2 text-stone-600">
                    {advancedView.behaviorChain.content}
                  </p>
                </section>
                <section className="rounded-2xl border border-stone-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-stone-950">
                    {advancedView.whatHappened.title}
                  </h3>
                  <p className="mt-2 text-stone-600">{advancedView.whatHappened.content}</p>
                </section>

                <section className="rounded-2xl border border-stone-200 bg-white p-4">
                  <button
                    className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-stone-950"
                    onClick={() => toggleSection("code")}
                    type="button"
                  >
                    <span>看代码</span>
                    <span className="text-xs font-medium text-stone-500">
                      {expandedSections.code ? "收起" : "展开"}
                    </span>
                  </button>
                  {expandedSections.code ? (
                    <div className="mt-3 space-y-4 text-sm leading-6 text-stone-600">
                      <ul className="space-y-3">
                        {advancedView.code.files.map((file) => (
                          <li key={file.path}>
                            <strong className="text-stone-950">{file.path}</strong>：{file.role}
                          </li>
                        ))}
                      </ul>
                      {advancedView.code.functions.length > 0 ? (
                        <div className="rounded-2xl border border-stone-100 bg-stone-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                            相关函数
                          </p>
                          <ul className="mt-3 space-y-3">
                            {advancedView.code.functions.map((fn) => (
                              <li key={`${fn.file}:${fn.name}`}>
                                <strong className="text-stone-950">{fn.name}</strong> ({fn.file})：
                                {fn.role}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </section>

                <section className="rounded-2xl border border-stone-200 bg-white p-4">
                  <button
                    className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-stone-950"
                    onClick={() => toggleSection("flow")}
                    type="button"
                  >
                    <span>数据流</span>
                    <span className="text-xs font-medium text-stone-500">
                      {expandedSections.flow ? "收起" : "展开"}
                    </span>
                  </button>
                  {expandedSections.flow ? (
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-stone-600">
                      {advancedView.dataFlow.map((node) => (
                        <li key={node}>{node}</li>
                      ))}
                    </ol>
                  ) : null}
                </section>
              </div>
            ) : (
              <p className="text-stone-500">这一小节暂时还没有实现视角说明。</p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              className="rounded-full border px-4 py-2 text-sm transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={stepIndex === 0}
              onClick={() => moveToStep(Math.max(0, stepIndex - 1))}
              type="button"
            >
              上一步
            </button>
            <p className="text-sm text-stone-500">
              {stepIndex + 1} / {learningScript.steps.length}
            </p>
            <button
              className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              disabled={stepIndex === learningScript.steps.length - 1}
              onClick={() => moveToStep(Math.min(learningScript.steps.length - 1, stepIndex + 1))}
              type="button"
            >
              下一步
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
