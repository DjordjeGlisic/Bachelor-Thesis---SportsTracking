import { Alert, Box, Button, Container, Grid, Paper, Snackbar, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Registracija from "./Registracija";
import axios from "axios";

const Prijava=(props)=>{
      const navigate=useNavigate();
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
       

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [prijava,setPrijava]=useState(true);
    //const navigate=useNavigate();
    const prijavaHandler=(event)=>
    {
         event.preventDefault();
       
        const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(username);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
         if(username.trim().length<5 || ( isEmail===false && isValid===false) )
        {
            handleClick();
            setTip('error');
            setPoruka('Korisničko ime mora sadržati slova i brojeve i mora imati bar 5 karaktera.');
            return;
            
        }
         if(password.trim().length<3)
        {
            handleClick();
            setTip('error');
             setPoruka('Lozinka mora sadržati najmanje 6 karaktera.');
            return;
            
        }
        
      
        const response = axios.post(
          `http://localhost:5146/Korisnik/PrijavaKorisnika`,
          {
           
          
            username: username,
            lozinka: password
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
            
              console.log(response.data);
              if(!response.data.sport)
              {
                props.setKorisnik(response.data);
                localStorage.setItem("korisnik", JSON.stringify(response.data));
                if(response.data.isAdmin)
                   navigate('./Klubovi');
              }
              else
              {
                localStorage.removeItem("izabraniKlub");
                props.setIzabraniKlub(null);
                props.setKlub(null);
                localStorage.setItem("klub",JSON.stringify(response.data));
                props.setKlub(response.data);
                navigate('./');
              }
            handleClick();
          setTip('success');
          setPoruka('Uspesno ste se prijavili!');
          //navigate('./');
          setTimeout( ()=>{props.onClose()},1500);
          
          })
          .catch((error) => {
            // Obrada greške
            handleClick();
            setTip('error');
             setPoruka(error.response.data.message);
            
          });
     
        
         

    }
    const linkHandler=(event)=>
    {
        
        console.log("linkHandler");
        setPrijava(false);
    }
    const usernameHandler=(event)=>{
     
      const novoEmail = event.target.value;
  
      // Ažuriramo stanje sa novom vrednošću
      setUsername(novoEmail); 
  }
  const passwordHandler=(event)=>{
       
    const novoPassword = event.target.value;
  
    // Ažuriramo stanje sa novom vrednošću
    setPassword(novoPassword); 
  }
    return (<>
 {prijava===true &&( <Grid
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
            Prijava
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.65)",
              textAlign: "center",
              fontSize: 13,
              mb: 3,
            }}
          >
            Uloguj se da bi pratio klubove i komenratisao omiljene utakmice
          </Typography>

          <Box component="form" noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              onChange={usernameHandler}
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
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={passwordHandler}
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
              onClick={prijavaHandler}
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
              Prijavi se
            </Button>

            <Grid container justifyContent="center" sx={{ mt: 3 }}>
              <Link
                component="button"
                variant="body2"
                onClick={linkHandler}
                sx={{
                  color: "rgba(255,255,255,0.75)",
                  textDecorationColor: "rgba(255,255,255,0.35)",
                  "&:hover": { color: "#ff7a00", textDecorationColor: "#ff7a00" },
                }}
              >
                Nemate nalog? Registrujte se
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
  </Grid>)}
  {prijava===false &&(
    <>
     <Registracija promeni={setPrijava} onClose={props.onClose} />
    </>
  )}
  </>
);
};
export default Prijava;