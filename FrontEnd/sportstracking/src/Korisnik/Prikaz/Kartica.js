import '../Prikaz/Rezultati/Rezultati.css';
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
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
      const { letters, contentColor,setModal,korisnik} = useContext(Context);
    const {takmicenje,setTakmicenje}=useContext(TakmicenjeContext);
    // Funkcije za nove akcije (ovde dodaj svoju logiku ili prosledi kroz props)
  const handleEdit = (e) => {
    e.preventDefault();
    props.setIzabranoTakmicenje(props.objekat);
    props.setRuta('/Klub');
    props.setOpenEditModal(true);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    props.setIzabranoTakmicenje(props.objekat);
    props.setRuta('/Klub');
    props.setOpenDeleteModal(true)
  };
   
    return (
  <>
      {props.tipTakmicenje === true && (
        <>
          <Grid item xs={12} md={4} sx={{ display: "flex" }}>
            <div style={{ width: "100%" }}>
              <div className="comp-card">
                <div className="comp-accent" style={{ background: "#ff7a00" }} />
                <div className="comp-inner" style={{ background: contentColor }}>
                  
                  {/* GORNJI DEO */}
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

                  {/* DONJI DEO (AKCIJE) */}
                  <div className="comp-actions" style={{ padding: '15px' }}>
                    <Stack spacing={1}>
                      {/* Glavno dugme */}
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTakmicenje(props.objekat);
                          open();
                        }}
                        sx={{
                          textTransform: "none",
                          fontWeight: 800,
                          borderRadius: 2,
                          backgroundColor: "#ff7a00",
                          boxShadow: "0 10px 24px rgba(255,122,0,0.25)",
                          "&:hover": { backgroundColor: "#ff8a1f" },
                        }}
                      >
                        Vidi rezultate
                      </Button>

                      {/* Dodatna dugmad u redu */}
                      {korisnik && korisnik.isAdmin &&(<Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleEdit}
                          sx={{
                            color: letters,
                            borderColor: "#ff7a00",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { borderColor: "#ff8a1f", backgroundColor: "rgba(255,122,0,0.1)" }
                          }}
                        >
                          Izmena
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          color="error"
                          onClick={handleDelete}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            backgroundColor: "#d32f2f", // Crvena za brisanje
                          }}
                        >
                          Obriši
                        </Button>
                      </Stack>)}
                    </Stack>
                  </div>
                </div>
              </div>
            </div>
          </Grid>
          <RezultatiModal open={openLogin} onClose={close} utakmica={null} />
        </>
      )}
    </>
    );

}
export default Kartica;