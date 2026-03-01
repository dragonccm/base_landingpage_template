import Link from "next/link";
import { FolderOpen, Tag } from "lucide-react";
import BlogHero from "@/components/blog/BlogHero";
import { listPostCategories, listPostTags, listPostsPublic } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BlogCategoryPage({ params, searchParams }) {
  const slug = params.slug;
  const [posts, categories, tags] = await Promise.all([
    listPostsPublic({
      category: slug,
      q: searchParams?.q || "",
      tag: searchParams?.tag || undefined,
      sort: searchParams?.sort || "newest",
      page: Number(searchParams?.page || 1),
      limit: Number(searchParams?.limit || 12),
    }),
    listPostCategories(),
    listPostTags(),
  ]);

  return (
    <>
      <BlogHero title={`Blog - Category: ${slug}`} crumbs={[{ label: "Blog", href: "/blog" }, { label: slug }]} />
      <section className="pageWrap blogTwoCol">
        <aside className="card blogSidebar">
          <h3>Filter & Search</h3>
          <form method="get" className="blogFilterForm">
            <input name="q" defaultValue={searchParams?.q || ""} placeholder="Tìm kiếm full-text..." />
            <select name="sort" defaultValue={searchParams?.sort || "newest"}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="popular">Phổ biến</option>
              <option value="relevance">Liên quan</option>
            </select>
            <input type="hidden" name="category" value={slug} />
            <select name="tag" defaultValue={searchParams?.tag || ""}>
              <option value="">Tất cả tag</option>
              {tags.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
            </select>
            <button className="btn">Apply</button>
          </form>
          <hr />
          <h4>Explore</h4>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <Link href="/blog">All</Link>
            {categories.slice(0, 8).map((c) => (
              <Link key={c.id} href={`/blog/category/${c.slug}`} className="blogTaxLink"><FolderOpen size={14} /> {c.name}</Link>
            ))}
            {tags.slice(0, 8).map((t) => (
              <Link key={t.id} href={`/blog/tag/${t.slug}`} className="blogTaxLink"><Tag size={14} /> {t.name}</Link>
            ))}
          </div>
        </aside>

        <div className="blogMainGrid">
          {posts.map((p) => (
            <article key={p.id} className="card blogPostCard">
              {p.cover_image ? <img src={p.cover_image} alt={p.title} className="blogPostCardImage" /> : null}
              <h3 className="blogPostCardTitle"><Link href={`/blog/${p.slug}`}>{p.title}</Link></h3>
              <p className="blogPostCardExcerpt">{p.excerpt || "(No excerpt)"}</p>
              <small className="blogPostCardMeta">{p.published_at ? new Date(p.published_at).toLocaleString() : "Draft"}</small>
            </article>
          ))}
          {posts.length === 0 && <div className="card">Chưa có bài viết trong thể loại này.</div>}
        </div>
      </section>
    </>
  );
}
