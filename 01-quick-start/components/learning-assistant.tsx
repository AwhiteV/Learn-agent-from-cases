'use client';

import { useMemo, useState } from 'react';

import { learningScript } from '@/lib/learning-assistant-script';

export function LearningAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const step = useMemo(() => learningScript.steps[stepIndex], [stepIndex]);

  if (!step) {
    return null;
  }

  return (
    <>
      {!isOpen ? (
        <button
          className="fixed right-5 bottom-5 z-40 rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-800"
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
              <h2 className="mt-2 text-xl font-semibold text-stone-950">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {learningScript.summary}
              </p>
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
          </div>

          <div className="mt-6 flex-1 space-y-4 overflow-y-auto rounded-3xl border bg-stone-50 p-4 text-sm leading-6 text-stone-700">
            <p>
              <strong>去做什么：</strong>
              {step.doThis}
            </p>
            <p>
              <strong>看哪里：</strong>
              {step.watchHere}
            </p>
            <p>
              <strong>你会看到什么：</strong>
              {step.notice}
            </p>
            <p>
              <strong>这说明什么：</strong>
              {step.whyItMatters}
            </p>
            {step.termNote ? (
              <p>
                <strong>术语速记：</strong>
                {step.termNote}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              className="rounded-full border px-4 py-2 text-sm transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
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
              onClick={() =>
                setStepIndex((current) =>
                  Math.min(learningScript.steps.length - 1, current + 1)
                )
              }
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
