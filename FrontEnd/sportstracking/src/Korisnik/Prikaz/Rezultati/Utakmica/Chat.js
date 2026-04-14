import React, { useState, useRef, useEffect,useContext } from "react";
import Poruka from "./Poruka";
import { Context,UtakmicaContext } from "../../../../Context/Context";
import "./Chat.css";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";

const Chat = () => {
    const {utakmica}=useContext(UtakmicaContext);
    const {korisnik}=useContext(Context);
  

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const scrollRef = useRef(null);

  // uvek skroluj na dno kad stigne nova poruka
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
   useEffect(() => {
        
        const response =  axios.get(`http://localhost:5146/Korisnik/VratiChat/${utakmica.id}`,
            {
                headers:{
                    //Authorization: `Bearer ${token}`
                }
            }).then(response=>{
                let niz=[];
                console.log("stampa se niz poruka");
                console.log(response.data);
                response.data.forEach((x,ind)=>{
                          niz[ind]=  {
                            id: ind,
                            idPoruke:x.id,
                            side: korisnik!==null&&x.username==korisnik.username?"right":"left",
                            text: x.text,
                            time: x.time,
                            username:x.username,
                            sent:"sent",
                            day:x.day
                            }

                });
                setMessages(niz);
             
            })
            .catch(error=>{
                console.log(error);
            })
        }, []);
useEffect(() => {
      const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5146/ChatHub") 
        .build();
    
      connection.start().then(() => {
        console.log('Connected to SignalR hub');
      });
    
      connection.on(`DodataPorukaUtakmici${utakmica.id}`, (x) => {
        //console.log(korisnik.username);
        console.log(x);
        
       setMessages(prev => [
  ...prev,
  {
    id: prev.length,
    idPoruke: x.id,
    side: korisnik !== null && x.username === korisnik.username ? "right" : "left",
    username:x.username,
    text: x.text,
    time: x.time,
    sent: "sent",
    day: x.day
  }
]);
      });
       connection.on(`ObrisanaPoruka${utakmica.id}`, (idPoruke) => {
    setMessages(prev =>
      prev.filter(m => m.idPoruke !== idPoruke)
    );
  });
      
    
      
    }, []);
  const handleSend = (e) => {
    e.preventDefault();
   
    const response = axios.post(
          `http://localhost:5146/Korisnik/PosaljiPoruku/${korisnik.id}/${utakmica.id}`,
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
  };
  const handleDelete=(event,id)=>{
      event.preventDefault();
   
    const response = axios.delete(
          `http://localhost:5146/Korisnik/ObrisiPoruku/${id}/${utakmica.id}`,
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
    <div className="chat-window">
      <div className="chat-scroll" ref={scrollRef}>
        {messages.map((m) =>
     
            <Poruka
              key={m.idPoruke}
              id={m.idPoruke}
              side={m.side}
              text={m.text}
              time={`${m.day}:${m.time}`}
              sent={m.sent}
              isEmoji={m.isEmoji}
              user={m.username}
              delete={handleDelete}
              />
            
      
          
        )}
      </div>

     {utakmica.uzivo && (
      <form className="chat-input-bar" >
        

        <input
          className="chat-input-field"
          type="text"
          placeholder={korisnik===null?"Prijavite se da bi ste komentarisali utakmicu":"Napsite javni komentar"}
           disabled={korisnik===null}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />

        <button
          type="submit"
          className="chat-icon-btn chat-send-btn"
          aria-label="Send"
          disabled={korisnik===null}
          onClick={handleSend}
        >
          ➤
        </button>
      </form>)}
    </div>
  );
};

export default Chat;
