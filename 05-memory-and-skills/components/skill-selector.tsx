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
    <section className="rounded-[2rem] border border-stone-300/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(63,43,27,0.08)] backdrop-blur">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
          Skill Selector
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">
          Switch the assistant mode
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          The selected preset contributes the system prompt. Ask the same
          question with another skill to compare tone, structure, and decision
          framing.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {skills.map((skill) => {
          const isActive = skill.id === selectedSkillId;

          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => onSelectSkill(skill.id)}
              className={`rounded-[1.5rem] border p-4 text-left transition ${
                isActive
                  ? "border-teal-600 bg-teal-950 text-teal-50 shadow-[0_16px_50px_rgba(13,148,136,0.25)]"
                  : "border-stone-200 bg-stone-50 text-stone-900 hover:border-stone-300 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{skill.name}</h3>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    isActive ? "bg-white/15 text-teal-100" : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {isActive ? "Active" : "Preset"}
                </span>
              </div>
              <p className={`mt-3 text-sm leading-6 ${isActive ? "text-teal-100" : "text-stone-600"}`}>
                {skill.description}
              </p>
              <div
                className={`mt-4 rounded-2xl p-3 text-xs leading-6 ${
                  isActive ? "bg-white/10 text-teal-100" : "bg-white text-stone-500"
                }`}
              >
                <p className="font-semibold uppercase tracking-[0.18em]">
                  System prompt
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
