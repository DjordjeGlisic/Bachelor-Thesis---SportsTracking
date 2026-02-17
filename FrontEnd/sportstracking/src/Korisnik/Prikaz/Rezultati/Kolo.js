import { useEffect, useMemo, useState,useContext } from "react";
import { TakmicenjeContext,UtakmicaContext } from "../../../Context/Context";
import "./Kolo.css";
import axios from "axios";
import Utakmica from "./Utakmica/Utakmica";

export default function Kolo() {
    const { takmicenje } = useContext(TakmicenjeContext);
    const [round, setRound] = useState(1);
  
    const[utakmica,setUtakmica]=useState(null);
    const [matches,setMatches] = useState(null);
   

const tipKola=(tip)=>{
  switch(tip)
  {
    case 1:
      return "Opšte Kolo";
    case 2:
      return "1/64 Finala";
    case 3:
      return "1/32 Finala";
    case 4:
      return "1/16 Finala";
    case 5:
      return "1/8 Finala";
    case 6:
      return "1/4 Finala";
    case 7:
      return "1/2 Finala";
    default:
      return "Finale";
    
    
    
    
      
      
  }
}
function formatDateTime(ts) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(ts));
}
    useEffect(() => {
        const response =  axios.get(`http://localhost:5146/Korisnik/PribaviKolo/${takmicenje.id}/${round}`,
            {
                headers:{
                    //Authorization: `Bearer ${token}`
                }
            }).then(response=>{
                console.log(response.data.value);
                setMatches(response.data.value);
                const niz=[];
                
                 console.log(`Stampam utakmice kola `);
                 console.log(matches);
             
            })
            .catch(error=>{
                console.log(error);
            })
        }, [round]);
 
  const statusLabel = (m) => {
    if (m?.uzivo) return { text: "Uživo", cls: "live" };
  const now= new Date();
  const utakmica=new Date(m.datum);
    if (utakmica<now) return { text: "Odigrano", cls: "ft" };
    return { text: "Predstoji", cls: "upcoming" };
  };
  return (
    <>
    {utakmica===null&&<>
    <div className="rm-wrap">
      {/* HEADER */}
      <div className="rm-header">
        <div className="rm-title">
          <span className="rm-titleText">{round}. kolo od {matches!==null?matches.koliko:0}</span>

          <label className="rm-selectWrap" aria-label="Izaberi kolo">
            <span className="rm-selectLabel">Kolo</span>
            <select
              className="rm-select"
              value={round}
              onChange={(e) => setRound(Number(e.target.value))}
            >
              {matches!==null&&Array.from({ length: matches.koliko }, (_, i) => (
    <option key={i + 1} value={i + 1}>
      {i + 1}
    </option>
  ))}
            </select>
          </label>
        </div>
      </div>
<>
  {matches === null && <h1>Učitavanje kola…</h1>}

  {matches !== null && (
    <div className="rm-grid">
      <h1>{tipKola(matches.tip)}</h1>
      {matches.utakmice.map((e) => (
        <div className="rm-card" key={e.id} onClick={(event)=>{event.preventDefault();setUtakmica(e);console.log("Kliknuta utakmica");console.log(e)}}>
        <div className="rm-teams">
          <div className="rm-team">
            <span className="rm-name">{e.domacin}</span>
          </div>
          <div className="rm-team">
            <span className="rm-name">{e.gost}</span>
          </div>
        </div>

       <div className="rm-score">
  {(() => {
    const [home, away] = e.rezultat.split(":");

    return (
      <div className="rm-score-col">
        <div className={`rm-score-item ${e.uzivo ? "live" : ""}`}>
      {home}</div>
       <div className={`rm-score-item ${e.uzivo ? "live" : ""}`}>{away}</div>
      </div>
    );
  })()}
</div>

        <div className="rm-meta">
          <span className={`rm-status ${e.uzivo ? "live" : ""}`}>
            {statusLabel(e).text}
          </span>
          <span className="rm-date">{formatDateTime(e.datum)}.</span>
        </div>
      </div>
      ))}
    </div>
  )}
</>
    </div>
    </>}
    {utakmica!==null&&(
    <UtakmicaContext.Provider value={{utakmica,setUtakmica}}>
        <Utakmica strelica={true}/>
    </UtakmicaContext.Provider>)}
    </>
  );
}
