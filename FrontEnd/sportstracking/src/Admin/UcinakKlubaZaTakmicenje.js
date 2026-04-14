import React, { useState,useContext, useEffect } from 'react';
import {
  Box, TextField, Button, Stack, Typography, Paper,
  Snackbar, Alert, IconButton, Chip, Divider,
  Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Context, KluboviContext } from '../Context/Context'; 
import axios from 'axios';

const UcinakKlubaZaTakmicenje = ({ data, setData, podtip,kliknutUcinak,idTakmicenja=-1,  onClose}) => {
  const {sport} =  useContext(Context);
  const [openSuccess, setOpenSuccess] = useState(false);
  const handleCloseSuccess = () => { setOpenSuccess(false) };
   const [openError, setOpenError] = useState(false);
  const handleCloseError = () => { setOpenError(false) };
  const [takmicenja,setTakmicenja ] = useState([]);
  const [takmicenje,setTakmicenje] = useState(null);
  const [sezona,setSezona] = useState(null);
  const [ucinak,setUcinak] = useState(null);
  useEffect(()=>{
    axios.get(`http://localhost:5146/Admin/VratiTakmicenjaSportaSaUcincima/${sport}`)
    .then((res)=>{
        setTakmicenja(res.data);
        if(!kliknutUcinak)
            setTakmicenje(res.data[0]);
        else
        {
            let takm = res.data.find(el=> el.id == idTakmicenja ); 
            setTakmicenje(takm);
            setSezona(kliknutUcinak.sezona);
            setUcinak(kliknutUcinak.nazivTabele);
        }
        
    })
    .catch((err)=>{
        console.error(err);
    })

  },[sport])
  const dodajUcinkeKlubu = () => {
    if(!takmicenje || !sezona || !ucinak)
    {
        setOpenError(true);
        return;
    }
    const exists = ( data && data.listaUcinaka && kliknutUcinak.nazivTabele && data.listaUcinaka.length > 0 && data.listaUcinaka.some(t => t.nazivTabele === kliknutUcinak.nazivTabele && t.sezona == kliknutUcinak.sezona) ) ? true : false;
    if(exists)
    {
        
        setData(prevData => ({
        ...prevData,
        listaUcinaka: prevData.listaUcinaka.map(t =>
            t.nazivTabele === ucinak && t.sezona === sezona ? { ...t, ...{
                idUcinka : -1,
                idTakmicenja: takmicenje.id,
                nazivTakmicenja: takmicenje.nazivTakmicenja,
                nazivTabele: ucinak,
                sezona: sezona
                
            } } : t
        )
        }));
    }
    else
    {
        let postojiUcinak = data.listaUcinaka.find((el)=> el.nazivTabele == ucinak && el.sezona == sezona && el.idTakmicenja == takmicenje.id  ) ? true : false;
        if(!postojiUcinak)
        {
            setData(prevData => ({
                ...prevData,
                listaUcinaka: [...prevData.listaUcinaka, {
        
                    idUcinka: -1,
                    idTakmicenja: takmicenje.id,
                    nazivTakmicenja: takmicenje.nazivTakmicenja,
                    nazivTabele: ucinak,
                    sezona: sezona
                    
                }]
            }))
        }

    }
    setOpenSuccess(true);
    setTimeout(()=>{
        onClose();
    },1500)
  }

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
          {podtip}
        </Typography>

        <Stack spacing={3}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            {/* SELEKT ZA TAKMICENJE */}
            <FormControl fullWidth sx={textFieldStyle}>
              <InputLabel>Dostupna Takmičenja </InputLabel>
              <Select
                value={takmicenje?.nazivTakmicenja || ''}
                label="Takmičenje"
                onChange={(e) => {
                    setTakmicenje( takmicenja.find(t => t.nazivTakmicenja === e.target.value) )
                    setSezona( takmicenja.find(t => t.nazivTakmicenja === e.target.value).listaUcinaka[0].sezona )
                }}
              >
                {takmicenja.length > 0  && takmicenja.map((takm) => (
                  <MenuItem key={takm.id} value={takm.nazivTakmicenja}>{takm.nazivTakmicenja}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {takmicenje && (<Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            {/* SELEKT ZA SEZONU */}
            <FormControl fullWidth sx={textFieldStyle}>
              <InputLabel>Dostupne Sezone u Takmičenju </InputLabel>
              <Select
                value={sezona || ''}
                label="Sezona u Takmičenju"
                onChange={(e) => {setSezona( e.target.value ); setUcinak(takmicenje?.listaUcinaka.find(u => u.sezona == e.target.value).nazivTabele)}}
              >
                {takmicenje?.listaUcinaka.length > 0  && takmicenje.listaUcinaka.map((ucn) => (
                  <MenuItem key={ucn.sezona} value={ucn.sezona}>{ucn.sezona}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>)}
            {takmicenje && sezona && (<Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            {/* SELEKT ZA Naziv tabele */}
            <FormControl fullWidth sx={textFieldStyle}>
              <InputLabel>Dostupne Tabele u Takmičenju Za Sezonu {sezona} </InputLabel>
              <Select
                value={ucinak || ''}
                label="Tabela u Takmičenju"
                onChange={(e) => setUcinak( e.target.value )}
              >
                {takmicenje.listaUcinaka.length > 0  && takmicenje.listaUcinaka.map((ucn) => (
                  <MenuItem key={ucn.nazivTabele} value={ucn.nazivTabele}>{ucn.nazivTabele}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>)}
          <Button fullWidth variant="contained" startIcon={<PersonAddIcon />} onClick={dodajUcinkeKlubu} sx={submitButtonStyle}>
            {"Sačuvaj učinak kluba"}
          </Button>
        </Stack>

        <Snackbar open={openSuccess} autoHideDuration={6000} onClose={handleCloseSuccess}>
          <Alert onClose={handleCloseSuccess} severity="success" variant="filled" sx={{ width: '100%' }}>
            Klub će dobiti prazan učinak u takmičenju {takmicenje ? takmicenje.nazivTakmicenja : ''} kada sačuvate izmene!
          </Alert>
        </Snackbar>
        <Snackbar open={openError} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
            Niste popunili sva polja u formi!
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

export default UcinakKlubaZaTakmicenje;