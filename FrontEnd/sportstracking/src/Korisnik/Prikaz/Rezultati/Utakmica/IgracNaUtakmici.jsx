import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Context, TakmicenjeContext, UtakmicaContext } from '../../../../Context/Context';
import axios from 'axios';
import { HubConnectionBuilder } from '@microsoft/signalr';

// Stilovi koji prate tvoju sliku
const themeStyles = {
  container: {
    backgroundColor: '#111111', // Tamna pozadina kao na slici
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '900px',
    margin: '40px auto', // Centriranje na stranici
    border: '1px solid #222',
    boxShadow: '0px 10px 30px rgba(0,0,0,0.5)',
  },
  statPill: {
    backgroundColor: '#e60000', // Crvena boja sa tvojih slika
    borderRadius: '20px',
    padding: '2px 12px',
    color: 'white',
    fontWeight: 'bold',
    minWidth: '35px',
    textAlign: 'center',
    fontSize: '0.85rem',
  },
  accordion: {
    backgroundColor: 'transparent',
    color: '#ccc',
    boxShadow: 'none',
    '&:before': { display: 'none' }, // Uklanja liniju harmonike
    borderBottom: '1px solid #222',
  },
  label: {
    color: '#999',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  }
};

const StatRow = ({ label, count, onAdd,onChange, onRemove,korisnik,uzivo,dobioCrveni }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0.5 }}>
    <Typography sx={themeStyles.label}>{label}</Typography>
    {(label !== "Crveni kartoni" && label !== "Žuti kartoni" ) && (
     <Stack direction="row" alignItems="center" spacing={1}>
      {korisnik && korisnik.isAdmin && !dobioCrveni && uzivo  && (<IconButton size="small" onClick={onRemove} 
       sx={{ color: '#555' }}>
        <RemoveIcon fontSize="small" />
      </IconButton>)}
      <Box sx={themeStyles.statPill}>{count}</Box>
      {korisnik && korisnik.isAdmin && !dobioCrveni && uzivo   && (<IconButton size="small" onClick={onAdd}
         sx={{ color: '#555' }}>
        <AddIcon fontSize="small" />
      </IconButton>)}
    </Stack>)}
    { (label === "Crveni kartoni" || label === "Žuti kartoni") && (
        <Stack direction="row" alignItems="center" spacing={1}>
           <Checkbox 
            size="small" 
            checked={count}
            disabled={!(korisnik && korisnik.isAdmin && uzivo) || (label === "Žuti kartoni" && dobioCrveni) }
                //|| !utakmica.uzivo }
            onChange={(event)=>{
               onChange(event.target.checked);
            }
        }
            sx={{ color: '#e60000', '&.Mui-checked': { color: '#e60000' } }} 
          />
        </Stack>
    )}
  </Stack>
);

const PlayerEntry = ({ playerStat,korisnik,setSviIgraci,tim,utakmica,setOpenSnack,setPoruka,setTip,sport }) => {
  // playerStat je objekat koji si mi poslao (sa pogotci, asistencije, itd.)
  // Ime izvlačimo direktno iz objekta
  const name = playerStat.imePrezime;

  // Rečnik za lepši prikaz labela (Mapiramo C# property name u UI label)
  const labelMap = {
    pogotci: "Pogotci",
    asistencije: "Asistencije",
    ukupnoSuteva: "Upućeni šutevi",
    izgubljeneLopte: "Izgubljene lopte",
    ukradeneLopte: "Ukradene lopte",
    blokiraniUdarci: "Blokirani udarci",
    vraceniPosedi: "Vraćeni posedi",
    ukupnoDodavanja: "Dodavanja",
    ukupnoTacnihDodavanja: "Tačna dodavanja",
    predjenaDistancaKM: "Pređena distanca (KM)",
    skokoviOF: "Ofanzivni skokovi",
    skokoviDF: "Defanzivni skokovi",
    iskljucenja: "Isključenja",
    ukupnoFaula: "Fauli",
    crveniKartoni: "Crveni kartoni",
    zutiKartoni: "Žuti kartoni",
    igraUtakmicu: "Igra utakmicu"
  };
  const  promeniStatIgraca = (klub, igracID,parametar,promena) =>
  {
        let obj = {
            klub: klub,
            igracID : igracID,
            parametar: parametar,
            promena : promena
        }
        console.log(obj);
        axios.put(`http://localhost:5146/Admin/PromeniParametarIgracu/${utakmica.id}/${sport}`,obj)
        .then((res)=>{
            setTip("success");
            setPoruka("Uspešno ažuriran učinak igraču");
            setOpenSnack(true);
        })
        .catch((err)=>{
            setTip("error");
            setPoruka("Greška prilikom ažuriranja učinka igraču");
            setOpenSnack(true);
        })
  }
  return (
    <Accordion sx={themeStyles.accordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#555' }} />}>
        <Typography sx={{ fontWeight: 500, fontSize: '0.95rem' }}>{name}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        {/* Checkbox za igrao utakmicu - uvek vidljiv */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Checkbox 
            size="small" 
            checked={playerStat.igraUtakmicu > 0}
            disabled={!(korisnik && korisnik.isAdmin && utakmica.uzivo) }
            onChange={(event)=>{
                let staraVredonst = playerStat.igraUtakmicu;
                let novaVredonst = !playerStat.igraUtakmicu;
                setSviIgraci(prev => ({
                    ...prev, 
                    [tim]: prev[tim].map(igrac => 
                    igrac.igracId === playerStat.igracId 
                        ? { ...igrac, ['igraUtakmicu']:event.target.checked } 
                        : igrac 
                    )
                }))
                promeniStatIgraca(tim, playerStat.igracId,'igraUtakmicu','invertuj')
            }
        }
            sx={{ color: '#e60000', '&.Mui-checked': { color: '#e60000' } }} 
          />
          <Typography variant="caption" sx={{ color: '#666' }}>IGRAO UTAKMICU</Typography>
        </Stack>

        {/* Dinamičko iscrtavanje ostalih statova koji nisu NULL */}
        { playerStat.igraUtakmicu === true && Object.keys(playerStat).map((key) => {
          const value = playerStat[key];
          
          // Preskačemo: null vrednosti, igracId, imePrezime i odigraneUtakmice (već smo je stavili gore)
          if (
            value === null || 
            key === 'igracId' || 
            key === 'imePrezime' || 
            key === 'igraUtakmicu' ||
            !labelMap[key]
          ) {
            return null;
          }

          return (
            <StatRow 
              key={key}
              uzivo={utakmica.uzivo}
              label={labelMap[key]} 
              count={playerStat[key]}
              dobioCrveni = {playerStat.crveniKartoni}
              onAdd={() =>{
                let staraVrednost = playerStat[key];
                let novaVrednost = playerStat[key] + 1;
                  setSviIgraci(prev => ({
                      ...prev, 
                      [tim]: prev[tim].map(igrac => 
                      igrac.igracId === playerStat.igracId 
                          ? { ...igrac, [key]: novaVrednost } 
                          : igrac 
                      )
                  }))
                promeniStatIgraca(tim, playerStat.igracId,key,'dodaj')
              } } 
              onRemove={() =>
              {
                let staraVrednost = playerStat[key];
                let novaVrednost = playerStat[key] > 0 ? playerStat[key]  - 1 : 0;
                  setSviIgraci(prev => ({
                      ...prev, 
                      [tim]: prev[tim].map(igrac => 
                      igrac.igracId === playerStat.igracId 
                          ? { ...igrac, [key]: novaVrednost } 
                          : igrac 
                      )
                  }))
                promeniStatIgraca(tim, playerStat.igracId,key,'oduzmi')
              }
              }
              onChange={(checked)=>{
                setSviIgraci(prev => ({
                      ...prev, 
                      [tim]: prev[tim].map(igrac => 
                      igrac.igracId === playerStat.igracId 
                          ? { ...igrac, [key]: checked } 
                          : igrac 
                      )
                  }))
                let promena = checked ? 'dodaj' : 'oduzmi';
                promeniStatIgraca(tim, playerStat.igracId,key,promena)
              }} 
              korisnik={korisnik}
            />
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
};
const IgracNaUtakmici = ({setPoruka,setOpenSnack,setTip }) => {
    const domaci = Array.from({ length: 11 }, (_, i) => `Igrač ${i + 1}`);
    const gosti = Array.from({ length: 11 }, (_, i) => `Igrač ${i + 1}`);
    const {korisnik,sport} = useContext(Context);
    const {utakmica}=useContext(UtakmicaContext);
    const [statistikaIgraca,setStatistikaIgraca] = useState(null);
    const handleStatPlayerChange = (x) =>
    {
        setStatistikaIgraca(prevStat => {
        if (!prevStat) return prevStat;

        // 1. Pokušavamo da nađemo i ažuriramo igrača u listi Domaćina
        const noviDomacin = prevStat.domacin.map(u => 
            u.igracID === x.igracId ? { ...u, ...x } : u
        );

        // 2. Pokušavamo isto to u listi Gostiju
        const noviGost = prevStat.gost.map(u => 
            u.igracID === x.igracId ? { ...u, ...x } : u
        );
        // 3. Vraćamo novi objekat sa ažuriranim listama
        return {
            ...prevStat,
            domacin: noviDomacin,
            gost: noviGost
        };
    });
    }
    useEffect(()=>{
        axios.get(`http://localhost:5146/Korisnik/VratiStatistikuIgracaZaUtakmicu/${utakmica.id}/${sport}`)
        .then((res)=>{
            setStatistikaIgraca(res.data);
            console.log(res.data);
        })
        .catch((err)=>{
                console.error(err);
        })

    },[utakmica,sport])
     useEffect(() => {
           const connection = new HubConnectionBuilder()
             .withUrl("http://localhost:5146/MatchHub") 
             .build();
         
           connection.start().then(() => {
             console.log('Connected to SignalR hub');
           });
         
           connection.on(`PromenjenUcinakIgracuNaUtakmici${utakmica.id}`, (x) => {
             console.log(x);
                handleStatPlayerChange(x);
             
           });
           return () => {
        connection.off(
         `PromenjenUcinakIgracuNaUtakmici${utakmica.id}`,
          handleStatPlayerChange
        );
      };
         }, []);

  return (
   <Box sx={{ 
  maxWidth: '850px', // Ograničava širinu da ne izlazi iz ekrana
  margin: '0 auto',  // Centrira celu formu
  backgroundColor: 'rgba(20, 20, 20, 0.95)', // Boja pozadine forme sa slike
  borderRadius: '20px',
  border: '1px solid #333',
  padding: '20px',
  boxSizing: 'border-box'
}}>
  <Typography 
    variant="subtitle2" 
    align="center" 
    sx={{ color: '#ccc', mb: 3, letterSpacing: '1px', textTransform: 'uppercase' }}
  >
    Statistika igrača na utakmici
  </Typography>

  <Grid 
    container 
    sx={{ 
      display: 'flex', 
      flexDirection: 'row', 
      flexWrap: 'nowrap', // Garantuje da su jedan pored drugog
      gap: 2 // Razmak između kolona
    }}
  >
    {/* DOMAĆIN KOLONA */}
    <Grid item sx={{ flex: 1, minWidth: 0 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3, justifyContent: 'center' }}>
        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
            {utakmica.domacin[0].toUpperCase()}
            {utakmica.domacin[1].toUpperCase()}
            {utakmica.domacin.length > 2 ? utakmica.domacin[2].toUpperCase(): '' }
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>{utakmica.domacin}</Typography>
      </Stack>

      <Box sx={{ 
        height: '450px', // Fiksna visina unutar forme
        overflowY: 'auto', 
        pr: 1,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: '#444', borderRadius: '10px' }
      }}>
        {statistikaIgraca?.domacin?.map((n, i) => (
          <PlayerEntry key={n.igracId } playerStat={n} korisnik={korisnik} setSviIgraci={setStatistikaIgraca} tim={'domacin'}
          utakmica = {utakmica} sport={sport } setOpenSnack={setOpenSnack} setPoruka={setPoruka} setTip = {setTip} />
        ))}
      </Box>
    </Grid>

    {/* VERTIKALNA LINIJA (Opciono, kao na slici) */}
    <Divider orientation="vertical" flexItem sx={{ bgcolor: '#333', opacity: 0.5 }} />

    {/* GOST KOLONA */}
    <Grid item sx={{ flex: 1, minWidth: 0 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3, justifyContent: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>{utakmica.gost}</Typography>
        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
             {utakmica.gost[0].toUpperCase()}{utakmica.gost[1].toUpperCase()}{utakmica.gost.length > 2 ? utakmica.gost[2].toUpperCase(): '' }
        </Box>
      </Stack>

      <Box sx={{ 
        height: '450px', 
        overflowY: 'auto', 
        pr: 1,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: '#444', borderRadius: '10px' }
      }}>
        {statistikaIgraca?.gost?.map((n, i) => (
          <PlayerEntry key={n.igracId } playerStat={n} korisnik={korisnik}  setSviIgraci={setStatistikaIgraca} tim={'gost'}
           utakmica = {utakmica} setOpenSnack={setOpenSnack} setPoruka={setPoruka} setTip = {setTip} sport={sport}/>
        ))}
      </Box>
    </Grid>
  </Grid>
</Box>
  );
};

export default IgracNaUtakmici;