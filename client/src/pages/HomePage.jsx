import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, StarOff, Copy, Share2, RefreshCw } from "lucide-react";
import { apiGet } from "../api";
import { Card, Button, Input, Pill, Skeleton } from "../ui.jsx";
import { buildShareTextPlayer, stripHash, fmtCompact, battleTypeLabel, ago } from "../format";
import { copyText, shareWhatsApp } from "../share";
import { loadJSON, pushRecent, toggleFavorite, isFavorite } from "../storage";
import { showToast, openModal, closeModal } from "../overlay";

function Stat({ label, value }){
  return (
    <div className="item" style={{padding:"10px 12px"}}>
      <div className="small">{label}</div>
      <div style={{fontWeight:800, fontSize:"1.02rem"}}>{value}</div>
    </div>
  );
}

function parseBattleTime(s){
  try{
    if(!s || typeof s !== "string" || !s.includes("T")) return null;
    const iso = s.replace(/\.(\d+)Z$/,"Z").replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, "$1-$2-$3T$4:$5:$6Z");
    return iso;
  }catch{ return null; }
}

function BattleItem({ it }){
  const ev = it.event || {};
  const bt = it.battle || {};
  const mode = ev.mode || bt.mode || "—";
  const map = ev.map || "—";
  const type = battleTypeLabel(bt.type);
  const iso = parseBattleTime(it.battleTime);
  const badge = bt.result ? bt.result.toUpperCase() : (bt.rank ? ("RANK " + bt.rank) : "—");

  return (
    <div className="item">
      <div className="itemTop">
        <div>
          <div style={{fontWeight:800}}>{mode} <span className="small">• {type}</span></div>
          <div className="small">{map}</div>
        </div>
        <Pill>{badge}</Pill>
      </div>
      <div className="kv">
        <span>{iso ? ago(iso) : "—"}</span>
        {bt.trophyChange != null && <span>Troféus: {bt.trophyChange > 0 ? "+" : ""}{bt.trophyChange}</span>}
      </div>
    </div>
  );
}

export function HomePage(){
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState("");
  const [tag, setTag] = useState("");

  const recent = loadJSON("recent", []);
  const favs = loadJSON("favs", []);
  const favOn = useMemo(()=> (tag ? isFavorite(tag) : false), [tag]);

  function doSearch(t){
    const clean = stripHash(t);
    if(!clean) return;
    setTag(clean);
    setInput("#" + clean);
    pushRecent(clean);
    try{ setParams({ tag: clean }); }catch{}
  }

  useEffect(()=>{
    const qt = params.get("tag");
    if(qt) doSearch(qt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const qPlayer = useQuery({
    queryKey: ["player", tag],
    enabled: !!tag,
    queryFn: () => apiGet(`/api/player/${encodeURIComponent(tag)}`)
  });

  const qBattle = useQuery({
    queryKey: ["battlelog", tag],
    enabled: !!tag,
    queryFn: () => apiGet(`/api/player/${encodeURIComponent(tag)}/battlelog`)
  });

  function onFav(){
    if(!tag) return;
    const { on } = toggleFavorite(tag);
    showToast(on ? "Favoritado." : "Removido dos favoritos.");
  }

  const shareText = useMemo(()=>{
    if(!qPlayer.data) return "";
    return buildShareTextPlayer(qPlayer.data, qBattle.data);
  }, [qPlayer.data, qBattle.data]);

  return (
    <>
      <div id="toast" className="toast" />
      <div id="modalBack" className="modalBack" onClick={(e)=>{ if(e.target?.id==="modalBack") closeModal(); }}>
        <div className="modal" onClick={(e)=>e.stopPropagation()}>
          <div className="modalTop">
            <div id="modalTitle" className="modalTitle">Texto</div>
            <Button className="btnIcon" onClick={closeModal}>Fechar</Button>
          </div>
          <textarea id="modalText" spellCheck="false" />
          <div className="row" style={{padding:"10px 6px 4px"}}>
            <Button onClick={()=>copyText(document.getElementById("modalText")?.value || "")}><Copy size={16}/> Copiar</Button>
            <Button className="btnPrimary" onClick={()=>shareWhatsApp(document.getElementById("modalText")?.value || "")}><Share2 size={16}/> WhatsApp</Button>
          </div>
        </div>
      </div>

      <div className="grid">
        <Card className="cardPad">
          <div className="row" style={{alignItems:"center", justifyContent:"space-between"}}>
            <div>
              <h1 className="h1">Consultar perfil</h1>
              <div className="small">Player tag — histórico + favoritos</div>
            </div>
            <div className="badge">{tag ? `#${tag}` : "—"}</div>
          </div>

          <div className="sep" />

          <div className="row" style={{alignItems:"center"}}>
            <Input
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              placeholder="Digite a tag do player (com ou sem #)"
              onKeyDown={(e)=>{ if(e.key==="Enter") doSearch(input); }}
            />
            <Button className="btnPrimary" onClick={()=>doSearch(input)}><Search size={16}/> Buscar</Button>
          </div>

          <div className="row" style={{marginTop:10}}>
            <Button onClick={onFav}>
              {favOn ? <StarOff size={16} /> : <Star size={16} />}
              {favOn ? "Desfavoritar" : "Favoritar"}
            </Button>
            <Button onClick={()=>copyText(shareText)} disabled={!shareText}><Copy size={16}/> Copiar resumo</Button>
            <Button className="btnPrimary" onClick={()=>shareWhatsApp(shareText)} disabled={!shareText}><Share2 size={16}/> WhatsApp</Button>
            <Button className="btnGhost" onClick={()=>{ qPlayer.refetch(); qBattle.refetch(); }} disabled={!tag}>
              <RefreshCw size={16}/> Atualizar
            </Button>
          </div>

          {qPlayer.isError && <div className="err">{qPlayer.error?.message || "Erro ao buscar player"}</div>}

          <div style={{height:12}} />

          {!tag && (
            <div className="small">
              Recentes:{" "}
              {recent.length ? recent.map(r=>(
                <Button key={r} className="btnGhost" onClick={()=>doSearch(r)}>#{r}</Button>
              )) : "—"}
            </div>
          )}

          {qPlayer.isLoading && (
            <div className="list" style={{marginTop:12}}>
              <div className="item"><Skeleton className="skelLine" /><div style={{height:8}} /><Skeleton className="skelLine2" /></div>
              <div className="item"><Skeleton className="skelBox" /></div>
            </div>
          )}

          {qPlayer.data && (
            <>
              <div className="item" style={{marginTop:10}}>
                <div style={{fontWeight:900, fontSize:"1.06rem"}}>
                  {qPlayer.data.name} <span className="small">#{qPlayer.data.tag}</span>
                </div>
                <div className="kv">
                  {qPlayer.data.club?.name && <span>Clube: {qPlayer.data.club.name}</span>}
                  <span>Nível: {qPlayer.data.expLevel}</span>
                  <span>Troféus: {fmtCompact(qPlayer.data.trophies)} (Best {fmtCompact(qPlayer.data.bestTrophies)})</span>
                </div>
              </div>

              <div className="row" style={{marginTop:10}}>
                <div style={{flex:"1 1 180px"}}><Stat label="Vitórias 3v3" value={fmtCompact(qPlayer.data["3vs3Victories"])} /></div>
                <div style={{flex:"1 1 180px"}}><Stat label="Vitórias Solo" value={fmtCompact(qPlayer.data.soloVictories)} /></div>
                <div style={{flex:"1 1 180px"}}><Stat label="Vitórias Dupla" value={fmtCompact(qPlayer.data.duoVictories)} /></div>
              </div>

              <div className="sep" />

              <div className="row" style={{alignItems:"center", justifyContent:"space-between"}}>
                <div>
                  <div style={{fontWeight:800}}>Top brawlers</div>
                  <div className="small">por troféus</div>
                </div>
                <Pill>{(qPlayer.data.brawlers || []).length} brawlers</Pill>
              </div>

              <div className="list" style={{marginTop:10}}>
                {[...(qPlayer.data.brawlers || [])]
                  .sort((a,b)=>(b.trophies||0)-(a.trophies||0))
                  .slice(0, 8)
                  .map(b=>(
                    <div className="item" key={b.id}>
                      <div className="itemTop">
                        <div>
                          <div style={{fontWeight:800}}>{b.name}</div>
                          <div className="small">Power {b.power} • Rank {b.rank}</div>
                        </div>
                        <Pill>{b.trophies}</Pill>
                      </div>
                      <div className="kv">
                        <span>Maior: {b.highestTrophies}</span>
                        <span>Gadgets: {(b.gadgets || []).length}</span>
                        <span>Star Powers: {(b.starPowers || []).length}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </>
          )}
        </Card>

        <Card className="cardPad">
          <div className="row" style={{alignItems:"center", justifyContent:"space-between"}}>
            <div>
              <h1 className="h1">Últimas partidas</h1>
              <div className="small">battlelog</div>
            </div>
            <Pill>{qBattle.data?.items?.length ?? 0}</Pill>
          </div>

          <div className="sep" />

          {qBattle.isLoading && (
            <div className="list">
              <div className="item"><Skeleton className="skelLine" /><div style={{height:8}} /><Skeleton className="skelLine2" /></div>
              <div className="item"><Skeleton className="skelLine" /><div style={{height:8}} /><Skeleton className="skelLine2" /></div>
              <div className="item"><Skeleton className="skelLine" /><div style={{height:8}} /><Skeleton className="skelLine2" /></div>
            </div>
          )}

          {qBattle.isError && <div className="err">{qBattle.error?.message || "Erro ao carregar battlelog"}</div>}

          {!tag && <div className="small">Busque um player para ver as partidas.</div>}

          {qBattle.data?.items?.length ? (
            <div className="list">
              {qBattle.data.items.slice(0, 12).map((it, idx)=>(
                <BattleItem it={it} key={idx} />
              ))}
            </div>
          ) : (tag && !qBattle.isLoading && <div className="small">Sem dados.</div>)}

          <div className="sep" />

          <div>
            <div style={{fontWeight:800}}>Favoritos</div>
            <div className="small">toque para buscar</div>
            <div className="row" style={{marginTop:8}}>
              {(favs || []).slice(0, 12).map(f=>(
                <Button key={f} className="btnGhost" onClick={()=>doSearch(f)}>#{f}</Button>
              ))}
              {(!favs || favs.length===0) && <div className="small">—</div>}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
