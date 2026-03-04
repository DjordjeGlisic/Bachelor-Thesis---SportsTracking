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
         
          side: x.username === korisnik?.username ? "right" : x.username == klub?.username  ? "right" : "left",
          username:x.username,
          text: x.text,
          time: x.time,
          sent: "sent",
          day: x.day
        }
      ])
      if(korisnik)
      {
          setKlubKontakti(prev =>
      prev.map((m,ind) =>
        ind === activeId
          ? { ...m, text: x.text,day:x.day,time:x.time }   // promenjen samo ovaj
          : m                                     // ostali nepromenjeni
      )
    );

      }
      else if (klub)
      {
        console.log("Kontakti");
        console.log(korisniciKontakti);
         setKorisniciKontakti(prev =>
      prev.map((m,ind) =>
        m.naziv === x.username
          ? { ...m, text: x.text,day:x.day,time:x.time }   // promenjen samo ovaj
          : m                                     // ostali nepromenjeni
      )
    );
      }
      
    }
    const handleDelete=(idPoruke)=>{
      setPoruke(prev =>
            prev.filter(m => m.id !== idPoruke)
          );
    }
   const handleNewContatsChange = (obj) => {
    if (korisnik) {
      console.log("Dosadasnji blog iz ugla korisnika");
      console.log(klubKontakti);
        setKlubKontakti(prev => 
            prev.map(m => 
                m.klubKor.email == obj.username
                    ? { ...m, text: obj.text, day: obj.day, time: obj.time }
                    : m
            )
        );
    } 
    else if (klub) {
      
        setKorisniciKontakti(prev => 
            prev.map(m => 
                m.naziv == obj.username
                    ? { ...m, text: obj.text, day: obj.day, time: obj.time }
                    : m
            )
        );
    }
}
    const handleNewChat=(obj)=>{

        if(korisnik)
        {
          setKlubKontakti(prev =>
          {
            const postoji = prev.some(k => k.naziv === obj.naziv);

            if (postoji) return prev;   
             return [...prev,obj];
          }
          );

        }
        else if (klub)
        {
           setKorisniciKontakti(prev =>
          {
            const postoji = prev.some(k => k.username === obj.username);

            if (postoji) return prev;   
             return [...prev,obj];
          }
          );

        }
    }
    const [newMessage,setNewMessage]=useState("");
    //const [messages,setMessages]=useState([]);
    const [activeId, setActiveId] = useState(null);
    const [klubKontakti,setKlubKontakti] =useState( []);
    const [korisniciKontakti,setKorisniciKontakti]=useState([]);
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
            let Sport=klub ? klub.sport : sport;
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
            connection.on(`Stigla nova poruka ID=${!klub ? korisnik.id : klub.id}`, (x) => {
              console.log("Stigla nova poruka klubu od nekog korisnika");
              console.log(x);
            handleNewContatsChange(x);
            });
             connection.on(`Obrisana poruka:${korID}:${klubID}:${Sport}`, (idPoruke) => {
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
      `Obrisana poruka:${korID}:${klubID}:${Sport}`,
      handleDelete
    );
    connection.off(
      `Dodaj novi chat:${id}`,
      handleNewChat
    );
    connection.off(
      `Stigla nova poruka ID=${!klub ? korisnik.id : klub.id}`,
       handleNewContatsChange
    );
    connection.stop();
  };
          }, [korisnik,klub,izabraniKlub,izabraniKorisnik]);
    useEffect(()=>{
       
        setKlubKontakti([]);
        setKorisniciKontakti([]);
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

                
        const id=korisnik===null?klub.id:korisnik.id;
        const kor=korisnik===null?false:true;
        let Sport=korisnik===null?klub.sport : sport;
        if( klub )
          setChat(null);
       const response =  axios.get(`http://localhost:5146/Korisnik/VratiInbox/${id}/${Sport}/${kor}`,
        {
            headers:{
            //Authorization: `Bearer ${token}`
            }
        }).then(response=>{
            console.log(response.data);
            if(korisnik)
              setKlubKontakti(response.data);
            else if (klub)
              setKorisniciKontakti(response.data);
        
            
        })
        .catch(error=>{
            console.log(error);
        })
        

    },[sport]);
   
    const chatHandler=(kontakt,ind)=>{
      console.log("Ovo je kontakt");
      console.log(kontakt);
      let Sport=korisnik===null?klub.sport : sport;
        setActiveId(ind);
       setChat(null);
         const response =  axios.get(`http://localhost:5146/Korisnik/VratiChatKorKlub/${kontakt.korId}/${kontakt.klubId}/${Sport}`,
        {
            headers:{
            //Authorization: `Bearer ${token}`
            }
        }).then(response=>{
            console.log("Poruke");
            console.log(response.data);
            setPoruke(response.data);
            if(korisnik)
              setIzabraniKlub(kontakt.klubKor);
            else if (klub)
              setIzabraniKorisnik(kontakt.klubKor);
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
        let Sport=!klub ? sport : klub.sport;
          const response = axios.post(
          `http://localhost:5146/Korisnik/PosaljiPorukuKlubKorisnik/${korisnikID}/${klubID}/${Sport}/${kor}`,
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
        let Sport= !klub ? sport : klub.sport;
        
         const response = axios.delete(
          `http://localhost:5146/Korisnik/ObrisiPorukuKlubKorsinsik/${korID}/${klubID}/${Sport}/${id}`,
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
           {korisnik && ( <h2 className="kc-sidebar-title">Kontakt sa {sportText} klubovima</h2> )}
           {klub && ( <h2 className="kc-sidebar-title">Kontakt sa korisnicima </h2> )}
           
          </header>

        

          <div className="kc-contact-list" style={{background:background,color:letters}}>
            {korisnik && klubKontakti.map((k,ind) => (
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
             {klub && korisniciKontakti.map((k,ind) => (
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
       {korisnik && (
        <>
         <img
          className="club-logo"
          src={izabraniKlub!==null?izabraniKlub.logo==null?izabraniKlub.logoURL:izabraniKlub.logo:null}
          alt="Club logo"
        />
        <span className="club-name">{izabraniKlub!==null&&izabraniKlub.naziv}</span>
        </>)}
        {klub && (
        
        <span className="club-name">{izabraniKorisnik!==null&&izabraniKorisnik.username}</span>
        )}
      </div>

      {/* PORUKE – OVO SE SKROLUJE */}
      <div className="chat-scroll-klub"  ref={scrollRef} style={{color:'white'}}>
        {poruke.map((m,ind) => (
          <Poruka
            key={ind}
            id={m.id}
            side={(m.username===korisnik?.username||m.username===klub?.username)?"right":"left"}
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
          disabled={!korisnik && !klub }
          value={newMessage}
          onChange={(event)=>{setNewMessage(event.target.value)}}
        />
        <button
          type="submit"
          className="chat-icon-btn chat-send-btn"
          aria-label="Send"
          disabled={!korisnik && !klub }
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
