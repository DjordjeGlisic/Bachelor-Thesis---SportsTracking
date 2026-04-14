import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Autocomplete, Snackbar, Alert } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SaveIcon from '@mui/icons-material/Save';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AddNewMatch({ open, data, setData, labelKolo, onDodavanje, podtip, izborKlubova }) {
  
  const klubovi = izborKlubova ?? [];
  const domacinObj = klubovi.find(k => k.naziv === data?.domacin) ?? null;
  const gostObj    = klubovi.find(k => k.naziv === data?.gost)    ?? null;
  const [openSnack,setOpenSnack] = useState(false);
  const [tip,setTip] = useState(null);
  const [poruka,setPoruka] = useState('');
  const handleCloseSnack = () => setOpenSnack(false);
  const dodajUtakmicuHandler = () =>{
    if(!data.domacin || data.domacin.trim().length === 0
        || !data.gost || data.gost.trim().length === 0 )
    {
        setTip("error");
        setPoruka("Niste uneli domacina ili gosta ili oba");
        setOpenSnack(true);
        return;
    }
    if(!data.datum || data.datum.trim().length === 0)
    {
        setTip("error");
        setPoruka("Niste uneli datum početka utakmice");
        setOpenSnack(true);
        return;
    }
     if(!data.lokacija || data.lokacija.trim().length === 0)
    {
        setTip("error");
        setPoruka("Niste uneli lokaciju gde bi se  igrala utakmica");
        setOpenSnack(true);
        return;
    }
    onDodavanje();
  }

  return (
   
      <Box sx={{ maxWidth: 850, margin: "auto", backgroundColor: "#0a0a0a", borderRadius: "20px", border: "1px solid #1a1a1a", p: 5, color: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.7)", backgroundImage: "radial-gradient(ellipse at top left, rgba(255,122,0,0.04) 0%, transparent 60%)", maxHeight: "90vh", overflowY: "auto", "&::-webkit-scrollbar": { width: "6px" }, "&::-webkit-scrollbar-track": { background: "transparent" }, "&::-webkit-scrollbar-thumb": { background: "rgba(255,122,0,0.4)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255,122,0,0.7)" } }}>

        <Typography variant="h5" sx={headerTitleStyle}>{podtip.toUpperCase()}</Typography>
        <Box sx={{ height: '1px', background: 'linear-gradient(to right, rgba(255,122,0,0.4), transparent)', mb: 4 }} />

        <Typography variant="caption" sx={{ color: '#555', letterSpacing: 2, textTransform: 'uppercase', display: 'block', mb: 1.5 }}>Takmičenje</Typography>
        <Box sx={{ border: "1px solid #1e1e1e", borderRadius: "14px", p: 3, mb: 4, backgroundColor: "rgba(255,122,0,0.03)" }}>
          <Grid container spacing={2}>
            <Grid item xs={5}><TextField fullWidth label="Naziv takmičenja" value={data?.takmicenjeNaziv ?? ''} InputProps={{ readOnly: true }} sx={readOnlyStyles} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Tip kola" value={labelKolo ?? ''} InputProps={{ readOnly: true }} sx={readOnlyStyles} /></Grid>
            <Grid item xs={3}><TextField fullWidth label="Broj kola" value={data?.brojKola ?? ''} InputProps={{ readOnly: true }} sx={readOnlyStyles} /></Grid>
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <GroupsIcon sx={{ color: '#ff7a00', fontSize: 18 }} />
          <Typography variant="caption" sx={{ color: '#ff7a00', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Timovi</Typography>
        </Box>

        <Box sx={teamBoxStyle}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#ff7900', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>🏠 Domaćin</Typography>
            {data?.domacin && (
              <Typography variant="caption" sx={{ color: '#ff7a00', backgroundColor: 'rgba(255,122,0,0.1)', border: '1px solid rgba(255,122,0,0.2)', px: 1.5, py: 0.3, borderRadius: '20px', fontSize: '0.7rem' }}>{data.domacin}</Typography>
            )}
          </Box>
          <Autocomplete
            fullWidth
            options={klubovi.filter(k => k.naziv !== data?.gost)}
            getOptionLabel={(option) => typeof option === 'string' ? option : (option?.naziv ?? '')}
             getOptionKey={(option) => option?.id ?? option?.naziv} 
            value={domacinObj}
            onChange={(_, newValue) => setData({ ...data, domacin: newValue?.naziv ?? '' })}
            isOptionEqualToValue={(option, value) => option?.naziv === value?.naziv}
            sx={autocompleteStyle}
            renderInput={(params) => <TextField {...params} label="Pronađi klub po nazivu..." variant="outlined" fullWidth />}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1.5 }}>
          <Box sx={{ flex: 1, height: '1px', backgroundColor: '#1a1a1a' }} />
          <Box sx={{ px: 2, py: 0.5, border: '1px solid #333', borderRadius: '20px', backgroundColor: '#111' }}>
            <Typography sx={{ color: '#444', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2 }}>VS</Typography>
          </Box>
          <Box sx={{ flex: 1, height: '1px', backgroundColor: '#1a1a1a' }} />
        </Box>

        <Box sx={{ ...teamBoxStyle, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#ff7900', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>✈️ Gost</Typography>
            {data?.gost && (
              <Typography variant="caption" sx={{ color: '#ff7a00', backgroundColor: 'rgba(255,122,0,0.1)', border: '1px solid rgba(255,122,0,0.2)', px: 1.5, py: 0.3, borderRadius: '20px', fontSize: '0.7rem' }}>{data.gost}</Typography>
            )}
          </Box>
          <Autocomplete
            fullWidth
            options={klubovi.filter(k => k.naziv !== data?.domacin)}
            getOptionLabel={(option) => typeof option === 'string' ? option : (option?.naziv ?? '')}
             getOptionKey={(option) => option?.id ?? option?.naziv} 
            value={gostObj}
            onChange={(_, newValue) => setData({ ...data, gost: newValue?.naziv ?? '' })}
            isOptionEqualToValue={(option, value) => option?.naziv === value?.naziv}
            sx={autocompleteStyle}
            renderInput={(params) => <TextField {...params} label="Pronađi klub po nazivu..." variant="outlined" fullWidth />}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <LocationOnIcon sx={{ color: '#ff7a00', fontSize: 18 }} />
          <Typography variant="caption" sx={{ color: '#ff7a00', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Detalji meča</Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 5 }}>
          <Grid item xs={6}>
         <TextField
            fullWidth
            label="Datum i vreme početka"
            type="datetime-local"
            // Ovo je bitno da bi labela uvek bila gore i ne bi se preklapala sa datumom
            InputLabelProps={{ shrink: true }} 
            value={data?.datum ?? ''}
            onChange={(e) => setData({ ...data, datum: e.target.value })}
            sx={{
                ...editableStyles, // Tvoj osnovni stil
                "& .MuiInputBase-input": {
                color: "white !important", // SADRŽAJ JE SADA 100% BEO
                WebkitTextFillColor: "white !important",
                },
                // Boja ikonice kalendara unutar polja
                "& input::-webkit-calendar-picker-indicator": {
                filter: "invert(1)", // Pretvara crnu ikonicu u belu
                cursor: "pointer"
                }
            }}
            />
  </Grid>
  <Grid item xs={6}>
    <TextField
      fullWidth
      label="Lokacija (Stadion)"
      placeholder="Unesite naziv stadiona..."
      value={data?.lokacija ?? ''}
      onChange={(e) => setData({ ...data, lokacija: e.target.value })}
      sx={editableStyles}
    />
  </Grid>
</Grid>

        <Box sx={{ height: '1px', background: 'linear-gradient(to right, rgba(255,122,0,0.3), transparent)', mb: 4 }} />

        <Button fullWidth variant="contained" startIcon={<SaveIcon />} sx={submitButtonStyle} onClick={dodajUtakmicuHandler}>
          SAČUVAJ UTAKMICU
        </Button>
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
      </Box>
    
  );
}

const readOnlyStyles = { "& .MuiOutlinedInput-root": { color: "#666", "& fieldset": { borderColor: "#1e1e1e" }, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "10px" }, "& .MuiInputLabel-root": { color: "#444" } };
const editableStyles = { "& .MuiOutlinedInput-root": { color: "white", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "10px", "& fieldset": { borderColor: "#2a2a2a" }, "&:hover fieldset": { borderColor: "#ff7a00" }, "&.Mui-focused fieldset": { borderColor: "#ff7a00", borderWidth: '2px' } }, "& .MuiInputLabel-root": { color: "#666" }, "& .MuiInputLabel-root.Mui-focused": { color: "#ff7a00" } };
const datePickerStyles = { "& .MuiOutlinedInput-root": { color: "#ffffff", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "10px", "& fieldset": { borderColor: "#2a2a2a" }, "&:hover fieldset": { borderColor: "#ff7a00" }, "&.Mui-focused fieldset": { borderColor: "#ff7a00", borderWidth: '2px' } }, "& .MuiInputBase-input": { color: "#ffffff !important", WebkitTextFillColor: "#ffffff !important", opacity: "1 !important" }, "& .MuiInputLabel-root": { color: "#666" }, "& .MuiInputLabel-root.Mui-focused": { color: "#ff7a00" }, "& .MuiSvgIcon-root": { color: "#ff7a00" }, "& .MuiInputAdornment-root button": { color: "#ff7a00" } };
const autocompleteStyle = { "& .MuiOutlinedInput-root": { color: "white", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "10px", "& fieldset": { borderColor: "#2a2a2a" }, "&:hover fieldset": { borderColor: "#ff7a00" }, "&.Mui-focused fieldset": { borderColor: "#ff7a00", borderWidth: '2px' } }, "& .MuiInputLabel-root": { color: "#666" }, "& .MuiInputLabel-root.Mui-focused": { color: "#ff7a00" }, "& .MuiAutocomplete-endAdornment .MuiSvgIcon-root": { color: "#ff7900" }, "& .MuiAutocomplete-input": { color: "#fff" } };
const teamBoxStyle = { p: 3, border: '1px solid #1e1e1e', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.015)', transition: 'border-color 0.3s ease, background-color 0.3s ease', '&:hover': { borderColor: 'rgba(255,122,0,0.2)', backgroundColor: 'rgba(255,122,0,0.02)' } };
const submitButtonStyle = { py: 1.5, bgcolor: '#ff7900', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#fff' }, transition: '0.3s' };
const headerTitleStyle = { mb: 3, fontWeight: 'bold', fontFamily: "'Orbitron', sans-serif", color: '#ff7900', display: 'flex', alignItems: 'center', gap: 2 };
const datePickerCustomStyles = `
  .custom-datepicker-wrapper {
    width: 100%;
  }
  .custom-datepicker {
    width: 100% !important;
    height: 56px !important; /* Standardna MUI visina */
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.23) !important; /* Boja MUI border-a */
    border-radius: 4px !important;
    padding: 16.5px 14px !important; /* Standardni MUI padding */
    color: white !important;
    font-size: 1rem !important;
    font-family: "Roboto","Helvetica","Arial",sans-serif;
    box-sizing: border-box;
    transition: border-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .custom-datepicker:hover {
    border-color: #ffffff !important;
  }
  .custom-datepicker:focus {
    outline: none !important;
    border: 2px solid #ffffff !important; /* Deblji border na fokus */
    padding: 15.5px 13px !important; /* Kompenzacija za deblji border */
  }
  /* Stilizovanje samog kalendara (pop-up) da bude taman */
  .react-datepicker {
    background-color: #1e1e1e !important;
    border: 1px solid #333 !important;
    color: white !important;
  }
  .react-datepicker__header {
    background-color: #2a2a2a !important;
    border-bottom: 1px solid #333 !important;
  }
  .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name {
    color: white !important;
  }
  .react-datepicker__day:hover {
    background-color: #ff8c00 !important; /* Narandžasta na hover (kao tvoj button) */
  }
  .react-datepicker__day--selected {
    background-color: #ff8c00 !important;
  }
`;