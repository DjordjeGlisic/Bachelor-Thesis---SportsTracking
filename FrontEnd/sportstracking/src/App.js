import logo from './logo.svg';
import './App.css';

import React, { useEffect,useRef,useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './Korisnik/Navigacija/NavBar'; 
import { Context,KluboviContext } from './Context/Context';
import PrijavaModal from './Korisnik/Prijava/PrijavaModal';
import Rezultati from './Korisnik/Prikaz/Rezultati/Rezultati';
import Klubovi from './Korisnik/Prikaz/Klubovi/Klubovi';
import Inbox from './Inbox/Inbox';
import GlavniPrikaz from './Korisnik/Prikaz/Novosti/GlavniPrikaz';
import HeaderKluba from './Klub/HeaderKluba';
import Transferi from './Admin/Transferi';


function App() {
   const [background, setBackground] = useState("#1E1E1E");
   const [letters, setLetters] = useState("#E4E6EA");
   const[ruta,setRuta]=useState("/");
  const [sport,setSport]=useState(1);
    const [contentColor,setContentColor]=useState("#605857");
    const [kliknutaPrijava,setKliknutaPrijava]=useState(false);
    const[korisnik,setKorisnik]=useState(null);
    const[klub,setKlub]=useState(null);
    const[izabraniKlub,setIzabraniKlub]=useState(null);
    const[izabraniKorisnik,setIzabraniKorisnik]=useState(null);
    const [chat,setChat]=useState(null);
    const[poruke,setPoruke]=useState([]);
  useEffect(() => {
        // Ova linija se izvršava SVAKI PUT kada se 'background' promeni.
        // Sada pouzdano koristite najnoviju vrednost stanja.
        let klb=localStorage.getItem("klub");
        if(klb)
          setKlub(JSON.parse(klb));
        let body=document.querySelector("body");
        body.style.backgroundColor = background;
        body.style.color = letters;
    }, [background]); // Zavisnost: efekat se pokreće samo kad se 'background' promeni
 const [openLogin, setOpenLogin] = useState(false);
const [openSide, setOpenSide] = useState(false);
const [modal,setModal]=useState(false);
  // element na koji vraćaš fokus kad zatvoriš modal
  const focusBackRef = useRef(null);

  const open = () => setOpenLogin(true);
  const close = () => {
    setOpenLogin(false);
    setModal(false);
    requestAnimationFrame(() => focusBackRef.current?.focus());
  };
  console.log(klub);
  return (
    <>
      <KluboviContext.Provider value={{klub,setKlub,izabraniKorisnik,setIzabraniKorisnik}}>
       <Context.Provider value={{
         background, setBackground,letters,setLetters,
        contentColor,setContentColor,
         kliknutaPrijava,setKliknutaPrijava,korisnik,setKorisnik,
         sport,setSport,openSide,setOpenSide,izabraniKlub,setIzabraniKlub,chat,setChat,poruke,setPoruke,ruta,setRuta,
         modal,setModal

          }}>
    <div className="App" ref={focusBackRef} tabIndex={-1}>
     { klub===null  &&( 
       <Navbar onOpenLogin={open}/>)}

        <Routes>
          <Route path='/Takmicenja' element={
            <>
            <Rezultati/>
        </>} />
        <Route path='/Klubovi' element={
            <>
            <Klubovi/>
        </>} />
          {korisnik!==null&&(
            <>
          <Route path='/Inbox' element={
            <>
           <Inbox/>
        </>} />
            </>
      )}
          <Route path='/' element={
            <>
           { klub!==null ? <HeaderKluba/> : <GlavniPrikaz/>}
        </>} />
        <Route path='/Klub' element={
            <>
           <HeaderKluba/>
        </>} />
        {korisnik && korisnik.isAdmin && (
          <Route path='/Transferi' element = {
              <>
                <Transferi/>
              </>

            }/>
        )}
                
        </Routes>
    </div>
    <PrijavaModal open={openLogin} onClose={close} />
           </Context.Provider>
           </KluboviContext.Provider>
    </>
  );
}

export default App;
