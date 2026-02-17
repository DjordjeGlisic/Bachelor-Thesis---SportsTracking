import React, { useContext, useState } from "react";
import "./SideBar.css";
import { Context,KluboviContext } from "../../Context/Context";
import { useNavigate } from "react-router-dom";
export default function SideBar() {
  const {setSport,sport} = useContext(Context);
  const {klub,setKlub}=useContext(KluboviContext);
  const navigate=useNavigate();
  const sports = [
    { key: 1, label: "Fudbal", emoji: "⚽" },
    { key: 2, label: "Košarka", emoji: "🏀" },
    { key: 3, label: "Vaterpolo", emoji: "🤽‍♂️" },
  ];

  return (
    <>
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Sportovi</div>
      </div>

      <ul className="sidebar-list">
        {sports.map((s) => {
          const isActive = sport === s.key;

          return (
            <li
              key={s.key}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => {setSport(s.key);setKlub(null);}}
            >
              <span className="sidebar-emoji">{s.emoji}</span>
              <span className="sidebar-label">{s.label}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  
    </>
  );
}
