import { Alert, Box, Button, Grid, Snackbar, Typography } from "@mui/material";
import React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { Context,TakmicenjeContext } from "../../../Context/Context";
import './Rezultati.css';
import Kartica from "../Kartica";
import axios from "axios";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ModalPage from "../../../modalWrappers/ModalPage";
import { uploadToCloudinary } from "../../../modalWrappers/UploadImageToClaudinary";
import DeleteDialog from "../../../modalWrappers/DeleteDialog";
const Rezultati = () => {
  
  const {letters,sport,korisnik,ruta,setRuta} = useContext(Context);
  const [takmicenja, setTakmicenja] = useState([]);
  const [takmicenje, setTakmicenje] = useState(1);

  useEffect(() => {
    setTakmicenja([]); 
    setTakmicenje(1);
    const response =  axios.get(`http://localhost:5146/Korisnik/PribaviTakmicenja/${sport}`,
  {
    headers:{
      //Authorization: `Bearer ${token}`
    }
  }).then(response=>{
    console.log(response.data.value);
    setTakmicenja(response.data.value);
  })
  .catch(error=>{
    console.log(error);
  })
  }, [sport]);
/// ADMIN PODRSKA ///////////////
 const [openAddModal,setOpenAddModal] = useState(false);
 const [openEditModal,setOpenEditModal] = useState(false);
 const [openDeleteModal,setOpenDeleteModal] = useState(false);
 const [selectedFile,setSelectedFile] = useState(null);
 const [izabranoTakmicenje,setIzabranoTakmicenje] = useState(null);
 const [novoTakmicenje,setNovoTakmicenje] = useState(
  {
    naziv: '',
    logoURL : null,
    sport: sport,
    opis: '',
    drzava: '',
    regularnoBr: null,
    roundOf128Br: null,
    roundOf64Br: null,
    roundOf32Br: null,
    roundOf16Br: null,
    roundOf8Br: null,
    roundOf4Br:null,
    roundOf2Br:null,
    sekcije:[]
  }
 );
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
const formaZaDodavanjeTakmicenjaHandler = () =>
{
    setRuta('/Klub');
    setOpenAddModal(true);
}
const pozivKaBackHandler = async(takmicenje,dodavanje) =>
{
 if(!takmicenje.naziv || takmicenje.naziv.trim().length === 0 ||
    (dodavanje && takmicenja.some(t => t.naziv.toLowerCase() === takmicenje.naziv.toLowerCase()))){
        setTip("error");
        setPoruka("Niste uneli naziv takmičenja ili takmičenje već postoji.");
        setOpenScnack(true);
        return;
      }
     if(!takmicenje.opis || !takmicenje.opis.trim().length === 0){
        setTip("error");
        setPoruka("Niste uneli opis takmičenja.");
        setOpenScnack(true);
        return;
      }
     if(!takmicenje.drzava || !takmicenje.drzava.trim().length === 0){
        setTip("error");
        setPoruka("Niste uneli državu takmičenja.");
        setOpenScnack(true);
        return;
      }
    if(!takmicenje.regularnoBr &&(!takmicenje.roundOf128Br && !takmicenje.roundOf64Br && !takmicenje.roundOf32Br && !takmicenje.roundOf16Br && !takmicenje.roundOf8Br && !takmicenje.roundOf4Br && !takmicenje.roundOf2Br)){
        setTip("error");
        setPoruka("Niste dodali kola takmičenju.");
        setOpenScnack(true);
        return;
      }
      if(!takmicenje.sekcije || takmicenje.sekcije.length === 0){
        setTip("error");
        setPoruka("Niste uneli sekcije za takmičenje. Ako je takmičenje kup sistem, mora imati tkz Opštu sekciju!");
        setOpenScnack(true);
        return;
      }
       let konacniUrlSlike = takmicenje.logoURL; 
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
         let zaSlanje = takmicenje;
         zaSlanje.logoURL = konacniUrlSlike;
         if(zaSlanje.logoURL.trim().length===0)
         {
             setTip('error');
             setPoruka('Takmičenje mora imati neki logo');
             return;
         }
         if(dodavanje)
         {
           axios.post(`http://localhost:5146/Admin/DodajTakmicenje`,
             zaSlanje
           )
           .then((res)=>{
             console.log(res.data);
             const postoji = takmicenja.find(k => k.id === res.data.id);
            setTakmicenja(prev => {
               // Proveravamo da li takmičenje sa tim ID-em već postoji u nizu
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
             setPoruka("Uspešno dodato novo takmičenje");
             setOpenScnack(true);
             setOpenAddModal(false);
             setOpenEditModal(false);
             setOpenAddModal(false);
             if(ruta == '/Klub')
               setRuta('/Takmicenja');
                setNovoTakmicenje(
               {
                  naziv: '',
                  logoURL : null,
                  sport: sport,
                  opis: '',
                  drzava: '',
                  regularnoBr: null,
                  roundOf128Br: null,
                  roundOf64Br: null,
                  roundOf32Br: null,
                  roundOf16Br: null,
                  roundOf8Br: null,
                  roundOf4Br:null,
                  roundOf2Br:null,
                  sekcije:[]
              }
             );
           })
           .catch((err)=>{
             setTip("error");
             setPoruka(err.response?.data || "Greška pri slanju");
             setOpenScnack(true);
           });
         }
         else
         {
            axios.put(`http://localhost:5146/Admin/IzmeniTakmicenje/${takmicenje.id}`,
             zaSlanje
           )
           .then((res)=>{
             console.log(res.data);
             const postoji = takmicenja.find(k => k.id === res.data.id);
            setTakmicenja(prev => {
               // Proveravamo da li takmičenje sa tim ID-em već postoji u nizu
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
             setPoruka("Uspešno izmenjeno postojeće takmičenje");
             setOpenScnack(true);
             setOpenAddModal(false);
             setOpenEditModal(false);
             setOpenAddModal(false);
             if(ruta == '/Klub')
               setRuta('/Takmicenja');
                setIzabranoTakmicenje(null);
           })
           .catch((err)=>{
             setTip("error");
             setPoruka(err.response?.data || "Greška pri slanju");
             setOpenScnack(true);
           });
         }
         
}
const dodavanjeTakmicenjaHandler = async() =>
{
    await pozivKaBackHandler(novoTakmicenje,true);

}
const editTakmicenjaHandler = async() =>
{
    await pozivKaBackHandler(izabranoTakmicenje,false);
}
const deleteTakmicenjeHandler = () =>
{
  axios.delete(`http://localhost:5146/Admin/ObrisiTakmicenje/${izabranoTakmicenje.id}`)
  .then((res)=>{
    setTip("success");
    setPoruka("Takmičenje uspešno obrisano");
    setOpenScnack(true);
    setTakmicenja(prev => prev.filter(k => k.id !== res.data.id));
     if(ruta == '/Klub')
        setRuta('/Takmicenja');
      setOpenDeleteModal(false);
  })
  .catch((err)=>{
    setTip("error");
    setPoruka(err.response?.data || "Greška pri slanju");
    setOpenScnack(true);
  });
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
        IZABERITE TAKMIČENJE ZA KOJE ŽELITE DA VIDITE REZULTATE
      </Typography>
      {korisnik && korisnik.isAdmin && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={formaZaDodavanjeTakmicenjaHandler}
            sx={{
              backgroundColor: "#ff7a00",
              fontWeight: 800,
              px: 4,
              py: 1.5,
              borderRadius: "12px",
              textTransform: "uppercase",
              fontFamily: "'Orbitron', sans-serif",
              boxShadow: "0 10px 20px rgba(255,122,0,0.3)",
              "&:hover": {
                backgroundColor: "#ff8a1f",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 25px rgba(255,122,0,0.4)",
              },
              transition: "all 0.3s ease"
            }}
          >
            Dodaj novo takmičenje
          </Button>
        </Box>
      )}
<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
      <Grid container spacing={3} sx={{alignSelf: "flex-end", width: "100%", maxWidth: 1400, mx: "auto", alignItems: "stretch" }}>
<>
     
  <TakmicenjeContext.Provider value={{takmicenje,setTakmicenje}}>
          {takmicenja.map((t) => (
            <Kartica key={t.id} tipTakmicenje={true} objekat={t}  setIzabranoTakmicenje = {setIzabranoTakmicenje}
              setRuta = {setRuta}
              setOpenAddModal = {setOpenAddModal}
              setOpenDeleteModal = {setOpenDeleteModal}
              setOpenEditModal = {setOpenEditModal}
             />
            
            
          ))}
      </TakmicenjeContext.Provider>
     
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
                setOpenAddModal(false);
                if(ruta == '/Klub')
                {
                  setRuta('/Takmicenja');
                }
                setNovoTakmicenje(
                    {
                    naziv: '',
                    logoURL : null,
                    sport: sport,
                    opis: '',
                    drzava: '',
                    regularnoBr: null,
                    roundOf128Br: null,
                    roundOf64Br: null,
                    roundOf32Br: null,
                    roundOf16Br: null,
                    roundOf8Br: null,
                    roundOf4Br:null,
                    roundOf2Br:null,
                    sekcije:[]
                  }
                  );
                }}
              open = {openAddModal}
              data = {novoTakmicenje}
              setData = {setNovoTakmicenje}
              onDodavanje = {dodavanjeTakmicenjaHandler}
              tip = {"AddOrEditGeneralTakmicenje"}
              setSelectedFile={setSelectedFile}
              selectedFile = {selectedFile}
              podtip = {"Dodaj novo takmičenje"}
              setOpenSnack={ setOpenScnack}
              setTip = {setTip}
              setPoruka = {setPoruka}
            />
             <ModalPage 
              onClose = {()=>{
                setOpenEditModal(false);
                if(ruta == '/Klub')
                {
                  setRuta('/Takmicenja');
                }
                setIzabranoTakmicenje(null);
                }}
              open = {openEditModal}
              data = {izabranoTakmicenje}
              setData = {setIzabranoTakmicenje}
              onIzmena = {editTakmicenjaHandler}
              tip = {"AddOrEditGeneralTakmicenje"}
              setSelectedFile={setSelectedFile}
              selectedFile = {selectedFile}
              podtip = {"Promeni postojće takmičenje"}
              setOpenSnack={ setOpenScnack}
              setTip = {setTip}
              setPoruka = {setPoruka}
            />
             <DeleteDialog
                open = {openDeleteModal} 
                onClose = {()=>{
                  if(ruta == '/Klub')
                    setRuta('/Takmicenja');
                setOpenDeleteModal(false);
                }}
                onConfirm = {(e)=>{e.preventDefault();deleteTakmicenjeHandler()}} 
                title = {"Da li ste sigurni da želite da obrišete takmičenje"} 
                description = {"Brisanje takmičenja će ga trajno ukloniti iz baze podataka zajedno sa svim učincima klubova,igrača i utakmicama u njemu"} 
                loading = {false}
                content={"takmičenje"}
            />
    </Box>
  );
};

export default Rezultati;
