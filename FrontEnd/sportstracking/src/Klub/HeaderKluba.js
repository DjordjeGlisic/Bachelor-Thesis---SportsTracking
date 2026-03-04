import React, { useMemo, useState,useEffect,useContext } from "react";
import "./HeaderKluba.css";

import PublicIcon from "@mui/icons-material/Public";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Alert, Avatar, Snackbar, Tooltip } from "@mui/material";
import { Context,KluboviContext } from "../Context/Context";
import axios from "axios";
import OpsteInfo from "./StraniceKluba/OpsteInfo";
import Novosti from "./StraniceKluba/Novosti";
import SastavKluba from "./StraniceKluba/SastavKluba";
import UcinakKluba from "./StraniceKluba/UcinakKluba";
import { useNavigate } from "react-router-dom";
import Inbox from "../Inbox/Inbox";

const  HeaderKluba=()=>{
  const [open,setOpen]=useState(false);
  const navigate=useNavigate();
 const [izabraniIgrac,setIzabraniIgrac]=useState(null);
    const pratiText = (n) => {
  if (n === 1) return "1 korisnik prati klub";
  if (n >= 2 && n <= 4) return `${n} korisnika prati klub`;
  return `${n} korisnika prati klub`;
};
  const [formOpen, setFormOpen] = useState(true);
const[activeTab, setActiveTab] = useState("ucniak");
const [opcija,setOpcija]=useState("ucinak");
const {klub,setKlub}=useContext(KluboviContext);
const {korisnik,izabraniKlub}=useContext(Context);
const korisnikTabs=[
    { key: "ucinak", label: "Učinak kluba" },
    { key: "opsteInfo", label: "Opšte informacije" },
    { key: "novosti", label: "Novosti" },
    { key: "sastav", label: "Sastav" },
  ];
  const klubTabs=[
    { key: "ucinak", label: "Učinak kluba" },
    { key: "opsteInfo", label: "Opšte informacije" },
    { key: "novosti", label: "Novosti" },
    { key: "sastav", label: "Sastav" },
    { key: "inbox", label: "Inbox" }
  ];
const tabs = useMemo(
  () => izabraniKlub!==null ? korisnikTabs : klubTabs,
  
);
const aktivniKlub = izabraniKlub!==null ? izabraniKlub : klub;
const brojPratilaca = aktivniKlub?.brojPratioca ?? aktivniKlub?.brojPratiocaKluba ?? 0;
const [formMatches,setFormMatches]=useState([]);

useEffect(()=>{
  
  if(!aktivniKlub) return;
     const response =  axios.get(`http://localhost:5146/Klub/VratiFormuTima/${aktivniKlub.id}`,
      {
        headers:{
          //Authorization: `Bearer ${token}`
        }
      }).then(response=>{
        console.log(response.data);
        setFormMatches(response.data);
        
      })
      .catch(error=>{
        console.log(error);
      })
},[izabraniKlub,klub]);
useEffect(()=>{
  setActiveTab("ucinak");
  setOpcija("ucinak");
},[klub])
function formatDateTime(ts) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(ts));
}
  const [alert,setAlert]=useState("");
  const[severity,setSeverity]=useState("");
  const [openSnack,setOpenSnack]=useState(false);
  const hideSnack=()=>{setAlert("");setSeverity("");setOpenSnack(false);}
  return (
    <>
    {aktivniKlub&&(
    <div className="kh-shell">
      {/* HERO */}
      <div
        className="kh-hero"
        style={
          aktivniKlub.logo
            ? { backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.80), rgba(0,0,0,.45)), url(${aktivniKlub.logo})` }
            : undefined
        }
      >
        <div className="kh-heroInner">
          <div className="kh-left">
            <div className="kh-logoWrap">
               <img src={aktivniKlub.logo} alt={aktivniKlub.naziv} /> : <div className="kh-logoFallback" />
            </div>

            <div className="kh-titleBlock">
              <div className="kh-title">{aktivniKlub.naziv}</div>
              {aktivniKlub.takicenja.map((t)=>(<div className="kh-sub">
                <PublicIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                <span className="kh-country">{t}</span>
              </div>))}
            </div>
            <Tooltip title="Broj korisnika koji prate klub" arrow>
    <div className="kh-followPill">
      <span className="kh-followIcon">
        <PersonAddAlt1Icon fontSize="small" />
      </span>

      <span className="kh-followNum">{brojPratilaca}</span>

      <span className="kh-followLabel">
        {brojPratilaca === 1 ? "pratilac" : "pratioca"}
      </span>

     
    </div>
  </Tooltip>

  {/* mala linija ispod sa rečenicom (opciono) */}
  <div className="kh-followSub">{pratiText(brojPratilaca)}</div>
          </div>
                


          {/* DESNO: FORMA (padajuće) */}
          <div className={"kh-form " + (formOpen ? "kh-form--open" : "kh-form--closed")}>
            <button
              type="button"
              className="kh-formToggle"
              onClick={() => setFormOpen((p) => !p)}
              aria-label="Forma kluba"
            >
              <span className="kh-formTitle">Forma</span>
              <span className="kh-formPills" aria-hidden="true">
                {formMatches.slice(0, 5).map((m) => (
                  <span
                    key={m.id}
                    className={
                      "kh-pill " +
                      (m.result === 1
                        ? "kh-pill--w"
                        : m.result === 2
                        ? "kh-pill--d"
                        : "kh-pill--l")
                    }
                  >
                    {m.ishod===2?"D":m.ishod===1?"W":"L"}
                  </span>
                ))}
              </span>
              {formOpen ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
            </button>

            {formOpen && (
              <div className="kh-formBody">
                <div className="kh-formLabel">Last 5 matches</div>

                <div className="kh-formList">
                  {formMatches.slice(0, 5).map((m) => (
                    <div key={m.id} className="kh-formRow">
                      <div
                        className={
                          "kh-badge " +
                          (m.ishod === 1 ? "kh-badge--w" : m.ishod === 2 ? "kh-badge--d" : "kh-badge--l")
                        }
                      >
                        {m.ishod===2?"D":m.ishod===1?"W":"L"}
                      </div>

                      <div className="kh-formText">
                        <div className="kh-formLine">
                          <span className="kh-team">{m.domacin}</span>
                          <span className="kh-score">{m.rezultat}</span>
                          <span className="kh-team">{m.gost}</span>
                        </div>
                        <div className="kh-formMeta">
                          <span>{formatDateTime(m.datum)}</span>
                          <span className="kh-dot">•</span>
                          <span>{m.takmicenje}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formMatches.length === 0 && <div className="kh-formEmpty">Nema podataka o formi.</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TAB BAR */}
        <div className="kh-tabsBar">
          <div className="kh-tabsInner">
            {tabs.map((t) => (
               
              <button
                key={t.key}
                type="button"
                className={"kh-tab " + (activeTab === t.key ? "kh-tab--active" : "")}
                // nema funkcije routing ovde, samo izgled
                onClick={(e) =>{ e.preventDefault(); setActiveTab(t.key);setOpcija(t.key); setIzabraniIgrac(null);}}
              >
                {t.label}
              </button>
            ))}
            {klub && (
               <button
                  type="button"
                  className={"kh-tab " + (open === true ? "kh-tab--active" : "")}
                  onClick={()=>{
                    setKlub(null);
                    localStorage.removeItem("klub");
                    navigate("./");
                  }}>Odjava</button>
                  
         

            )}
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT ISPOD HEDERA */}
      <div className="kh-contentScroll">
        {opcija==="ucinak"&&<UcinakKluba/>}
        {opcija==="opsteInfo"&&<OpsteInfo alert={alert} setAlert={setAlert} openSnack={openSnack} setOpenSnack={setOpenSnack} hideSnack={hideSnack} severity={severity} setSeverity={setSeverity}/>}
        {opcija==="novosti"&&<Novosti/>}
        {opcija==="sastav"&&<SastavKluba izabraniIgrac={izabraniIgrac} setIzabraniIgrac={setIzabraniIgrac} alert={alert} setAlert={setAlert} openSnack={openSnack} setOpenSnack={setOpenSnack} hideSnack={hideSnack} severity={severity} setSeverity={setSeverity} />}
         {opcija==="inbox"&&<Inbox/>}
      </div>
    </div>)}
     <Snackbar open={openSnack} autoHideDuration={6000} onClose={hideSnack}>
      <Alert onClose={hideSnack} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {alert}
      </Alert>
    </Snackbar>
    </>
  );
}
export default HeaderKluba;