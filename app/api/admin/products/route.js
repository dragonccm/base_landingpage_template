import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../../../lib/db";

const schema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  image: z.string().url(),
  price: z.number().positive(),
  oldPrice: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export async function GET() {
  const products = await db.products.list();
  return NextResponse.json({ products });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const input = schema.parse(body);

    const product = {
      id: `p_${crypto.randomUUID()}`,
      ...input,
    };

    await db.products.create(product);
    return NextResponse.json({ message: "Đã thêm sản phẩm", product });
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  await db.products.remove(id);
  return NextResponse.json({ message: "Đã xoá sản phẩm" });
}
