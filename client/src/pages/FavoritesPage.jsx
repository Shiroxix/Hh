import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, Trash2 } from "lucide-react";
import { Card, Button, Pill } from "../ui.jsx";
import { loadJSON, saveJSON } from "../storage";
import { showToast } from "../overlay";

export function FavoritesPage(){
  const nav = useNavigate();
  const favs = loadJSON("favs", []);
  const recent = loadJSON("recent", []);

  function clearFavs(){
    saveJSON("favs", []);
    showToast("Favoritos limpos.");
    window.location.reload();
  }
  function clearRecent(){
    saveJSON("recent", []);
    showToast("Recentes limpos.");
    window.location.reload();
  }

  return (
    <>
      <div id="toast" className="toast" />
      <Card className="cardPad">
        <div className="row" style={{alignItems:"center", justifyContent:"space-between"}}>
          <div>
            <h1 className="h1">Favoritos</h1>
            <div className="small">acesso rápido</div>
          </div>
          <Pill><Star size={14}/> {favs.length}</Pill>
        </div>

        <div className="sep" />

        <div className="row">
          {favs.length ? favs.map(f=>(
            <Button key={f} className="btnPrimary" onClick={()=>nav(`/?tag=${encodeURIComponent(f)}`)}>#{f}</Button>
          )) : <div className="small">—</div>}
        </div>

        <div className="sep" />

        <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
          <div>
            <div style={{fontWeight:800}}>Recentes</div>
            <div className="small">últimas buscas</div>
          </div>
          <Pill>{recent.length}</Pill>
        </div>

        <div className="row" style={{marginTop:10}}>
          {recent.length ? recent.map(r=>(
            <Button key={r} className="btnGhost" onClick={()=>nav(`/?tag=${encodeURIComponent(r)}`)}>#{r}</Button>
          )) : <div className="small">—</div>}
        </div>

        <div className="sep" />

        <div className="row">
          <Button className="btnDanger" onClick={clearFavs}><Trash2 size={16}/> Limpar favoritos</Button>
          <Button className="btnDanger" onClick={clearRecent}><Trash2 size={16}/> Limpar recentes</Button>
        </div>
      </Card>
    </>
  );
}
