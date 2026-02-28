"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const r=useRouter();
  async function submit(e){e.preventDefault();const res=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})});const d=await res.json();if(!res.ok)return alert(d.error||'Login failed');r.push('/admin');}
  return <main><form className="card" onSubmit={submit}><h2>Admin Login</h2><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /><button className="btn">Login</button><p>Tài khoản mặc định: nguyenngoclong5511@gmail.com / long20%long</p></form></main>
}
