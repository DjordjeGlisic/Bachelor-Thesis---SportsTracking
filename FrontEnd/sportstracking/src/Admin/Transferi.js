import { Alert, Box, Button, Checkbox, FormControlLabel, Grid, Snackbar, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../Context/Context";
import '../Korisnik/Prikaz/Rezultati/Rezultati.css';
import Kartica from "../Korisnik/Prikaz/Kartica";
import axios from "axios";
import '../Korisnik/Prikaz/Klubovi/Klubovi.css';
import KarticaIgrac from "./KarticaIgrac";
import ModalPage from "../modalWrappers/ModalPage";
import DeleteDialog from "../modalWrappers/DeleteDialog";
import { data } from "react-router-dom";
const Transferi = () => {
  
    const {letters,sport,korisnik,ruta,setRuta} = useContext(Context);
    const [igraci, setIgraci] = useState([]);
    const [sportText,setSportText]=useState("");
    const [openSearchName,setOpenSearchName] = useState(false);
    const [onlyWithClub,setOnlyWithClub]=useState(false);
    const [onlyWithoutClub,setOnlyWithoutClub]=useState(false);
    const [open,setOpen] = React.useState(false);
    useEffect(() => {
        setIgraci([]); 
        switch(sport)
        {
            case 1:
            setSportText("Fudbalu");
                break;
            case 2:
                setSportText("Košarci");
                break;
            case 3:
                setSportText("Vaterpolu");
                break;
                

        }
        const response =  axios.get(`http://localhost:5146/Admin/VratiIgraceZaTransfer/${sport}`,
    {
        headers:{
        //Authorization: `Bearer ${token}`
        }
    }).then(response=>{
        setIgraci(response.data);
        
    })
    .catch(error=>{
        console.log(error);
    })
    }, [sport]);
    const [imeFilter, setImeFilter] = useState("");
    const [klubFilter,setKlubFilter] = useState("");
    const [openSnack, setOpenScnack] = useState(false);
    const[tip,setTip]=useState(null);
    const[poruka,setPoruka]=useState('');
    const handleClick = () => {
        setOpenScnack(true);
    };
  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    if (event) {
    event.stopPropagation();
  }

    setOpenScnack(false);
  };

const filteredData = useMemo(() => {
  if (!igraci) return [];

  return igraci.filter((x) => {
    // 1. Filter po imenu (uvek radi)
    const ime = (x.ime ?? "").toLowerCase();
    const imeOk = ime.includes(imeFilter.toLowerCase());

    // 2. Filter po klubu (proveravamo samo ako nazivKluba postoji, inače poredimo sa praznim stringom)
    const klubNaziv = (x.klubNaziv ?? "").toLowerCase();
    const klubOK = klubNaziv.includes(klubFilter.toLowerCase());

    // 3. Logika za "Samo slobodni agenti"
    // Ako je checkbox uključen, prikaži samo one koji NEMAJU klub. Ako nije, pusti sve.
    const slobodanAgentOk = onlyWithoutClub ? (!x.klubNaziv || x.klubNaziv === "") : true;

    // 4. Logika za "Samo igrači sa klubom"
    // Ako je checkbox uključen, prikaži samo one koji IMAJU klub. Ako nije, pusti sve.
    const imaKlubOk = onlyWithClub ? (x.klubNaziv && x.klubNaziv !== "") : true;

    // Spajanje svih filtera
    return imeOk && klubOK && slobodanAgentOk && imaKlubOk;
  });
}, [igraci, imeFilter, klubFilter, onlyWithClub, onlyWithoutClub]);
  useEffect(()=>{
    if(klubFilter.trim().length > 0 || onlyWithClub  === true || onlyWithoutClub === true)
        setOpenSearchName(true);
    else
        setOpenSearchName(false);

  },[klubFilter,onlyWithClub,onlyWithoutClub])
  const [igrac,setIgrac] = useState(null);
  const [openTransferModal,setOpenTransferModal] = useState(false);
  const [openDeleteModal,setOpenDeleteModal] = useState(false);
  const onSubmit = (noviKlub,datumPocetka,datumKraja) =>  {
    const transfer = {
        id : igrac.id,
        noviKlubID : noviKlub.id,
        datumPocetka :datumPocetka,
        datumKraja :datumKraja,
    };
    
    axios.put(`http://localhost:5146/Admin/ObaviTransferIgracu`,transfer)
    .then((res)=>{
        setIgraci(prevIgraci => 
            prevIgraci.map(igrac => 
                igrac.id === res.data.id ? res.data : igrac
            )
            );
        setTip("success");
        setPoruka(`Transfer je uspešno izvrčen igraču ${res.data.ime} ${res.data.prezime}!`);
        setOpenScnack(true);
        setOpenTransferModal(false);
        if(ruta == '/Klub')
            setRuta('/Trnsferi');
        setIgrac(null);
        
    })
    .catch((err)=>{
         setTip("error");
        setPoruka(`Došlo je do greške prilikom izvršenja tranfera igraču  ${igrac.ime} ${igrac.prezime}!`);
        setOpenScnack(true);

    })
    

    }
    const onDeleteHandler = () => {
        axios.delete(`http://localhost:5146/Admin/ProglasiIgracaSlobodnimAgentom/${igrac.id}`)
        .then((res)=>{
             setIgraci(prevIgraci => 
            prevIgraci.map(igrac => 
                igrac.id === res.data.id ? res.data : igrac
            )
            );
        setTip("success");
        setPoruka(`Igrač ${res.data.ime} ${res.data.prezime} je postao sloban agent! `);
        setOpenScnack(true);
        setOpenDeleteModal(false);
        if(ruta == '/Klub')
            setRuta('/Trnsferi');
        setIgrac(null);

        })
        .catch((err)=>{
              setTip("error");
        setPoruka(`Došlo je do greške prilikom proglašavanja  igrača  ${igrac.ime} ${igrac.prezime} za slobodnog agenta!`);
        setOpenScnack(true);
        setOpenDeleteModal(false);
        if(ruta == '/Klub')
            setRuta('/Trnsferi');
        setIgrac(null);

        })

    }
   return (
    <Box sx={{ width: "100%", px: { xs: 2, md: 6 }, pt: 10, pb: 4 }}>
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          color: letters,
          fontWeight: 800,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          mb: 4,
          textShadow: "0 10px 30px rgba(0,0,0,0.55)",
          fontFamily: "'Orbitron', sans-serif",
          fontSize: { xs: 18, sm: 22, md: 28 },
        }}
      >
        SPISAK IGRAČA ZA KOJE MOŽETE OBAVITI TRANSFER U {sportText}
      </Typography>
<Box 
  className="searchDiv" 
  sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', // Centira ceo "paket" na sredinu ekrana
    width: '100%',
    mt: 3,
    mb: 5
  }}
>
  {/* Ovaj Box je 'sidro' - on je centriran, ali njegovi unutrašnji elementi idu ulevo */}
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'flex-start', // Poravnava inpute i checkbox-ove po levoj ivici
    gap: 2 
  }}>
    
    {/* RED SA INPUTIMA */}
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 2 
    }}>
      {openSearchName && (<input
        type="text"
        className="search-input"
        placeholder="Pretraži igrača po nazivu"
        value={imeFilter}
        onChange={(e) => setImeFilter(e.target.value)}
        style={{ width: '280px' }} // Fiksna širina da bi uvek bili poravnati
      />)}
      <input
        type="text"
        className="search-input"
        placeholder="Pretraži igrača po klubu  u kome nastupa"
        value={klubFilter}
        onChange={(e) => setKlubFilter(e.target.value)}
        style={{ width: '300px' }}
      />
    </Box>

    {/* RED SA CHECKBOX-OVIMA */}
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 3,
      ml: 0.5 // Blago pomeranje da se vizuelno poravna kućica sa tekstom iznad
    }}>
      <FormControlLabel 
        sx={{ color: letters, m: 0 }} 
        control={
          <Checkbox
            checked={onlyWithoutClub}
            onChange={(e) => setOnlyWithoutClub(e.target.checked)}
            sx={{
              color: "#ff8a1f",
              p: 0, 
              mr: 1,
              "&.Mui-checked": { color: "#ff8a1f" },
            }}
          />
        }
        label="Prikaži samo slobodne agente"
      />
      <FormControlLabel 
        sx={{ color: letters, m: 0 }}
        control={
          <Checkbox
            checked={onlyWithClub}
            onChange={(e) => setOnlyWithClub(e.target.checked)}
            sx={{
              color: "#ff8a1f",
              p: 0, 
              mr: 1,
              "&.Mui-checked": { color: "#ff8a1f" },
            }}
          />
        }
        label="Prikaži samo igrače koji igraju trenutno negde"
      />
    </Box>
  </Box>
</Box>
<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >

      <Grid container spacing={3} sx={{alignSelf: "flex-end", width: "100%", maxWidth: 1400, mx: "auto", alignItems: "stretch" }}>
<>
     
 
          {filteredData.map((t) => (
            <KarticaIgrac
             igrac = {t} setIgrac = { setIgrac }
              setOpenTransferModal = { setOpenTransferModal} setOpenDeleteModal = {setOpenDeleteModal}
              setOpenSnack={setOpenScnack}
              setTip = {setTip}
              setPoruka = {setPoruka}
             />
            
          ))}
     <KarticaIgrac />
            
</>
      </Grid>
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
      <ModalPage 
        onClose = {()=>{
        setOpenTransferModal(false);
        if(ruta == '/Klub')
            setRuta('/Trnsferi');
        }}
        open = {openTransferModal}
        data = {igrac}
        setData = {setIgrac}
        sport = {sport}
        tip = {"TransferForPlayer"}
        podtip = {"Obavi transfer igrača"}
        setOpenSnack={setOpenScnack}
        setTip = {setTip}
        setPoruka = {setPoruka}
        onSubmit = {onSubmit}
    />
    <DeleteDialog
        open = {openDeleteModal} 
        onClose = {()=>{
        setOpenDeleteModal(false);
        if(ruta == '/Klub')
            setRuta('/Transferi');
        }}
        onConfirm = {(e)=>{e.preventDefault();onDeleteHandler()}} 
        title = {"Da li ste sigurni da želite da postavite igraća za slobodnog agenta"} 
        description = {"Postavljanje igrača za slobodnog agenta će ukloniti vezu sa trenutnim klubom za koji nastupa"} 
        loading = {false}
        content={"igrač"}
    />
    </Box>
  );
};

export default Transferi;
