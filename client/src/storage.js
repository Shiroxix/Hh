const ns = "brawl_meta_profile_v1";
const k = (key)=> `${ns}:${key}`;

export function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(k(key));
    return raw ? JSON.parse(raw) : fallback;
  }catch{ return fallback; }
}

export function saveJSON(key, value){
  try{ localStorage.setItem(k(key), JSON.stringify(value)); }catch{}
}

export function pushRecent(tag){
  const t = String(tag||"").toUpperCase().replace(/^#/,"").trim();
  if(!t) return;
  const list = loadJSON("recent", []);
  const next = [t, ...list.filter(x => x !== t)].slice(0, 12);
  saveJSON("recent", next);
  return next;
}

export function toggleFavorite(tag){
  const t = String(tag||"").toUpperCase().replace(/^#/,"").trim();
  if(!t) return { favs: loadJSON("favs", []), on: false };
  const favs = loadJSON("favs", []);
  const on = favs.includes(t);
  const next = on ? favs.filter(x=>x!==t) : [t, ...favs].slice(0, 30);
  saveJSON("favs", next);
  return { favs: next, on: !on };
}

export function isFavorite(tag){
  const t = String(tag||"").toUpperCase().replace(/^#/,"").trim();
  return loadJSON("favs", []).includes(t);
}
