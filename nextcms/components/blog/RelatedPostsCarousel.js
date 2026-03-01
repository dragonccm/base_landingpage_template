"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const VISIBLE = 3;

export default function RelatedPostsCarousel({ posts = [], intervalMs = 3500 }) {
  const items = useMemo(() => {
    if (posts.length <= VISIBLE) return posts;
    return [...posts, ...posts.slice(0, VISIBLE)];
  }, [posts]);

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (posts.length <= VISIBLE) return;
    const id = setInterval(() => {
      setAnimate(true);
      setIndex((prev) => prev + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [posts.length, intervalMs]);

  useEffect(() => {
    if (posts.length <= VISIBLE) return;
    if (index !== posts.length) return;
    const id = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, 520);
    return () => clearTimeout(id);
  }, [index, posts.length]);

  if (!posts.length) return null;

  const slideWidth = 100 / VISIBLE;

  return (
    <div className="blogCarousel">
      <div
        className="blogCarouselTrack"
        style={{
          transform: `translateX(-${index * slideWidth}%)`,
          transition: animate ? "transform 500ms ease" : "none",
        }}
      >
        {items.map((p, i) => (
          <div className="blogCarouselSlide" style={{ minWidth: `${slideWidth}%` }} key={`${p.id}-${i}`}>
            <article className="card blogPostCard">
              {p.cover_image ? <img src={p.cover_image} alt={p.title} className="blogPostCardImage" /> : null}
              <h3 className="blogPostCardTitle"><Link href={`/blog/${p.slug}`}>{p.title}</Link></h3>
              <p className="blogPostCardExcerpt">{p.excerpt || "(No excerpt)"}</p>
              <small className="blogPostCardMeta">{p.published_at ? new Date(p.published_at).toLocaleString() : "Draft"}</small>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
