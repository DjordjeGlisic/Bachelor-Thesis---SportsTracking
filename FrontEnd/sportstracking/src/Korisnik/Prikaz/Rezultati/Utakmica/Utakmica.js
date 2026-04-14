import React, { useContext, useEffect, useRef, useState } from "react";
import "./Utakmica.css";
import { UtakmicaContext, TakmicenjeContext, Context } from "../../../../Context/Context";
import { Alert, Avatar, Button, MenuItem, Select, Snackbar } from "@mui/material";
import Statistika from "./Statistika";
import Chat from "./Chat";
import Tabela from "../UcinakIgracaNaTakmicenju";
import axios from "axios";
import KlubModal from "./KlubModal";
import IgracNaUtakmici from "./IgracNaUtakmici";
import { HubConnectionBuilder } from "@microsoft/signalr";
const statusiPoSportu = {
    fudbalStatus : [
  {id:1,status:"PREDSTOJI"},
  {id:2,status:"TRENUTNI MINUT"},
  {id:3,status:"KRAJ I POLUVREMENA"},
  {id:4,status:"KRAJ II POLUVREMENA"},
  {id:5,status:"KRAJ I PRODUZETKA"},
  {id:6,status:"KRAJ II PRODUZETKA"},
  {id:7,status:"PENAL SERIJA"},
  {id:8,status:"ODIGRANO"},
    ],
  kosarkaStatus : [
  {id:1,status:"PREDSTOJI"},
  {id:2,status:"TRENUTNI MINUT"},
  {id:3,status:"KRAJ I CETVRTINE"},
  {id:4,status:"KRAJ II CETVRTINE"},
  {id:5,status:"KRAJ III CETVRTINE"},
  {id:6,status:"KRAJ IV CETVRTINE"},
  {id:7,status:"TAJM AUT"},
  {id:8,status:"KRAJ I PRODUZETKA"},
  {id:9,status:"KRAJ I PRODUZETKA"},
  {id:10,status:"KRAJ II PRODUZETKA"},
  {id:11,status:"KRAJ III PRODUZETKA"},
  {id:12,status:"KRAJ IV PRODUZETKA"},
  {id:13,status:"KRAJ V PRODUZETKA"},
  {id:14,status:"KRAJ VI PRODUZETKA"},
  {id:15,status:"KRAJ VII PRODUZETKA"},
  {id:16,status:"KRAJ VIII PRODUZETKA"},
  {id:17,status:"KRAJ IX PRODUZETKA"},
  {id:18,status:"KRAJ X PRODUZETKA"},
  {id:1,status:"ODIGRANO"},
    ],
  vaterpoloStatus : [
  {id:1,status:"PREDSTOJI"},
  {id:2,status:"TRENUTNI MINUT"},
  {id:3,status:"KRAJ I CETVRTINE"},
  {id:4,status:"KRAJ II CETVRTINE"},
  {id:5,status:"KRAJ III CETVRTINE"},
  {id:6,status:"KRAJ IV CETVRTINE"},,
  {id:7,status:"TAJM AUT"},
  {id:8,status:"PETERCI"},
  {id:9,status:"ODIGRANO"},
    ]
}

const Utakmica = (props) => {
  //////KLUB MODAL///////////////////////
  const{izabraniKlub,setIzabraniKlub,sport,korisnik}=useContext(Context);
  
   const [openSnack, setOpenSnack] = useState(false);
   const[tip,setTip]=useState(null);
   const[poruka,setPoruka]=useState('');
   const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    if (event) {
    event.stopPropagation();
  }
  
    setOpenSnack(false);
  };
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
  const handleNewResult = (x)=> {
      if(x.utakmicaID == utakmica.id)
         {
           setUtakmica(prev => ({
               ...prev,     
               rezultat: x.rezultat,
               listaStrelaca : sport === 1 ?  x.listaStrelaca : null
             }));
          }
  }

  const { utakmica, setUtakmica } = useContext(UtakmicaContext);
  const { takmicenje } = useContext(TakmicenjeContext);
    const[opcija,setOpcija]=useState(1);
    useEffect(() => {
       const connection = new HubConnectionBuilder()
         .withUrl("http://localhost:5146/MatchHub") 
         .build();
     
       connection.start().then(() => {
         console.log('Connected to SignalR hub');
       });
     
       connection.on(`PromenjenRezultatUtkamice:Kolo:${props.kolo}|Takmicenje:${takmicenje.id}`, (x) => {
         console.log(x);
         handleNewResult(x);
        });
         return () => {
    connection.off(
      `PromenjenRezultatUtkamice:Kolo:${props.kolo}|Takmicenje:${takmicenje.id}`,
      handleNewResult
    );
  };
    
     }, [props.kolo,takmicenje.id]);

  

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

  if (utakmica.listaStrelaca && takmicenje.sport === 1) {
    const [domPart, gosPart] = utakmica.listaStrelaca.split(",");
    domStrelci = domPart.split("-").slice(1); // bez "Dom"
    gostStrelci = gosPart.split("-").slice(1); // bez "Gos"
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
////////////////////////////ADMIN PODRSKA/////////////////////////////////////////////////
const getOpcije = () => {
  if (takmicenje.sport === 1) return statusiPoSportu.fudbalStatus;
  if (takmicenje.sport === 2) return statusiPoSportu.kosarkaStatus;
  if (takmicenje.sport === 3) return statusiPoSportu.vaterpoloStatus;
  return [];
};
const opcije = getOpcije();
const [status,setStatus] = useState(utakmica && utakmica.status ? utakmica.status : "IZABERITE STATUS");
const [minutUtakmice,setMinutUtakmice] = useState(0);
useEffect(()=>{
  if(status === "TRENUTNI MINUT" || (utakmica && utakmica.status === "TRENUTNI MINUT"))
  {
    console.log("za ovu utakmicu trazim minut");
    console.log(utakmica);
    axios.get(`http://localhost:5146/Korisnik/VratiMinutUtakmice/${utakmica.id}`)
    .then((res)=>{
      setMinutUtakmice(res.data);
    })
    .catch((err)=>{
      console.error("Greska prilikom pribavljanja statusa i minuta utakmice");
    })
  }

},[status,utakmica]);
const promenaStatusaHandler = (utakmicaID,noviStatus)=>
{
  axios.put(`http://localhost:5146/Admin/UpravljanjeStatusomTokomUtakmice/${utakmicaID}/${noviStatus}`)
  .then((res)=>{
    setTip("success");
    setPoruka(res.data);
    setOpenSnack(true);
  })
  .catch((err)=>{
    setTip("error");
    setPoruka(err.response.data);
    setOpenSnack(true);
  })
}
const handleNewMinut = (x) =>
{
  setMinutUtakmice(x);
}
const handleNewStat = (x) =>
{
  console.log("Promenio se status utakmice");
  console.log(x);
    setUtakmica(prevState => ({
          ...prevState,                  
          status: x.status,
          uzivo: x.uzivo
        }));
    setStatus(x.status);
}
useEffect(() => {
    let isMounted = true;
    let  isMountedForStatus = true;
    const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5146/MatchHub")
        .withAutomaticReconnect() 
        .build();
    const startConnection = async () => {
        try {
            await connection.start();
            console.log('SignalR: Uspešno povezan na Utakmica.js');

            if (isMounted) {
                const channel = `Utakmica:${utakmica.id} azuriran minut`;
                connection.on(channel, (data) => {
                    if (isMounted) {
                        console.log("SignalR poruka primljena:", data);
                        handleNewMinut(data);
                    }
                });
            }
             if (isMountedForStatus) {
              const channel = `Azuriran status utakmice kola:${props.kolo} takmicenja:${props.takmicenjeId}`;
              connection.on(channel, (data) => {
                  if (isMountedForStatus) {
                      console.log("SignalR poruka primljena:", data);
                      handleNewStat(data);
                  }
              });
            }
        } catch (err) {
            console.error('SignalR: Greška pri startovanju konekcije:', err);
        }
    };

    if (utakmica?.id) {
        startConnection();
    }

    // 3. CLEANUP: Gasi celu konekciju, ne samo listener
    return () => {
        isMounted = false;
        isMountedForStatus = false;
        if (connection) {
            connection.stop()
                .then(() => console.log("SignalR: Konekcija bezbedno zatvorena."))
                .catch(err => console.error("SignalR cleanup error:", err));
        }
    };
}, [utakmica.id]);
if (!utakmica) return null;
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
        <div className="match-status">
          {korisnik && korisnik.isAdmin && utakmica.status !== "ODIGRANO" ? (
             <Select
                value={status}
                label="Status"
                variant="standard" // "standard" uklanja spoljni okvir (border)
                disableUnderline // uklanja donju liniju kod standard varijante
                sx={{
                  color: "white",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  textAlign: "right",
                  "& .MuiSelect-select": {
                    paddingRight: "24px !important", // prostor za strelicu
                  },
                  "& .MuiSvgIcon-root": {
                    color: "white", // boja strelice
                  },
                  "&:before, &:after": {
                    display: "none", // potpuno uklanjanje linija ispod
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#1a1a1a", // tamna pozadina padajućeg menija
                      color: "white",
                      "& .MuiMenuItem-root": {
                        fontSize: "0.85rem",
                        "&.Mui-selected": {
                          bgcolor: "#333",
                        },
                        "&:hover": {
                          bgcolor: "#444",
                        },
                      },
                    },
                  },
                }}
                onChange={(e) => {
                    //setStatus(e.target.value)
                    promenaStatusaHandler(utakmica.id,e.target.value);
                }}
                renderValue={(selected) => {
                  if (selected === "TRENUTNI MINUT") {
                    return `${minutUtakmice} min`; 
                  }
                  return selected ? selected.toUpperCase() : "IZABERITE STATUS";
                }}
              >
                <MenuItem value="IZABERITE STATUS" disabled>
                  IZABERITE STATUS
                </MenuItem>
                {opcije.length > 0  && opcije.map((op) => (
                  <MenuItem key={op.id} value={op.status}>{op.status}</MenuItem>
                ))}
              </Select>
            ) :
            (
            <span>
              {utakmica.status !=="TRENUTNI MINUT" ? utakmica.status : `${minutUtakmice} MIN` }
            </span>
            )}
        </div>
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
        {!(korisnik && korisnik.isAdmin) && <button className={opcija===2?"match-tab match-tab-active":"match-tab"} onClick={()=>setOpcija(2)}>ČET</button>}
        <button className={opcija===3?"match-tab match-tab-active":"match-tab"} onClick={()=>setOpcija(3)}>IGRAČI</button>
      </div>
        <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
          <Alert
            onClose={handleCloseSnack}
            severity={tip}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {poruka}
          </Alert>
        </Snackbar>
      {opcija===1&&<Statistika
      setPoruka={setPoruka}  setOpenSnack={ setOpenSnack}
              setTip = {setTip}
      />}
      {opcija===2&& <Chat/>}
      {opcija === 3 && <IgracNaUtakmici setPoruka={setPoruka}  setOpenSnack={ setOpenSnack}
              setTip = {setTip}/>}
     
     
    </div>)}
     {izabraniKlub!==null&&( <KlubModal
                    open={izabraniKlub!=null}
                    onClose={close}
                   
              />)}
    </>
  );
};

export default Utakmica;
