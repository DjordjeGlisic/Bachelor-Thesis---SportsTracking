import React, { useContext, useEffect, useState } from 'react';
import {
  Box, TextField, Button, Stack, Typography, Avatar, 
  Paper, Snackbar, Alert, MenuItem, Select, FormControl, InputLabel, Chip, OutlinedInput
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SportsIcon from '@mui/icons-material/Sports';
import { Context } from '../Context/Context';
import axios from 'axios';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ModalPage from '../modalWrappers/ModalPage';
const AddOrEditKlub = ({ data, setData, onSubmit, setSelectedFile, podtip }) => {
  const [openSnack,setOpenSnack] = useState(false);
  const[tip,setTip]=useState(null);
  const[poruka,setPoruka]=useState('');
  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    if (event) {
    event.stopPropagation();
  }

    setOpenSnack(false);
  };
   const [openAddModal,setOpenAddModal] = useState(false);
  const {letters,sport,korisnik} = useContext(Context);
  const  [idTakmicenja,setIdTakmicenja]=useState(-1);
  const [kliknutUcinak,setKliknutUcinak] = useState( {
    nazivTabele : null,
    sezona: null,

  });
  const handleEditUcinak = (comp) => {
    let pom = {
      nazivTabele:comp.nazivTabele,
      sezona: comp.sezona
    };
    setKliknutUcinak(pom);
    setIdTakmicenja(comp.idTakmicenja);
    setOpenAddModal(true);
   
  }
  const pribaviUcinkeKluba = (id) => {
    axios.get(`http://localhost:5146/Admin/VratiUcinkeKluba/${id}`)
    .then(res=>{
      setData(prevState => ({
        ...prevState,
        listaUcinaka: res.data,
      }));
    })
    .catch((err)=>{
      setTip("error");
      setPoruka("Neuspešno pribavljeni učinci u takmiečenjima za klub "+err);
      setOpenSnack(true);

    })
  }
  useEffect(()=>{
    let noviKlub =  podtip === "Dodaj Novi Klub" ? true : false;
    if(!noviKlub)
      pribaviUcinkeKluba(data.id);

  },[])
  const handleDelete = (nazivTabele,sezona) => {
    setData(prev => ({
      ...prev,
      listaUcinaka: data.listaUcinaka.filter((comp) => comp.nazivTabele !== nazivTabele || comp.sezona !== sezona)

    }))
    
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '850px', boxSizing: 'border-box' }}>
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
          overflowY: 'auto'
        }}
      >
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', letterSpacing: 1 }}>
          {podtip }
        </Typography>

        <Stack spacing={3}>
          
          {/* Naziv Kluba */}
          {podtip != "Izmeni Takmičenja Kluba" &&
          (<TextField
            fullWidth
            label="Naziv kluba"
            value={data?.naziv || ''}
            onChange={(e) => setData(prev => ({ ...prev, naziv: e.target.value }))}
            sx={textFieldStyle}
          />)}

          {/* Login Kredencijali */}
            {podtip != "Izmeni Takmičenja Kluba" &&
          (
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Email"
              value={data?.email || ''}
              onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
              sx={textFieldStyle}
            />
            <TextField
              fullWidth
              type="password"
              label="Šifra"
              value={data?.lozinka || ''}
              onChange={(e) => setData(prev => ({ ...prev, lozinka: e.target.value }))}
              sx={textFieldStyle}
            />
          </Box>)}
          {podtip != "Izmeni osnovne podatke" &&
          (<>
          <Box sx={{ width: '100%', mt: 2, mb: 3 }}>
      {/* Dugme iznad box-a */}
      <Button
        startIcon={<AddCircleOutlineIcon />}
        sx={{
          color: '#ff8a00',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          mb: 1,
          '&:hover': { backgroundColor: 'rgba(255, 138, 0, 0.08)' },
        }}
        onClick={()=>{
          setKliknutUcinak({
            nazivTabele : null,
            sezona: null,
          });
          setIdTakmicenja(-1);
           setOpenAddModal(true);
        }}
      >
        Pridruži takmičenje klubu
      </Button>
        {/* Box sa Chip-ovima */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#121212', // Tamna pozadina kao na slici
            border: '1px solid #333',
            borderRadius: '8px',
            minHeight: '80px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          { (data.listaUcinaka && data.listaUcinaka.length > 0) ? (
            data.listaUcinaka.map((comp) => (
              <Chip
                key={comp.nazivTabele+comp.sezona}
                label={`${comp.nazivTabele} -- ${comp.sezona} `}
                onDelete={() => handleDelete(comp.nazivTabele,comp.sezona)}
                onClick={()=>{handleEditUcinak(comp);}}
                sx={{
                  bgcolor: '#262626',
                  color: '#e0e0e0',
                  border: '1px solid #444',
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: '#888',
                    '&:hover': { color: '#ff4d4d' },
                  },
                  '&:hover': {
                    borderColor: '#ff8a00',
                    bgcolor: '#2d2d2d',
                  },
                }}
              />
            ))
          ) : (
            <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', m: 'auto' }}>
              Nema povezanih takmičenja
            </Typography>
          )}
        </Box>
      </Box>
      </>)}
      {/* Sekcija za Logo/Sliku */}
       {podtip != "Izmeni Takmičenja Kluba" &&
      (
      <Box sx={{ 
            p: 3, 
            border: "1px solid #333", 
            borderRadius: 2,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
            backgroundColor: 'rgba(255,255,255,0.02)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar 
                src={data ? data.logo : ''} 
                variant="rounded" 
                sx={{ width: 100, height: 100, border: '1px solid #444' }}
              >
                {(!data || !data.logo ) && <CloudUploadIcon fontSize="large" />}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>Vizuelni identitet</Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>Ova slika će biti prikazana kao logo kluba</Typography>
              </Box>
            </Box>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ 
                borderColor: '#444', 
                color: '#fff',
                px: 4,
                "&:hover": { borderColor: '#ff7900', color: '#ff7900' }
              }}
            >
              OTPREMI NOVU SLIKU
             <input type="file" hidden accept="image/*" onChange={(e) => {
                setSelectedFile( e.target.files[0] );
                if(e.target.files[0]) setData(prev => ({ ...prev,logo: URL.createObjectURL(e.target.files[0]) }) );
              }} />
            </Button>
          </Box>)}
      <Button
          fullWidth
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={false}
          onClick={(e)=>
              {
                    e.preventDefault();
                   onSubmit();

              }}
          sx={{
              bgcolor: '#f57c00',
              '&:hover': { bgcolor: '#e65100' },
              fontWeight: 'bold',
              py: 1.5
          }}
      >
         {podtip}
      </Button>
      </Stack>
      </Paper>
        <ModalPage 
          open = {openAddModal}
          onClose = {()=>{setOpenAddModal(false)}}
          data = {data}
          setData = {setData}
          tip = {"UcinakKlubaZaTakmicenje"}
          podtip = {"Dodaj učinak kluba u takmičenju"}
          sport = {data.sport ? data.sport : sport}
          kliknutUcinak = {kliknutUcinak}
          idTakmicenja={idTakmicenja}
        />
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
};

// Isti stil kao u modelu
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
  "& .MuiSvgIcon-root": { color: "#ff7900" }, // Boja strelice u selectu
};

export default AddOrEditKlub;