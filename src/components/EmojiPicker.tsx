"use client";

import { useState } from "react";

interface EmojiPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const EMOJI_GROUPS = [
  {
    name: "Education",
    emojis: ["📚", "📖", "📝", "🎓", "🏫", "✏️", "📐", "🔬", "🧮", "💡", "📘", "📙", "📗", "📕", "📓", "📔", "📒"],
  },
  {
    name: "Technology",
    emojis: ["💻", "🖥️", "⌨️", "📱", "🔧", "⚙️", "🤖", "🧠", "🔬", "🛸", "🎮", "📡", "🔌", "💾", "🖨️"],
  },
  {
    name: "Business",
    emojis: ["💼", "📊", "📈", "💰", "💵", "🏢", "🤝", "📋", "🗂️", "💡", "🚀", "📉", "🧾", "💳"],
  },
  {
    name: "Science",
    emojis: ["🔬", "🧪", "🧬", "🔭", "🌍", "🌙", "☀️", "⚡", "🧲", "🧮", "💊", "🦠"],
  },
  {
    name: "Arts",
    emojis: ["🎨", "🎭", "🎪", "🎬", "🎤", "🎧", "🎵", "🎼", "🎸", "🎹", "🎻", "🥁", "🎷", "🎺"],
  },
  {
    name: "Nature",
    emojis: ["🌿", "🌱", "🌲", "🌳", "🌴", "🌵", "🌾", "🌻", "🌺", "🌹", "🍀", "🍁", "🍄", "🐚"],
  },
  {
    name: "Sports",
    emojis: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥊", "🏋️", "🤺", "⛷️", "🏊"],
  },
  {
    name: "Food",
    emojis: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍑", "🍒", "🥑", "🍔", "🍕", "🍣", "🍩"],
  },
  {
    name: "Travel",
    emojis: ["✈️", "🚀", "🚂", "🚢", "🚗", "🚕", "🚌", "🏍️", "🚲", "🛴", "🧭", "🗺️", "⛰️", "🏖️"],
  },
  {
    name: "Symbols",
    emojis: ["⭐", "🌟", "💫", "✨", "🔥", "💥", "💯", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "❣️", "💕", "💖", "💗", "💓", "💘", "💝"],
  },
  {
    name: "Objects",
    emojis: ["📁", "📂", "📅", "📌", "📎", "🔒", "🔑", "🔔", "📢", "📣", "📯", "🔮", "🪄", "🎯", "🏆", "🎪", "🎫", "🎟️"],
  },
  {
    name: "More",
    emojis: ["🧩", "🧸", "🎁", "🎀", "🎗️", "🎟️", "🏅", "🥇", "🥈", "🥉", "🏆", "🎖️", "🏵️", "🎨", "🧵", "🧶", "🪡", "🧷", "💭", "🗯️", "💬", "🗨️"],
  },
];

export default function EmojiPicker({ value, onChange, label = "Icon" }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const allEmojis = EMOJI_GROUPS.flatMap((group) => group.emojis);
  const uniqueEmojis = Array.from(new Set(allEmojis));

  const filteredEmojis = search
    ? uniqueEmojis.filter((emoji) => emoji.includes(search))
    : uniqueEmojis;

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-200">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-2xl transition hover:scale-110"
            aria-label="Open emoji picker"
          >
            {value || "😀"}
          </button>
          {!value && (
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="📚"
              className="flex-1 bg-transparent text-sm outline-none"
              maxLength={2}
            />
          )}
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-[70] mt-2 w-full rounded-3xl border border-slate-200 bg-white shadow-2xl sm:left-auto sm:right-0 sm:w-[320px]">
            <div className="border-b border-slate-100 p-3">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search emoji..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                autoFocus
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-3">
              {EMOJI_GROUPS.map((group) => {
                const groupEmojis = search
                  ? group.emojis.filter((emoji) => filteredEmojis.includes(emoji))
                  : group.emojis;

                if (groupEmojis.length === 0) return null;

                return (
                  <div key={group.name} className="mb-3 last:mb-0">
                    {!search && (
                      <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {group.name}
                      </p>
                    )}
                    <div className="grid grid-cols-8 gap-1">
                      {groupEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            onChange(emoji);
                            setIsOpen(false);
                            setSearch("");
                          }}
                          className={`flex items-center justify-center rounded-xl p-1.5 text-xl transition hover:bg-slate-100 ${
                            value === emoji ? "bg-sky-50 ring-1 ring-sky-500" : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredEmojis.length === 0 && (
                <div className="py-6 text-center text-sm text-slate-500">No emojis found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
