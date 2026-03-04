import { Alert, Box, Button, Checkbox, FormControlLabel, IconButton, Snackbar, Typography } from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import React,{useState,useEffect,useContext,useMemo, useRef} from "react";
import { Context,KluboviContext } from "../../Context/Context";
import axios from "axios";
import NovostModal from "../NovostModal";
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import './Novosti.css';
import ModalPage from "../../modalWrappers/ModalPage";
import { uploadToCloudinary } from '../../modalWrappers/UploadImageToClaudinary';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { responsive } from "@cloudinary/react";
import DeleteDialog from "../../modalWrappers/DeleteDialog";

const Novosti=()=>{
    const {letters,izabraniKlub,korisnik}=useContext(Context);
    const{klub}=useContext(KluboviContext);
    const [novosti,setNovosti]=useState([]);
    const[novost,setNovost]=useState(null);
    const[klubZaNovost,setKlubZaNovost]=useState(null);
     const [openNovost,setOpenNovost]=useState(false);
    const focusBackRef = useRef(null);
    const aktivniKlub = izabraniKlub!==null ? izabraniKlub : klub;
      useEffect(() => {
        if (klub)
          setNovosti(null);
        const korID = korisnik == null ? 0 : korisnik.id;
       
        axios
          .get(`http://localhost:5146/Klub/VratiNovostiKluba/${aktivniKlub.id}/${korID}`)
          .then((res) => {
            setNovosti(res.data ?? []);
          })
          .catch((err) => console.log(err));
      }, [korisnik,klub]);
      function formatDateTimeDDMMYYYY(isoString) {
  if (!isoString) return "";

  const [datePart, timePart] = isoString.split("T");
  if (!datePart || !timePart) return "";

  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.replace("Z", "").split(":");

  return `${day}.${month}.${year} ${hour}:${minute}`;
}
const [novaVest,setNovaVest] = useState(
 {
  naslov: "",
  autor: "", // Ovde možeš staviti npr. "Admin" ili trenutno ulogovanog korisnika
  sazetak: "",
  vest: "",
  slika: '',
  datum: new Date().toISOString(), // Postavlja trenutno vreme u ISO formatu
  brojLajkova: 0,
  brojDislajkova: 0,
  likedByMe: false,
  dislikedByMe: false,
  klubID: null, // Ovde prosledi ID kluba kojem vest pripada
  // id: null (ID obično dodeljuje baza podataka pri kreiranju)
})
const [openEdit,setOpenEdit] = useState(false);
const closeEdit = () => {setOpenEdit(false);} 
const [openAdding,setOpenAdding] = useState(false);
const closeAdding = () => {setNovaVest( {
  naslov: "",
  autor: "", 
  sazetak: "",
  vest: "",
  slika: '',
  datum: new Date().toISOString(), 
  brojLajkova: 0,
  brojDislajkova: 0,
  likedByMe: false,
  dislikedByMe: false,
  klubID: null, 
});setOpenAdding(false)};

 const openN = () => setOpenNovost(true);
    const closeN = () => {
      setOpenNovost(false);
      requestAnimationFrame(() => focusBackRef.current?.focus());
    };
    const handleLajk=(vestID,korisnikID,isLike)=>{
         const response =  axios.post(`http://localhost:5146/Korisnik/LajkujILIDislajkujNovost/${korisnikID}/${vestID}/${isLike}`,
        {
            headers:{
            //Authorization: `Bearer ${token}`
            }
        }).then(response=>{
            console.log("Odgovor");
            console.log(response.data);
            if(novosti.length > 0)
            {
              setNovosti(prev =>
                prev.map(v =>
                    v.id === response.data.vestId
                    ? {
                        ...v,
                        brojLajkova: response.data.likes,
                        brojDislajkova: response.data.dislikes,
                        likedByMe: response.data.likedByMe,
                        dislikedByMe: response.data.dislikedByMe,
                        }
                    : v
                )
                );
            }
            else
            {
              setNovosti(prev => [...prev,{
                 brojLajkova: response.data.likes,
                        brojDislajkova: response.data.dislikes,
                        likedByMe: response.data.likedByMe,
                        dislikedByMe: response.data.dislikedByMe,

              }])
            }
                   

            
        })
        .catch(error=>{
            console.log(error);
        })
    }
//////FILTER PO LAJKU DISLAJKU I NASLOVU NOVOSTI
 const [open,setOpen] = React.useState(false);
    const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
    const [openAddError,setOpenAddError] = React.useState(false);
    const [openEditError,setOpenEditError] = React.useState(false);
    const handleCloseAddError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAddError(false);
  };
  const handleCloseEditError = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }

  setOpenEditError(false);
};
  const [openAddSuccess,setOpenAddSuccess] = React.useState(false);
  const [openEditSuccess,setOpenEditSuccess] = React.useState(false);
  const handleCloseAddSuccess = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }

  setOpenAddSuccess(false);
};
  const handleCloseEditSuccess = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }

  setOpenEditSuccess(false);
};
const [onlyLiked,setOnlyLiked]=useState(false);
const [onlyDisliked,setOnlyDisliked]=useState(false);
const [naslovFilter,setNaslovFilter]=useState("");
const [selectedFile,setSelectedFile] = useState(null);
const handleEdit = async () => {


  // 1. Počni sa trenutnom slikom (ako nije menjana, ostaje stara)
  let konacniUrlSlike = novost.slika; 

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
   let zaSlanje=novost;
  zaSlanje.slika=konacniUrlSlike;
  console.log("Salje se backendu za izmenu",zaSlanje);
   axios.put(`http://localhost:5146/Klub/KlubAzuriraNovost/${klub.id}`,zaSlanje
)
.then((res)=>{
 setNovosti(prevNovosti => 
    prevNovosti.map(novost => 
      novost.id === res.data.id 
        ? { ...novost, ...res.data } 
        : novost                       
    )
  );
 setNovost(null);
  setOpenEditSuccess(true);
})
.catch((err)=>{
  setOpenEditError(true);
})
};

const handleAdding = async() => {
  // 1. Počni sa trenutnom slikom (ako nije menjana, ostaje stara)
  let konacniUrlSlike = novaVest.slika; 

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
  let zaSlanje=novaVest;
  zaSlanje.slika=konacniUrlSlike

  axios.post(`http://localhost:5146/Klub/KlubDodajeNovost/${klub.id}`,zaSlanje
)
.then((res)=>{
  setNovosti(prev => [...prev,res.data]);
  setNovaVest(
    {
  naslov: "",
  autor: "", 
  sazetak: "",
  vest: "",
  slika: '',
  datum: new Date().toISOString(), 
  brojLajkova: 0,
  brojDislajkova: 0,
  likedByMe: false,
  dislikedByMe: false,
  klubID: null, 
}
  )
  setOpenAddSuccess(true);
})
.catch((err)=>{
  setOpenAddError(true);
})

}
  const [openSuccess,setOpenSuccess] = React.useState(false);
  const [openError,setOpenError] = React.useState(false);
  const handleOpenSuccess = () =>{setOpenSuccess(true)};
  const handleOpenError = () =>{setOpenError(true)};
const [openDeleteDialog,setOpenDeleteDialog]  = useState(false);
const closeDeleteDialogHandler =() =>{
  setOpenDeleteDialog(false);
  setOpenSuccess(false);
  setOpenError(false);
}
const deleteHandler = () =>{
   axios.delete(`http://localhost:5146/Klub/ObrisiPostojecuVest/${klub.id}/${novost.id}`)
   .then((res)=>{
    setOpenSuccess(true);
    setNovosti(prevNovosti => 
        prevNovosti.filter(novost => novost.id !== res.data)
      );
    setNovost(null);
    setTimeout(()=>{
    closeDeleteDialogHandler();
    },3000);

   })
   .catch((err)=>{
    setOpenError(true);
   })

}
const filteredData = useMemo(() => {
  if (!novosti) return [];

  return novosti.filter((x) => {
    const nalsov = (x.naslov ?? "").toLowerCase();
    const naslovOk = nalsov.includes(naslovFilter.toLowerCase());

    const lajkOk = onlyLiked ? x.likedByMe === true : true;
    const dislajkOk = onlyDisliked ? x.dislikedByMe === true : true;
    return naslovOk && lajkOk && dislajkOk;
  });
}, [novosti, naslovFilter, onlyLiked, onlyDisliked]);
    return (
        <>
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
                SPISAK NOVOSTI KOJE JE OBJAVIO "{aktivniKlub.naziv}"
              </Typography>
              <div className="searchDiv">
              
                <input
                  type="text"
                  className="search-input"
                  placeholder="Pretraži vest po  naslovu"
                  value={naslovFilter}
                  onChange={(e) => setNaslovFilter(e.target.value)}
                />
              {!klub && (
              <>
                  <FormControlLabel sx={{color:letters}}
                    control={
                      <Checkbox
                        checked={onlyLiked}
                        onChange={(e) =>{ korisnik===null?setOpen(true):setOnlyLiked(e.target.checked)}}
                        sx={{
                          color: "#ff8a1f",
                          "&.Mui-checked": {
                            color: "#ff8a1f",
                          },
                        }}
                      />
                    }
                    label="Prikaži samo lajkovane vesti"
                    className="checkbox-label"
                  />
                  <FormControlLabel sx={{color:letters}}
                    control={
                      <Checkbox
                        checked={onlyDisliked}
                        onChange={(e) =>{ korisnik===null?setOpen(true):setOnlyDisliked(e.target.checked)}}
                        sx={{
                          color: "#ff8a1f",
                          "&.Mui-checked": {
                            color: "#ff8a1f",
                          },
                        }}
                      />
                    }
                    label="Prikaži samo dislajkovane vesti"
                    className="checkbox-label"
                  />
                </>
                )}
               {klub && (
                <Button
                  variant="contained"
                  onClick={(e)=>{
                     e.preventDefault();
                    e.stopPropagation();
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
                  DODAJ NOVOST
                </Button>
                        )}
              </div>
                 <div className="pk-news-wrap">
                          
                          <div className="pk-news-grid">
                            {filteredData.map((n) => (
                              <div key={n.id} className="pk-news-card">
                                 
                                <div className="pk-news-head">
                                  <div className="pk-news-avatar">
                                    <img src={aktivniKlub.logo} alt={aktivniKlub.naziv} />
                                  </div>
                                  <div className="pk-news-head-text">
                                    <div className="pk-news-club">{aktivniKlub.naziv}</div>
                                    <div className="pk-news-date">{formatDateTimeDDMMYYYY(n.datum)}</div>
                                  </div>
                                {klub && (
                                <div className="pk-news-admin-actions">
                                  <IconButton 
                                    className="pk-btn-edit" 
                                    size="small" 
                                    onClick={(e)=>{
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setNovost(n);
                                      setKlubZaNovost(aktivniKlub);
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
                                      setNovost(n);
                                      setOpenDeleteDialog(true);
                                    }}
                                  >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                  </IconButton>
                                </div>
                                )}
                                </div>

                                <div className="pk-news-img">
                                  <img src={n.slika} alt={n.tip} />
                                </div>

                                <div className="pk-news-body">
                                  <div className="pk-news-naslov">{n.naslov}</div>
                                  <div className="pk-news-opis">{n.sazetak}</div>
                                </div>

                                <div className="pk-news-actions">
                                  <button type="button" className={`pk-news-like ${n.likedByMe===true ? "pk-news-like--active" : ""}`} disabled={korisnik==null?true:false} onClick={(e)=>{e.preventDefault();handleLajk(n.id,korisnik.id,true)}} aria-label="like" >
                                    <ThumbUpAltOutlinedIcon fontSize="small" />
                                    <span>{n.brojLajkova}</span>
                                  </button>

                                  <button type="button" className={`pk-news-dislike ${n.dislikedByMe===true? "pk-news-dislike--active" : ""}`} disabled={korisnik==null?true:false} onClick={(e)=>{e.preventDefault();handleLajk(n.id,korisnik.id,false)}} aria-label="dislike">
                                    <ThumbDownAltOutlinedIcon fontSize="small" />
                                    <span>{n.brojDislajkova}</span>
                                  </button>

                                  <div className="pk-news-spacer" />

                                  {/* samo ikonica koja sugeriše detalje (ne implementiramo modal ovde) */}
                                  <IconButton
                                    className="pk-news-details"
                                    size="small"
                                    aria-label="detalji vesti"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setNovost(n);
                                      setKlubZaNovost(aktivniKlub);
                                      openN();
                                    }}
                                  >
                                    <ChevronRightRoundedIcon />
                                  </IconButton>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
            </Box>
            {novost!==null&& klubZaNovost &&( <NovostModal
                          open={openNovost}
                          onClose={closeN}
                          novost={novost}     
                          korisnik={korisnik}         
                          clubNaziv={klubZaNovost.naziv}      
                          clubLogo={klubZaNovost.logo}        
                    />)}
            {novost!==null && klub && (
             
                <ModalPage
                  open={openEdit}
                  onClose={closeEdit}
                  data = {novost}
                  setData = {setNovost}
                  onSubmit = {handleEdit}
                  selectedFile = { selectedFile }
                  setSelectedFile = {setSelectedFile }
                  tip = {'AddOrEditNovost'}
                  podtip = {'Azuziiraj postojecu novost'}
                  />
                )}
                {klub && (
                  <>
                  <ModalPage
                  open={openAdding}
                  onClose={closeAdding}
                  data = {novaVest}
                  setData = {setNovaVest}
                  onSubmit = {handleAdding}
                  selectedFile = { selectedFile }
                  setSelectedFile = {setSelectedFile }
                  tip = {'AddOrEditNovost'}
                  podtip = {'Dodaj novu vest'}
                  />
                  <DeleteDialog
                  open = {openDeleteDialog} 
                  onClose = {closeDeleteDialogHandler} 
                  onConfirm = {(e)=>{e.preventDefault();deleteHandler()}} 
                  title = {"Da li ste sigurni da zelite da obrisete datu vest"} 
                  description = {"Brisanje vesti ce je trajno ukloniti iz baze podataka"} 
                  loading = {false}
                  openSuccess={openSuccess}
                  openError={openError}
                  handleOpenSuccess={handleOpenSuccess}
                  handleOpenError={handleOpenError}
                  content={"novosti"}
                  />
                  </>
                )}
                
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
              <Alert
                onClose={handleClose}
                severity={'error'}
                variant="filled"
                sx={{ width: '100%' }}
              >
                {"Prijavite se da bi ste mogli da lajkujete ili dislajkujete novost!"}
              </Alert>
            </Snackbar>
            <Snackbar open={openAddError} autoHideDuration={6000} onClose={handleCloseAddError}>
            <Alert
              onClose={handleCloseAddError}
              severity={'error'}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {"Greska prilikom pokusaja dodavanje nove vesti!"}
            </Alert>
          </Snackbar>
          <Snackbar open={openAddSuccess} autoHideDuration={6000} onClose={handleCloseAddSuccess}>
            <Alert
              onClose={handleCloseAddSuccess}
              severity={'success'}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {"Uspesno dodavanje nove vesti!"}
            </Alert>
          </Snackbar>
           <Snackbar open={openEditError} autoHideDuration={6000} onClose={handleCloseAddError}>
            <Alert
              onClose={handleCloseEditError}
              severity={'error'}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {"Greska prilikom pokusaja modifikacije nove vesti!"}
            </Alert>
          </Snackbar>
          <Snackbar open={openEditSuccess} autoHideDuration={6000} onClose={handleCloseEditSuccess}>
            <Alert
              onClose={handleCloseEditSuccess}
              severity={'success'}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {"Uspesno modifikovanje nove vesti!"}
            </Alert>
          </Snackbar>
        </>
    );
}
export default Novosti;