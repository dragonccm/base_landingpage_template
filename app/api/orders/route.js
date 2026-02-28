import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { db } from "../../../lib/db";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });

  const body = await request.json();
  const order = {
    id: `o_${crypto.randomUUID()}`,
    userId: user.sub,
    customerName: user.name,
    items: body.items || [],
    total: body.total || 0,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await db.orders.create(order);
  return NextResponse.json({ message: "Đặt hàng thành công", order });
}
