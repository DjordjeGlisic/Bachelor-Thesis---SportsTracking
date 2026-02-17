import React, { useEffect, useMemo,useContext,useState } from "react";
import "./SastavKluba.css";
import axios from "axios";
import { Context,KluboviContext } from "../../Context/Context";
import { Button } from "@mui/material";
import IgracKluba from "./IgracKluba";



const sectionOrderFudbal = [
  { key: "Golman", title: "Golmani", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
  { key: "Odbrambeni", title: "Odbrana", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
  { key: "Vezni", title: "Vezni red", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
  { key: "Napadač", title: "Napad", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
 
  
  
  
  
  
];
const sectionOrderKosarka=[
     { key: "PG", title: "Play Maker", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
  { key: "SG", title: "Bek šuter", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
  { key: "SF", title: "Krilo", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
  { key: "PF", title: "Krlini centar", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
  { key: "C", title: "Centar", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
  
  
];
const sectionOrderVaterpolo=[
     { key: "Golman", title: "Golmani", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
    { key: "Sidras", title: "Sidraš", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
  { key: "Bek", title: "Bek", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
   { key: "Krilo", title: "Krilo", statHeader: "Indeksni rejting", statKey: "indeksniRejting" },
];



const safe = (v, fallback = "-") => (v === null || v === undefined || v === "" ? fallback : v);

// const calcAge = (datumRodjenja) => {
//   if (!datumRodjenja) return "-";
//   const d = new Date(datumRodjenja);
//   if (Number.isNaN(d.getTime())) return "-";
//   const today = new Date();
//   let age = today.getFullYear() - d.getFullYear();
//   const m = today.getMonth() - d.getMonth();
//   if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
//   return age;
// };

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  // dd.mm.yyyy
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

function ProfileIcon() {
  return (
    <svg className="sk-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
      />
    </svg>
  );
}



export default function SastavKluba(props) {

    const {klub}=useContext(KluboviContext);
    const{izabraniKlub,sport}=useContext(Context);
    const[igraci,setIgraci]=useState([]);
    const [sectionOrder,setSectionOrder]=useState([]);
    
const igracHandler=(p)=>{
  console.log(p);
  props.setIzabraniIgrac(p);
}
function PlayerRow({ p, statKey }) {
  return (
    <div className="sk-row" role="row" onClick={()=>{igracHandler(p)}}>
      {/* Igrač */}
      <div className="sk-cell sk-player" role="cell">
        <div className="sk-iconWrap" aria-hidden="true">
          <ProfileIcon />
        </div>

        <div className="sk-nameWrap">
          <div className="sk-name">{safe(p.ime)} {safe(p.prezime, "")}</div>
          <div className="sk-sub">Pozicija: {safe(p.pozicija)}</div>
        </div>
      </div>

      {/* Datum rođenja */}
      <div className="sk-cell sk-center" role="cell">{formatDate(p.datumRodjenja)}</div>

      {/* Godine */}
      <div className="sk-cell sk-center" role="cell">{p.brojGodina}</div>

      {/* Visina */}
      <div className="sk-cell sk-center" role="cell">{safe(p.visina.toFixed(2))}{p.visina ? " cm" : ""}</div>

      {/* Težina */}
      <div className="sk-cell sk-center" role="cell">{safe(p.tezina.toFixed(2))}{p.tezina ? " kg" : ""}</div>

      {/* Datum potpisa */}
      <div className="sk-cell sk-center" role="cell">{formatDate(p.datumPocetkaUgovora)}</div>

      {/* Datum isteka */}
      <div className="sk-cell sk-center" role="cell">{formatDate(p.datumKrajaUgovora)}</div>

      {/* Stat */}
      <div className="sk-cell sk-center sk-stat" role="cell">{safe(p[statKey])}</div>
    </div>
  );
}

function Section({ title, players, statHeader, statKey }) {
  return (
    <section className="sk-section">
      <div className="sk-sectionTitle">{title}</div>

      <div className="sk-headRow" role="row">
        <div className="sk-headCell sk-headPlayer">Igrač</div>
        <div className="sk-headCell">Datum rođenja</div>
        <div className="sk-headCell">Godine</div>
        <div className="sk-headCell">Visina</div>
        <div className="sk-headCell">Težina</div>
        <div className="sk-headCell">Datum potpisa</div>
        <div className="sk-headCell">Datum isteka</div>
        <div className="sk-headCell">{statHeader}</div>
      </div>

      <div className="sk-rows" role="rowgroup">
        {players.length > 0 ? (
          players.map((p) => <PlayerRow key={p.id} p={p} statKey={statKey} />)
        ) : (
          <div className="sk-empty">Nema igrača u ovoj grupi.</div>
        )}
      </div>
    </section>
  );
}

    useEffect(()=>{
        const id=izabraniKlub==null?klub.id:izabraniKlub.id;
        const response=axios.get(`http://localhost:5146/Klub/VratiSastavKluba/${id}`)
        .then((response)=>{
            console.log(response.data);
            setIgraci(response.data);
            if(sport==1)
                setSectionOrder(sectionOrderFudbal);
            else if (sport==2)
                setSectionOrder(sectionOrderKosarka);
            else
                setSectionOrder(sectionOrderVaterpolo);


        })
      .catch((err) => console.log(err));

    },[])
    //GRUPISANJE PO POZICIJI
  const grouped = useMemo(() => {
    const map = new Map();
    for (const p of igraci) {
      const key = p.pozicija || "OSTALO";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }

    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const an = `${a.prezime ?? ""} ${a.ime ?? ""}`.trim();
        const bn = `${b.prezime ?? ""} ${b.ime ?? ""}`.trim();
        return an.localeCompare(bn);
      });
    }

    return map;
  }, [igraci]);

  return (
    <div className="sk-wrap">
      {props.izabraniIgrac===null&&(<div className="sk-card">
        <div className="sk-top">
          <div className="sk-title">Sastav</div>
          <div className="sk-subtitle">Grupisano po poziciji</div>
        </div>

        <div className="sk-scroll">
          {sectionOrder.map((sec) => (
            <Section
              key={sec.key}
              title={sec.title}
              players={grouped.get(sec.key) ?? []}
              statHeader={sec.statHeader}
              statKey={sec.statKey}
            />
          ))}
        </div>
      </div>)}
      {props.izabraniIgrac!==null&&(
        <IgracKluba izabraniIgrac={props.izabraniIgrac}/>
      )}
    </div>
  );
}
