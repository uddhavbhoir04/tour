import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/client";
import { useSettings } from "../../context/SettingsContext";
import { adminInput, LinesField, ObjectListField } from "./ListEditor";

const TEXT_FIELDS = [
  ["brandName", "Brand name"],
  ["tagline", "Tagline"],
  ["announcement", "Announcement bar"],
  ["primaryPhone", "Primary phone"],
  ["whatsappNumber", "WhatsApp number (digits, with country code)"],
  ["email", "Public email"],
  ["instagram", "Instagram URL"],
  ["upiNumber", "UPI number"],
  ["upiId", "UPI ID"],
  ["upiHolderName", "UPI holder name"],
  ["googleReviewsRating", "Google rating"],
  ["reviewsCount", "Reviews count"],
  ["trekkersCount", "Trekkers count"],
  ["priceRangeText", "Advance range text"],
  ["aboutTitle", "About title"],
];

const PICKUP_FIELDS = [
  { key: "time", label: "Time" },
  { key: "location", label: "Location" },
  { key: "landmark", label: "Landmark" },
];

const SiteSettings = () => {
  const { settings, reload } = useSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (!form) return <p className="p-4 text-sm text-slate-500">Loading settings…</p>;
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/api/settings", form);
      toast.success("Settings saved");
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="w-full bg-white border border-slate-200 rounded-xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Site Settings</h1>
        <button disabled={saving} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TEXT_FIELDS.map(([k, label]) => (
          <label key={k} className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1">{label}</span>
            <input className={adminInput} value={form[k] || ""} onChange={(e) => set(k)(e.target.value)} />
          </label>
        ))}
      </div>

      <ObjectListField label="Contact people" value={form.contacts} onChange={set("contacts")} fields={[{ key: "name", label: "Name" }, { key: "phone", label: "Phone" }]} addLabel="Add contact" />
      <LinesField label="Hero rotating words" value={form.heroWords} onChange={set("heroWords")} rows={3} />
      <LinesField label="About paragraphs" value={form.aboutText} onChange={set("aboutText")} rows={4} placeholder="One paragraph per line" />
      <ObjectListField label="Trust badges" value={form.trustBadges} onChange={set("trustBadges")} fields={[{ key: "title", label: "Title" }, { key: "subtitle", label: "Subtitle" }]} />
      <ObjectListField
        label="Why choose us (icon: bus, food, shield, users)"
        value={form.whyChooseUs}
        onChange={set("whyChooseUs")}
        fields={[{ key: "icon", label: "Icon" }, { key: "title", label: "Title" }, { key: "description", label: "Description" }]}
      />
      <ObjectListField label="Home categories (key must match package categories)" value={form.categories} onChange={set("categories")} fields={[{ key: "key", label: "Key" }, { key: "label", label: "Label" }]} />
      <ObjectListField label="Mumbai pickup points" value={form.mumbaiPickups} onChange={set("mumbaiPickups")} fields={PICKUP_FIELDS} addLabel="Add pickup" />
      <ObjectListField label="Pune pickup points" value={form.punePickups} onChange={set("punePickups")} fields={PICKUP_FIELDS} addLabel="Add pickup" />
      <ObjectListField label="Booking steps" value={form.bookingSteps} onChange={set("bookingSteps")} fields={[{ key: "title", label: "Title" }, { key: "description", label: "Description" }]} addLabel="Add step" />
    </form>
  );
};

export default SiteSettings;
