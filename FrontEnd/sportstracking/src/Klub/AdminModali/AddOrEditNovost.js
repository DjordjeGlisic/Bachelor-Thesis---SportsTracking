import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Stack, Typography, Avatar, 
  IconButton, Paper,
  Snackbar,
  Alert
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";


const AddOrEditNovost = ({ data,setData, onSubmit, onClose, selectedFile, setSelectedFile,podtip }) => {
const [openError,setOpenError] = useState(false);
const handleCloseError = () => {setOpenError(false)};

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '850px', boxSizing: 'border-box' }}> 
    

      {/* 2. Glavna forma */}
      <Paper 
        elevation={0}
        sx={{
          width: '100%',
          backgroundColor: '#111',
          border: '1px solid #333', // Suptilnija granica
          borderRadius: 4,
          p: { xs: 2, sm: 5 }, // Više paddinga na desktopu
          color: '#fff',
          boxSizing: 'border-box',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', letterSpacing: 1 }}>
          UREDI SADRŽAJ VESTI
        </Typography>

        <Stack spacing={3}>
          {/* Naslov i Autor */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Naslov vesti"
              name="naslov"
              value={data ? data.naslov : ''}
              onChange={(e) => setData(prev => ({ ...prev,naslov: e.target.value }) )}
              sx={textFieldStyle}
            />
            <TextField
              fullWidth
              label="Autor"
              name="autor"
              value={data ? data.autor : ''}
              onChange={(e) => setData(prev => ({ ...prev,autor: e.target.value }) )}
              sx={textFieldStyle}
            />
          </Box>

          {/* Sažetak - malo veći */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Kratak sažetak"
            name="sazetak"
            value={data ? data.sazetak : ''}
            onChange={(e) => setData(prev => ({ ...prev,sazetak: e.target.value }) )}
            sx={textFieldStyle}
          />

          {/* TEKST VESTI - MAKSIMALNO PROŠIREN */}
          <TextField
            fullWidth
            multiline
            rows={12} // Značajno više redova
            label="Kompletan tekst vesti"
            name="vest"
            value={data ? data.vest : ''}
            onChange={(e) => setData(prev => ({ ...prev,vest: e.target.value }) )}
            sx={textFieldStyle}
            placeholder="Unesite detaljan opis vesti ovde..."
          />

          {/* Sekcija za sliku */}
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
                src={data ? data.slika : ''} 
                variant="rounded" 
                sx={{ width: 100, height: 100, border: '1px solid #444' }}
              >
                {(!data || !data.slika ) && <CloudUploadIcon fontSize="large" />}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>Vizuelni identitet</Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>Ova slika će biti prikazana na kartici vesti</Typography>
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
                if(e.target.files[0]) setData(prev => ({ ...prev,slika: URL.createObjectURL(e.target.files[0]) }) );
              }} />
            </Button>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={(e) => {
              if(data.autor=='' || data.naslov=='' || data.sazetak==''||data.vest=='')
              {
                setOpenError(true);
                return;
              }
              onSubmit();
            }}
            sx={{
              py: 2,
              backgroundColor: "#ff7900",
              color: "#000",
              fontWeight: "bold",
              fontSize: '1.1rem',
              borderRadius: 2,
              mt: 2,
              "&:hover": { backgroundColor: "#fff", transform: 'scale(1.01)' },
              transition: 'all 0.3s ease'
            }}
          >
            {podtip.toUpperCase()}
          </Button>
        </Stack>
         <Snackbar open={openError} autoHideDuration={6000} onClose={handleCloseError}>
            <Alert
              onClose={handleCloseError}
              severity={'error'}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {"Niste popunili sva polja!"}
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
};

export default AddOrEditNovost;