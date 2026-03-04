import React, { useState,useContext } from 'react';
import {
  Box, TextField, Button, Stack, Typography, Paper,
  Snackbar, Alert, IconButton, Chip, Divider,
  Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { KluboviContext } from '../../Context/Context';

const fudbalskePozicije = [
  "Golman", "Odbrambeni", "Vezni", "Napadač"
];
const kosarkaskePozicije = [
  "PG", "SG", "SF", "PF","C"
];
const vaterpoloPozicije= [
    "Golman","Bek","Krilo","Sidraš"
]


const AddOrEditIgrac = ({ data, setData, onSubmit, podtip, dostupnaTakmicenja }) => {
  const [openError, setOpenError] = useState(false);
  const [noviKlub, setNoviKlub] = useState("");
  const {klub}=useContext(KluboviContext);
  const handleCloseError = () => { setOpenError(false) };

  // Logika za dodavanje (Različita obrada za niz i za string)
  const dodajUListu = (vrednost, polje, tip) => {
    if (!vrednost || vrednost.trim() === "") return;
    const trimovanaVrednost = vrednost.trim();

    if (tip === 'niz') {
      // Obrada za takmicenja (Array)
      const trenutniNiz = Array.isArray(data[polje]) ? data[polje] : [];
      if (!trenutniNiz.includes(trimovanaVrednost)) {
        setData(prev => ({ ...prev, [polje]: [...trenutniNiz, trimovanaVrednost] }));
      }
    } else {
      // Obrada za klubove (String sa zapetama)
      const trenutnaLista = data[polje] ? data[polje].split(", ").filter(x => x !== "") : [];
      if (!trenutnaLista.includes(trimovanaVrednost)) {
        const novaLista = [...trenutnaLista, trimovanaVrednost].join(", ");
        setData(prev => ({ ...prev, [polje]: novaLista }));
      }
    }
  };

  const ukloniIzListe = (vrednost, polje, tip) => {
    if (tip === 'niz') {
      setData(prev => ({
        ...prev,
        [polje]: data[polje].filter(stavka => stavka !== vrednost)
      }));
    } else {
      const novaLista = data[polje]
        .split(", ")
        .filter(stavka => stavka !== vrednost)
        .join(", ");
      setData(prev => ({ ...prev, [polje]: novaLista }));
    }
  };

  const validacija = () => {
    // Provera obaveznih polja pre slanja
    if (!data.ime || !data.prezime || !data.pozicija || !data.visina || !data.tezina) {
      setOpenError(true);
      return;
    }
    onSubmit();
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '900px', boxSizing: 'border-box' }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          backgroundColor: '#111',
          border: '1px solid #333',
          borderRadius: 4,
          p: { xs: 2, sm: 5 },
          color: '#fff',
          boxSizing: 'border-box',
          maxHeight: '90vh',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { background: '#ff7900', borderRadius: '10px' }
        }}
      >
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', fontFamily: "'Orbitron', sans-serif", color: '#ff7900' }}>
          {podtip === 'add' ? 'DODAVANJE NOVOG IGRAČA' : 'IZMENA PODATAKA IGRAČA'}
        </Typography>

        <Stack spacing={3}>
          {/* IME I PREZIME */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField fullWidth label="Ime" value={data?.ime || ''} onChange={(e) => setData(prev => ({ ...prev, ime: e.target.value }))} sx={textFieldStyle} />
            <TextField fullWidth label="Prezime" value={data?.prezime || ''} onChange={(e) => setData(prev => ({ ...prev, prezime: e.target.value }))} sx={textFieldStyle} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            {/* SELEKT ZA POZICIJU */}
            <FormControl fullWidth sx={textFieldStyle}>
              <InputLabel>Pozicija</InputLabel>
              <Select
                value={data?.pozicija || ''}
                label="Pozicija"
                onChange={(e) => setData(prev => ({ ...prev, pozicija: e.target.value }))}
              >
                {klub.sport==1 && fudbalskePozicije.map((poz) => (
                  <MenuItem key={poz} value={poz}>{poz}</MenuItem>
                ))}
                {klub.sport==2 && kosarkaskePozicije.map((poz) => (
                  <MenuItem key={poz} value={poz}>{poz}</MenuItem>
                ))}
                {klub.sport==3 && vaterpoloPozicije.map((poz) => (
                  <MenuItem key={poz} value={poz}>{poz}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth type="number" label="Broj godina" value={data?.brojGodina || ''} onChange={(e) => setData(prev => ({ ...prev, brojGodina: e.target.value }))} sx={textFieldStyle} />
          </Box>

          {/* FIZIČKE KARAKTERISTIKE */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField fullWidth type="number" label="Visina (cm)" value={data?.visina || ''} onChange={(e) => setData(prev => ({ ...prev, visina: e.target.value }))} sx={textFieldStyle} />
            <TextField fullWidth type="number" label="Težina (kg)" value={data?.tezina || ''} onChange={(e) => setData(prev => ({ ...prev, tezina: e.target.value }))} sx={textFieldStyle} />
          </Box>

          {/* DATUMI (Validni format YYYY-MM-DD) */}
          <Divider sx={{ borderColor: '#222' }}> <Typography variant="caption" sx={{ color: '#444' }}>DATUMI</Typography> </Divider>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <TextField fullWidth type="date" label="Datum rođenja" InputLabelProps={{ shrink: true }} value={data?.datumRodjenja || ''} onChange={(e) => setData(prev => ({ ...prev, datumRodjenja: e.target.value }))} sx={textFieldStyle} />
            <TextField fullWidth type="date" label="Početak ugovora" InputLabelProps={{ shrink: true }} value={data?.datumPocetkaUgovora || ''} onChange={(e) => setData(prev => ({ ...prev, datumPocetkaUgovora: e.target.value }))} sx={textFieldStyle} />
            <TextField fullWidth type="date" label="Kraj ugovora" InputLabelProps={{ shrink: true }} value={data?.datumKrajaUgovora || ''} onChange={(e) => setData(prev => ({ ...prev, datumKrajaUgovora: e.target.value }))} sx={textFieldStyle} />
          </Box>

          {/* TAKMIČENJA (LISTA STRINGOVA) */}
          {podtip!='Izmeni postojećeg igrača kluba'&&(
          <Box sx={{ p: 2, border: '1px solid #222', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#ff7900' }}>TAKMIČENJA:</Typography>
            <FormControl fullWidth sx={textFieldStyle}>
              <InputLabel>Odaberi takmičenje</InputLabel>
              <Select
                value=""
                label="Odaberi takmičenje"
                onChange={(e) => dodajUListu(e.target.value, 'takmicenja', 'niz')}
              >
                {dostupnaTakmicenja?.map((t, idx) => (
                  <MenuItem key={idx} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {Array.isArray(data.takmicenja) && data.takmicenja.map((t, i) => (
                <Chip key={i} label={t} onDelete={() => ukloniIzListe(t, 'takmicenja', 'niz')} sx={chipStyle} />
              ))}
            </Box>
          </Box>)}

          {/* ISTORIJA KLUBOVA (STRING SA ZAPETAMA) */}
          <Box sx={{ p: 2, border: '1px solid #222', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#ff7900' }}>ISTORIJA KLUBOVA</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField fullWidth size="small" label="Unesi naziv kluba" value={noviKlub} onChange={(e) => setNoviKlub(e.target.value)} sx={textFieldStyle} />
              <IconButton onClick={() => { dodajUListu(noviKlub, 'listaKlubova', 'string'); setNoviKlub(""); }} sx={{ backgroundColor: '#ff7900', "&:hover": { backgroundColor: '#fff' } }}>
                <AddCircleOutlineIcon sx={{ color: '#000' }} />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {data.listaKlubova?.split(", ").filter(x => x !== "").map((k, i) => (
                <Chip key={i} label={k} onDelete={() => ukloniIzListe(k, 'listaKlubova', 'string')} sx={chipStyle} />
              ))}
            </Box>
          </Box>

          <Button fullWidth variant="contained" startIcon={<PersonAddIcon />} onClick={validacija} sx={submitButtonStyle}>
            {podtip === 'add' ? 'DODAJ IGRAČA' : 'SAČUVAJ IZMENE'}
          </Button>
        </Stack>

        <Snackbar open={openError} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
            Niste popunili obavezna polja!
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.02)",
    "& fieldset": { borderColor: "#222" },
    "&:hover fieldset": { borderColor: "#444" },
    "&.Mui-focused fieldset": { borderColor: "#ff7900" },
  },
  "& .MuiInputLabel-root": { color: "#555" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ff7900" },
  "& .MuiSvgIcon-root": { color: "#ff7900" },
  "& .MuiOutlinedInput-input": {
    "&::-webkit-calendar-picker-indicator": { filter: "invert(1)" }
  }
};

const chipStyle = {
  backgroundColor: 'rgba(255,121,0,0.1)',
  color: '#ff7900',
  border: '1px solid #ff7900',
  '& .MuiChip-deleteIcon': { color: '#ff7900', '&:hover': { color: '#fff' } }
};

const submitButtonStyle = {
  py: 2,
  backgroundColor: "#ff7900",
  color: "#000",
  fontWeight: "bold",
  fontSize: '1.1rem',
  borderRadius: 2,
  "&:hover": { backgroundColor: "#fff", transform: 'scale(1.01)' },
  transition: 'all 0.3s ease'
};

export default AddOrEditIgrac;