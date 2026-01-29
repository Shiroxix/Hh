const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5179";

export async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Erro");
  return data;
}
