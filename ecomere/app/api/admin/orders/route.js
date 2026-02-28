import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET() {
  const orders = await db.orders.list();
  return NextResponse.json({ orders });
}

export async function PATCH(request) {
  const body = await request.json();
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });

  const updated = await db.orders.updateStatus(id, status);
  if (!updated) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });

  return NextResponse.json({ message: "Cập nhật thành công", order: updated });
}
