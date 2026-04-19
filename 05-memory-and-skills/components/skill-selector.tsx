"use client";

import type { SkillPreset } from "@/lib/types";

interface SkillSelectorProps {
  skills: SkillPreset[];
  selectedSkillId: string;
  onSelectSkill: (skillId: string) => void;
}

export function SkillSelector({
  skills,
  selectedSkillId,
  onSelectSkill,
}: SkillSelectorProps) {
  return (
    <section
      className="rounded-xl border bg-white p-4 shadow-sm"
      data-learning-target="skill-selector"
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Skill 选择器
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          切换助手工作模式
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          当前选中的 preset 会决定 system prompt。把同一个问题换一个 skill 再问一遍，
          更容易对比语气、结构和决策方式的差异。
        </p>
      </div>

      <div className="grid gap-3">
        {skills.map((skill) => {
          const isActive = skill.id === selectedSkillId;

          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => onSelectSkill(skill.id)}
              className={`rounded-[1.5rem] border p-4 text-left transition ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{skill.name}</h3>
                <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    isActive ? "bg-white/15 text-slate-100" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {isActive ? "当前激活" : "预设"}
                </span>
              </div>
              <p className={`mt-3 text-sm leading-6 ${isActive ? "text-slate-100" : "text-slate-600"}`}>
                {skill.description}
              </p>
              <div
                className={`mt-4 rounded-2xl p-3 text-xs leading-6 ${
                  isActive ? "bg-white/10 text-slate-100" : "bg-white text-slate-500"
                }`}
              >
                <p className="font-semibold uppercase tracking-[0.18em]">
                  系统提示词
                </p>
                <p className="mt-2">{skill.systemPrompt}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
