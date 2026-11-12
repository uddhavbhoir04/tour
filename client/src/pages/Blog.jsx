import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { imageUrl } from "../utils/imageUrl";
import { LoadingGrid, ErrorState, EmptyState } from "./components/StateViews";

const Blog = () => {
  const { data: posts, loading, error, reload } = useApi("/api/blog", { select: (d) => d.posts || [] });

  return (
    <div className="w-full py-16 bg-[#fafbfc] min-h-screen">
      <div className="max-w-screen-xl mx-auto px-6">
        <motion.h1
          className="text-3xl md:text-5xl font-extrabold text-center text-slate-900 mb-3"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Trek Stories & Guides
        </motion.h1>
        <p className="text-center text-slate-500 mb-12">Tips, packing lists and trail guides from our trek leaders.</p>

        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !posts?.length ? (
          <EmptyState message="No articles yet — check back soon!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.article
                key={post._id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-shadow flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                {post.coverImage && <img src={imageUrl(post.coverImage)} alt={post.title} className="w-full h-56 object-cover" loading="lazy" />}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[11px] text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {post.author ? ` • ${post.author}` : ""}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1 mb-2">{post.title}</h2>
                  <p className="text-sm text-slate-600 mb-4 flex-1">{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className="text-sm font-bold text-emerald-700 hover:text-emerald-800">
                    Read more &rarr;
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            to="/search"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-8 rounded-xl text-sm font-bold transition"
          >
            Explore Upcoming Treks
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blog;
