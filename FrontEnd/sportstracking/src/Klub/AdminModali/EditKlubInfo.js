import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Paper,
    Alert,
    Chip,
    IconButton,
    Snackbar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const EditKlubInfo = ({ data, setData, onSubmit, parseMoneyToNumber }) => {
    // Lokalni state za "Ukupno" polje
    const [ukupno, setUkupno] = useState(
        0
    );
    useEffect(()=>{
        data.prihodi = parseMoneyToNumber(data.prihodi);
        data.rashodi = parseMoneyToNumber(data.rashodi);
        setUkupno(data.prihodi + data.rashodi);

    },[]);

    // Hendler za promenu običnih inputa
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: value
        });
    };

    // Provera validnosti finansija
    const isFinansijeValid = parseMoneyToNumber(data.prihodi) + parseMoneyToNumber(data.rashodi) === Number(ukupno);
    useEffect(()=>{
        console.log("edit kluba dobija");
        console.log(data)
    },[data]);
      const [noviTrofej, setNoviTrofej] = useState("");
      const [noviSponzor,setNoviSponzor] = useState("");
      const dodajUListu = (vrednost, polje, tip) => {
    if (!vrednost || vrednost.trim() === "") return;
    const trimovanaVrednost = vrednost.trim();
      // Obrada za klubove (String sa zapetama)
      const trenutnaLista = data[polje] ? data[polje].split(", ").filter(x => x !== "") : [];
      if (!trenutnaLista.includes(trimovanaVrednost)) {
        const novaLista = [...trenutnaLista, trimovanaVrednost].join(", ");
        setData(prev => ({ ...prev, [polje]: novaLista }));
      }
  };

  const ukloniIzListe = (vrednost, polje, tip) => {
      const novaLista = data[polje]
        .split(", ")
        .filter(stavka => stavka !== vrednost)
        .join(", ");
      setData(prev => ({ ...prev, [polje]: novaLista }));
  };
   const [alertTrofeji,setAlertTrofeji] = useState(false);
   const hideAlertTrofeji = () =>{setAlertTrofeji(false)};
    const [alertEmail,setAlertEmail] = useState(false);
   const hideAlertEmail = () =>{setAlertEmail(false)};

    return (
        <Paper
            sx={{
                width: '100%',
                maxWidth: 600,
                bgcolor: '#121212',
                color: 'white',
                p: 3,
                maxHeight: '80vh',
                overflowY: 'auto',
                border: '1px solid #333'
            }}
        >
            <Typography variant="h5" sx={{ mb: 3, color: '#f57c00', fontWeight: 'bold', textAlign: 'center' }}>
                Izmena informacija kluba
            </Typography>

            {/* SEKCIJA: FINANSIJE */}
            <Accordion sx={{ bgcolor: '#1e1e1e', color: 'white', mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                    <Typography>Finansije (Prihodi vs Rashodi) U  €</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Ukupan budžet (Zbir) U  €"
                                type="number"
                                value={ukupno}
                                onChange={(e) => setUkupno(Number(e.target.value))}
                                variant="outlined"
                                sx={{ input: { color: 'white' }, label: { color: '#aaa' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#444' } } }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                name="prihodi"
                                label="Prihodi U  €"
                                type="number"
                                value={data.prihodi || ''}
                                onChange={handleChange}
                                error={!isFinansijeValid}
                                sx={{ input: { color: 'white' }, label: { color: '#aaa' } }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                name="rashodi"
                                label="Rashodi U  €"
                                type="number"
                                value={data.rashodi || ''}
                                onChange={handleChange}
                                error={!isFinansijeValid}
                                sx={{ input: { color: 'white' }, label: { color: '#aaa' } }}
                            />
                        </Grid>
                        {!isFinansijeValid && (
                            <Grid item xs={12}>
                                <Alert severity="error" sx={{ bgcolor: 'transparent', color: '#ff5252' }}>
                                    Zbir prihoda i rashoda mora biti tačno {ukupno}€!
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* SEKCIJA: SPONZORI I TROFEJI */}
            <Accordion sx={{ bgcolor: '#1e1e1e', color: 'white', mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                    <Typography>Sponzori i Trofeji</Typography>
                </AccordionSummary>
                <AccordionDetails>
                     <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%', mt: 2 }}>
                        <TextField
                            fullWidth
                            name="sponzori"
                            label="Lista sponzora"
                            placeholder="Unesite naziv kompanije koja sponzoriše klub!"
                            value={noviSponzor}
                            onChange={(e) => setNoviSponzor(e.target.value)}
                            sx={{
                                ...textFieldStyle,
                                flex: 1 // Osigurava da polje zauzme sav preostali prostor
                            }}
                        />
                        <IconButton 
                            onClick={() => { 
                                if(noviSponzor.trim() !== "") {
                                    dodajUListu(noviSponzor, 'sponzori', 'string'); 
                                    setNoviSponzor(""); 
                                }
                            }} 
                            sx={{ 
                                backgroundColor: '#ff7900', 
                                mt: 1, // Malo spuštanje da se poravna sa centrom inputa (zbog labela)
                                "&:hover": { backgroundColor: '#fff' },
                                width: 45,
                                height: 45
                            }}
                        >
                            <AddCircleOutlineIcon sx={{ color: '#000' }} />
                        </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                   {data.sponzori?.split(", ").filter(x => x !== "").map((k, i) => (
                                     <Chip key={i} label={k} onDelete={() => ukloniIzListe(k, 'sponzori', 'string')} sx={chipStyle} />
                                   ))}
                        </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%', mt: 2 }}>
                        <TextField
                            fullWidth
                            name="trofeji"
                            label="Lista trofeja"
                            placeholder="Unesite naziv takmičenja x broj titula!"
                            value={noviTrofej}
                            onChange={(e) => setNoviTrofej(e.target.value)}
                            sx={{
                                ...textFieldStyle,
                                flex: 1 // Osigurava da polje zauzme sav preostali prostor
                            }}
                        />
                        <IconButton 
                            onClick={() => { 
                                if(noviTrofej.trim() !== "") {
                                    const regex = /^(.*?)\s*[xX]\s*(\d+)\s*$/;
                                    let ispravno =  regex.test(noviTrofej.trim());
                                    if(!ispravno)
                                    {
                                        setAlertTrofeji(true);
                                        return;
                                    }
                                    dodajUListu(noviTrofej, 'trofeji', 'string'); 
                                    setNoviTrofej(""); 
                                }
                            }} 
                            sx={{ 
                                backgroundColor: '#ff7900', 
                                mt: 1, // Malo spuštanje da se poravna sa centrom inputa (zbog labela)
                                "&:hover": { backgroundColor: '#fff' },
                                width: 45,
                                height: 45
                            }}
                        >
                            <AddCircleOutlineIcon sx={{ color: '#000' }} />
                        </IconButton>
                        </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                   {data.trofeji?.split(", ").filter(x => x !== "").map((k, i) => (
                                     <Chip key={i} label={k} onDelete={() => ukloniIzListe(k, 'trofeji', 'string')} sx={chipStyle} />
                                   ))}
                        </Box>
                </AccordionDetails>
            </Accordion>

            {/* SEKCIJA: KONTAKT I ISTORIJA */}
            <Accordion sx={{ bgcolor: '#1e1e1e', color: 'white', mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                    <Typography>Opšte informacije i Istorija</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <TextField
                        fullWidth
                        name="username"
                        label="Email"
                        value={data.username || ''}
                        onChange={handleChange}
                        sx={{ mb: 2, input: { color: 'white' }, label: { color: '#aaa' } }}
                    />
                    <TextField
                        fullWidth
                        name="adresa"
                        label="Adresa"
                        value={data.adresa || ''}
                        onChange={handleChange}
                        sx={{ mb: 2, input: { color: 'white' }, label: { color: '#aaa' } }}
                    />
                    <TextField
                        fullWidth
                        name="istorija"
                        label="Kratka istorija"
                        multiline
                        rows={3}
                        value={data.istorija || ''}
                        onChange={handleChange}
                        sx={{ textarea: { color: 'white' }, label: { color: '#aaa' } }}
                    />
                </AccordionDetails>
            </Accordion>

            <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={!isFinansijeValid}
                onClick={(e)=>
                    {
                        e.preventDefault();
                        if( !data.username.includes(".") || !data.username.includes("@"))
                        {
                            setAlertEmail(true);
                            return;
                        }
                        onSubmit();

                    }}
                sx={{
                    bgcolor: '#f57c00',
                    '&:hover': { bgcolor: '#e65100' },
                    fontWeight: 'bold',
                    py: 1.5
                }}
            >
                Sačuvaj izmene
            </Button>
             <Snackbar open={alertTrofeji} autoHideDuration={6000} onClose={hideAlertTrofeji}>
                  <Alert onClose={hideAlertTrofeji} severity={"error"} variant="filled" sx={{ width: '100%' }}>
                    {"Nije ispoštovan format unosa trofeja - Naziv takmičenja x broj titlula"}
                  </Alert>
              </Snackbar>
              <Snackbar open={alertEmail} autoHideDuration={6000} onClose={hideAlertEmail}>
                  <Alert onClose={hideAlertEmail} severity={"error"} variant="filled" sx={{ width: '100%' }}>
                    {"Nije ispoštovan format unosa email-a - Moraju se u email-u naći karakteri '@' i '.'"}
                  </Alert>
              </Snackbar>

        </Paper>
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

export default EditKlubInfo;