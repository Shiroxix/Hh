import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = process.env.BRAWLSTARS_TOKEN;
if (!TOKEN) console.warn("Faltou BRAWLSTARS_TOKEN no ambiente.");

const API = "https://api.brawlstars.com/v1";

function normalizeTag(tag) {
  if (!tag) return "";
  const t = String(tag).trim().toUpperCase();
  return t.startsWith("#") ? t.slice(1) : t;
}

async function brawlFetch(path) {
  const res = await fetch(API + path, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.message || data?.reason || "Erro na API";
    const status = res.status || 500;
    const e = new Error(msg);
    e.status = status;
    e.data = data;
    throw e;
  }
  return data;
}

function sendErr(res, e){
  res.status(e.status || 500).json({ error: e.message, details: e.data || null });
}

app.get("/api/health", (_req,res)=> res.json({ ok:true }));

app.get("/api/player/:tag", async (req, res) => {
  try {
    const tag = normalizeTag(req.params.tag);
    res.json(await brawlFetch(`/players/%23${encodeURIComponent(tag)}`));
  } catch (e) { sendErr(res,e); }
});

app.get("/api/player/:tag/battlelog", async (req, res) => {
  try {
    const tag = normalizeTag(req.params.tag);
    res.json(await brawlFetch(`/players/%23${encodeURIComponent(tag)}/battlelog`));
  } catch (e) { sendErr(res,e); }
});

app.get("/api/club/:tag", async (req, res) => {
  try {
    const tag = normalizeTag(req.params.tag);
    res.json(await brawlFetch(`/clubs/%23${encodeURIComponent(tag)}`));
  } catch (e) { sendErr(res,e); }
});

app.get("/api/events", async (_req, res) => {
  try { res.json(await brawlFetch(`/events/rotation`)); }
  catch (e) { sendErr(res,e); }
});

app.get("/api/brawlers", async (_req, res) => {
  try { res.json(await brawlFetch(`/brawlers`)); }
  catch (e) { sendErr(res,e); }
});

app.get("/api/rankings/:scope/:type", async (req, res) => {
  try {
    const scope = String(req.params.scope || "").trim();
    const type = String(req.params.type || "").trim();
    const limit = Math.min(Number(req.query.limit || 50) || 50, 200);
    if (!scope || !type) throw Object.assign(new Error("Parâmetros inválidos"), { status: 400 });

    const safeScope = scope.toLowerCase() === "global" ? "global" : scope.toUpperCase();
    const path = `/rankings/${encodeURIComponent(safeScope)}/${encodeURIComponent(type)}?limit=${encodeURIComponent(limit)}`;
    res.json(await brawlFetch(path));
  } catch (e) { sendErr(res,e); }
});

const PORT = process.env.PORT || 5179;
app.listen(PORT, () => console.log(`Proxy rodando em http://localhost:${PORT}`));
