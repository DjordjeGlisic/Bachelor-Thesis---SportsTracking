import React from "react";
import "./Chat.css";
import DeleteIcon from '@mui/icons-material/Delete';
import { useContext } from "react";
import { Context,KluboviContext } from "../../../../Context/Context";
const Poruka = (props) => {
    const {korisnik,letters,contentColor,chat}=useContext(Context);
    const {klub}=useContext(KluboviContext);
  return (
    <div className={`chat-row chat-row-${props.side}`}>
      <div className={`chat-meta chat-meta-${props.side}`} style={{color:props.saKlubom===null?letters:'white'}}>
        {props.user}
      </div>

      <div
        className={[
          "chat-bubble",
          `chat-bubble-${props.side}-${props.sent}`,
          
         
        ].join(" ")}
      >
        <span className="chat-text">{props.text}</span>
        <span className="chat-time">{props.time}</span>
      </div>
      {korisnik!==null && korisnik.username==props.user&&(
       <DeleteIcon
       sx={{color:'red'}}
        onClick={(event) =>{props.delete(event,props.id)}}
      
      />)}
      {klub!==null && klub.username==props.user&&(
       <DeleteIcon
       sx={{color:'red'}}
        onClick={(event) =>{props.delete(event,props.id)}}
      
      />)}
       
    </div>
  );
};

export default Poruka;
