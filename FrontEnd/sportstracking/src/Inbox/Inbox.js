import React, { useRef } from "react";
import "./Inbox.css";
import {useState,useEffect,useContext} from 'react';
import { Context,KluboviContext } from "../Context/Context";
import Poruka from "../Korisnik/Prikaz/Rezultati/Utakmica/Poruka";
import axios from "axios";
import { HubConnectionBuilder } from "@microsoft/signalr";

const Inbox = () => {
    const handleNewMsg=(x)=>{
          console.log(x);
              
             setPoruke(prev => [
        ...prev,
        {
          id: x.id,
         
          side:x.username === (korisnik.username || x.username === klub.email) ? "right" : "left",
          username:x.username,
          text: x.text,
          time: x.time,
          sent: "sent",
          day: x.day
        }
      ])
      setKlubKontakti(prev =>
  prev.map((m,ind) =>
    ind === activeId
      ? { ...m, text: x.text,day:x.day,time:x.time }   // promenjen samo ovaj
      : m                                     // ostali nepromenjeni
  )
);
      ;
    }
    const handleDelete=(idPoruke)=>{
      setPoruke(prev =>
            prev.filter(m => m.id !== idPoruke)
          );
    }
    const handleNewChat=(obj)=>{

          setKlubKontakti(prev =>
          {
            const postoji = prev.some(k => k.naziv === obj.naziv);

            if (postoji) return prev;   
             return [...prev,obj];
          }
          );
    }
    const [newMessage,setNewMessage]=useState("");
    //const [messages,setMessages]=useState([]);
    const [activeId, setActiveId] = useState(null);
    const [klubKontakti,setKlubKontakti] =useState( []);
    const { background, letters, contentColor,korisnik,sport,openSide,izabraniKlub,setIzabraniKlub,chat,setChat,poruke,setPoruke } = useContext(Context);
      const {klub,setKlub,izabraniKorisnik,setIzabraniKorisnik} = useContext(KluboviContext);
    const[sportText,setSportText]=useState("FUDBALSKIM");
    
      const scrollRef = useRef(null);
    
      // uvek skroluj na dno kad stigne nova poruka
      useEffect(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, [poruke]);
      useEffect(() => {
            const connection = new HubConnectionBuilder()
              .withUrl("http://localhost:5146/ChatHub") 
              .build();
            if(korisnik==null&&klub==null  )
                return;
            connection.start().then(() => {
              console.log('Connected to SignalR hub');
            });
        if(klub!==null&&izabraniKorisnik===null)
                return;
          let korID=korisnik==null?izabraniKorisnik.id:korisnik.id;
          if(korisnik!==null&&izabraniKlub===null)
            return;
          let klubID=korisnik==null?klub.id:izabraniKlub.id;
            connection.on(`Stigla nova poruka korID=${korID} klubID=${klubID}`, (x) => {
              //console.log(korisnik.username);
            handleNewMsg(x);
            });
             connection.on(`Obrisana poruka:${korID}:${klubID}:${sport}`, (idPoruke) => {
                  console.log("SignalR Obrisana poruka stigla, id =", idPoruke);
                handleDelete(idPoruke);
        });
        let id=korisnik!==null?korisnik.id:klub.id;
           connection.on(`Dodaj novi chat:${id}`, (obj) => {
        handleNewChat(obj);
        }); 
          
              return () => {
    connection.off(
      `Stigla nova poruka korID=${korID} klubID=${klubID}`,
      handleNewMsg
    );
    connection.off(
      `Obrisana poruka:${korID}:${klubID}:${sport}`,
      handleDelete
    );
    connection.off(
      `Dodaj novi chat:${id}`,
      handleNewChat
    );
    connection.stop();
  };
          }, [korisnik,klub,izabraniKlub,izabraniKorisnik]);
    useEffect(()=>{
       
        setKlubKontakti([]);
        setActiveId(null);
        if(korisnik!==null)
        {

            switch (sport) {
                case 1:
                setSportText("FUDBALSKIM");
                break;
            case 2:
                setSportText("KOŠARKAŠKIM");
                break;
            case 3:
                setSportText("VATERPOLO");
                break;
            default:
                break;
            }
        }
        console.log("KORISNIK"+korisnik.id);
        console.log("KLUB"+izabraniKlub?.id);
                
        const id=korisnik===null?klub.id:korisnik.id;
        const kor=korisnik===null?false:true;
       const response =  axios.get(`http://localhost:5146/Korisnik/VratiInbox/${id}/${sport}/${kor}`,
        {
            headers:{
            //Authorization: `Bearer ${token}`
            }
        }).then(response=>{
            console.log(response.data);
            setKlubKontakti(response.data);
        
            
        })
        .catch(error=>{
            console.log(error);
        })
        

    },[sport]);
   
    const chatHandler=(kontakt,ind)=>{
        setActiveId(ind);
       setChat(null);
         const response =  axios.get(`http://localhost:5146/Korisnik/VratiChatKorKlub/${kontakt.korId}/${kontakt.klubId}/${sport}`,
        {
            headers:{
            //Authorization: `Bearer ${token}`
            }
        }).then(response=>{
            console.log("Poruke");
            console.log(response.data);
            setPoruke(response.data);
            setIzabraniKlub(kontakt.klubKor);
            setChat(1);
            
        })
        .catch(error=>{
            console.log(error);
        })
        
       
    }
    const slanjeHandler=()=>{
        let korisnikID=korisnik===null?izabraniKorisnik.id:korisnik.id;
        let klubID=korisnik===null?klub.id:izabraniKlub.id;
        let kor=korisnik===null?false:true;
          const response = axios.post(
          `http://localhost:5146/Korisnik/PosaljiPorukuKlubKorisnik/${korisnikID}/${klubID}/${sport}/${kor}`,
          {
            sadrzaj: newMessage
          },
          {
            headers: {
              // Ovde možete dodati header informacije ako su potrebne
              // Authorization: `Bearer ${token}`
            },
          }
        )
          .then((response) => {
          
          console.log(response.data);
            
          })
          .catch((error) => {
            // Obrada greške
            console.log(error);
            
          });

    setNewMessage("");
    }
    const handleDeleteDB=(event,id)=>{
        event.preventDefault();
        let korID=korisnik===null?izabraniKorisnik.id:korisnik.id;
        let klubID=korisnik===null?klub.id:izabraniKlub.id;
        
         const response = axios.delete(
          `http://localhost:5146/Korisnik/ObrisiPorukuKlubKorsinsik/${korID}/${klubID}/${sport}/${id}`,
          {
            sadrzaj: newMessage
          },
          {
            headers: {
              // Ovde možete dodati header informacije ako su potrebne
              // Authorization: `Bearer ${token}`
            },
          }
        )
          .then((response) => {
          
          console.log(response.data);
            
          })
          .catch((error) => {
            // Obrada greške
            console.log(error);
            
          });

    }
  return (
    <div className="kc-wrapper">
      <div className="kc-layout">
        {/* LEVO – lista kontakata */}
        {openSide===false&&(
        <aside className="kc-sidebar">
          <header className="kc-sidebar-header">
            <h2 className="kc-sidebar-title">Kontakt sa {sportText} klubovima</h2>
          </header>

        

          <div className="kc-contact-list" style={{background:background,color:letters}}>
            {klubKontakti.map((k,ind) => (
              <div key={ind} className={activeId === ind ? "kc-contact-item kc-contact-item-active" : "kc-contact-item"}
               onClick={()=>{chatHandler(k,ind)}}
               >
                

                <div className="kc-contact-main">
                  <div className="kc-contact-row kc-contact-row-top">
                    <span className="kc-contact-name"style={{color:letters}}>{k.naziv}</span>
                    <span className="kc-contact-time"style={{color:letters}}>{k.day}-{k.time}</span>
                  </div>
                  <div className="kc-contact-row">
                    <span className="kc-contact-preview" style={{color:letters}}>{k.text}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>)}

        {/* DESNO – statičan deo sa 3 kartice */}
              <main className="kc-main" style={{ background:background, color: letters }}>
  <div className="kc-main-inner">
    {chat !== null && (
    <div className="chat-window-klub">
      {/* HEADER */}
     <div className="chat-header">
        <img
          className="club-logo"
          src={izabraniKlub!==null?izabraniKlub.logo==null?izabraniKlub.logoURL:izabraniKlub.logo:null}
          alt="Club logo"
        />
        <span className="club-name">{izabraniKlub!==null&&izabraniKlub.naziv}</span>
      </div>

      {/* PORUKE – OVO SE SKROLUJE */}
      <div className="chat-scroll-klub"  ref={scrollRef} style={{color:'white'}}>
        {poruke.map((m,ind) => (
          <Poruka
            key={ind}
            id={m.id}
            side={(m.username===korisnik?.username||m.username===klub?.email)?"right":"left"}
            text={m.text}
            time={`${m.day}:${m.time}`}
            sent={"sent"}
            user={m.username}
           saKlubom={true}
           delete={handleDeleteDB}
          />
        ))}
      </div>

      {/* INPUT – UVEK DOLE */}
      <form className="chat-input-bar">
        <input
          className="chat-input-field"
          type="text"
          placeholder={
           `Napišite pouruku ${korisnik!==null?"klubu":"korisniku"}`
          }
          disabled={korisnik === null}
          value={newMessage}
          onChange={(event)=>{setNewMessage(event.target.value)}}
        />
        <button
          type="submit"
          className="chat-icon-btn chat-send-btn"
          aria-label="Send"
          disabled={korisnik === null}
          onClick={(e)=>{e.preventDefault();slanjeHandler()}}
        >
          ➤
        </button>
      </form>
    </div>)}
  </div>
</main>

      </div>
    </div>
    
  );
};

export default Inbox;
