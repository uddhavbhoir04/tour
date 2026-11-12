import { Link, useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { imageUrl } from "../utils/imageUrl";
import { ErrorState } from "./components/StateViews";
import Spinner from "./components/Spinner";

const BlogPost = () => {
  const { slug } = useParams();
  const { data: post, loading, error } = useApi(`/api/blog/${encodeURIComponent(slug)}`, { select: (d) => d.post });

  if (loading) return <Spinner />;
  if (error || !post)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <ErrorState message={error || "Post not found"} />
        <Link to="/blog" className="text-sm font-bold text-emerald-700">&larr; All articles</Link>
      </div>
    );

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/blog" className="text-xs font-bold text-emerald-700">&larr; All articles</Link>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">{post.title}</h1>
      <p className="text-xs text-slate-400 mt-2">
        {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        {post.author ? ` • ${post.author}` : ""}
      </p>
      {post.coverImage && <img src={imageUrl(post.coverImage)} alt={post.title} className="w-full h-72 object-cover rounded-2xl my-8" />}
      <div className="text-slate-700 leading-relaxed space-y-4">
        {(post.content || "").split(/\n{2,}/).map((para, i) => (
          <p key={i} className="whitespace-pre-line">{para}</p>
        ))}
      </div>
    </article>
  );
};

export default BlogPost;
