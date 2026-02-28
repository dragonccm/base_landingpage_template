"use client";
import { useEffect, useState } from "react";

export default function Admin(){
  const [data,setData]=useState(null);
  useEffect(()=>{fetch('/api/admin/landing').then(r=>r.json()).then(d=>setData(d.data));},[]);
  if(!data) return <main>Loading...</main>;
  const theme=data.theme, content=data.content;
  const set=(group,key,val)=>setData(prev=>({...prev,[group]:{...prev[group],[key]:val}}));
  async function save(){const res=await fetch('/api/admin/landing',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(data)});alert(res.ok?'Saved':'Failed');}
  return <main>
    <div className="card"><h2>Admin CMS</h2><div className="row"><button className="btn" onClick={save}>Lưu thay đổi</button></div></div>
    <div className="card"><h3>Theme</h3><div className="grid">{Object.entries(theme).map(([k,v])=><label key={k}>{k}<input value={v} onChange={e=>set('theme',k,e.target.value)} /></label>)}</div></div>
    <div className="card"><h3>Content</h3><div className="grid">{Object.entries(content).map(([k,v])=><label key={k}>{k}<textarea rows={3} value={v} onChange={e=>set('content',k,e.target.value)} /></label>)}</div></div>
  </main>
}
