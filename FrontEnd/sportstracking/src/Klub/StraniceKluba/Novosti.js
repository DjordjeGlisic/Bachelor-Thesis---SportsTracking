import { Alert, Box, Checkbox, FormControlLabel, IconButton, Snackbar, Typography } from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import React,{useState,useEffect,useContext,useMemo, useRef} from "react";
import { Context,KluboviContext } from "../../Context/Context";
import axios from "axios";
import NovostModal from "../NovostModal";
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
        const korID = korisnik == null ? 0 : korisnik.id;
       
        axios
          .get(`http://localhost:5146/Klub/VratiNovostiKluba/${aktivniKlub.id}/${korID}`)
          .then((res) => {
            setNovosti(res.data ?? []);
          })
          .catch((err) => console.log(err));
      }, [korisnik]);
      function formatDateTimeDDMMYYYY(isoString) {
  if (!isoString) return "";

  const [datePart, timePart] = isoString.split("T");
  if (!datePart || !timePart) return "";

  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.replace("Z", "").split(":");

  return `${day}.${month}.${year} ${hour}:${minute}`;
}
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
const [onlyLiked,setOnlyLiked]=useState(false);
const [onlyDisliked,setOnlyDisliked]=useState(false);
const [naslovFilter,setNaslovFilter]=useState("");
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
                                  {/* uklonjene 3 tačkice */}
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
            {novost!==null&&( <NovostModal
                          open={openNovost}
                          onClose={closeN}
                          novost={novost}     
                          korisnik={korisnik}         
                          clubNaziv={klubZaNovost.naziv}      
                          clubLogo={klubZaNovost.logo}        
                    />)}
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
        </>
    );
}
export default Novosti;