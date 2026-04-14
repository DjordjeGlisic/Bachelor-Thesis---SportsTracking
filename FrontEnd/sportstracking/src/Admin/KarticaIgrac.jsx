import React, { useContext } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  Stack, 
  Divider,
  Chip,
  Grid,
  Skeleton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Context } from '../Context/Context';

const KarticaIgrac = ({ igrac,setIgrac,setOpenTransferModal,setOpenDeleteModal }) => {
    const {setRuta} = useContext(Context);
    const onTransferHandler = () => 
    {
        setRuta('./Klub');
        setIgrac(igrac);
        setOpenTransferModal(true);

    }
    const onSlobodanAgentHandler = () => 
    {
        setRuta('./Klub');
        setIgrac(igrac);
        setOpenDeleteModal(true);

    }

  return (
    <>
    {igrac ?  <Card 
      sx={{ 
        background: "linear-gradient(145deg, rgba(40,40,40,0.9) 0%, rgba(20,20,20,0.95) 100%)", 
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        color:"#fff",
        width: "100%",
        maxWidth: 380,
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.8)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-8px)",
          border: "1px solid rgba(255, 138, 31, 0.3)",
          boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.9)",
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          
          {/* HEADER: Avatar i Ime/Prezime/Godine */}
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Avatar 
              sx={{ 
                width: 70, 
                height: 70, 
                bgcolor: "#ff8a1f", 
                boxShadow: "0 4px 15px rgba(255, 138, 31, 0.4)",
                border: "2px solid rgba(255,255,255,0.1)"
              }}
            >
              <PersonIcon sx={{ fontSize: 45, color: "#fff" }} />
            </Avatar>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: "'Orbitron', sans-serif", 
                  fontWeight: 900, 
                  letterSpacing: '1px',
                  lineHeight: 1.1,
                  fontSize: "1.2rem",
                  mb: 0.5
                }}
              >
                {igrac.ime.toUpperCase()} <br/> {igrac.prezime.toUpperCase()}
              </Typography>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: "#ff8a1f", 
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  letterSpacing: "0.5px"
                }}
              >
                BROJ GODINA: {igrac.brojGodina} 
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />

          {/* INFO: Trenutni klub i Ugovor */}
        <Box sx={{ 
            pl: 1, 
            pr: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' // Centriranje svega unutar Box-a
            }}>
            <Typography 
                variant="caption" 
                sx={{ 
                color: "rgba(255,255,255,0.5)", 
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                mb: 1
                }}
            >
                Trenutni angažman
            </Typography>

            {/* Naziv Kluba - Centriran */}
            <Typography 
                variant="body1" 
                sx={{ 
                fontWeight: 700, 
                fontSize: '1.1rem',
                color: "#fff",
                textAlign: 'center', // Centriranje teksta
                mb: 1
                }}
            >
                {igrac.klubNaziv || "Slobodan agent"}
            </Typography>

            {/* Datum - Centriran ispod kluba */}
            <Stack 
                direction="row" 
                spacing={1} 
                alignItems="center" 
                sx={{ 
                bgcolor: "rgba(255,138,31,0.08)", 
                p: '4px 12px', 
                borderRadius: '6px',
                justifyContent: 'center',
                width: 'fit-content' // Da pozadina prati samo dužinu datuma
                }}
            >
                <CalendarMonthIcon sx={{ fontSize: 16, color: "#ff8a1f" }} />
                <Typography 
                variant="caption" 
                sx={{ 
                    color: "rgba(255,255,255,0.9)", 
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap'
                }}
                >
                {igrac.datumPocetkaUgovora} — {igrac.datumKrajaUgovora}
                </Typography>
            </Stack>
            </Box>

          {/* ISTORIJA: Chipovi */}
          <Box sx={{ pl: 1 }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", textTransform: 'uppercase', letterSpacing: '1px', mb: 1.5, display: 'block' }}>
              Istorija klubova
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {igrac.listaKlubova.split(',').map(item => item.trim()).map((klub, index) => (
                <Chip 
                  key={index} 
                  label={klub} 
                  variant="outlined"
                  size="small" 
                  sx={{ 
                    borderColor: "rgba(255, 138, 31, 0.4)", 
                    color: "#ff8a1f", 
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    "&:hover": { bgcolor: "rgba(255, 138, 31, 0.1)" }
                  }} 
                />
              ))}
            </Box>
          </Box>

          {/* AKCIJE */}
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SwapHorizIcon />}
              onClick={() => onTransferHandler()}
              sx={{
                bgcolor: "#ff8a1f",
                color: "#000",
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 900,
                borderRadius: "10px",
                py: 1.2,
                "&:hover": { bgcolor: "#e67a1a", transform: "scale(1.02)" },
                transition: "all 0.2s"
              }}
            >
              OBAVI TRANSFER
            </Button>
            
            {igrac.klubNaziv && (<Button
              fullWidth
              variant="outlined"
              startIcon={<PersonRemoveIcon />}
              onClick={()=> onSlobodanAgentHandler() }
              sx={{
                color: "#ff4d4d",
                borderColor: "rgba(255, 77, 77, 0.5)",
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 900,
                borderRadius: "10px",
                py: 1,
                "&:hover": {
                  borderColor: "#ff3333",
                  bgcolor: "rgba(255, 77, 77, 0.05)",
                  transform: "scale(1.02)"
                },
                transition: "all 0.2s"
              }}
            >
              PROGLASI SLOBODNIM
            </Button>)}
          </Stack>

        </Stack>
      </CardContent>
    </Card>
    :
        <Grid container spacing={3} sx={{ justifyContent: "center", mt: 2 }}>
    
      <Grid item  xs={12} sm={6} md={4} lg={3}>
        <Box sx={{ 
          p: 3, 
          bgcolor: "rgba(255,255,255,0.05)", 
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <h1>Učitavanje igrača...</h1>
        </Box>
      </Grid>
  </Grid>}
    </>
  );
};

export default KarticaIgrac;