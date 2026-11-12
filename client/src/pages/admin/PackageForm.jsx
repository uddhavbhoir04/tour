import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/client";
import { imageUrl } from "../../utils/imageUrl";
import { adminInput, LinesField, ObjectListField } from "./ListEditor";

export const EMPTY_PACKAGE = {
  packageName: "",
  slug: "",
  badge: "",
  tagline: "",
  packageDescription: "",
  packageDestination: "",
  baseVillage: "",
  region: "",
  categories: [],
  packageDays: 1,
  packageNights: 1,
  trailType: "",
  difficulty: "",
  endurance: "",
  trailLength: "",
  duration: "",
  bestTime: "",
  batchSchedule: "",
  packageAccommodation: "",
  packageTransportation: "",
  packageMeals: "",
  packageActivities: "",
  packagePrice: 0,
  packageDiscountPrice: 0,
  mumbaiPrice: "",
  punePrice: "",
  advanceAmount: 500,
  packageOffer: false,
  isActive: true,
  packageImages: [],
  inclusions: [],
  exclusions: [],
  whatToCarry: [],
  importantRules: [],
  mumbaiPickups: [],
  punePickups: [],
  itinerary: [],
};

const ARRAY_KEYS = ["categories", "inclusions", "exclusions", "whatToCarry", "importantRules", "mumbaiPickups", "punePickups", "itinerary", "packageImages"];

const TEXT = [
  ["packageName", "Trek name *"],
  ["slug", "URL slug (auto)"],
  ["badge", "Badge (e.g. Monsoon Special)"],
  ["tagline", "Tagline"],
  ["packageDestination", "Destination *"],
  ["baseVillage", "Base village"],
  ["region", "Region"],
  ["difficulty", "Difficulty (e.g. Easy, Moderate)"],
  ["endurance", "Endurance"],
  ["trailType", "Trail type"],
  ["trailLength", "Trail length"],
  ["duration", "Trek duration"],
  ["bestTime", "Best time"],
  ["batchSchedule", "Batch schedule"],
  ["packageAccommodation", "Accommodation *"],
  ["packageTransportation", "Transportation *"],
  ["packageMeals", "Meals *"],
  ["packageActivities", "Activities *"],
];

const NUMBERS = [
  ["packageDays", "Days"],
  ["packageNights", "Nights"],
  ["packagePrice", "Regular price *"],
  ["packageDiscountPrice", "Discount price"],
  ["mumbaiPrice", "Mumbai price"],
  ["punePrice", "Pune price"],
  ["advanceAmount", "Advance / person"],
];

const PICKUP_FIELDS = [
  { key: "time", label: "Time" },
  { key: "location", label: "Location" },
];

const clean = (v) => (Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x.trim() : x)).filter((x) => x !== "" && x !== null) : v);

/** Create (no initial._id) or update an existing package. */
const PackageForm = ({ initial = EMPTY_PACKAGE, onSaved }) => {
  const [form, setForm] = useState({ ...EMPTY_PACKAGE, ...initial });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial._id);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!isEdit && files.length === 0 && form.packageImages.length === 0) return toast.error("Add at least 1 image (upload or URL)");
    if (Number(form.packagePrice) <= 0) return toast.error("Price must be greater than 0");
    if (form.packageOffer && Number(form.packageDiscountPrice) >= Number(form.packagePrice))
      return toast.error("Regular price should be greater than discount price");

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (["_id", "__v", "createdAt", "updatedAt", "packageRating", "packageTotalRatings"].includes(k)) return;
      if (ARRAY_KEYS.includes(k)) data.append(k, JSON.stringify(clean(v)));
      else if (v !== "" && v !== null && v !== undefined) data.append(k, v);
    });
    if (!form.packageOffer) data.set("packageDiscountPrice", form.packageDiscountPrice || form.packagePrice);
    files.forEach((f) => data.append("packageImages", f));

    setSaving(true);
    try {
      const url = isEdit ? `/api/package/update-package/${initial._id}` : "/api/package/create-package";
      const { data: res } = await api.post(url, data);
      toast.success(res.message);
      if (!isEdit) {
        setForm(EMPTY_PACKAGE);
        setFiles([]);
      }
      onSaved?.(res.package);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full bg-white border border-slate-200 rounded-xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{isEdit ? `Edit: ${initial.packageName}` : "Add Package"}</h1>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.packageOffer} onChange={(e) => set("packageOffer")(e.target.checked)} /> Offer
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive")(e.target.checked)} /> Visible
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TEXT.map(([k, label]) => (
          <label key={k} className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1">{label}</span>
            <input className={adminInput} value={form[k] ?? ""} onChange={(e) => set(k)(e.target.value)} />
          </label>
        ))}
      </div>

      <label className="block">
        <span className="block text-xs font-bold text-slate-700 mb-1">Description *</span>
        <textarea rows={4} className={adminInput} value={form.packageDescription} onChange={(e) => set("packageDescription")(e.target.value)} />
      </label>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {NUMBERS.map(([k, label]) => (
          <label key={k} className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1">{label}</span>
            <input type="number" min="0" className={adminInput} value={form[k] ?? ""} onChange={(e) => set(k)(e.target.value)} />
          </label>
        ))}
      </div>

      <LinesField label="Categories (keys from Site Settings, e.g. waterfall, jungle, easy)" value={form.categories} onChange={set("categories")} rows={2} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LinesField label="Inclusions" value={form.inclusions} onChange={set("inclusions")} />
        <LinesField label="Exclusions" value={form.exclusions} onChange={set("exclusions")} />
        <LinesField label="What to carry" value={form.whatToCarry} onChange={set("whatToCarry")} />
        <LinesField label="Important rules" value={form.importantRules} onChange={set("importantRules")} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ObjectListField label="Mumbai pickups" value={form.mumbaiPickups} onChange={set("mumbaiPickups")} fields={PICKUP_FIELDS} addLabel="Add pickup" />
        <ObjectListField label="Pune pickups" value={form.punePickups} onChange={set("punePickups")} fields={PICKUP_FIELDS} addLabel="Add pickup" />
      </div>

      <ObjectListField
        label="Itinerary"
        value={form.itinerary}
        onChange={set("itinerary")}
        fields={[
          { key: "day", label: "Day (e.g. Night 1)" },
          { key: "title", label: "Title" },
          { key: "items", label: "Timeline items", type: "lines" },
        ]}
        addLabel="Add day"
      />

      <div className="space-y-2">
        <span className="block text-xs font-bold text-slate-700">Images</span>
        <div className="flex flex-wrap gap-2">
          {form.packageImages.map((img, i) => (
            <div key={`${img}-${i}`} className="relative">
              <img src={imageUrl(img)} alt="" className="w-24 h-16 object-cover rounded-lg border" />
              <button
                type="button"
                onClick={() => set("packageImages")(form.packageImages.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-[10px]"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <LinesField label="Image URLs (optional)" value={form.packageImages} onChange={set("packageImages")} rows={2} placeholder="https://… one per line (uploaded files are kept)" />
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-sm" />
        {files.length > 0 && <p className="text-xs text-slate-500">{files.length} new file(s) will be uploaded</p>}
      </div>

      <button disabled={saving} className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
        {saving ? "Saving…" : isEdit ? "Update Package" : "Create Package"}
      </button>
    </form>
  );
};

export default PackageForm;
