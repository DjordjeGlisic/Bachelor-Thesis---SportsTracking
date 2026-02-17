import {React,useContext,useState,useEffect} from "react";
import "./Statistika.css";
import { UtakmicaContext,TakmicenjeContext,Context } from "../../../../Context/Context";
import Utakmica from "./Utakmica";
import axios from "axios";
import { Avatar } from "@mui/material";
const Statistika = () => {
   
    const {utakmica}=useContext(UtakmicaContext);
    const {takmicenje}=useContext(TakmicenjeContext);
    const [statsFudbal,setStatsFudbal]=useState(null);
    const [statsKosarka,setStatsKosarka]=useState(null);
    const [statsVaterpolo,setStatsVaterpolo]=useState(null);
    
    
    useEffect(() => {
        
        const response =  axios.get(`http://localhost:5146/Korisnik/GetStatistika/${utakmica.id}/${takmicenje.sport}`,
            {
                headers:{
                    //Authorization: `Bearer ${token}`
                }
            }).then(response=>{
                console.log(response.data.value);
                            let niz=[];
                switch(takmicenje.sport)
                {
                    case 1:
                        niz = [
                            { label: "Golovi", home: response.data.domGolovi, away: response.data.gosGolovi },
                            { label: "Ukupno šuteva", home: response.data.domSutevi, away: response.data.gosSutevi },
                            { label: "Šutevi ka golu", home: response.data.domSutGol, away: response.data.gosSutevi },
                            { label: "Posed lopte", home: `${response.data.domPosed}%`, away: `${response.data.gosPosed}%` },
                            { label: "Preciznost dodavanja", home: `${response.data.domPreciznost}%`, away: `${response.data.gosPreciznost}%` },
                            { label: "Žuti kartoni", home: response.data.domZuti, away: response.data.gosZuti },
                            { label: "Crveni kartoni", home: response.data.domCrveni, away: response.data.gosCrveni },
                        
                        ];
                        setStatsFudbal(niz);
                        setStatsKosarka(null);
                        setStatsVaterpolo(null);
                        break;
                    case 2:
                         niz=[
                                { label: "Prva četvrtina", home: response.data.domPrva, away: response.data.gosPrva },
                                { label: "Druga četvrtina", home: response.data.domDruga, away: response.data.gosDruga },
                                { label: "Treća četvrtina", home: response.data.domTreca, away: response.data.gosTreca },
                                { label: "Četvrta četvrtina", home: response.data.domCetvrta, away: response.data.gosCetvrta },
                                { label: "Ukupno skokova", home: response.data.domSkok, away: response.data.gosSkok },
                                { label: "Ukradene lopte", home: response.data.domUkradene, away: response.data.gosUkradene },
                                { label: "Blokade", home: response.data.domBlok, away: response.data.gosBlok },
                                { label: "Ubačenih slobodnih bacanja", home: response.data.domPenali, away: response.data.gosPenali },
                                { label: "Ubačenih dvojki", home: response.data.domDva, away: response.data.gosDva },
                                { label: "Ubačenih trojki", home: response.data.domTri, away: response.data.gosTri },
                         ];
                         setStatsKosarka(niz);
                         setStatsFudbal(null);
                        setStatsVaterpolo(null);
                        break;
                    case 3:
                       niz = [
                                    { label: "Prva četvrtina", home: response.data.domPrva, away: response.data.gosPrva },
                                    { label: "Druga četvrtina", home: response.data.domDruga, away: response.data.gosDruga },
                                    { label: "Treća četvrtina", home: response.data.domTreca, away: response.data.gosTreca },
                                    { label: "Četvrta četvrtina", home: response.data.domCetvrta, away: response.data.gosCetvrta },
                                    { label: "Golovi", home: response.data.domGolovi, away: response.data.gosGolovi },
                                    { label: "Asistencije", home: response.data.domAsistencije, away: response.data.gosAsistencije },
                                    { label: "Isključenja", home: response.data.domIskljucenja, away: response.data.gosIskljucenja},
                                    { label: "Realizovani peterci", home: response.data.domPet, away: response.data.gosPet },
    
                             ];
                             setStatsVaterpolo(niz);
                         setStatsKosarka(null);
                         setStatsFudbal(null);
                        break;
                    default:
                        break;
                }
                
                 console.log(`Stampam statistiku utakmice`);
                 console.log(response.data);
             
            })
            .catch(error=>{
                console.log(error);
            })
        }, []);
  
  
    const homeTeam = {
    name: utakmica.domacin,
   
   
  };

  const awayTeam = {
    name: utakmica.gost,
   
  };

  

 




  return (
    <div className="team-stats-card">
      {/* gornji red: grbovi i naslov */}
      <div className="team-stats-header">
        <Avatar alt={homeTeam.name} className="ts-logo" >  {utakmica.domacin.slice(0, 3).toUpperCase()}</Avatar>
        <span className="ts-title">STATISTIKA TIMA</span>
         <Avatar alt={homeTeam.name} className="ts-logo" >  {utakmica.gost.slice(0, 3).toUpperCase()}</Avatar>
      </div>

      {/* tabela statistika */}
      <div className="team-stats-body">
        
        {statsFudbal!==null&&statsFudbal.map((row, idx) => (
          <div className="ts-row" key={idx}>
            <div className="ts-value ts-value-left">
              <span className={row.home>=row.away?"ts-pill-more":"ts-pill-less"}>{row.home}</span>
            </div>
            <div className="ts-label">{row.label}</div>
            <div className="ts-value ts-value-right">
              <span className={row.home<=row.away?"ts-pill-more":"ts-pill-less"}>{row.away}</span>
            </div>
          </div>
        ))}
        {statsKosarka!==null&&statsKosarka.map((row, idx) => (
          <div className="ts-row" key={idx}>
            <div className="ts-value ts-value-left">
              <span className={row.home>=row.away?"ts-pill-more":"ts-pill-less"}>{row.home}</span>
            </div>
            <div className="ts-label">{row.label}</div>
            <div className="ts-value ts-value-right">
              <span className={row.home<=row.away?"ts-pill-more":"ts-pill-less"}>{row.away}</span>
            </div>
          </div>
        ))}
         {statsVaterpolo!==null&&statsVaterpolo.map((row, idx) => (
          <div className="ts-row" key={idx}>
            <div className="ts-value ts-value-left">
              <span className={row.home>=row.away?"ts-pill-more":"ts-pill-less"}>{row.home}</span>
            </div>
            <div className="ts-label">{row.label}</div>
            <div className="ts-value ts-value-right">
              <span className={row.home<=row.away?"ts-pill-more":"ts-pill-less"}>{row.away}</span>
            </div>
          </div>
        ))}
      </div>

      {/* mesto odigravanja */}
      <div className="team-stats-venue">
        <span className="venue-label">Mesto: </span>
        <span className="venue-text">{utakmica.lokacija}</span>
      </div>
    </div>
  );
};

export default Statistika;