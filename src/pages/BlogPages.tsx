import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { BlogPost } from '../types';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';

export function BlogListPage() {
  const { blogPosts } = useStore();

  return (
    <div className="bg-white min-h-screen">
      <SeoHead
        title="Tea Knowledge & Blog – DON TRADERS"
        description="Read guides on Indian CTC tea, dust vs leaf tea, brewing strong Indian chai, Indian tea regions, and proper tea storage."
      />
      <div className="bg-[#FFF7E5] border-b border-[#29251F]/10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
            DON TRADERS Journal
          </p>
          <h1 className="font-display text-4xl font-bold text-[#29251F] mt-1">
            Tea Knowledge &amp; Guides
          </h1>
          <p className="text-sm text-[#29251F]/75 mt-2 max-w-2xl">
            Articles marked &ldquo;Sample Article&rdquo; are initial starter guides that store administrators can edit or replace from the Admin Dashboard.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group border border-[#29251F]/10 rounded-lg overflow-hidden bg-white flex flex-col hover:border-[#B82025]/40 transition-colors"
          >
            <div className="aspect-[4/3] bg-[#FFF7E5] overflow-hidden">
              <SafeImage
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-xs text-[#29251F]/60 mb-2">
                <span className="font-semibold text-[#B82025]">{post.category}</span>
                <span aria-hidden="true">·</span>
                <span>{post.readTimeMinutes} min read</span>
                {post.isDemo && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Sample Article</span>
                  </>
                )}
              </div>
              <h2 className="font-display text-xl font-bold text-[#29251F] group-hover:text-[#B82025] transition-colors">
                {post.title}
              </h2>
              <p className="mt-2.5 text-sm text-[#29251F]/75 leading-relaxed flex-1">
                {post.excerpt}
              </p>
              <span className="mt-4 text-xs font-semibold text-[#B82025]">
                Read Article &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/blog/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setPost(data);
        } else if (active) {
          setPost(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="h-72 bg-[#FFF7E5] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-[#29251F]">Article Not Found</h1>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#B82025] rounded"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="bg-white py-12">
      <SeoHead title={`${post.title} – DON TRADERS`} description={post.excerpt} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B82025] hover:underline mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tea Knowledge</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-[#29251F]/65 mb-3">
          <span className="font-semibold text-[#B82025]">{post.category}</span>
          <span aria-hidden="true">·</span>
          <span>{post.publishedAt}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readTimeMinutes} min read</span>
          {post.isDemo && (
            <>
              <span aria-hidden="true">·</span>
              <span>Sample Article</span>
            </>
          )}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] leading-tight">
          {post.title}
        </h1>

        <div className="mt-8 aspect-[16/9] rounded-xl overflow-hidden bg-[#FFF7E5] border border-[#29251F]/10">
          <SafeImage
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mt-8 space-y-4 text-base text-[#29251F]/85 leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </div>
    </article>
  );
}
