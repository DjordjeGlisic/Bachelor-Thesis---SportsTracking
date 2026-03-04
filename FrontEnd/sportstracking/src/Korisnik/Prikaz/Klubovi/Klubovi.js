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
const Klubovi = () => {
  
  const {letters,sport,korisnik} = useContext(Context);
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

  <FormControlLabel sx={{color:letters}}
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
  />
  {korisnik && korisnik.isAdmin && (
  <Button
    variant="contained"
    onClick={(e)=>{
        e.preventDefault();
      e.stopPropagation();
      
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
            <KarticaKlub   key={t.id} obj={t}  onFollowChanged={handleFollowChanged}/>
            
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
    </Box>
  );
};

export default Klubovi;
