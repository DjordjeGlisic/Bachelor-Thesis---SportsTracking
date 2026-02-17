
import "./Utakmica/Utakmica.css";
import './UcinakIgracaNaTakmicenju.css';
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Rating
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { green, red } from "@mui/material/colors";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Context, TakmicenjeContext } from "../../../Context/Context";
import axios from "axios";
import Tabela from "../Tabela";
import KlubModal from "./Utakmica/KlubModal";
const UcinakIgracaNaTakmicenju=(props)=>{
    const {takmicenje}=useContext(TakmicenjeContext);
    const[sezona,setSezona]=useState(null);
    const [sezone,setSezone]=useState([]);
    const[nazivTabele,setNazivTabele]=useState(null);
    const[naziviTabela,setNaziviTabela]=useState([]);
    
    const[kriterijum,setKriterijum]=useState(null);
    const [kriterijumi,setKriterijumi]=useState([]);
    const [data,setData]=useState(null);
     const [imeFilter, setImeFilter] = useState("");
  const [klubFilter, setKlubFilter] = useState("");


    //////KLUB MODAL///////////////////////
  const{izabraniKlub,setIzabraniKlub,sport,korisnik}=useContext(Context);
  
   const focusBackRef = useRef(null);
   
   
     const close = () => {
      
       setIzabraniKlub(null);
       requestAnimationFrame(() => focusBackRef.current?.focus());
     };
 
  const klubHandler=(klubNaziv)=>{
    const korID=korisnik!=null?korisnik.id:0;
    const naziv=encodeURIComponent(klubNaziv);
     const response = axios.get(
              `http://localhost:5146/Korisnik/VratiKlubSporta/${sport}/${naziv}/${korID}`,
              {
                headers: {
                  // Ovde možete dodati header informacije ako su potrebne
                  // Authorization: `Bearer ${token}`
                },
              }
            )
              .then((response) => {
              
              console.log("Izabrani klub");
              setIzabraniKlub(response.data);
                console.log(response.data);
                
              })
              .catch((error) => {
                // Obrada greške
                console.log(error);
                
              });

  }







const filteredData = useMemo(() => {
  // ako je data null/undefined → vrati prazan niz
  if (!data) return [];

  return data.filter((x) => {
    const ime = (x.igrac ?? "").toLowerCase();
    const klub = (x.klub ?? "").toLowerCase();

    const imeOk = ime.includes(imeFilter.toLowerCase());
    const klubOk = klub.includes(klubFilter.toLowerCase());

    return imeOk && klubOk;
  });
}, [data, imeFilter, klubFilter]);

    let val=0;
     useEffect(() => {
        if(props.timovi===true)
        {

            const sezonaUrl = encodeURIComponent(sezona);
            const nazivUrl = encodeURIComponent(nazivTabele);
            const response =  axios.get(`http://localhost:5146/Korisnik/PribaviTabeluTakmicenjaUSezoni/${takmicenje.id}/${sezonaUrl}/${nazivUrl}`,
                    {
                      headers:{
                            //Authorization: `Bearer ${token}`
                        }
                      }).then(response=>{
                        setData(response.data);
                        console.log(response.data)
                        
                      })
                    .catch(error=>{
                      console.log(error);
                    })
          }
          else 
          {
           if(props.igraci===true)
            {
              val=-1;
             
            } 
            else
            { 
              
              switch(kriterijum)
              {
                case "Indeks korisnosti":
                    val=0;
                    break;
                case "Lista strelaca":
                case  "Najbolji strelci":
                    val=1;
                    break;
                case "Lista asistenata":
                case "Najbolji asistenti":
                  val=2;
                  break;
                case "Najefikasniji igrači":
                case"Najbolji skakači":
                  val=3;
                  break;
                case "Najprecizniji igrači":
                case"Najbolji kradljivci":
                  val=4;
                  break;
                case "Najgrublji igrači":
                case "Najbolji blokeri":
                  val=5;
                  break;
                case "Najagresvniji igrači":
                  val=6;
                  break;
                default:
                  val=0;
                  break;
                
                  
                
              }
          }
            
             const sezonaUrl = encodeURIComponent(sezona);
            const response =  axios.get(`http://localhost:5146/Korisnik/PribaviUcinakIgraca/${takmicenje.id}/${val}/${sezonaUrl}`,
                    {
                      headers:{
                            //Authorization: `Bearer ${token}`
                        }
                      }).then(response=>{
                        setData(response.data);
                       console.log("Igraci po kriterijumu");
                        console.log(response.data)
                        
                      })
                    .catch(error=>{
                      console.log(error);
                    })

          }

      }, [sezona,kriterijum,nazivTabele]);
      useEffect(()=>{
        const response =  axios.get(`http://localhost:5146/Korisnik/PribaviKriterijumeTakmicenja/${takmicenje.id}`,
                    {
                      headers:{
                            //Authorization: `Bearer ${token}`
                        }
                      }).then(response=>{
                       setKriterijumi(response.data.listaKriterijuma);
                       setKriterijum(response.data.listaKriterijuma[0]);
                       setSezone(response.data.sezone);
                       setSezona(response.data.sezone[0]);
                       setNaziviTabela(response.data.nazivi);
                       setNazivTabele(response.data.nazivi[0]); 
                       console.log("Kriterijumi");
                       console.log(response.data.listaKriterijuma)
                        
                      })
                    .catch(error=>{
                      console.log(error);
                    })

      },[])
     
return(
  <>
{izabraniKlub==null&&(
  <div className="tabela-wrapper">
   <div className="tabela-season-bar">
  <span className="tabela-season-label">Sezona</span>

  <select
    className="tabela-season-select"
    value={sezona}
    onChange={(e) => setSezona(e.target.value)}
  >
    {sezone.map((s, i) => (
      <option key={i} value={s}>
        {s}
      </option>
    ))}
  </select>
  {props.timovi==true&&(<select
    className="tabela-season-select"
    value={nazivTabele}
    onChange={(e) => setNazivTabele(e.target.value)}
  >
    {naziviTabela.map((s, i) => (
      <option key={i} value={s}>
        {s}
      </option>
    ))}
  </select>)}
  {(props.timovi===false&&props.igraci===false)&&( 
    <>
    <span className="tabela-season-label">Statistika Igrača</span>
    <select
    className="tabela-season-select"
    value={kriterijum}
    onChange={(e) => setKriterijum(e.target.value)}
  >
    {kriterijumi.map((s, i) => (
      <option key={i} value={s}>
        {s}
      </option>
    ))}
  </select></>)}
  {props.timovi===false&&props.igraci===true&&(
    <>
      <input
  type="text"
  className="search-input"
  placeholder="Pretraži po imenu i prezimenu"
  value={imeFilter}
   onChange={(e) => setImeFilter(e.target.value)}
/>
  <input
  type="text"
  className="search-input"
  placeholder="Pretraži igrače po klubu"
   value={klubFilter}
   onChange={(e) => setKlubFilter(e.target.value)}
/>    
    

    </>
  )}
</div>

    <div className="tabela-card">
        {(props.timovi===true&&takmicenje.sport===1)&&(
      <div className="tabela-header-row">
        <div className="col-pos">#</div>
        <div className="col-club">Klub</div>
        <div className="col-num">OU</div>
        <div className="col-num">P</div>
        <div className="col-num">N</div>
        <div className="col-num">I</div>
        <div className="col-num">DG</div>
        <div className="col-num">PG</div>
        <div className="col-num">GR</div>
        <div className="col-num">Bod</div>
        <div className="col-form">Poslednjih 5</div>
      </div>)}
      {(props.timovi===true&&takmicenje.sport===3)&&(
      <div className="tabela-header-row">
        <div className="col-pos">#</div>
        <div className="col-club">Klub</div>
        <div className="col-num">OU</div>
        <div className="col-num">P</div>
        <div className="col-num">I</div>
        <div className="col-num">DG</div>
        <div className="col-num">PG</div>
        <div className="col-num">GR</div>
        <div className="col-num">Bod</div>
        <div className="col-form">Poslednjih 5</div>
      </div>)}
         {props.timovi===true&&takmicenje.sport===2&&(
      <div className="tabela-header-row">
        <div className="col-pos">#</div>
        <div className="col-club">Klub</div>
        <div className="col-num">OU</div>
        <div className="col-num">P</div>
        <div className="col-num">I</div>
        <div className="col-num">PTS+</div>
        <div className="col-num">PTS-</div>
        <div className="col-num">DIFF</div>
        <div className="col-num">BOD</div>
        <div className="col-form">Poslednjih 5</div>
      </div>)}
  
      

{(data!==null&&props.timovi===true)&&(
      <div className="tabela-body">
        {data.map((row,ind) => (
          <div className="tabela-row" key={ind} onClick={()=>{klubHandler(row.klub)}}>
            <div className="col-pos">{ind+1}</div>
            <div className="col-club">
              <div className="club-logo-circle">
                <img src={row.logo}/>
              </div>
              <span className="club-name">{row.klub}</span>
            </div>
            <div className="col-num">{row.odigrane}</div>
            <div className="col-num">{row.pobeda}</div>
            {takmicenje.sport===1&&(<div className="col-num">{row.neresene}</div>)}
            <div className="col-num">{row.porazi}</div>
            <div className="col-num">{row.datiPoeni}</div>
            <div className="col-num">{row.primljeniPoeni}</div>
            <div className="col-num">{row.razlika}</div>
            <div className="col-num col-pts">{row.bodovi}</div>
            <div className="col-form">
              {row.poslednjihPet.map((f, idx) => (
                <span
                  key={idx}
                  className={
                    "form-dot " +
                    (f === 3 ? "form-win" : f === 1 ? "form-draw" : "form-loss")
                  }
                  />
                ))}
              
            </div>
          </div>
        ))}
      </div>)}
     
         {(!props.timovi&&data!=null&&props.igraci===false)&& (
      <Tabela data={data} naslov={kriterijum} />
      )}
        {(!props.timovi&&data!=null&&props.igraci===true)&& (
      <Tabela data={filteredData} naslov={"Spisak igrača"} />
      )}
    </div>
  </div>)}
  {izabraniKlub!==null&&( <KlubModal
                      open={izabraniKlub!=null}
                      onClose={close}
                     
                />)}
        </>
);





}
export default UcinakIgracaNaTakmicenju;