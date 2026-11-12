import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { adminInput } from "./ListEditor";

const empty = { title: "", slug: "", excerpt: "", content: "", coverImage: "", author: "", published: true };

const BlogAdmin = () => {
  const { data: posts, reload, loading, error } = useApi("/api/blog?all=1", { select: (d) => d.posts || [] });
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form._id) await api.put(`/api/blog/${form._id}`, form);
      else await api.post("/api/blog", form);
      toast.success("Post saved");
      setForm(empty);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/api/blog/${id}`);
      toast.success("Post deleted");
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
      <form onSubmit={save} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <h1 className="text-lg font-bold">{form._id ? "Edit post" : "New post"}</h1>
        <input required className={adminInput} placeholder="Title" value={form.title} onChange={set("title")} />
        <input className={adminInput} placeholder="Slug (auto from title)" value={form.slug} onChange={set("slug")} />
        <input className={adminInput} placeholder="Cover image URL" value={form.coverImage} onChange={set("coverImage")} />
        <input className={adminInput} placeholder="Author" value={form.author} onChange={set("author")} />
        <textarea className={adminInput} rows={2} placeholder="Excerpt" value={form.excerpt} onChange={set("excerpt")} />
        <textarea required className={adminInput} rows={8} placeholder="Content (blank line between paragraphs)" value={form.content} onChange={set("content")} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={set("published")} /> Published
        </label>
        <div className="flex gap-2">
          <button disabled={saving} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
          {form._id && (
            <button type="button" onClick={() => setForm(empty)} className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100">
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
        <h2 className="text-lg font-bold">Posts</h2>
        {loading && <p className="text-sm text-slate-500">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {(posts || []).map((p) => (
          <div key={p._id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{p.title}</p>
              <p className="text-[11px] text-slate-400">{p.published ? "Published" : "Draft"} • /blog/{p.slug}</p>
            </div>
            <button onClick={() => setForm({ ...empty, ...p })} className="text-xs font-bold text-emerald-700">Edit</button>
            <button onClick={() => remove(p._id)} className="text-xs font-bold text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogAdmin;
