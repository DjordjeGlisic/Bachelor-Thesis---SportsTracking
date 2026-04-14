import React, { useState } from "react";
import "./KarticaKlub.css";
import {useContext} from "react";
import {Context,KluboviContext} from "../../../Context/Context";
import axios from "axios";
import { Alert, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
const KarticaKlub = (props) => {
    const {letters,contentColor,korisnik,izabraniKlub,setIzabraniKlub,setChat,poruke,setPoruke,sport,setRuta}=useContext(Context);
   
    const [open,setOpen] = React.useState(false);
    const [poruka,setPoruka]=React.useState("");
    const Obavestenje=()=>{
    setPoruka("Morate biti ulogovani i pratiti klub da biste kontaktirali taj klub.");setOpen(true);
    }
    const navigate=useNavigate();
    const Redirekcija=()=>{
     
      setIzabraniKlub(props.obj);
      const response =  axios.get(`http://localhost:5146/Korisnik/VratiChatKorKlub/${korisnik.id}/${props.obj.id}/${sport}`,
        {
          headers:{
            //Authorization: `Bearer ${token}`
            }
        }).then(response=>{
            console.log(response.data);
            setPoruke(response.data);
            setChat(1);
            setRuta('/Inbox');
            navigate('/Inbox');
            
        })
        .catch(error=>{
            console.log(error);
        })

    }
    const [brojPratioca,setBrojPratioca]=useState(props.obj.brojPratioca);
    
    const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const pracenjeHandler=(e)=>{
    e.preventDefault();
    if(props.obj.korisnikPrati===false)
    {
        //
        if(korisnik===null)
            {
                setPoruka("Morate biti ulogovani da biste zapratili klub.");
                setOpen(true);
                return;
            }
            console.log("KORISNIK ID:",korisnik.id+" KLUB ID:",props.obj.id );
          const response =  axios.post(`http://localhost:5146/Korisnik/ZapratiKlub/${korisnik.id}/${props.obj.id}`,
          {
            headers:{
              //Authorization: `Bearer ${token}`
            }
          }).then(response=>{
            console.log(response.data);
            
          props.onFollowChanged(props.obj.id, !props.obj.korisnikPrati);
           
            
          })
          .catch(error=>{
            console.log(error);
          })
    }
    else
    {
       const response =  axios.post(`http://localhost:5146/Korisnik/OtpratiKlub/${korisnik.id}/${props.obj.id}`,
          {
            headers:{
              //Authorization: `Bearer ${token}`
            }
          }).then(response=>{
            console.log(response.data);
              props.onFollowChanged(props.obj.id, !props.obj.korisnikPrati);
           
           
            
          })
          .catch(error=>{
            console.log(error);
          })
    }
  }
 
  return (
    <div className="club-card" style={{color: letters, background: contentColor}}>
      <div className="club-card-inner" style={{color: letters, background: contentColor}}>
        {/* GORNJI DEO: logo + naziv + bedž region */}
        <div className="club-card-header">
          <div className="club-card-logo-wrap">
            <img src={props.obj.logo} alt={props.obj.naziv} className="club-card-logo" />
          </div>

          <div className="club-card-header-text">
            <h2 className="club-card-title">{props.obj.naziv}</h2>
            {/* <p className="club-card-subtitle">Sponzori:{props.obj.sponzori}</p>
             <p className="club-card-subtitle">Takmiči se:{props.obj.takicenja}</p> */}
          </div>

          <span className="club-card-tag">{props.obj.brojPratioca} Pratioca</span>
        </div>

        {/* SREDINA: takmičenja i sponzori */}
        <div className="club-card-section">
          <h4 className="club-card-section-title">Takmičenja</h4>
          <ul className="club-card-list">
              {props.obj.takicenja.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
             
          
          </ul>
        </div>

        <div className="club-card-section">
          <h4 className="club-card-section-title">Sponzori</h4>
          <ul className="club-card-list">
           
             {props.obj.sponzori}
          </ul>
        </div>

        {/* DNO: 3 dugmeta u redu */}
        <div className="club-card-actions">
          { (!korisnik || (korisnik && !korisnik.isAdmin)) && (
          <>
          <button className="club-btn club-btn-secondary"onClick={()=>{console.log(props.obj);localStorage.setItem("izabraniKlub",JSON.stringify(props.obj));setIzabraniKlub(props.obj);setRuta('/Klub');navigate("../Klub")}}>Detalji</button>
          <button className="club-btn club-btn-primary" onClick={pracenjeHandler}>{props.obj.korisnikPrati===false?"Prati":"Odprati" }</button>
          <button className="club-btn club-btn-secondary" onClick={(e)=>{e.preventDefault();korisnik===null||props.obj.korisnikPrati===false?Obavestenje():Redirekcija()}}>Kontakt</button>
          </>
          )}
          { (korisnik && korisnik.isAdmin) && (
          <>
          <button className="club-btn club-btn-secondary"onClick={()=>{props.setKlubZaIzmenu(props.obj);setRuta('/Klub');props.setOpenBasicModal(true)}}>Izmeni osnovne podatke</button>
          <button className="club-btn club-btn-primary" onClick={()=>{props.setKlubZaIzmenu(props.obj);setRuta('/Klub');props.setOpenEditModal(true);}}>Izmeni gde se takmiči</button>
          <button className="club-btn club-btn-secondary" onClick={(e)=>{e.preventDefault();setRuta('/Klub');props.setKlubZaIzmenu(props.obj);props.setOpenDeleteModal(true)}}>Obriši klub</button>
          </>
          )}
        </div>
      </div>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
              <Alert
                onClose={handleClose}
                severity={'error'}
                variant="filled"
                sx={{ width: '100%' }}
              >
                {poruka}
              </Alert>
            </Snackbar>
    </div>
  );
};

export default KarticaKlub;
