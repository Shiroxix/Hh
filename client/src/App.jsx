import React from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Search, Trophy, CalendarDays, Star } from "lucide-react";
import { HomePage } from "./pages/HomePage.jsx";
import { EventsPage } from "./pages/EventsPage.jsx";
import { RankingsPage } from "./pages/RankingsPage.jsx";
import { FavoritesPage } from "./pages/FavoritesPage.jsx";
import { MeuIpPage } from "./pages/MeuIpPage.jsx";

function TopBar(){
  const nav = useNavigate();
  return (
    <div className="topbar">
      <div className="topbarInner">
        <div className="brand" onClick={()=>nav("/")} style={{cursor:"pointer"}}>
          <div className="logo" />
          <div>Brawl Meta</div>
        </div>
        <div className="badge">Consulta de perfil • rápido</div>
      </div>
    </div>
  );
}

function TabBtn({ to, icon, label }){
  return (
    <NavLink
      to={to}
      className={({isActive}) => "tabbtn " + (isActive ? "tabbtnActive" : "")}
      end
    >
      <div className="tabicon">{icon}</div>
      <div className="tablabel">{label}</div>
    </NavLink>
  );
}

export default function App(){
  return (
    <>
      <div className="bgfx" />
      <TopBar />

      <div className="container pagePad">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/meuip" element={<MeuIpPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>

      <div className="tabbar" aria-label="Navegação">
        <div className="tabbarInner">
          <TabBtn to="/" icon={<Search size={16} />} label="Buscar" />
          <TabBtn to="/events" icon={<CalendarDays size={16} />} label="Eventos" />
          <TabBtn to="/rankings" icon={<Trophy size={16} />} label="Rankings" />
          <TabBtn to="/favorites" icon={<Star size={16} />} label="Favoritos" />
        </div>
      </div>
    </>
  );
}
