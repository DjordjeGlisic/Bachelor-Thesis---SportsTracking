import React, { useEffect, useMemo,useContext,useState } from "react";
import "./SastavKluba.css";
import axios from "axios";
import { Context,KluboviContext } from "../../Context/Context";
import { Alert, Button, IconButton, Snackbar } from "@mui/material";
import IgracKluba from "./IgracKluba";
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ModalPage from "../../modalWrappers/ModalPage";
import DeleteDialog from "../../modalWrappers/DeleteDialog";


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



export default function SastavKluba({izabraniIgrac,setIzabraniIgrac,alert,setAlert,openSnack,setOpenSnack,hideSnack,severity, setSeverity}) {

    const {klub}=useContext(KluboviContext);
    const{izabraniKlub,sport}=useContext(Context);
    const Sport=klub ? klub.sport : sport;
    const[igraci,setIgraci]=useState([]);
    const [sectionOrder,setSectionOrder]=useState([]);
    const [igrac,setIgrac]=useState(null);

    
const igracHandler=(p)=>{
  console.log(p);
  setIzabraniIgrac(p);
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
      {klub &&
       (
        <div className="pk-news-admin-actions">
          <IconButton 
            className="pk-btn-edit" 
            size="small" 
            onClick={(e)=>{
              e.preventDefault();
              e.stopPropagation();
              setIgrac(p);
              //setKlubZaNovost(aktivniKlub);
              setOpenEdit(true);
            }}
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton 
            className="pk-btn-delete" 
            size="small" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              //setNovost(n);
              //setOpenDeleteDialog(true);
            }}
          >
            <DeleteOutlineRoundedIcon fontSize="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIgrac(p);
                setOpenDeleteDialog(true);
              }}
             />
          </IconButton>
        </div>
        )}
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
            if(Sport==1)
                setSectionOrder(sectionOrderFudbal);
            else if (Sport==2)
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
  const prazanObjekat={
  ime: "",
  prezime: "", 
  datumPocetkaUgovora: null,
  datumKrajaUgovora: null,
  pozicija: "",
  visina: 0.0, 
  tezina: 0.0,
  datumRodjenja: null,
  listaKlubova: "",
  brojGodina: 0,
  klubID: klub ? klub.id : 0 ,
  takmicenja:""
}
  const [noviIgrac,setNoviIgrac] = useState(null);
  const [openAdding,setOpenAdding] = useState(false);
  const [openEdit,setOpenEdit]=useState(false);
  const [openDeleteDialog,setOpenDeleteDialog]=useState(false);
  const closeDeleteDialogHandler =() =>{
  setOpenDeleteDialog(false);
}
const deleteHandler=()=>{
  axios.delete(`http://localhost:5146/Klub/ObrsisiIgraca/${klub.id}/${igrac.id}`)
  .then((resp)=>{
     setIgraci(prevIgraci => 
        prevIgraci.filter(i => i.id !== resp.data)
      );
    setIgrac(null);
    setAlert("Upešano je obrisan igrač iz baze");
    setSeverity("success");
    setOpenSnack(true);
     setTimeout(()=>{
    closeDeleteDialogHandler();
    },3000)


  })
  .catch((err)=>{
    setAlert("Neuspešan pokušaj brisanja igrača iz baze",err);
      setSeverity("error");
      setOpenSnack(true);

  })

}
  const handleAdding =() =>{
    console.log("Ovo saljem backendu");
    console.log(noviIgrac);
    axios.post(`http://localhost:5146/Klub/DodajIgracaKlubu/${klub.id}`,noviIgrac)
    .then((response)=>{
      setAlert("Igrac je uspesno dodat klubu");
      setSeverity("success");
      setIgraci((prev)=>[...prev,response.data]);
      setIgrac(null);
      setOpenSnack(true);

    })
    .catch((err)=>{
      setAlert("Igrac nije dodat klubu",err);
      setSeverity("error");
      setOpenSnack(true);

    })
  }
  const handleEdit=()=>{
    axios.put(`http://localhost:5146/Klub/AzurirajIgracaKluba/${igrac.id}`,igrac)
    .then((res)=>{
       setIgraci(prevIgraci => 
          prevIgraci.map(item => 
            item.id === res.data.id ? { ...item, ...res.data } : item
          )
        );
        setAlert("Igrac je uspesno modifikovan u bazi");
        setSeverity("success");
        setOpenSnack(true);

    })
    .catch((err)=>{
       setAlert("Igrac nije izmenjen u bazi",err);
      setSeverity("error");
      setOpenSnack(true);
    })

  }
  const closeAdding = () => {setNoviIgrac(prazanObjekat );setOpenAdding(false)};
   const closeEdit = () => {setIgrac(null);setOpenEdit(false)};
  return (
    <div className="sk-wrap">
      {!izabraniIgrac &&(<div className="sk-card">
        <div className="sk-top">
            {klub && (
                <Button
                  variant="contained"
                  onClick={(e)=>{
                     e.preventDefault();
                    e.stopPropagation();
                    setNoviIgrac(prazanObjekat);
                    setOpenAdding(true);
                  }}
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{
                    backgroundColor: '#ff7900', // Tvoja narandžasta
                    color: '#000',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    borderRadius: '12px',
                    fontSize: '1rem',
                    textTransform: 'none', // Da ne bude sve caps lock
                    boxShadow: '0 4px 14px 0 rgba(255, 121, 0, 0.39)',
                    '&:hover': {
                      backgroundColor: '#e66d00',
                      boxShadow: '0 6px 20px 0 rgba(255, 121, 0, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  DODAJ IGRAČA
                </Button>
                        )}
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
         {klub && (
                  <>
                  <ModalPage
                  open={openAdding}
                  onClose={closeAdding}
                  data = {noviIgrac}
                  setData = {setNoviIgrac}
                  onSubmit = {handleAdding}
                  tip = {'AddOrEditIgrac'}
                  podtip = {'Dodaj novog igrača klubu'}
                  dostupnaTakmicenja={klub.takicenja}
                  />
                   <ModalPage
                  open={openEdit}
                  onClose={closeEdit}
                  data = {igrac}
                  setData = {setIgrac}
                  onSubmit = {handleEdit}
                  tip = {'AddOrEditIgrac'}
                  podtip = {'Izmeni postojećeg igrača kluba'}
                  dostupnaTakmicenja={klub.takicenja}
                  />
                  <DeleteDialog
                    open = {openDeleteDialog} 
                    onClose = {closeDeleteDialogHandler} 
                    onConfirm = {(e)=>{e.preventDefault();deleteHandler()}} 
                    title = {"Da li ste sigurni da zelite da obrisete datog igrača"} 
                    description = {"Brisanje igrača će je trajno ukloniti njega iz baze podataka ne samo iz kluba"} 
                    loading = {false}
                  />
                  </>
         )}
      </div>)}
      {izabraniIgrac &&(
        <IgracKluba izabraniIgrac={izabraniIgrac}/>
      )}
   
    </div>
  );
}
