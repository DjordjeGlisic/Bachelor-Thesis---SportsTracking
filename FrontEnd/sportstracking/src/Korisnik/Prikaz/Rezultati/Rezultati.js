import { Box, Button, Grid, Typography } from "@mui/material";
import React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { Context,TakmicenjeContext } from "../../../Context/Context";
import './Rezultati.css';
import Kartica from "../Kartica";
import axios from "axios";
const Rezultati = () => {
  
  const {letters,sport} = useContext(Context);
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
<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
      <Grid container spacing={3} sx={{alignSelf: "flex-end", width: "100%", maxWidth: 1400, mx: "auto", alignItems: "stretch" }}>
<>
     
  <TakmicenjeContext.Provider value={{takmicenje,setTakmicenje}}>
          {takmicenja.map((t) => (
            <Kartica key={t.id} tipTakmicenje={true} objekat={t}  />
            
            
          ))}
      </TakmicenjeContext.Provider>
     
</>
      </Grid>
      </div>
    </Box>
  );
};

export default Rezultati;
