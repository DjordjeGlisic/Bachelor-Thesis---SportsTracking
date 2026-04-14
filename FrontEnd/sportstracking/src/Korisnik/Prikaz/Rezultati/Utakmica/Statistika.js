import {React,useContext,useState,useEffect} from "react";
import "./Statistika.css";
import { UtakmicaContext,TakmicenjeContext,Context } from "../../../../Context/Context";
import Utakmica from "./Utakmica";
import axios from "axios";
import { Avatar, IconButton } from "@mui/material";
import { HubConnectionBuilder } from "@microsoft/signalr";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
const Statistika = ({setPoruka,setOpenSnack,setTip }) => {
   
    const {utakmica}=useContext(UtakmicaContext);
    const {takmicenje}=useContext(TakmicenjeContext);
    const {korisnik,sport} = useContext(Context);
    const [statsFudbal,setStatsFudbal]=useState(null);
    const [statsKosarka,setStatsKosarka]=useState(null);
    const [statsVaterpolo,setStatsVaterpolo]=useState(null);
    const handleNewStatChange = (x) => {
        let niz=[];
                switch(takmicenje.sport)
                {
                    case 1:
                        niz = [
                            { label: "Golovi", home: x.goloviDomacin, away: x.goloviGost,prop:null },
                            { label: "Ukupno šuteva", home: x.sutDomacin, away: x.sutGost ,prop:null },
                            { label: "Šutevi ka golu", home: x.sutKaGolDomacin, away: x.sutKaGolGost,prop:'sutKaGol' },
                            { label: "Posed lopte", home: `${x.posedDomacin}%`, away: `${x.posedGost}%`,prop:'posed' },
                            { label: "Preciznost dodavanja", home: `${x.preciznostPasovaDomacin}%`, away: `${x.preciznostPasovaGost}%`,prop:null },
                            { label: "Žuti kartoni", home:x.zutiKartoniDomacin, away: x.zutiKartoniGost,prop:null },
                            { label: "Crveni kartoni", home: x.crveniKartoniDomacin, away: x.crveniKartoniGost,prop:null },
                        
                        ];
                        setStatsFudbal(niz);
                        setStatsKosarka(null);
                        setStatsVaterpolo(null);
                        break;
                    case 2:
                         niz=[
                                { label: "Prva četvrtina", home: x.prvaCetDomacin, away: x.prvaCetGost,prop:null },
                                { label: "Druga četvrtina", home: x.drugaCetDomacin, away:  x.drugaCetGost,prop:null },
                                { label: "Treća četvrtina", home: x.trecaCetDomacin, away:  x.trecaCetGost,prop:null },
                                { label: "Četvrta četvrtina", home: x.cetvCetDomacin, away:  x.cetvCetGost,prop:null },
                                { label: "Ukupno skokova", home: x.reboundsDomacin, away: x.reboundsGost,prop:null },
                                { label: "Ukradene lopte", home: x.stealsDomacin, away: x.stealsGost,prop:null },
                                { label: "Blokade", home: x.blocksDomacin, away: x.blocksGost,prop:null },
                                { label: "Ubačenih slobodnih bacanja", home: x.freeThrowDomacin, away: x.freeThrowGost,prop:'bacanja' },
                                { label: "Ubačenih dvojki", home: x.twoPointDomacin, away: x.twoPointGost,prop:'dva' },
                                { label: "Ubačenih trojki", home: x.threePointDomacin, away: x.threePointGost,prop:'tri' },
                         ];
                         setStatsKosarka(niz);
                         setStatsFudbal(null);
                        setStatsVaterpolo(null);
                        break;
                    case 3:
                       niz = [
                                    { label: "Prva četvrtina", home: x.vP_PrvaCetDomacin, away: x.vP_PrvaCetGost,prop:null },
                                    { label: "Druga četvrtina", home: x.vP_DrugaCetDomacin, away: x.vP_DrugaCetGost,prop:null },
                                    { label: "Treća četvrtina", home: x.vP_TrecaCetDomacin, away:  x.vP_TrecaCetGost,prop:null },
                                    { label: "Četvrta četvrtina", home: x.vP_CetvCetDomacin, away:  x.vP_CetvCetGost,prop:null },
                                    { label: "Golovi", home: x.vP_PrvaCetDomacin+x.vP_DrugaCetDomacin+x.vP_TrecaCetDomacin+x.vP_CetvCetDomacin
                                      , away: x.vP_PrvaCetGost+x.vP_DrugaCetGost+x.vP_TrecaCetGost+x.vP_CetvCetGost,prop:null },
                                    { label: "Asistencije", home: x.asistencijeDomacin, away: x.asistencijeGost,prop:null },
                                    { label: "Isključenja", home: x.iskljucenjaDomacin, away: x.iskljucenjaGost,prop:null },
                                    { label: "Realizovani peterci", home:x.peterciDomacin, away: x.peterciGost,prop:'peterci'},
    
                             ];
                         setStatsVaterpolo(niz);
                         setStatsKosarka(null);
                         setStatsFudbal(null);
                        break;
                    default:
                        break;
                }
    }
    
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
                            { label: "Golovi", home: response.data.domGolovi, away: response.data.gosGolovi, prop:null },
                            { label: "Ukupno šuteva", home: response.data.domSutevi, away: response.data.gosSutevi, prop:null },
                            { label: "Šutevi ka golu", home: response.data.domSutGol, away: response.data.gosSutGol, prop:'sutKaGol' },
                            { label: "Posed lopte", home: `${response.data.domPosed}%`, away: `${response.data.gosPosed}%`, prop:'posed' },
                            { label: "Preciznost dodavanja", home: `${response.data.domPreciznost}%`, away: `${response.data.gosPreciznost}%`,prop:null },
                            { label: "Žuti kartoni", home: response.data.domZuti, away: response.data.gosZuti, prop:null },
                            { label: "Crveni kartoni", home: response.data.domCrveni, away: response.data.gosCrveni,prop:null },
                        
                        ];
                        setStatsFudbal(niz);
                        setStatsKosarka(null);
                        setStatsVaterpolo(null);
                        break;
                    case 2:
                         niz=[
                                { label: "Prva četvrtina", home: response.data.domPrva, away: response.data.gosPrva,prop:null },
                                { label: "Druga četvrtina", home: response.data.domDruga, away: response.data.gosDruga,prop:null },
                                { label: "Treća četvrtina", home: response.data.domTreca, away: response.data.gosTreca,prop:null },
                                { label: "Četvrta četvrtina", home: response.data.domCetvrta, away: response.data.gosCetvrta,prop:null },
                                { label: "Ukupno skokova", home: response.data.domSkok, away: response.data.gosSkok,prop:null },
                                { label: "Ukradene lopte", home: response.data.domUkradene, away: response.data.gosUkradene,prop:null },
                                { label: "Blokade", home: response.data.domBlok, away: response.data.gosBlok,prop:null },
                                { label: "Ubačenih slobodnih bacanja", home: response.data.domPenali, away: response.data.gosPenali,prop:'bacanja' },
                                { label: "Ubačenih dvojki", home: response.data.domDva, away: response.data.gosDva,prop:'dva' },
                                { label: "Ubačenih trojki", home: response.data.domTri, away: response.data.gosTri,prop:'tri' },
                         ];
                         setStatsKosarka(niz);
                         setStatsFudbal(null);
                        setStatsVaterpolo(null);
                        break;
                    case 3:
                       niz = [
                                    { label: "Prva četvrtina", home: response.data.domPrva, away: response.data.gosPrva,prop:null },
                                    { label: "Druga četvrtina", home: response.data.domDruga, away: response.data.gosDruga,prop:null },
                                    { label: "Treća četvrtina", home: response.data.domTreca, away: response.data.gosTreca,prop:null },
                                    { label: "Četvrta četvrtina", home: response.data.domCetvrta, away: response.data.gosCetvrta,prop:null },
                                    { label: "Golovi", home: response.data.domGolovi, away: response.data.gosGolovi,prop:null },
                                    { label: "Asistencije", home: response.data.domAsistencije, away: response.data.gosAsistencije,prop:null },
                                    { label: "Isključenja", home: response.data.domIskljucenja, away: response.data.gosIskljucenja,prop:null},
                                    { label: "Realizovani peterci", home: response.data.domPet, away: response.data.gosPet,prop:'peterci' },
    
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
        }, [utakmica.id,takmicenje.sport]);
  useEffect(() => {
         const connection = new HubConnectionBuilder()
           .withUrl("http://localhost:5146/MatchHub") 
           .build();
       
         connection.start().then(() => {
           console.log('Connected to SignalR hub');
         });
       
         connection.on(`PromenjenaStatistikaUtakmice${utakmica.id}`, (x) => {
           console.log(x);
          handleNewStatChange(x);
          });
          connection.off(
      `PromenjenaStatistikaUtakmice${utakmica.id}`,
      handleNewStatChange
    );
      
       }, []);
  
    const homeTeam = {
    name: utakmica.domacin,
   
   
  };

  const awayTeam = {
    name: utakmica.gost,
   
  };
  const  promeniStat = (klub,parametar,promena) => 
  {
      let obj = {
        klub: klub,
        parametar: parametar,
        promena : promena
      };
      axios.put(`http://localhost:5146/Admin/AzurirajStatUtakmice/${utakmica.id}/${sport}`,obj)
       .then((res)=>{
            // setTip("success");
            // setPoruka("Uspešno ažurirana statistika utakmcie");
            // setOpenSnack(true);
        })
        .catch((err)=>{
            setTip("error");
            setPoruka(err.response.data);
            setOpenSnack(true);
        })
  }
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
              <div className="stat-controls-wrapper">
              { ( (korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label === "Posed lopte" || row.label === "Šutevi ka golu") )? (
               <IconButton  className="btn-stat" onClick={()=>{promeniStat("domacin",row.prop,"oduzmi")}}
                 sx={{ color: '#555' }}>
                 <RemoveIcon fontSize="small" />
               </IconButton>
              ) : <div className="btn-placeholder" />}
              <span className={row.home>=row.away?"ts-pill-more":"ts-pill-less"}>{row.home}</span>
              {((korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label === "Posed lopte" || row.label === "Šutevi ka golu") ) ? (
                  <IconButton  className="btn-stat"   onClick={()=>{promeniStat("domacin",row.prop,"dodaj")}}
                   sx={{ color: '#555' }}>
                    <AddIcon fontSize="small" />
                   </IconButton>
                ) : <div className="btn-placeholder" />}
              </div>
            </div>
            <div className="ts-label">{row.label}</div>
            <div className="ts-value ts-value-right">
              <div className="stat-controls-wrapper">
              {((korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label === "Posed lopte" || row.label === "Šutevi ka golu") ) ? (
                <IconButton className="btn-stat" onClick={()=>{promeniStat("gost",row.prop,"oduzmi")}}
                  sx={{ color: '#555' }}>
                    <RemoveIcon fontSize="small"/>
                </IconButton>
              ) : <div className="btn-placeholder" /> }
              <span className={row.home<=row.away?"ts-pill-more":"ts-pill-less"}>{row.away}</span>
             {((korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label === "Posed lopte" || row.label === "Šutevi ka golu") ) ? (
                  <IconButton className="btn-stat"  onClick={()=>{promeniStat("gost",row.prop,"dodaj")}}
                   sx={{ color: '#555' }}
                  >
                    <AddIcon fontSize="small"/>
                  </IconButton>
                ) : <div className="btn-placeholder" />}
                </div>
            </div>
          </div>
        ))}
        {statsKosarka!==null&&statsKosarka.map((row, idx) => (
          <div className="ts-row" key={idx}>
            <div className="ts-value ts-value-left">
               <div className="stat-controls-wrapper">
                 { ( (korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label ===  "Ubačenih slobodnih bacanja" || row.label === "Ubačenih dvojki" || row.label === "Ubačenih trojki") )? (
               <IconButton  className="btn-stat" onClick={()=>{promeniStat("domacin",row.prop,"oduzmi")}}
                 sx={{ color: '#555' }}>
                 <RemoveIcon fontSize="small" />
               </IconButton>
              ) : <div className="btn-placeholder" />}
              <span className={row.home>=row.away?"ts-pill-more":"ts-pill-less"}>{row.home}</span>
               { ( (korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label ===  "Ubačenih slobodnih bacanja" || row.label === "Ubačenih dvojki" || row.label === "Ubačenih trojki") )? (
               <IconButton  className="btn-stat" onClick={()=>{promeniStat("domacin",row.prop,"dodaj")}}
                 sx={{ color: '#555' }}>
                 <AddIcon fontSize="small" />
               </IconButton>
              ) : <div className="btn-placeholder" />}
              </div>
            </div>
            <div className="ts-label">{row.label}</div>
            <div className="ts-value ts-value-right">
               <div className="stat-controls-wrapper">
                  { ( (korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label ===  "Ubačenih slobodnih bacanja" || row.label === "Ubačenih dvojki" || row.label === "Ubačenih trojki") )? (
               <IconButton  className="btn-stat" onClick={()=>{promeniStat("gost",row.prop,"oduzmi")}}
                 sx={{ color: '#555' }}>
                 <RemoveIcon fontSize="small" />
               </IconButton>
              ) : <div className="btn-placeholder" />}
              <span className={row.home<=row.away?"ts-pill-more":"ts-pill-less"}>{row.away}</span>
               { ( (korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label ===  "Ubačenih slobodnih bacanja" || row.label === "Ubačenih dvojki" || row.label === "Ubačenih trojki") )? (
               <IconButton  className="btn-stat" onClick={()=>{promeniStat("gost",row.prop,"dodaj")}}
                 sx={{ color: '#555' }}>
                 <AddIcon fontSize="small" />
               </IconButton>
              ) : <div className="btn-placeholder" />}
              </div>
            </div>
          </div>
        ))}
         {statsVaterpolo!==null&&statsVaterpolo.map((row, idx) => (
          <div className="ts-row" key={idx}>
            <div className="ts-value ts-value-left">
               <div className="stat-controls-wrapper">
                 { ( (korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label ===  "Realizovani peterci") )? (
               <IconButton  className="btn-stat" onClick={()=>{promeniStat("domacin",row.prop,"oduzmi")}}
                 sx={{ color: '#555' }}>
                 <RemoveIcon fontSize="small" />
               </IconButton>
              ) : <div className="btn-placeholder" />}
              <span className={row.home>=row.away?"ts-pill-more":"ts-pill-less"}>{row.home}</span>
                { ( (korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label ===  "Realizovani peterci") )? (
               <IconButton  className="btn-stat"  onClick={()=>{promeniStat("domacin",row.prop,"dodaj")}}
                 sx={{ color: '#555' }}>
                 <AddIcon fontSize="small" />
               </IconButton>
              ) : <div className="btn-placeholder" />}
              </div>
            </div>
            <div className="ts-label">{row.label}</div>
            <div className="ts-value ts-value-right">
               <div className="stat-controls-wrapper">
                  { ( (korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label ===  "Realizovani peterci") )? (
               <IconButton  className="btn-stat"  onClick={()=>{promeniStat("gost",row.prop,"oduzmi")}}
                 sx={{ color: '#555' }}>
                 <RemoveIcon fontSize="small" />
               </IconButton>
              ) : <div className="btn-placeholder" />}
              <span className={row.home<=row.away?"ts-pill-more":"ts-pill-less"}>{row.away}</span>
                { ( (korisnik && korisnik.isAdmin && utakmica.uzivo) && (row.label ===  "Realizovani peterci") )? (
               <IconButton  className="btn-stat"  onClick={()=>{promeniStat("gost",row.prop,"dodaj")}}
                 sx={{ color: '#555' }}>
                 <AddIcon fontSize="small" />
               </IconButton>
              ) : <div className="btn-placeholder" />}
              </div>
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