import { Alert, Box, Button, Checkbox, FormControlLabel, Grid, Snackbar, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../../../Context/Context";
import '../Rezultati/Rezultati.css';
import Kartica from "../Kartica";
import axios from "axios";
import KarticaKlub from "./KarticaKlub";
import './Klubovi.css';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ModalPage from "../../../modalWrappers/ModalPage";
import { uploadToCloudinary } from "../../../modalWrappers/UploadImageToClaudinary";
import DeleteDialog from "../../../modalWrappers/DeleteDialog";
const Klubovi = () => {
  
  const {letters,sport,korisnik,ruta,setRuta} = useContext(Context);
  const [klubovi, setKlubovi] = useState([]);
  const [klub, setKlub] = useState(1);
    const [sportText,setSportText]=useState("");
    const [onlyFollowed,setOnlyFollowed]=useState(false);
    const [open,setOpen] = React.useState(false);
    // const [clicked,setClicked]=useState(false);
    const handleFollowChanged = (klubId, follows) => {
  setKlubovi((prev) =>
    prev.map((k) =>
      k.id === klubId
        ? {
            ...k,
            korisnikPrati: follows,
            // brojPratioca +1 ako je zapratio, -1 ako je otpratio
            brojPratioca: (Number(k.brojPratioca) || 0) + (follows ? 1 : -1),
          }
        : k
    )
  );
};
    const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

 
  useEffect(() => {
    setKlubovi([]); 
    setKlub(1);
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
    let kor;
    if(korisnik===null)
      kor=0;
    else
      kor=korisnik.id;
    const response =  axios.get(`http://localhost:5146/Korisnik/VratiKluboveSporta/${sport}/${kor}`,
  {
    headers:{
      //Authorization: `Bearer ${token}`
    }
  }).then(response=>{
    console.log(response.data);
    setKlubovi(response.data);
    
  })
  .catch(error=>{
    console.log(error);
  })
  }, [sport,korisnik]);
     const [imeFilter, setImeFilter] = useState("");



const filteredData = useMemo(() => {
  if (!klubovi) return [];

  return klubovi.filter((x) => {
    const ime = (x.naziv ?? "").toLowerCase();
    const imeOk = ime.includes(imeFilter.toLowerCase());

    const pratiOk = onlyFollowed ? x.korisnikPrati === true : true;

    return imeOk && pratiOk;
  });
}, [klubovi, imeFilter, onlyFollowed]);

 /////ADMIN PODRSKA///////////////////////////////////////////////////////
 const [openAddModal,setOpenAddModal] = useState(false);
  const [openEditModal,setOpenEditModal] = useState(false);
  const [openBasicModal,setOpenBasicModal] = useState(false);
  const [openDeleteModal,setOpenDeleteModal] = useState(false);
  const [openSuccess,setOpenSuccess] = React.useState(false);
  const [openError,setOpenError] = React.useState(false);
  const handleOpenSuccess = () =>{setOpenSuccess(true)};
  const handleOpenError = () =>{setOpenError(true)};
 const [selectedFile,setSelectedFile] = useState(null);
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
 
 const [noviKlub,setNoviKlub] = useState(
  {
   naziv: "",
   email: "", 
   lozinka: "",
   logo: '',
   sport:sport,
   listaUcinaka: []
 });
 const [klubZaIzmenu,setKlubZaIzmenu] = useState(null);
 const pozivKaBackuHandler = (zaSlanje,id,poruka) =>
  {
     axios.post(`http://localhost:5146/Admin/DodajILIMenjajKlub/${id}/${sport}`,
      zaSlanje
    )
    .then((res)=>{
      console.log(res.data);
      const postoji = klubovi.find(k => k.id === res.data.id);
     setKlubovi(prev => {
        // Proveravamo da li klub sa tim ID-em već postoji u nizu
        const postoji = prev.find(k => k.id === res.data.id);
        if (postoji) {
            // Ako postoji, vraćamo novi niz gde je taj element zamenjen
            return prev.map(k => k.id === res.data.id ? res.data : k);
        } else {
            // Ako ne postoji, dodajemo novi element na kraj niza
            return [...prev, res.data];
        }
    });
      setTip("success");
      setPoruka(poruka);
      setOpenScnack(true);
      setOpenAddModal(false);
      setOpenEditModal(false);
      setOpenBasicModal(false);
      if(ruta == '/Klub')
        setRuta('/Klubovi');
      setNoviKlub(
        {
          naziv: "",
          email: "", 
          lozinka: "",
          logo: '',
          sport:sport,
          listaUcinaka: []
        }
      );
      setKlubZaIzmenu(
       {
          naziv: "",
          email: "", 
          lozinka: "",
          logo: '',
          sport:sport,
          listaUcinaka: []
        }
      );



    })
    .catch((err)=>{
      setTip("error");
      setPoruka(err.response?.data || "Greška pri slanju");
      setOpenScnack(true);
    });

  }
 const dodajNoviKlubHandler = async() =>{
    if(noviKlub.naziv.trim().length<2)
    {
        handleClick();
        setTip('error');
        setPoruka('Naziv mora imati bar 2 karaktera.');
        return;
        
    }
    const isValid = /^(?=.*@)(?=.*\.).+$/.test(noviKlub.email);
      if(noviKlub.email.trim().length<5||isValid===false)
      {
          handleClick();
          setTip('error');
          setPoruka('Korisničko ime mora sadržati samo slova i brojeve i mora imati  karakter: @ i karatker: .');
          return;
          
      }
   
    if(noviKlub.lozinka.trim().length<6)
    {
        handleClick();
        setTip('error');
        setPoruka('Lozinka mora sadržati najmanje 6 karaktera.');
        return;
    }
    if(noviKlub.listaUcinaka.length === 0)
    {
       handleClick();
        setTip('error');
        setPoruka('Klub se mora takmičiti u bar jednom takmičenju.');
        return;
    }
  let konacniUrlSlike = noviKlub.logo; 
  
    // 2. Ako je korisnik izabrao novi fajl, uradi upload na Cloudinary
    if (selectedFile) {
      console.log("Otpremanje nove slike...");
      // Šaljemo RAW fajl objekt, NE previewUrl string!
      const publicUrl = await uploadToCloudinary(selectedFile); 
      
      if (publicUrl) {
        konacniUrlSlike = publicUrl;
        console.log("Slika uspešno otpremljena:", konacniUrlSlike);
      } else {
        alert("Greška pri otpremanju slike na server.");
        return; // Prekidamo ako upload nije uspeo
      }
    }
    let zaSlanje = noviKlub;
    zaSlanje.logo = konacniUrlSlike;
    if(zaSlanje.logo.trim().length===0)
    {
        handleClick();
        setTip('error');
        setPoruka('Klub mora imati neki logo');
        return;
        
    }
    pozivKaBackuHandler(zaSlanje,-1,"Uspešno dodat novi klub");
   
 }
 const izmeniGdeSeTakmiciKlubHandler = () => {
  let zaSlanje = {
    naziv : null,
    email : klubZaIzmenu.email,
    lozinka : null,
    id : klubZaIzmenu.id,
    logo : null,
    listaUcinaka : klubZaIzmenu.listaUcinaka,

  }
  console.log(zaSlanje);
  pozivKaBackuHandler(zaSlanje,klubZaIzmenu.id,"Uspešno izvšena modifikacija učinaka kluba");
 }
 const izmeniOpsteInfoHandler = async() =>
 {
  let zaSlanje = {
    naziv : klubZaIzmenu.naziv,
    email : klubZaIzmenu.email,
    lozinka : klubZaIzmenu.lozinka,
    id : klubZaIzmenu.id,
    logo : klubZaIzmenu.logo,
    listaUcinaka :null,
  }
   if(zaSlanje.naziv && zaSlanje.naziv.trim().length<2)
    {
        handleClick();
        setTip('error');
        setPoruka('Naziv mora imati bar 2 karaktera.');
        return;
        
    }
    const isValid = /^(?=.*@)(?=.*\.).+$/.test(zaSlanje.email);
      if(zaSlanje.email && zaSlanje.email.trim().length<5||isValid===false)
      {
          handleClick();
          setTip('error');
          setPoruka('Korisničko ime mora sadržati samo slova i brojeve i mora imati  karakter: @ i karatker: .');
          return;
          
      }
   
    if(zaSlanje.lozinka && zaSlanje.lozinka.trim().length<6)
    {
        handleClick();
        setTip('error');
        setPoruka('Lozinka mora sadržati najmanje 6 karaktera.');
        return;
    }
   
    let konacniUrlSlike = zaSlanje.logo; 
  
    // 2. Ako je korisnik izabrao novi fajl, uradi upload na Cloudinary
    if (selectedFile) {
      console.log("Otpremanje nove slike...");
      // Šaljemo RAW fajl objekt, NE previewUrl string!
      const publicUrl = await uploadToCloudinary(selectedFile); 
      
      if (publicUrl) {
        konacniUrlSlike = publicUrl;
        console.log("Slika uspešno otpremljena:", konacniUrlSlike);
      } else {
        alert("Greška pri otpremanju slike na server.");
        return; // Prekidamo ako upload nije uspeo
      }
    }
    zaSlanje.logo = konacniUrlSlike;
    if(zaSlanje.logo && zaSlanje.logo.trim().length===0)
    {
        handleClick();
        setTip('error');
        setPoruka('Klub mora imati neki logo');
        return;
        
    }
    zaSlanje.listaUcinaka = [];
    pozivKaBackuHandler(zaSlanje,klubZaIzmenu.id,"Uspešno ste izmenili opšte informacije o klubu!");
   
 }
 const deleteHandler = () =>
  {
    axios.delete(`http://localhost:5146/Admin/ObrisiPostojeciKlubSaNjegovimZavisnostima/${klubZaIzmenu.id}`)
    .then((res)=>{
      let noviKlubovi = klubovi.filter(x=>x.id != res.data);
      setKlubovi(noviKlubovi);
      handleOpenSuccess();
      setOpenDeleteModal(false);
      if(ruta == '/Klub')
        setRuta('/Klubovi');
            
    })
    .catch((err)=>{
       handleOpenError();
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
        SPISAK KLUBOVA KOJE MOŽETE ZAPRATITI U {sportText}
      </Typography>
<div className="searchDiv">

  <input
    type="text"
    className="search-input"
    placeholder="Pretraži klub po nazivu"
    value={imeFilter}
    onChange={(e) => setImeFilter(e.target.value)}
  />

  {  !(korisnik && korisnik.isAdmin) && (<FormControlLabel sx={{color:letters}}
    control={
      <Checkbox
        checked={onlyFollowed}
        onChange={(e) =>{ korisnik===null?setOpen(true):setOnlyFollowed(e.target.checked)}}
        sx={{
          color: "#ff8a1f",
          "&.Mui-checked": {
            color: "#ff8a1f",
          },
        }}
      />
    }
    label="Prikaži samo praćene klubove"
    className="checkbox-label"
  />)}
  {korisnik && korisnik.isAdmin && (
  <Button
    variant="contained"
    onClick={(e)=>{
        e.preventDefault();
      setRuta('/Klub');
      setOpenAddModal(true);
      
    }}
    startIcon={<AddCircleOutlineIcon />}
    sx={{
      backgroundColor: '#ff7900', // Tvoja narandžasta
      color: '#000',
      fontWeight: 'bold',
      px: 4,
      py: 1.5,
      mb:1,
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
      DODAJ NOVI KLUB U {sportText.toUpperCase()} 
  </Button>
  )}

</div>
<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >

      <Grid container spacing={3} sx={{alignSelf: "flex-end", width: "100%", maxWidth: 1400, mx: "auto", alignItems: "stretch" }}>
<>
     
 
          {filteredData.map((t) => (
            <KarticaKlub   key={t.id} obj={t}  onFollowChanged={handleFollowChanged} setKlubZaIzmenu = {setKlubZaIzmenu} setOpenEditModal={setOpenEditModal} setOpenBasicModal={setOpenBasicModal} setOpenDeleteModal={setOpenDeleteModal}/>
            
          ))}
     
</>
      </Grid>
      </div>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                    <Alert
                      onClose={handleClose}
                      severity={'error'}
                      variant="filled"
                      sx={{ width: '100%' }}
                    >
                      {"Prijavite se da bi ste mogli da zapratite klub i filtrirate po tom kriterijumu!"}
                    </Alert>
        </Snackbar>
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
            setOpenAddModal(false);
            if(ruta == '/Klub')
               setRuta('/Klubovi');
          }}
          open = {openAddModal}
          data = {noviKlub}
          setData = {setNoviKlub}
          onSubmit = {dodajNoviKlubHandler}
          tip = {"AddOrEditGeneralClub"}
          setSelectedFile={setSelectedFile}
          selectedFile = {selectedFile}
          podtip = {"Dodaj Novi Klub"}
        />
        <ModalPage 
          onClose = {()=>{
            setOpenEditModal(false);
            if(ruta == '/Klub')
              setRuta('/Klubovi');
          }}
          open = {openEditModal}
          data = {klubZaIzmenu}
          setData = {setKlubZaIzmenu}
          onSubmit = {izmeniGdeSeTakmiciKlubHandler}
          tip = {"AddOrEditGeneralClub"}
          podtip = {"Izmeni Takmičenja Kluba"}
        />
         <ModalPage 
          onClose = {()=>{
            setOpenBasicModal(false);
            if(ruta == '/Klub')
              setRuta('/Klubovi');
            }}
          open = {openBasicModal}
          data = {klubZaIzmenu}
          setData = {setKlubZaIzmenu}
          onSubmit = {izmeniOpsteInfoHandler}
          tip = {"AddOrEditGeneralClub"}
          setSelectedFile={setSelectedFile}
          selectedFile = {selectedFile}
          podtip = {"Izmeni osnovne podatke"}
        />
         <DeleteDialog
            open = {openDeleteModal} 
            onClose = {()=>{
            setOpenDeleteModal(false);
            if(ruta == '/Klub')
              setRuta('/Klubovi');
            }}
            onConfirm = {(e)=>{e.preventDefault();deleteHandler()}} 
            title = {"Da li ste sigurni da želite da obrišete dati klub"} 
            description = {"Brisanje kluba će je trajno ukloniti taj klub iz baze podataka zajedno sa njegovim učincima, novostima, dok će igrači postati slobodni agenti"} 
            loading = {false}
            openSuccess={openSuccess}
            openError={openError}
            handleOpenSuccess={handleOpenSuccess}
            handleOpenError={handleOpenError}
            content={"klub"}
          />
       
      
    </Box>
  );
};

export default Klubovi;
