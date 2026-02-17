import '../Prikaz/Rezultati/Rezultati.css';
import { Box, Button, Grid, Typography } from "@mui/material";
import React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { Context,TakmicenjeContext } from "../../Context/Context";
import { useNavigate } from 'react-router-dom';
import RezultatiModal from './Rezultati/RezultatiModal';
const Kartica=(props)=>{
   const [openLogin, setOpenLogin] = useState(false);
  
    // element na koji vraćaš fokus kad zatvoriš modal
    const focusBackRef = useRef(null);
  
    const open = () =>{setModal(true); setOpenLogin(true);}
    const close = () => {
      setOpenLogin(false);
      setModal(false);
      requestAnimationFrame(() => focusBackRef.current?.focus());
    };
      const { letters, contentColor,setModal} = useContext(Context);
    const {takmicenje,setTakmicenje}=useContext(TakmicenjeContext);
    
   
    return (
      <>
    
      {props.tipTakmicenje===true&&(
      <>
        <Grid item xs={12} md={4} sx={{ display: "flex" }}>
            <div style={{ width: "100%" }}>
            <div
              
              style={{ width: "100%", border: "none", background: "transparent", padding: 0 }}
            >
              <div className="comp-card">
  <div className="comp-accent" style={{ background:"#ff7a00" }} />

  <div className="comp-inner" style={{ background: contentColor }}>
    {/* GORNJI DEO (logo + tekst + chip) */}
    <div className="comp-head">
      <div className="comp-logoWrap" style={{ backgroundColor: "#e07b38" }}>
        {props.objekat.logoURL ? (
          <img className="comp-logo" src={props.objekat.logoURL} alt={props.objekat.naziv} />
        ) : (
          <div className="comp-fallback">{props.objekat.drzava}</div>
        )}
      </div>

      <div className="comp-text">
        <div className="comp-title" style={{ color: letters }}>
          {props.objekat.naziv}
        </div>
        <div className="comp-sub" style={{ color: letters }}>
          {props.objekat.opis}
        </div>
      </div>

      <div className="comp-chip" style={{ backgroundColor: "#e07b38", color: letters }}>
        {props.objekat.drzava}
      </div>
    </div>

    {/* DONJI DEO (dugme) */}
    <div className="comp-actions">
      <Button
        fullWidth
        variant="contained"
        onClick={(e) => {
          e.preventDefault(); // da ne “klikne” parent button
          e.stopPropagation();
            setTakmicenje(props.objekat);
            open();
           
        }}
        sx={{
          textTransform: "none",
          fontWeight: 800,
          borderRadius: 2,
          py: 1.2,
          backgroundColor: "#ff7a00",
          boxShadow: "0 10px 24px rgba(255,122,0,0.25)",
          "&:hover": {
            backgroundColor: "#ff8a1f",
            boxShadow: "0 12px 28px rgba(255,122,0,0.30)",
          },
        }}
      >
        Vidi rezultate
      </Button>
    </div>
  </div>
</div>

            </div>
            </div>
          </Grid>
         
          <RezultatiModal open={openLogin} onClose={close} utakmica={null} />
          </>)}
          </>
    );

}
export default Kartica;