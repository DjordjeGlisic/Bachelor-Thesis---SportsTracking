import "./NavBar.css";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useContext, useEffect, useRef, useState } from "react";
import { Context,KluboviContext } from "../../Context/Context";
import { useNavigate } from "react-router-dom";
import { Divider, IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import MailTwoToneIcon from '@mui/icons-material/MailTwoTone';
import SideBar from "./SideBar";
import LogoutIcon from '@mui/icons-material/Logout';
import Avatar from '@mui/material/Avatar'; 
export default function Navbar({ onOpenLogin }) {
      const { setBackground,setLetters, setPrijavljen,setContentColor,korisnik,setKorisnik,openSide,setOpenSide,izabraniKlub,setIzabraniKlub,chat,setChat,ruta,setRuta,modal,setModal } = useContext(Context);
     
      const [icon, setIcon] = useState(1);
      //const [menuOpen, setMenuOpen] = useState(false);
      const [activeOption, setActiveOption] = useState(1);   
      const[open,setOpen]=useState(false);
      //ZATVARANJE DROP DOWN-A KADA SE KLIKNE VAN NJEGA
    const wrapRef = useRef(null);
    useEffect(() => {
    let kor=localStorage.getItem("korisnik");
    if(kor)
    {
      if(!korisnik)
      {
          setKorisnik(JSON.parse(kor));
          console.log("postavio korisnika iz local storage-a");
          console.log(JSON.parse(kor));

      }
    }
     let izabaraniKLb=localStorage.getItem("izabraniKlub");
    if(izabaraniKLb)
    {
      if(!izabraniKlub)
      {
          setIzabraniKlub(JSON.parse(izabaraniKLb));
          console.log("postavio izabrani klub iz local storage-a");
          console.log(JSON.parse(izabaraniKLb));
      }
    }
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);

  }, []);
      const navigate = useNavigate();
  return (
    <>
    <nav className="navbar">
      {/* LEFT */}
        <div style={{display:'flex',flexDirection:'row',flexWrap:'nowrap',alignItems:'center'}}>
            <div className="navbar-left">

         <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon sx={{color:'white'}} onClick={() => setOpenSide(!openSide)} />
          </IconButton>
            </div>

      <div className="navbar-left">
        <span className="logo">SportsTracking</span>
        </div>
      </div>

      {/* CENTER */}
      <ul className="navbar-center">
        <li className={ruta === "./" ? "nav-item active" : "nav-item"} onClick={()=>{setActiveOption(3);localStorage.removeItem("izabraniKlub");setIzabraniKlub(null);setRuta("./");navigate("./")}}>Početna</li>
        <li className={ruta === "./Takmicenja" ? "nav-item active" : "nav-item"} onClick={()=>{setActiveOption(1);setRuta("./Takmicenja");navigate("./Takmicenja");localStorage.removeItem("izabraniKlub");setIzabraniKlub(null);}}>Takmičenja</li>
        <li className={ruta === "./Klubovi"|| ruta === "./Klub" ? "nav-item active" : "nav-item"} onClick={()=>{setActiveOption(2);setRuta("./Klubovi");navigate("./Klubovi");localStorage.removeItem("izabraniKlub");setIzabraniKlub(null);}}>Klubovi</li>
      </ul>

      {/* RIGHT */}
      <div className="navbar-right">
        <button className="icon-btn" >
          <span className="icon">
           
          {
          korisnik === null ? <AccountCircleIcon onClick={()=>{onOpenLogin();setModal(true);}} /> 
          :
          
             <div className="user-menu" ref={wrapRef}>
           <Avatar sx={{
      width: 28,
      height: 28,
      fontSize: 13,
      background: "transparent",
      color: "white",
    }} onClick={()=>{setOpen(!open)}}>{korisnik.ime[0]}{korisnik.prezime[0]} </Avatar>
          {open && (
            <div className="dropdown" role="menu">
            <button
              type="button"
              className="dropdown-item danger"
              onClick={() => {
                setOpen(false);
                setKorisnik(null);
                localStorage.removeItem("korisnik");
              }}
            >
              Odjava
            </button>
          </div>
        )}
        </div>
      }
          
           </span>
        </button>
        <button className="icon-btn">
          <span className="icon" onClick={()=>{setBackground(icon===1?"#E4E6EA":"#1E1E1E"); setLetters(icon===1?"#1E1E1E":"#E4E6EA");setContentColor(icon==1?"#dbd5cb": "#605857");setIcon(icon===1?2:1)}}><>{icon === 1 ? <DarkModeIcon /> : <LightModeIcon />}</></span>
        </button>
         <button className="icon-btn"  disabled={korisnik===null} onClick={(e)=>{e.preventDefault();setActiveOption(4);setChat(null);setRuta("./Inbox");navigate("./Inbox");setIzabraniKlub(null);}} >
          <span className="icon"><MailTwoToneIcon sx={{color:ruta === "./Inbox" ? " #ff7a00" : "white"}}   /></span>
        </button>
       
      </div>
    
    </nav>
      {openSide &&ruta!=='/Klub'&& modal===false && (<SideBar />)}
      </>
  );
}
