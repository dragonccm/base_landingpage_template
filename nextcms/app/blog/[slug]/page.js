import Link from "next/link";
import { FolderOpen, Tag } from "lucide-react";
import BlogHero from "@/components/blog/BlogHero";
import RelatedPostsCarousel from "@/components/blog/RelatedPostsCarousel";
import { notFound } from "next/navigation";
import { getPostBySlug, listPostsPublic } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return notFound();

  const [sameCategoryPosts, newestPosts] = await Promise.all([
    listPostsPublic({ category: post.category_slug, limit: 8, sort: "newest" }),
    listPostsPublic({ limit: 8, sort: "newest" }),
  ]);

  const relatedPosts = [...sameCategoryPosts, ...newestPosts]
    .filter((p) => p.slug !== post.slug)
    .filter((p, index, arr) => arr.findIndex((x) => x.slug === p.slug) === index)
    .slice(0, 8);

  return (
    <>
      <BlogHero title={post.title} crumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
      <section className="pageWrap">
        <article className="blogDetailCard">
          <Link href="/blog">← Back to blog</Link>
          <h1>{post.title}</h1>
          <p style={{ color: "#666" }}>{post.excerpt}</p>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <small>{post.published_at ? new Date(post.published_at).toLocaleString() : "Draft"}</small>
          </div>
          {post.cover_image ? <img src={post.cover_image} alt={post.title} style={{ width: "100%", borderRadius: 12 }} /> : null}
          <div dangerouslySetInnerHTML={{ __html: post.content_html || "<p>No content</p>" }} />

          <hr />
          <div className="blogPostTaxonomy">
            {post.category_slug ? (
              <Link href={`/blog/category/${post.category_slug}`} className="blogTaxPill"><FolderOpen size={14} /> {post.category_name || post.category_slug}</Link>
            ) : null}
            {(post.tags || []).map((t) => (
              <Link key={t.id || t.slug} href={`/blog/tag/${t.slug}`} className="blogTaxPill"><Tag size={14} /> {t.name}</Link>
            ))}
          </div>
        </article>

        {relatedPosts.length > 0 ? (
          <section style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 12 }}>Bài viết liên quan</h3>
            <RelatedPostsCarousel posts={relatedPosts} />
          </section>
        ) : null}
      </section>
    </>
  );
}
