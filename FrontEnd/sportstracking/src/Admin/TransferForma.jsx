import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Button, Stack, Typography, Paper,
  Snackbar, Alert, Autocomplete
} from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

const TransferForma = ({ data, onClose,sport,podtip,setOpenSnack,setTip,setPoruka,onSubmit }) => {
  const [noviKlub, setNoviKlub] = useState(null);
  const [datumPocetka, setDatumPocetka] = useState('');
  const [datumKraja, setDatumKraja] = useState('');

  const [kluboviOpcije,setKluboviOpcije] = useState(null);
  useEffect(()=>{
    axios.get(`http://localhost:5146/Admin/VratiKluboveZaTransferIgraca/${sport}`)
    .then((res)=>{
        const filter = res.data.filter(x => x.naziv != data.klubNaziv);
        setKluboviOpcije(filter);
        setTip("success");
        setPoruka("Potencijalni klbovi za tranfer uspešno su učitani!");
        setOpenSnack(true);
        
    })
    .catch((err)=>
    {
         setTip("error");
        setPoruka("Potencijalni klbovi za tranfer nisu uspešno učitani!");
        setOpenSnack(true);
    })

  },[sport])


  const danasnjiDatum = new Date().toISOString().split('T')[0];

  const handleSacuvaj = () => {
    if (!noviKlub || !datumPocetka || !datumKraja) {
        setTip("error");
        setPoruka("Niste popunili sva polja !");
        setOpenSnack(true);
      return;
    }
    console.log(noviKlub);
    onSubmit(noviKlub,datumPocetka,datumKraja);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', p: 2 }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '900px',
          backgroundColor: '#0a0a0a',
          border: '1px solid #333',
          borderRadius: 4,
          p: { xs: 4, md: 8 },
          color: '#fff',
        }}
      >
        <Typography variant="h3" sx={{ mb: 6, textAlign: 'center', fontWeight: 800, fontFamily: "'Orbitron', sans-serif", color: '#ff7900' }}>
          {data.ime} {data.prezime}
        </Typography>

        <Stack spacing={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            
            {/* TRENUTNI KLUB (Locked) */}
            <Box sx={{ 
                flex: 1, height: '75px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid #444', borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.03)', px: 3, width: '100%'
            }}>
                <Typography sx={{ color: '#888', fontSize: '1.3rem', fontWeight: 'bold' }}>
                  {data.klubNaziv || "MANCHESTER CITY"}
                </Typography>
            </Box>

            <ArrowForwardIcon sx={{ color: '#ff7900', fontSize: 45 }} />

            {/* NOVI KLUB AUTOCOMPLETE - STILIZOVAN */}
         <Autocomplete
            sx={{ flex: 1, width: '100%' }}
            options={kluboviOpcije}
            getOptionLabel={(option) => option.naziv}
            value={noviKlub}
            onChange={(e, val) => setNoviKlub(val)}
            
            // REŠENJE ZA KEY: Ručno renderovanje opcija sa unikatnim ključem
            renderOption={(props, option) => {
                return (
                <li {...props} key={option.id}>
                    {option.naziv}
                </li>
                );
            }}

            // Dobra praksa: Pomaže Reactu da uporedi trenutnu vrednost sa opcijama
            isOptionEqualToValue={(option, value) => option.id === value.id}

            // Stilovi za padajući panel (tvoj postojeći kod)
            PaperComponent={({ children }) => (
                <Paper sx={{ 
                    backgroundColor: '#1a1a1a', 
                    color: '#fff', 
                    border: '1px solid #ff7900',
                    marginTop: '5px'
                }}>
                {children}
                </Paper>
            )}
            
            // Ne zaboravi renderInput koji ide ispod
            renderInput={(params) => (
                <TextField 
                {...params} 
                label="Pretraži novi klub" 
                sx={autocompleteTextFieldStyle} 
                />
            )}
            />
                    </Box>

          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Početak ugovora" type="date" fullWidth sx={textFieldStyle}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: danasnjiDatum, style: { height: '40px', fontSize: '1.2rem' } }}
              value={datumPocetka} onChange={(e) => setDatumPocetka(e.target.value)}
            />
            <TextField
              label="Kraj ugovora" type="date" fullWidth sx={textFieldStyle}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: datumPocetka || danasnjiDatum, style: { height: '40px', fontSize: '1.2rem' } }}
              value={datumKraja} onChange={(e) => setDatumKraja(e.target.value)}
            />
          </Box>

          <Button fullWidth variant="contained" startIcon={<SaveIcon sx={{ fontSize: 30 }} />} onClick={handleSacuvaj} sx={submitButtonStyle}>
            POTVRDI TRANSFER
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

// Specifičan stil za Autocomplete Input
const autocompleteTextFieldStyle = {
  "& .MuiOutlinedInput-root": {
    height: '75px',
    color: "#fff",
    fontSize: '1.2rem',
    backgroundColor: "rgba(255,255,255,0.02)",
    "& fieldset": { borderColor: "#444" },
    "&:hover fieldset": { borderColor: "#666" },
    "&.Mui-focused fieldset": { borderColor: "#ff7900", borderWidth: '2px' },
  },
  "& .MuiInputLabel-root": { color: "#777", fontSize: '1.1rem' },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ff7900" },
  "& .MuiAutocomplete-endAdornment .MuiSvgIcon-root": { color: "#ff7900" } // Naranžasta strelica za dropdown
};

// Standardni stil za datume
const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.02)",
    "& fieldset": { borderColor: "#444" },
    "&:hover fieldset": { borderColor: "#666" },
    "&.Mui-focused fieldset": { borderColor: "#ff7900", borderWidth: '2px' },
  },
  "& .MuiInputLabel-root": { color: "#777", fontSize: '1.1rem' },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ff7900" },
  "& .MuiOutlinedInput-input": {
    "&::-webkit-calendar-picker-indicator": { filter: "invert(1)", transform: 'scale(1.5)', cursor: 'pointer' }
  }
};

const submitButtonStyle = {
  height: '85px', fontSize: '1.5rem', backgroundColor: "#ff7900", color: "#000", fontWeight: 900, borderRadius: 2, mt: 4,
  "&:hover": { backgroundColor: "#fff", transform: 'translateY(-3px)' },
  transition: 'all 0.3s ease'
};

export default TransferForma;