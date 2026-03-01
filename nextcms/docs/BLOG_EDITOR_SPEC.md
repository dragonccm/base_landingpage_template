# Blog Editor Specification (Word-like)

Mục tiêu: trình soạn thảo bài viết mạnh, trực quan, đáp ứng tối đa nhu cầu biên tập.

## 1) Editor capabilities (bắt buộc)

### Text formatting
- Font size, style presets
- Paragraph + Heading H1..H6
- Bold / Italic / Underline / Strike
- Text color + highlight
- Align: left / center / right / justify
- Indent / outdent

### Block types
- Paragraph
- Heading
- Bullet list / Numbered list / Checklist
- Quote
- Code block
- Divider
- Callout box

### Links
- Insert link text
- Edit/unlink
- Option open in new tab
- rel noopener/nofollow toggle

### Images
- Upload/select từ Media Library
- Inline image + caption
- Alt text bắt buộc (SEO + accessibility)
- Resize, align, wrap mode

### Tables
- Add/remove row/column
- Merge/split cell (phase 2)
- Header row
- Basic cell alignment

### Charts
- Block biểu đồ: line / bar / pie
- Nhập dữ liệu thủ công (table mini) hoặc JSON
- Chỉnh màu/legend/title
- Xuất ra ảnh tĩnh khi render public (để nhẹ)

## 2) Usability features

- Undo/redo
- Keyboard shortcuts (Ctrl+B, Ctrl+I, ...)
- Auto-save mỗi 10-20 giây
- Draft restore khi crash/tab close
- Full-screen mode
- Word count + reading time

## 3) Content model

Lưu song song:
- `content_json` (structured blocks để edit lại)
- `content_html` (render nhanh public)

## 4) Validation rules

- Title bắt buộc
- Slug duy nhất
- Ít nhất 1 block nội dung
- Cover image khuyến nghị
- Alt text bắt buộc cho ảnh trong bài

## 5) Publish workflow

- Draft -> Review -> Published
- Scheduled publish theo thời gian
- Unpublish về Draft/Archived
- Permission:
  - editor: create/update draft
  - reviewer: approve review
  - publisher/super_admin: publish/unpublish

## 6) Security

- Sanitize HTML trước khi lưu/render
- Whitelist tag/attribute an toàn
- Chặn script/embed không hợp lệ

## 7) Audit log events

- `posts.create`
- `posts.update`
- `posts.status_change`
- `posts.publish`
- `posts.delete`
- `posts.restore_revision`

## 8) Future enhancements

- Comment nội bộ trên block
- Real-time collaboration
- AI assist viết/tóm tắt/SEO suggestion
