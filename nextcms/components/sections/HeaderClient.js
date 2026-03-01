"use client";
import { useState } from "react";
import Header from "./Header";

export default function HeaderClient({ i, navs, c }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <Header i={i} navs={navs} c={c} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />;
}
