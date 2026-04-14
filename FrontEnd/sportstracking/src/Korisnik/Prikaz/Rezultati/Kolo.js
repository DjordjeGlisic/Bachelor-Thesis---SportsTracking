import { useEffect, useMemo, useState,useContext } from "react";
import { Context, TakmicenjeContext,UtakmicaContext } from "../../../Context/Context";
import "./Kolo.css";
import axios from "axios";
import Utakmica from "./Utakmica/Utakmica";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Alert, Box, Button, Snackbar } from "@mui/material";
import ModalPage from "../../../modalWrappers/ModalPage";
import DeleteDialog from "../../../modalWrappers/DeleteDialog";
import { HubConnectionBuilder } from "@microsoft/signalr";

export default function Kolo() {
  const {korisnik,sport} = useContext(Context);
  const { takmicenje } = useContext(TakmicenjeContext);
  const [round, setRound] = useState(1);
  
  const[utakmica,setUtakmica]=useState(null);
  const [matches,setMatches] = useState(null);
  const [labelKolo,setLabelKolo] = useState("Opšte kolo");
  
  const tipKola=(tip)=>{
    console.log("Tip izabranog kola",tip);
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
const handleNewResult = (x) => {
  console.log("SignalR salje");
  console.log(x);
   setMatches(prevMatches => {
        if (!prevMatches) return prevMatches;
        const azuriraneUtakmice = prevMatches.utakmice.map(u => {
          if (u.id === x.utakmicaID) {
            return { ...u, rezultat: x.rezultat };
          }
          return u;
        });
        return {
          ...prevMatches,
          utakmice: azuriraneUtakmice
        };
      });
}
const handleNewStat = (x) => {
    setMatches(prevMatches => {
        if (!prevMatches) return prevMatches;
        const azuriraneUtakmice = prevMatches.utakmice.map(u => {
          if (u.id === x.id) {
            return { ...u, status: x.status };
          }
          return u;
        });
        return {
          ...prevMatches,
          utakmice: azuriraneUtakmice
        };
      });

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
                let t = tipKola(response.data.value.tip);
                setLabelKolo( t);
                const niz=[];
                
                 console.log(`Stampam utakmice kola `);
                 console.log(matches);
             
            })
            .catch(error=>{
                console.log(error);
            })
        }, [round]);
useEffect(() => {
    let isMounted = true;
    let isMountedForStatus = true;

    // 1. Dodajemo Automatic Reconnect da sprečimo trajni diskonekt
    const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5146/MatchHub")
        .withAutomaticReconnect() 
        .build();
    const startConnection = async () => {
        try {
            await connection.start();
            console.log('SignalR: Uspešno povezan na Utakmica.js');

            if (isMounted) {
                const channel = `PromenjenRezultatUtkamice:Kolo:${round}|Takmicenje:${takmicenje.id}`;
                
                // 2. Registrujemo listener direktno
                connection.on(channel, (data) => {
                    if (isMounted) {
                        console.log("SignalR poruka primljena:", data);
                        handleNewResult(data);
                    }
                });
            }
            if (isMountedForStatus) {
              const channel = `Azuriran status utakmice kola:${round} takmicenja:${takmicenje.id}`;
              
              // 2. Registrujemo listener direktno
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

    if (round && takmicenje?.id) {
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
}, [round, takmicenje?.id]);
  // const statusLabel = (m) => {
  //   if (m?.uzivo) return { text: "Uživo", cls: "live" };
  // const now= new Date();
  // const utakmica=new Date(m.datum);
  //   if (utakmica<now) return { text: "Odigrano", cls: "ft" };
  //   return { text: "Predstoji", cls: "upcoming" };
  // };
  /////////////////////////////////////////// ADMIN PODRSKA /////////////////////////////////////
  const [openAddModal,setOpenAddModal] = useState(false);
  const [openDeleteModal,setOpenDeleteModal] = useState(false);
  const [izborKlubova,setIzborKlubova] = useState([]);
  const [openSnack, setOpenScnack] = useState(false);
  const[tip,setTip]=useState(null);
  const[poruka,setPoruka]=useState('');
  const handleCloseSnack = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }
  if (event) {
  event.stopPropagation();
  }

  setOpenScnack(false);
  };
  const handleAddMatchModal = (e) => {
    e.stopPropagation();
    axios.get(`http://localhost:5146/Admin/VratiSlobodneKluboveZaKoloTakmicenja/${takmicenje.id}/${round}`)
    .then((res)=>{
      if(res.data.length < 2)
      {
        setTip("error");
        setPoruka("Svi parovi klubova koji učestvuju ove sezone u takmičenju igraju svoje utakmice u izabranom kolu");
        setOpenScnack(true);
        return;
      }
      setIzborKlubova(res.data);
      setOpenAddModal(true);

    })
  };

  const handleDeleteMatchModal = (e, matchId) => {
    e.stopPropagation(); 
    setOpenDeleteModal(true);
    setZaBrisanjeID(matchId);
    
  };
  const [zaBrisanjeID,setZaBrisanjeID] = useState(0);
  const [novaUtakmica,setNovaUtakmica] = useState({
    datum:null,
    domacin:'',
    gost:'',
    lokacija:'',
    brojKola:round,
    takmicenjeID:takmicenje.id,
    takmicenjeNaziv: takmicenje.naziv,
    sport: sport
  });
  const dodajNovuUtakmicuHandler = ()=>{
    axios.post(`http://localhost:5146/Admin/DodajNovuUtakmicuKolu`,novaUtakmica)
    .then((res)=>{
          setMatches(prevState => ({
          ...prevState,                  
          utakmice: [                     
            ...prevState.utakmice,        
              res.data                    
          ]
        }));
        setOpenAddModal(false);
        setTip("success");
        setPoruka("Uspešno dodata nova utakmica kolu");
        setNovaUtakmica(
        {
          datum:null,
          domacin:'',
          gost:'',
          lokacija:'',
          brojKola:round,
          takmicenjeID:takmicenje.id,
          takmicenjeNaziv: takmicenje.naziv,
          sport: sport
        });
    })
    .catch((err)=>{
       setOpenAddModal(false);
        setTip("error");
        setPoruka("Greška prilikom dodavanja nove utakmice",err);

    })
  }
  const deleteHandler = () => {
    axios.delete(`http://localhost:5146/Admin/ObrisiUtakmicuKola/${zaBrisanjeID}`)
    .then((res)=>{
     setMatches(prevState => ({
        ...prevState, // Zadržavamo ostale atribute objekta (npr. naziv kola, datum...)
        utakmice: prevState.utakmice.filter(utakmica => utakmica.id !== res.data)
      }));
      setOpenDeleteModal(false);
      setTip("success");
      setPoruka("Uspešno obrisana utakmica u kolu");
      setZaBrisanjeID(0);
    })
    .catch((err)=>{
      setOpenDeleteModal(false);
      setTip("error");
      setPoruka("Greška prilikom brisanja utakmice",err);
    })
  }

  return (
    <>
    {utakmica===null&&<>
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
      <Box sx={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      mb: 4,
      flexWrap: "wrap",
      gap: 2 
    }}>
      <h1>{tipKola(matches.tip)}</h1>
      {korisnik && korisnik.isAdmin && (
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddMatchModal}
          sx={{
            backgroundColor: "#ff7a00",
            fontWeight: 700,
            px: 3,
            py: 1.5,
            borderRadius: "10px",
            textTransform: "uppercase",
            fontSize: "0.85rem",
            boxShadow: "0 4px 15px rgba(255,122,0,0.3)",
            "&:hover": {
              backgroundColor: "#ff8a1f",
              transform: "translateY(-2px)",
            },
            transition: "all 0.2s"
          }}
        >
          Dodaj novu utakmicu
        </Button>
      )}

    </Box>
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
          <span className={`rm-status ${e.status}`}>
            {e.status !== "TRENUTNI MINUT" ? e.status :"U TOKU"}
          </span>
          <span className="rm-date">{formatDateTime(e.datum)}.</span>
          {korisnik && korisnik.isAdmin && (
              <Button
                variant="contained"
                size="small"
                onClick={(event) => {
                  event.stopPropagation(); // OBAVEZNO da ne otvori utakmicu
                  handleDeleteMatchModal(event, e.id);
                }}
                sx={{
                  ml: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: "#d32f2f",
                  borderRadius: "6px",
                  minWidth: "80px",
                  "&:hover": { backgroundColor: "#b71c1c" }
                }}
              >
                Obriši
              </Button>
            )}
        </div>
      </div>
      ))}
    </div>
  )}
</>
    </div>
   
        <ModalPage 
          onClose = {()=>{
            setOpenAddModal(false);
            setNovaUtakmica(
                {
                    datum:null,
                    domacin:'',
                    gost:'',
                    lokacija:'',
                    brojKola:round,
                    takmicenjeID:takmicenje.id,
                    takmicenjeNaziv: takmicenje.naziv,
                    sport: sport
                }
              );
            }}
          open = {openAddModal}
          data = {novaUtakmica}
          setData = {setNovaUtakmica}
          labelKolo = {labelKolo}
          onDodavanje = {dodajNovuUtakmicuHandler}
          tip = {"AddNewMatch"}
          podtip = {"Dodaj novu utakmicu"}
          setOpenSnack={ setOpenScnack}
          setTip = {setTip}
          setPoruka = {setPoruka}
          izborKlubova = {izborKlubova}
      />
       <DeleteDialog
          open = {openDeleteModal} 
          onClose = {()=>{
          setOpenDeleteModal(false);
          }}
          onConfirm = {(e)=>{e.preventDefault();deleteHandler()}} 
          title = {"Da li ste sigurni da želite da obrišete datu utakmicu"} 
          description = {"Brisanje kluba će je trajno ukloniti datu utakmicu iz baze podataka zajedno sa pridruženom statistikom, dok će učinak kluba u takmićenju biti umanjen za datu utakmicu"} 
          loading = {false}
          content={"klub"}
        />
       
    </>}
    {utakmica!==null&&(
    <UtakmicaContext.Provider value={{utakmica,setUtakmica}}>
        <Utakmica strelica={true} kolo={round} takmicenjeId={takmicenje.id}/>
    </UtakmicaContext.Provider>)}
    
    </>
  );
}
