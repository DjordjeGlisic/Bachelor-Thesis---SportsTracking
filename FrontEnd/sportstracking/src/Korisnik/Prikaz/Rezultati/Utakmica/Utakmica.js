import React, { useContext, useRef, useState } from "react";
import "./Utakmica.css";
import { UtakmicaContext, TakmicenjeContext, Context } from "../../../../Context/Context";
import { Avatar, Button } from "@mui/material";
import Statistika from "./Statistika";
import Chat from "./Chat";
import Tabela from "../UcinakIgracaNaTakmicenju";
import axios from "axios";
import KlubModal from "./KlubModal";

const Utakmica = (props) => {
  //////KLUB MODAL///////////////////////
  const{izabraniKlub,setIzabraniKlub,sport,korisnik}=useContext(Context);
  
   const focusBackRef = useRef(null);
   
   
     const close = () => {
      
       setIzabraniKlub(null);
       requestAnimationFrame(() => focusBackRef.current?.focus());
     };
 
  const klubHandler=(klubNaziv)=>{
    const korID=korisnik!=null?korisnik.id:0;
    const naziv=encodeURIComponent(klubNaziv);
     const response = axios.get(
              `http://localhost:5146/Korisnik/VratiKlubSporta/${sport}/${naziv}/${korID}`,
              {
                headers: {
                  // Ovde možete dodati header informacije ako su potrebne
                  // Authorization: `Bearer ${token}`
                },
              }
            )
              .then((response) => {
              
              console.log("Izabrani klub");
              setIzabraniKlub(response.data);
                console.log(response.data);
                
              })
              .catch((error) => {
                // Obrada greške
                console.log(error);
                
              });

  }




  const { utakmica, setUtakmica } = useContext(UtakmicaContext);
  const { takmicenje } = useContext(TakmicenjeContext);
    const[opcija,setOpcija]=useState(1);
  if (!utakmica) return null;

  // vreme
  const totalMin = Number(utakmica.vreme) || 0;
  const sat = Math.floor(totalMin / 60);
  const minut = totalMin % 60;

  // rezultat
  const [homeScore, awayScore] = utakmica.rezultat
    ? utakmica.rezultat.split(":")
    : ["-", "-"];

  // strelci
  let domStrelci = [];
  let gostStrelci = [];

  if (utakmica.listaStrelaca && takmicenje.sport !== 2) {
    const [domPart, gosPart] = utakmica.listaStrelaca.split(",");
    domStrelci = domPart.split("-").slice(1); // bez "Dom"
    gostStrelci = gosPart.split("-").slice(1); // bez "Gos"
  }
  
  const statusText = utakmica.uzivo === true ? `${sat}:${minut}` : "ODIGRANO";
 function formatDateTime(ts) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(ts));
}
  return (
    <>
  {izabraniKlub==null&&(   <div
      className="match-detail-card"
     
    >
{props.strelica==true&&(
      <button className="back-btn" onClick={() => setUtakmica(null)}>
        ←
      </button>)}
     
      {/* gornji red */}
      <div className="match-detail-top">
        <div className="match-meta">
          <span className="match-competition">{takmicenje.naziv}</span>
          <span className="match-dot">·</span>
          <span className="match-date">{formatDateTime(utakmica.datum)}</span>
        </div>
        <span className="match-status">{statusText}</span>
      </div>

      {/* rezultat */}
      <div className="match-score-row">
        <Button className="match-team match-team-left" onClick={()=>{klubHandler(utakmica.domacin)}}>
          <Avatar>
            {utakmica.domacin.slice(0, 3).toUpperCase()}
          </Avatar>
          <span className="team-name">{utakmica.domacin}</span>
        </Button>

        <div className="match-score">
          <span className="score-number">{homeScore}</span>
          <span className="score-separator">-</span>
          <span className="score-number">{awayScore}</span>
        </div>

        <Button className="match-team match-team-right" onClick={()=>{klubHandler(utakmica.gost)}}>
          <Avatar className="team-logo">
            {utakmica.gost.slice(0, 3).toUpperCase()}
          </Avatar>
          <span className="team-name" >{utakmica.gost}</span>
        </Button>
      </div>

      {/* strelci – samo ako sport !== 2 */}
      {takmicenje.sport !== 2 && (
        <div className="match-goals-row">
          <div className="match-goals-left">
            {domStrelci.map((strelac, i) => (
              <p key={`dom-${i}`}>{strelac}</p>
            ))}
          </div>
          <div className="match-goals-right">
            {gostStrelci.map((strelac, i) => (
              <p key={`gost-${i}`}>{strelac}</p>
            ))}
          </div>
        </div>
      )}

      <div className="match-tabs">
        <button className={opcija===1?"match-tab match-tab-active":"match-tab"} onClick={()=>{setOpcija(1);}}>STATISTIKA</button>
        <button className={opcija===2?"match-tab match-tab-active":"match-tab"} onClick={()=>setOpcija(2)}>ČET</button>
      </div>
      {opcija===1&&<Statistika/>}
      {opcija===2&&<Chat/>}
     
     
    </div>)}
     {izabraniKlub!==null&&( <KlubModal
                    open={izabraniKlub!=null}
                    onClose={close}
                   
              />)}
    </>
  );
};

export default Utakmica;
