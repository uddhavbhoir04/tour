// Reusable admin editors for string lists and lists of objects

export const adminInput =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500";

/** One item per line textarea ⇄ string[] */
export const LinesField = ({ label, value = [], onChange, rows = 4, placeholder }) => (
  <label className="block">
    <span className="block text-xs font-bold text-slate-700 mb-1">{label}</span>
    <textarea
      rows={rows}
      className={adminInput}
      placeholder={placeholder || "One item per line"}
      value={(value || []).join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n"))}
      onBlur={(e) => onChange(e.target.value.split("\n").map((l) => l.trim()).filter(Boolean))}
    />
  </label>
);

/**
 * Rows of objects. fields: [{ key, label, placeholder, type: "text"|"lines" }]
 */
export const ObjectListField = ({ label, value = [], onChange, fields, addLabel = "Add row" }) => {
  const update = (i, key, v) => onChange(value.map((row, j) => (j === i ? { ...row, [key]: v } : row)));
  const remove = (i) => onChange(value.filter((_, j) => j !== i));
  const move = (i, d) => {
    const next = [...value];
    const [row] = next.splice(i, 1);
    next.splice(i + d, 0, row);
    onChange(next);
  };
  const empty = Object.fromEntries(fields.map((f) => [f.key, f.type === "lines" ? [] : ""]));

  return (
    <div>
      <span className="block text-xs font-bold text-slate-700 mb-1">{label}</span>
      <div className="space-y-2">
        {value.map((row, i) => (
          <div key={i} className="flex gap-2 items-start p-2 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: fields.some((f) => f.type === "lines") ? "1fr" : `repeat(${fields.length}, minmax(0, 1fr))` }}>
              {fields.map((f) =>
                f.type === "lines" ? (
                  <textarea
                    key={f.key}
                    rows={3}
                    className={adminInput}
                    placeholder={f.placeholder || `${f.label} (one per line)`}
                    value={(row[f.key] || []).join("\n")}
                    onChange={(e) => update(i, f.key, e.target.value.split("\n"))}
                    onBlur={(e) => update(i, f.key, e.target.value.split("\n").map((l) => l.trim()).filter(Boolean))}
                  />
                ) : (
                  <input key={f.key} className={adminInput} placeholder={f.placeholder || f.label} value={row[f.key] || ""} onChange={(e) => update(i, f.key, e.target.value)} />
                )
              )}
            </div>
            <div className="flex flex-col gap-1">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="px-2 text-xs text-slate-500 disabled:opacity-30" aria-label="Move up">▲</button>
              <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="px-2 text-xs text-slate-500 disabled:opacity-30" aria-label="Move down">▼</button>
              <button type="button" onClick={() => remove(i)} className="px-2 text-xs text-red-600" aria-label="Remove">✕</button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...(value || []), empty])} className="mt-2 text-xs font-bold text-emerald-700">
        + {addLabel}
      </button>
    </div>
  );
};
