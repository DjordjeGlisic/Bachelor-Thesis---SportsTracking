import React, { useContext, useEffect, useState } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Chip, 
  Autocomplete, 
  Paper, 
  Divider,
  Stack,
  Button
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import SaveIcon from '@mui/icons-material/Save';
import { Context } from '../Context/Context';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteDialog from '../modalWrappers/DeleteDialog';

const AddOrEditSekcija = ({ 
    onClose,data,setData,onSubmit,onEdit,
    dodavanje ,podtip,setOpenSnack,setTip,setPoruka,ukloniPostojecuSekciju
}) => {
  const {sport} = useContext(Context);
  const [sviKlubovi, setSviKlubovi] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
 const deleteSekcijaHandler = () => {
    ukloniPostojecuSekciju();
    setOpenDeleteModal(false);
    onClose(); 
}
  const handleDelete = (idZaBrisanje) => {
    setData(prevData => ({
            ...prevData,
            klubovi: data.klubovi.filter((klub) => klub.id !== idZaBrisanje)
        }));
  };

  useEffect(()=>{
    axios.get(`http://localhost:5146/Admin/VratiPotencijalneUcesnikeSekcije/${sport}`)
    .then((res)=>{
        setSviKlubovi(res.data);
        setTip("success");
        setPoruka("Uspešno pribavljeni klubovi za sport ");
        setOpenSnack(true);
    })
    .catch((err)=>{
        setTip("error");
        setPoruka("Greška prilikom pribavljanja klubova",err);
        setOpenSnack(true);
        setSviKlubovi(null);

    })

  },[sport]);
 const handleAddKlub = (event, noviKlub) => {
  // 1. Provera da li je korisnik zapravo izabrao klub (da nije null)
  if (!noviKlub) return;

  setData((prev) => {
    // 2. Osigurač: proveri da li je klubovi niz
    const trenutniKlubovi = Array.isArray(prev.klubovi) ? prev.klubovi : [];

    // 3. Provera duplikata po ID-ju (bolje nego po nazivu)
    const vecPostoji = trenutniKlubovi.find(k => k.id === noviKlub.id);
    if (vecPostoji) return prev;

    // 4. Vrati novi objekat sa novim nizom
    return {
      ...prev,
      klubovi: [...trenutniKlubovi, noviKlub]
    };
  });
};

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '900px', mx: 'auto', p: 2 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          backgroundColor: '#111', 
          border: '1px solid #333', 
          borderRadius: 4, 
          p: { xs: 2, sm: 5 }, 
          color: '#fff',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* NASLOV U ORBITRON STILU */}
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4, 
            fontWeight: 'bold', 
            fontFamily: "'Orbitron', sans-serif", 
            color: '#ff7900', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}
        >
          <GroupsIcon fontSize="large" /> {podtip ? podtip.toUpperCase() : "UREDI SEKCIJU"}
        </Typography>

        <Stack spacing={4}>
          {/* NAZIV SEKCIJE */}
          <Box sx={sectionBoxStyle}>
            <TextField
              fullWidth
              label="Naziv sekcije (npr. Grupa A)"
              variant="outlined"
              value={data.nazivTabele}
              disabled={!dodavanje} 
              onChange={(e) => setData({...data, nazivTabele: e.target.value})}
              sx={textFieldStyle}
            />
          </Box>
           <Box sx={sectionBoxStyle}>
            <TextField
              fullWidth
              label="Sezona"
              variant="outlined"
              disabled={true} 
              value={data.sezona}
              onChange={(e) => setData({...data, sezona: e.target.value})}
              sx={textFieldStyle}
            />
          </Box>

          {/* DODAVANJE KLUBOVA */}
          <Box sx={sectionBoxStyle}>
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Typography variant="subtitle2" sx={{ color: '#ff7900', letterSpacing: 1 }}>
                PRETRAGA I DODAVANJE KLUBOVA
              </Typography>
              <Autocomplete
                options={sviKlubovi || []}
                getOptionLabel={(option) => option.naziv}
               onChange={(event, value) => {
                    handleAddKlub(event, value);
                }}
                sx={autocompleteStyle}
                renderInput={(params) => (
                    <TextField 
                    {...params} 
                    label="Pronađi klub po nazivu..." 
                    variant="outlined" 
                    />
                )}
                            />
            </Stack>
          </Box>

          {/* PRIKAZ DODATIH KLUBOVA (CHIPS) */}
          <Box sx={{ ...sectionBoxStyle, minHeight: '150px' }}>
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Typography variant="subtitle2" sx={{ color: '#ff7900', letterSpacing: 1 }}>
                UČESNICI U OVOJ SEKCIJI ({data.klubovi ? data.klubovi.length : 0})
              </Typography>
              
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255,121,0,0.02)', 
                  border: '1px dashed #444', 
                  borderRadius: 2,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                {data.klubovi && data.klubovi.length > 0 ? (
                  data.klubovi.map((klub) => (
                    <Chip
                      key={klub.id}
                      label={klub.naziv}
                      onDelete={() => handleDelete(klub.id)}
                      sx={chipStyle}
                    />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    Nema dodatih klubova u ovu sekciju.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={dodavanje ?onSubmit : onEdit}
                sx={{
                py: 1.5,
                bgcolor: '#ff7900',
                color: '#000',
                fontWeight: 'bold',
                fontFamily: "'Orbitron', sans-serif",
                '&:hover': { bgcolor: '#fff' },
                transition: '0.3s'
                }}
            >
                SAČUVAJ SEKCIJU
            </Button>

            {/* Prikazujemo dugme Obriši samo ako je u pitanju IZMENA (postoji nazivTabele) */}
            {!dodavanje && (
                <Button
                fullWidth
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setOpenDeleteModal(true)}
                sx={{
                    py: 1.5,
                    fontWeight: 'bold',
                    fontFamily: "'Orbitron', sans-serif",
                    bgcolor: '#d32f2f',
                    '&:hover': { bgcolor: '#b71c1c' }
                }}
                >
                OBRIŠI SEKCIJU
                </Button>
            )}
            </Stack>
        </Stack>
      </Paper>
        <DeleteDialog
            open = {openDeleteModal} 
            onClose = {()=>{
            setOpenDeleteModal(false);
            }}
            onConfirm = {(e)=>{e.preventDefault();deleteSekcijaHandler()}} 
            title = {"Da li ste sigurni da želite da obrišete sekciju"} 
            description = {"Brisanje sekcije će je trajno ukloniti iz baze podataka zajedno sa svim povezanim informacijama"} 
            loading = {false}
            content={"sekcija"}
        />
    </Box>
  );
};

// --- STILOVI DOSLEDNI TVOJIM OSTALIM FORMAMA ---

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.02)",
    "& fieldset": { borderColor: "#333" },
    "&:hover fieldset": { borderColor: "#444" },
    "&.Mui-focused fieldset": { borderColor: "#ff7900" },
  },
  "& .MuiInputLabel-root": { color: "#666" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ff7900" },
};

const autocompleteStyle = {
  ...textFieldStyle,
  "& .MuiAutocomplete-endAdornment .MuiSvgIcon-root": { color: "#ff7900" },
  "& .MuiAutocomplete-input": { color: "#fff" },
};

const chipStyle = {
  bgcolor: 'rgba(255,121,0,0.1)',
  color: '#ff7900',
  border: '1px solid #ff7900',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
  "& .MuiChip-deleteIcon": {
    color: "#ff7900",
    "&:hover": { color: "#fff" }
  }
};

const sectionBoxStyle = {
  display: 'flex', 
  flexDirection: 'column',
  gap: 2, 
  p: 3, 
  border: '1px solid #222', 
  borderRadius: 2,
  backgroundColor: 'rgba(255,255,255,0.01)'
};

export default AddOrEditSekcija;