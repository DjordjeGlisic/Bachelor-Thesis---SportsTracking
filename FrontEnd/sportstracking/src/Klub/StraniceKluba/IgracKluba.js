import "./IgracKluba.css";
import React,{useContext,useState,useEffect} from "react";
import { Context,KluboviContext } from "../../Context/Context";
import axios from "axios";
const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};
function splitByComma(input) {
  if (typeof input !== "string") return [];

  return input
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0);
}
export default function IgracKluba({izabraniIgrac}) {
  
    const[parametri,setParametri]=useState(null);
    useEffect(()=>{
        axios.get(`http://localhost:5146/Klub/VratiParametreIgraca/${izabraniIgrac.id}`)
        .then((response)=>{
            setParametri(response.data);
            setTakmicenje(response.data.takmicenja[0].id);
            setSezona(response.data.sezone[0]);

        })
        .catch((error)=>{console.log(error);})

    },[])
const {korisnik,izabraniKlub,sport}=useContext(Context);
const {klub}=useContext(KluboviContext);
const Sport= klub ? klub.sport  : sport;
const[stat,setStat]=useState(null);
const [sezona,setSezona]=useState(null);
  const [takmicenje,setTakmicenje]=useState(null);
useEffect(()=>{
    if(sezona==null||takmicenje==null)
        return;
     const sezonaUrl = encodeURIComponent(sezona);
     axios.get(`http://localhost:5146/Klub/VratiStatistikuIgraca/${izabraniIgrac.id}/${sezonaUrl}/${takmicenje}`)
     .then((resp)=>{console.log("Statistika igraca",resp.data);setStat(resp.data);})
     .catch((err)=>{console.log(err);})
},[sezona,takmicenje])
const statistikaKosarka=()=>{
    return ( <div className="ik-statsGrid">
          <div className="ik-stat"><strong>{stat.odigrane}</strong><span>ODIGRANE UTAKMICE</span></div>
        
          <div className="ik-stat"><strong>{stat.pts.toFixed(2)}</strong><span>POENA PO MEČU</span></div>
          <div className="ik-stat"><strong>{stat.reb.toFixed(2)}</strong><span>SKOKOVA PO MEČU</span></div>
          <div className="ik-stat"><strong>{stat.off.toFixed(2)}</strong><span>OFANZIVNIH PO MEČU</span></div>
          <div className="ik-stat"><strong>{stat.dff.toFixed(2)}</strong><span>DEFANZIVNH PO MEČU</span></div>
          <div className="ik-stat"><strong>{stat.ast.toFixed(2)}</strong><span>ASISTENCIJA PO MEČU</span></div>
          <div className="ik-stat"><strong>{stat.stl.toFixed(2)}</strong><span>KRAĐA PO MEČU</span></div>
          <div className="ik-stat"><strong>{stat.blk.toFixed(2)}</strong><span>BLOKADA PO MEČU</span></div>
          <div className="ik-stat"><strong>{stat.trn.toFixed(2)}</strong><span>IZGUBLJENIH LOPTI PO MEČU</span></div>
          <div className="ik-stat"><strong>{stat.fls.toFixed(2)}</strong><span>FAULA PO MEČU</span></div>
          <div className="ik-stat"><strong>{stat.proc.toFixed(2)}%</strong><span>PROCENAT ŠUTA PO MEČU</span></div>
          
          <div className="ik-stat"><strong>{stat.indeks.toFixed(2)}</strong><span>INDEKS PO MEČU</span></div>
        </div>);
}
const statistikaFudbal=()=>{
    return ( <div className="ik-statsGrid">
          <div className="ik-stat"><strong>{stat.odigrane}</strong><span>ODIGRANE UTAKMICE</span></div>
        
          <div className="ik-stat"><strong>{stat.golovi}</strong><span>GOLOVI</span></div>
          <div className="ik-stat"><strong>{stat.asistencije}</strong><span>ASISTENCIJE</span></div>
          <div className="ik-stat"><strong>{stat.sutevi}</strong><span>UPUĆENIH ŠUTEVA</span></div>
          <div className="ik-stat"><strong>{stat.fauli}</strong><span>FAULI</span></div>
          <div className="ik-stat"><strong>{stat.blokirani}</strong><span>BLOKIRANI UDARCI</span></div>
          <div className="ik-stat"><strong>{stat.vraceniPosedi}</strong><span>VRAĆENIH POSEDA</span></div>
          <div className="ik-stat"><strong>{stat.dodavanja}</strong><span>DODAVANJA</span></div>
          <div className="ik-stat"><strong>{stat.tacna}</strong><span>TAČNA DODAVANJA</span></div>
          <div className="ik-stat"><strong>{stat.uspesnostDodavanja.toFixed(2)}</strong><span>USPEŠNOST DODAVANJA%</span></div>
          <div className="ik-stat"><strong>{stat.predjeno}KM</strong><span>PREĐENA KILOMETRAŽA</span></div>
          
          <div className="ik-stat"><strong>{stat.indeks}</strong><span>INDEKS</span></div>
        </div>);
}
const statistikaVaterpolo=()=>{
    return ( <div className="ik-statsGrid">
         
        
          <div className="ik-stat"><strong>{stat.odigrane}</strong><span>ODIGRANE UTAKMICE</span></div>
        
          <div className="ik-stat"><strong>{stat.golovi}</strong><span>GOLOVI</span></div>
          <div className="ik-stat"><strong>{stat.asistencije}</strong><span>ASISTENCIJE</span></div>
          <div className="ik-stat"><strong>{stat.sutevi}</strong><span>UPUĆENIH ŠUTEVA</span></div>
          <div className="ik-stat"><strong>{stat.fauli}</strong><span>FAULI</span></div>         
          <div className="ik-stat"><strong>{stat.blokirani}</strong><span>BLOKIRANI UDARCI</span></div>
          <div className="ik-stat"><strong>{stat.izgubljene}</strong><span>IZGUBLJENE LOPTE</span></div>
           <div className="ik-stat"><strong>{stat.vraceni}</strong><span>VRAĆENI POSEDI</span></div>   
          <div className="ik-stat"><strong>{stat.iskljucenja}</strong><span>ISKLJUČENJA</span></div>
          <div className="ik-stat"><strong>{stat.indeks.toFixed(2)}</strong><span>INDEKS</span></div>
        </div>);
}
  
  
  return (
    <div className="ik-wrap">
      {/* HEADER */}
      <div className="ik-hero">
        <div className="ik-avatar">
          <span className="ik-avatarIcon">👤</span>
        </div>

        <div className="ik-main">
          <h1 className="ik-name">
            {izabraniIgrac.ime.toUpperCase()} {izabraniIgrac.prezime.toUpperCase()}
          </h1>

          <div className="ik-sub">
            {izabraniIgrac.pozicija}
          </div>

          <div className="ik-info">
            <div>
              <span>Godine</span>
              <strong>{izabraniIgrac.brojGodina}</strong>
            </div>
            <div>
              <span>Visina</span>
              <strong>{izabraniIgrac.visina.toFixed(2)} cm</strong>
            </div>
            <div>
              <span>Težina</span>
              <strong>{izabraniIgrac.tezina.toFixed(2)} kg</strong>
            </div>
            <div>
              <span>Datum rođenja</span>
              <strong>{formatDate(izabraniIgrac.datumRodjenja)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* CLUBS */}
      <div className="ik-clubs">
        <p>Igrao za sledeće klubove:</p>
        {splitByComma(izabraniIgrac.listaKlubova).map((k) => (
          <div key={k} className="ik-clubCard">
            
            <span>{k}</span>
          </div>
        ))}
      </div>

      {/* STATS */}
     {parametri!==null&&( <div className="ik-stats">
        <div className="ik-season">
          <select onChange={(e) => setSezona(e.target.value)}>
            {parametri.sezone.map((s) => (
              <option key={s} value={s} >{s}</option>
            ))}
          </select>
            <select onChange={(e) => {console.log(e.target.value);setTakmicenje(e.target.value)}}>
            {parametri.takmicenja.map((s) => (
              <option key={s.id} value={s.id}>{s.naziv}</option>
            ))}
          </select>
        </div>
        {stat!==null&&(<>
            {Sport===1?statistikaFudbal():Sport===2?statistikaKosarka():statistikaVaterpolo()}
        </>)}
       
      </div>)}
    </div>
  );
}
