import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Button, Stack, Typography, Avatar, 
  Paper, Divider, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, InputAdornment,
  Autocomplete
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SearchIcon from '@mui/icons-material/Search'; 
import PublicIcon from "@mui/icons-material/Public";
import { drzave } from '../modalWrappers/AllCountries';
import ModalPage from '../modalWrappers/ModalPage';
import axios from 'axios';

const AddOrEditTakmicenje = ({
  onClose, data, setData,
  onDodavanje, setSelectedFile, selectedFile,onIzmena,
  podtip, setOpenSnack, setTip, setPoruka
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const shouldHighlight = (klub) => {
    if (!searchTerm) return true;
    return klub.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const handleOpisChange = (e) => {
    setData({ ...data, opis: e.target.value });
  };

  const isOpisOverLimit = data && data.opis && data.opis.length > 50;
  /////////////////////SEKCIJA PODRŠKA////////////////////////
  const [openSekcijeModal,setOpenSekcijeModal] = useState(false);
  const [naslovDugmeta,setNaslovDugmeta] = useState("");
  const [dodavanje,setDodavanje] = useState(true);
  const vratiTrenutnuSezonu = () =>
  {
    const danas = new Date();
    const trenutnaGodina = danas.getFullYear();
    const trenutniMesec = danas.getMonth(); // 0-11 (Januar je 0, Avgust je 7)

    // Ako je mesec Avgust (7) ili kasnije
    if (trenutniMesec >= 7) {
        return `${trenutnaGodina}/${trenutnaGodina + 1}`;
    }
    
    return `${trenutnaGodina - 1}/${trenutnaGodina}`;
  }
  const [novaSekcija,setNovaSekcija] = useState(
    {
      nazivTabele: '',
      klubovi : [],
      sezona: vratiTrenutnuSezonu(),
    });
    const proveriFormatGodina = (input) => {
  // 1. Provera formata preko Regex-a
  const regex = /^(\d{4})\/(\d{4})$/;
  const match = input.match(regex);

  if (match) {
    // match[1] je prva grupa (prve 4 cifre)
    // match[2] je druga grupa (druge 4 cifre)
    const prvaGodina = parseInt(match[1]);
    const drugaGodina = parseInt(match[2]);

    // 2. Provera matematičkog uslova
    return drugaGodina === prvaGodina + 1;
  }

  return false;
};
const handleAddSekcija = () => {

  setData((prev) => {
    // 2. Osigurač: proveri da li je klubovi niz
    const trenutneSekcije = Array.isArray(prev.sekcije) ? prev.sekcije : [];

    // 3. Provera duplikata po ID-ju (bolje nego po nazivu)
    const vecPostoji = trenutneSekcije.find(s => s.nazivTabele === novaSekcija.nazivTabele && s.sezona === novaSekcija.sezona);
    if (vecPostoji)
    {
      setTip("error");
      setPoruka("Sekcija sa datim nazivom i sezonom već postoji u takmičenju.");
      setOpenSnack(true);
      return;
    }

    setTip("succes");
    setPoruka("Sekcija je dodata takmičenju.");
    setOpenSnack(true);
      setOpenSekcijeModal(false);
      setNovaSekcija(
          {
            nazivTabele: '',
            klubovi : [],
            sezona: '',
        }
        );

    return {
      ...prev,
      sekcije: [...trenutneSekcije, novaSekcija]
    };
  });
};
const promenaSekcijehandler = () =>{
   setData((prev) => {
    // 1. Proveravamo da li sekcija već postoji u nizu
    const postoji = prev.sekcije.find(
      (s) => s.nazivTabele === novaSekcija.nazivTabele && s.sezona === novaSekcija.sezona
    );
    const azuriraneSekcije = postoji 
      ? prev.sekcije.map((s) => 
          (s.nazivTabele === novaSekcija.nazivTabele && s.sezona === novaSekcija.sezona) 
          ? novaSekcija 
          : s
        )
      : prev.sekcije;

    return {
      ...prev,
      sekcije: azuriraneSekcije
    };
  });
    setTip("succes");
    setPoruka("Sekcija je uspešno ažurirana takmičenju.");
    setOpenSnack(true);
    setOpenSekcijeModal(false);
    setNovaSekcija(
        {
          nazivTabele: '',
          klubovi : [],
          sezona: '',
      }
      );

}
const handleDeleteSekcija = () => {
  setData((prev) => ({
        ...prev,
        sekcije: prev.sekcije.filter(s => s.nazivTabele !== novaSekcija.nazivTabele && s.sezona !== novaSekcija.sezona)
    }));
    setDodavanje(true);
    setNovaSekcija(
      {
        nazivTabele: '',
        klubovi : [],
        sezona: '',
    }
    );

}
  const novaSekcijaHandler = () => { 
    if(!novaSekcija.nazivTabele || novaSekcija.nazivTabele.trim().length === 0){
        setTip("error");
        setPoruka("Niste uneli naziv sekcije za takmičenje.");
        setOpenSnack(true);
        return;
      }
     if(!novaSekcija.sezona || !novaSekcija.sezona.trim().length === 0 || !proveriFormatGodina(novaSekcija.sezona)){
        setTip("error");
        setPoruka("Niste uneli validnu sezonu.");
        setOpenSnack(true);
        return;
      }
    if(!novaSekcija.klubovi || novaSekcija.klubovi.length === 0){
        setTip("error");
        setPoruka("Niste dodali nijedan klub u sekciju.");
        setOpenSnack(true);
        return;
      }
      handleAddSekcija();
  }
  /////////////////////////////PODRAŠKA ZA EDIT//////////////////////////////////////
  useEffect(()=>{
    setDodavanje(true);
    if(podtip ==="Promeni postojće takmičenje")
    {
      axios.get(`http://localhost:5146/Admin/VratiTakmicenje/${data.id}`)
      .then((res)=>{
        let obj = {
            id : data.id,
          naziv : res.data.naziv,
          logoURL :  res.data.logoURL,
          sport :  res.data.sport,
          opis : res.data.opis,
          drzava :  res.data.drzava,
          regularnoBr : res.data.regularnoBr,
          roundOf128Br : res.data.roundOf128Br,
          roundOf64Br : res.data.roundOf64Br,
          roundOf32Br : res.data.roundOf32Br,
          roundOf16Br : res.data.roundOf16Br,
          roundOf8Br : res.data.roundOf8Br,
          roundOf4Br :  res.data.roundOf4Br,
          roundOf2Br : res.data.roundOf2Br,
          sekcije: res.data.sekcije
        }
        setData(obj);
        setTip("success");
        setPoruka("Uspešno pribavljene informacije o takmičenju!");
        setOpenSnack(true);

      })
      .catch((err)=>{
        setTip("error");
        setPoruka("Greška prilikom pribavljanja detaljni informacija o takmičenju!",err);
        setOpenSnack(true);
      })
    }

  },[])
  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '950px', mx: 'auto', p: 2 }}>
      <Paper elevation={0} sx={paperStyle}>
        
        {/* NASLOV MODALA */}
        <Typography variant="h5" sx={headerTitleStyle}>
          <EmojiEventsIcon fontSize="large" /> {podtip.toUpperCase()}
        </Typography>

        <Stack spacing={3}>
          
         <Box sx={{ ...sectionBoxStyle, alignItems: 'stretch' }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <TextField
                fullWidth 
                label="Naziv takmičenja" 
                value={data && data.naziv ? data.naziv : ''}
                onChange={(e) => setData({...data, naziv: e.target.value})}
                sx={textFieldStyle}
              />
              {/* caption je sada apsolutan da ne gura visinu box-a */}
              <Typography variant="caption" sx={{ color: '#555', mt: 0.5, position: 'absolute', bottom: -18 }}>
                Unesite pun naziv sportskog prvenstva ili lige.
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: '#333', display: { xs: 'none', md: 'block' }, mx: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '240px', justifyContent: 'center' }}>
               <Avatar 
                  src={data ? data.logoURL : ''} 
                  variant="rounded" 
                  sx={{ width: 100, height: 100, border: '1px solid #444' }}
                >
                  {(!data || !data.logoURL ) && <CloudUploadIcon fontSize="large" />}
                </Avatar>
              <Button variant="outlined" component="label" size="small" sx={{ ...uploadButtonStyle, height: '40px' }}>
                OTPREMI LOGO
                <input type="file" hidden accept="image/*" onChange={(e) => {
                setSelectedFile( e.target.files[0] );
                if(e.target.files[0]) setData(prev => ({ ...prev,logoURL: URL.createObjectURL(e.target.files[0]) }) );
              }} />
              </Button>
            </Box>
          </Box>

          {/* DRUGI RED: DRŽAVA I OPIS */}
     <Box sx={{ ...sectionBoxStyle, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Autocomplete
              options={drzave}
              value={data && data.drzava ? data.drzava : ''}
              onChange={(event, newValue) => setData({ ...data, drzava: newValue })}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Država ili Kontinent" 
                  sx={textFieldStyle}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PublicIcon sx={{ color: '#ff7900' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
        </Box>

        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            // Uklonjen multiline da bi visina bila identična Autocomplete polju
            label="Kratak opis"
            value={data.opis ? data.opis : ''}
            onChange={handleOpisChange}
            error={isOpisOverLimit}
            sx={textFieldStyle}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: isOpisOverLimit ? '#f44336' : '#555' }}>
              {isOpisOverLimit ? "Limit 50!" : "Kratke info"}
            </Typography>
            {data.opis && (
              <Typography variant="caption" sx={{ color: isOpisOverLimit ? '#f44336' : '#555' }}>
                {data.opis.length}/50
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

          {/* SEKCIJE I KLUBOVI */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
              {data.sekcije && (
                <TextField
                  size="small"
                  placeholder="Pretraži klub..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#ff7900' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: '250px',
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      backgroundColor: "#1a1a1a",
                      "& fieldset": { borderColor: "#333" },
                      "&:hover fieldset": { borderColor: "#ff7900" },
                    }
                  }}
                />
              )}
              <Button startIcon={<AddCircleOutlineIcon />} sx={{ color: '#ff7900', fontWeight: 'bold' }} onClick={()=>{setNaslovDugmeta("Dodaj novu sekciju takmičenju");setOpenSekcijeModal(true);setDodavanje(true);}}>
                DODAJ SEKCIJU
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 600, tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1a1a1a' }}>
                    {data.sekcije && data.sekcije.map((sek, index) => (
                      <TableCell 
                        key={sek.id || index} 
                        onClick={() => {
                          setDodavanje(false);
                          setNaslovDugmeta("Izmeni sekciju takmičenju")
                          setNovaSekcija(sek); 
                          setOpenSekcijeModal(true); // Otvara modal
                        }}
                        sx={{ 
                          color: '#ff7900', 
                          fontWeight: 'bold', 
                          borderBottom: '2px solid #ff7900', 
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: '0.3s',
                          '&:hover': {
                            bgcolor: 'rgba(255, 121, 0, 0.1)', // Narandžasti hover na zaglavlje
                          }
                        }}
                      >
                        {sek.nazivTabele}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[0, 1, 2, 3].map((rowIndex) => (
                    <TableRow key={rowIndex}>
                      {data.sekcije && data.sekcije.map((sek, colIndex) => {
                        const klubObj = sek.klubovi[rowIndex];
                        const klubNaziv = klubObj?.naziv || "-";
                        const isVisible = klubNaziv ? shouldHighlight(klubNaziv) : true;
                        
                        return (
                          <TableCell 
                            key={colIndex} 
                            onClick={() => {
                              setDodavanje(false);
                              setNovaSekcija(sek); // Klik na bilo koje polje otvara tu sekciju
                              setOpenSekcijeModal(true);
                            }}
                            sx={{ 
                              color: isVisible ? '#bbb' : '#333', 
                              borderBottom: '1px solid #222', 
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: '0.2s',
                              backgroundColor: (searchTerm && isVisible && klubNaziv !== "-") 
                                ? 'rgba(255, 121, 0, 0.2)' 
                                : 'transparent',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.05)', // Suptilni sivi hover na ćeliju
                                color: '#ff7900' // Tekst postaje narandžast na hover
                              }
                            }}
                          >
                            {klubNaziv}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          {/* STRUKTURA KOLA */}
          <Box sx={{ p: 2, border: '1px solid #222', borderRadius: 2, bgcolor: 'rgba(255,121,0,0.02)' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#ff7900', letterSpacing: 1 }}>
              STRUKTURA ELIMINACIJA I KOLA
            </Typography>
            
            <Stack spacing={2}>
              {/* Broj opštih kola (Regularno) */}
              <TextField 
                size="small" 
                label="Broj opštih kola (Regularno)" 
                type="number" 
                fullWidth 
                value={data.regularnoBr || 1} 
                sx={textFieldStyle}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setData({ ...data, regularnoBr: val < 1 ? 1 : val });
                }}
                inputProps={{ min: 1 }}
                onKeyDown={(e) => ["-", "+", "e"].includes(e.key) && e.preventDefault()}
              />

              {/* Grid za eliminaciona kola */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
                
                {[
                  { label: "1/64", key: "roundOf128Br" },
                  { label: "1/32", key: "roundOf64Br" },
                  { label: "1/16", key: "roundOf32Br" },
                  { label: "1/8", key: "roundOf16Br" },
                  { label: "1/4", key: "roundOf8Br" },
                  { label: "1/2", key: "roundOf4Br" },
                  { label: "Finale", key: "roundOf2Br" }
                ].map((kolo) => (
                  <TextField
                    key={kolo.key}
                    size="small"
                    label={kolo.label}
                    type="number"
                    value={data[kolo.key] || 0}
                    sx={textFieldStyle}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setData({ ...data, [kolo.key]: val < 0 ? 0 : val });
                    }}
                    inputProps={{ min: 0 }}
                    onKeyDown={(e) => ["-", "+", "e"].includes(e.key) && e.preventDefault()}
                  />
                ))}
                
              </Box>
            </Stack>
          </Box>

          <Button
            fullWidth 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={podtip == "Dodaj novo takmičenje" ? onDodavanje : onIzmena}
            sx={submitButtonStyle}
          >
            SAČUVAJ TAKMIČENJE
          </Button>
        </Stack>
      </Paper>
       <ModalPage 
          onClose = {()=>{
            setOpenSekcijeModal(false);
            setNovaSekcija(
                {
                  nazivTabele: '',
                  klubovi : [],
                  sezona: '',
              }
              );
            }}
          open = {openSekcijeModal}
          data = {novaSekcija}
          setData = {setNovaSekcija}
          onSubmit = {novaSekcijaHandler}
          tip = {"AddOrEditSekcijaTakmicenja"}
          podtip = {naslovDugmeta}
          dodavanje = {dodavanje}
          setOpenSnack={ setOpenSnack}
          setTip = {setTip}
          setPoruka = {setPoruka}
          ukloniPostojecuSekciju = {handleDeleteSekcija}
          onEdit = {promenaSekcijehandler}
        />
    </Box>
  );
};

// --- STILOVI ---
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

const paperStyle = {
  backgroundColor: '#111',
  border: '1px solid #333',
  borderRadius: 4,
  p: { xs: 2, sm: 4 },
  color: '#fff',
  maxHeight: '90vh',
  overflowY: 'auto',
  '&::-webkit-scrollbar': { width: '6px' },
  '&::-webkit-scrollbar-thumb': { background: '#ff7900', borderRadius: '10px' }
};

const headerTitleStyle = {
  mb: 3, fontWeight: 'bold', fontFamily: "'Orbitron', sans-serif", 
  color: '#ff7900', display: 'flex', alignItems: 'center', gap: 2 
};

const sectionBoxStyle = {
  display: 'flex', 
  flexDirection: { xs: 'column', md: 'row' }, 
  gap: 2, 
  p: 2, 
  border: '1px solid #222', 
  borderRadius: 2,
  backgroundColor: 'rgba(255,255,255,0.01)',
  alignItems: 'center'
};

const uploadButtonStyle = {
  borderColor: '#444', 
  color: '#fff', 
  fontSize: '0.7rem',
  "&:hover": { borderColor: '#ff7900', color: '#ff7900' }
};

const submitButtonStyle = {
  py: 1.5, 
  bgcolor: '#ff7900', 
  color: '#000', 
  fontWeight: 'bold',
  '&:hover': { bgcolor: '#fff' }, 
  transition: '0.3s'
};

export default AddOrEditTakmicenje;