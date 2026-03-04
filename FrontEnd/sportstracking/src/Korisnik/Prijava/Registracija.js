import { Alert, Box, Button, Container, Grid, Paper, TextField, Typography } from "@mui/material";
import { useState,React } from "react";
import { Link, useNavigate } from "react-router-dom";
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import axios from 'axios';
const  Registracija=(props)=>{
   const [open, setOpen] = useState(false);
   const[tip,setTip]=useState(null);
   const[poruka,setPoruka]=useState('');

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };



    const [ime,setIme]=useState('');
    const [prezime,setPrezime]=useState('');
    const [telefon,setTelefon]=useState(0);
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [passwordAgain,setPasswordAgain]=useState('');
    
    const registracijaHandler=(event)=>
    {
        event.preventDefault();
        if(ime.trim().length<3)
        {
            handleClick();
            setTip('error');
            setPoruka('Ime mora sadržati najmanje 3 karaktera.');
            return;
            
        }
         if(prezime.trim().length<3)
        {
            handleClick();
            setTip('error');
            setPoruka('Prezime mora sadržati najmanje 3 karaktera.');
            return;
            
        }
         if(telefon.toString().trim().length!=9)
        {
            handleClick();
            setTip('error');
            setPoruka('Telefon mora sadržati tačno 9 karaktera.');
            return;
            
        }
        const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(username);
         if(username.trim().length<5||isValid===false)
        {
            handleClick();
            setTip('error');
            setPoruka('Korisničko ime mora sadržati samo slova i brojeve i mora imati bar 5 karaktera.');
            return;
            
        }
        if(password.trim().length<6|| password!==passwordAgain)
        {
            handleClick();
            setTip('error');
            setPoruka('Lozinka mora sadržati najmanje 6 karaktera i mora se poklapati sa potvrđenom.');
            return;
        }
        const response = axios.post(
          `http://localhost:5146/Korisnik/RegistracijaKorisnika`,
          {
           
            ime: ime,
            prezime: prezime,
            username: username,
            lozinka: password,
            telefon: telefon
          },
          {
            headers: {
              // Ovde možete dodati header informacije ako su potrebne
              // Authorization: `Bearer ${token}`
            },
          }
        )
          .then((response) => {
            // Obrada uspešnog odgovora
            
            
            handleClick();
          setTip('success');
          setPoruka('Uspesno ste se registrovali! Sada se možete prijaviti.');
          setTimeout(() => {
          props.promeni(true);
          }, 1500);

          })
          .catch((error) => {
            // Obrada greške
            console.log(error);
            
          });
    }
    return(
         <Grid
    container
    direction="column"
    alignItems="center"
    justifyContent="center"
    sx={{ minHeight: "calc(100vh - 64px)" }} // ispod navbara
  >
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "linear-gradient(180deg, rgba(26,26,26,0.92), rgba(15,15,15,0.92))",
          boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Narandžasti akcent bar (kao active tab) */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "#ff7a00",
          }}
        />

        <Box sx={{ p: 4 }}>
          <Typography
            component="h1"
            sx={{
              color: "white",
              fontWeight: 700,
              letterSpacing: 0.3,
              fontSize: 34,
              textAlign: "center",
              mb: 1,
            }}
          >
            Registracija
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.65)",
              textAlign: "center",
              fontSize: 13,
              mb: 3,
            }}
          >
            Registruj se da bi kreirao svoj nalog na ''SPORTS TRACKING'' platformi
          </Typography>

          <Box component="form" noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="ime"
              label="Ime"
              name="Ime"
              autoComplete="Pera"
              autoFocus
              onChange={(event)=>{setIme(event.target.value)}}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.55)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: 2,
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                  "&:hover fieldset": { borderColor: "rgba(255,122,0,0.55)" },
                  "&.Mui-focused fieldset": { borderColor: "#ff7a00" },
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="prezime"
              label="Prezime"
              type="text"
              id="prezime"
              autoComplete="Peric"
                onChange={(event)=>{setPrezime(event.target.value)}}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.55)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: 2,
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                  "&:hover fieldset": { borderColor: "rgba(255,122,0,0.55)" },
                  "&.Mui-focused fieldset": { borderColor: "#ff7a00" },
                },
              }}
            />
              <TextField
              margin="normal"
              required
              fullWidth
              name="telefon"
              label="Telefon"
              type="number"
              id="telefon"
              autoComplete={"0601234567"}
                onChange={(event)=>{setTelefon(event.target.value)}}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.55)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: 2,
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                  "&:hover fieldset": { borderColor: "rgba(255,122,0,0.55)" },
                  "&.Mui-focused fieldset": { borderColor: "#ff7a00" },
                },
              }}
            />
        <TextField
              margin="normal"
              required
              fullWidth
              name="username"
              label="Korisničko ime"
              type="text"
              id="username"
              autoComplete={"peraperic"}
                onChange={(event)=>{setUsername(event.target.value)}}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.55)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: 2,
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                  "&:hover fieldset": { borderColor: "rgba(255,122,0,0.55)" },
                  "&.Mui-focused fieldset": { borderColor: "#ff7a00" },
                },
              }}
            />
             <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Lozinka"
              type="password"
              id="password"
              
                onChange={(event)=>{setPassword(event.target.value)}}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.55)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: 2,
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                  "&:hover fieldset": { borderColor: "rgba(255,122,0,0.55)" },
                  "&.Mui-focused fieldset": { borderColor: "#ff7a00" },
                },
              }}
            />
             <TextField
              margin="normal"
              required
              fullWidth
              name="passwordAgain"
              label="Potvrdi lozinku"
              type="password"
              id="passwordAgain"
             
                onChange={(event)=>{setPasswordAgain(event.target.value)}}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.55)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: 2,
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                  "&:hover fieldset": { borderColor: "rgba(255,122,0,0.55)" },
                  "&.Mui-focused fieldset": { borderColor: "#ff7a00" },
                },
              }}
            />
            <Button
              data-testid="prijava"
              type="submit"
              fullWidth
              variant="contained"
               onClick={registracijaHandler}
              sx={{
                mt: 2.5,
                py: 1.25,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                backgroundColor: "#ff7a00",
                boxShadow: "0 10px 24px rgba(255,122,0,0.25)",
                "&:hover": {
                  backgroundColor: "#ff8a1f",
                  boxShadow: "0 12px 28px rgba(255,122,0,0.30)",
                },
              }}
            >
             Registruj se
            </Button>

            <Grid container justifyContent="center" sx={{ mt: 3 }}>
              <Link
                component="button"
                variant="body2"
                onClick={()=>{props.promeni(true)}}
                sx={{
                  color: "rgba(255,255,255,0.75)",
                  textDecorationColor: "rgba(255,255,255,0.35)",
                  "&:hover": { color: "#ff7a00", textDecorationColor: "#ff7a00" },
                }}
              >
                Imate nalog? Prijavite se
              </Link>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
   <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={tip}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {poruka}
        </Alert>
      </Snackbar>
  </Grid>
    );
}
export default Registracija;