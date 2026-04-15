import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import "./GlavniPrikaz.css";
import { Context, TakmicenjeContext, UtakmicaContext } from "../../../Context/Context";
import axios from "axios";
import { IconButton, Typography } from "@mui/material";
import RezultatiModal from "../Rezultati/RezultatiModal";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import NovostModal from "../../../Klub/NovostModal";
const GlavniPrikaz = () => {
  const [praceniKlubovi, setPraceniKlubovi] = useState([]);
  const [hideArray, setHideArray] = useState([]); // indexi koji su zatvoreni
  const [tabByClub, setTabByClub] = useState({}); // { [clubId]: "proslo"|"trenutno"|"sledece" }
 const [openLogin, setOpenLogin] = useState(false);
  
    // element na koji vraćaš fokus kad zatvoriš modal
    const focusBackRef = useRef(null);
  
    const open = () => setOpenLogin(true);
    const close = () => {
      setOpenLogin(false);
      setModal(false);
      requestAnimationFrame(() => focusBackRef.current?.focus());
    };
  const { korisnik, sport,letters,background,contentColor, modal,setModal } = useContext(Context);
  const [utakmica,setUtakmica]=useState(null);
  const[takmicenje,setTakmicenje]=useState(null);
    const [novost,setNovost]=useState(null);
    const [klubZaNovost,setKlubZaNovost]=useState(null);  
  // ------- helpers -------
  const parseRezultat = (rezultat) => {
    if (!rezultat || typeof rezultat !== "string") return { gd: null, gg: null };
    const parts = rezultat.split(":");
    if (parts.length !== 2) return { gd: null, gg: null };

    const gd = Number(parts[0]);
    const gg = Number(parts[1]);

    return {
      gd: Number.isFinite(gd) ? gd : null,
      gg: Number.isFinite(gg) ? gg : null,
    };
  };

  const formatDatum = (d) => (d ? String(d) : "");

  const getMatchesForClub = (club, tabKey) => {
    const key =
      tabKey === "proslo" ? "poslednja" : tabKey === "sledece" ? "sledeca" : "trenutna";

    const rows = [];
    const listaTakmicenja = club?.listaTakmicenja ?? [];

    for (const t of listaTakmicenja) {
      const m = t?.[key];
      if (!m) continue;

      const { gd, gg } = parseRezultat(m.rezultat);

      // let status = "";
      // if (tabKey === "trenutno") {
      //   status = m.uzivo ? `${m.minut ?? ""}'` : "U TOKU";
      // } else if (tabKey === "proslo") {
      //   status = "KR";
      // } else {
      //   status = ""; // sledece
      // }

      rows.push({
        id: m.id,
        takmicenje: t.takmicenje,
        domacin: m.domacin,
        gost: m.gost,
        goloviDomacin: gd,
        goloviGost: gg,
        status : m.status,
        datum: formatDatum(m.datum),
        raw: m,           
      });
    }

    return rows;
  };

  const groupByTakmicenje = (matches) => {
    const map = new Map();
    for (const m of matches) {
      const key = m.takmicenje ?? "Takmičenje";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    }
    return Array.from(map.entries()).map(([takmicenje, items]) => ({
      takmicenje,
      items,
    }));
  };

  const setClubTab = (clubId, tabKey) => {
    setTabByClub((prev) => ({ ...prev, [clubId]: tabKey }));
  };

  const toggleClubPanel = (index) => {
    setHideArray((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };
const utakmicaHandler=(g)=>{
  setUtakmica(g.raw);
  setTakmicenje({naziv:g.takmicenje,sport:sport})
  console.log("Kliknuta utakmica");
  console.log(g.raw);
  setModal(true);
  open();
  
}
  // ------- fetch -------
  useEffect(() => {
    const korID = korisnik == null ? 0 : korisnik.id;
    const postoji = korisnik != null;

    axios
      .get(`http://localhost:5146/Korisnik/VratiPocetnuStranicu/${korID}/${postoji}/${sport}`)
      .then((res) => {
        console.log(res.data);
        setPraceniKlubovi(res.data ?? []);
      })
      .catch((err) => console.log(err));
  }, [korisnik, sport]);

  // init default tab for every club once data arrives
  useEffect(() => {

    setTabByClub((prev) => {
      const next = { ...prev };
      for (const k of praceniKlubovi) {
        if (!next[k.id]) next[k.id] = "trenutno";
      }
      return next;
    });
  }, [praceniKlubovi]);

  const titleSport = sport === 1 ? "Fudbalski" : sport === 2 ? "Košarkaški" : "Vaterpolo";

function formatDateTimeDDMMYYYY(isoString) {
  if (!isoString) return "";

  const [datePart, timePart] = isoString.split("T");
  if (!datePart || !timePart) return "";

  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.replace("Z", "").split(":");

  return `${day}.${month}.${year} ${hour}:${minute}`;
}
function formatDateTime(ts) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(ts));
}

 const [openNovost,setOpenNovost]=useState(false);
 const openN = () => setOpenNovost(true);
    const closeN = () => {
      setOpenNovost(false);
      requestAnimationFrame(() => focusBackRef.current?.focus());
    };
    const handleLajk=(vestID,korisnikID,isLike)=>{
         const response =  axios.post(`http://localhost:5146/Korisnik/LajkujILIDislajkujNovost/${korisnikID}/${vestID}/${isLike}`,
        {
            headers:{
            //Authorization: `Bearer ${token}`
            }
        }).then(response=>{
            console.log("Odgovor");
            console.log(response.data);
               setPraceniKlubovi(prev =>
                    prev.map(klub => ({
                      ...klub,
                      listaSvezihVesti: klub.listaSvezihVesti.map(v =>
                        v.id === response.data.vestId
                          ? {
                              ...v,
                              brojLajkova: response.data.likes,
                              brojDislajkova: response.data.dislikes,
                              likedByMe: response.data.likedByMe,
                              dislikedByMe: response.data.dislikedByMe,
                            }
                          : v
                      ),
                    }))
                  );
                   

            
        })
        .catch(error=>{
            console.log(error);
        })
    }
 return (
    <>
      <div className="pk-overlay" style={{ backgroundColor: background, color: letters }}>
        <div className="pk-modal">
          <div className="pk-top">
            <Typography
              variant="h4"
              sx={{
                textAlign: "center",
                color: letters,
                fontWeight: 800,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                mb: 4,
                textShadow: "0 10px 30px rgba(0,0,0,0.55)",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: { xs: 18, sm: 22, md: 28 },
              }}
            >
              {korisnik === null ? "Popularni" : "Praćeni"} {titleSport} klubovi
            </Typography>

            <div className="pk-clubs-list">
              {praceniKlubovi.map((klub, ind) => {
                const isOpen = !hideArray.includes(ind);
                const aktivniTab = tabByClub[klub.id] ?? "trenutno";

                const utakmice = getMatchesForClub(klub, aktivniTab);
                const grupe = groupByTakmicenje(utakmice);

                const vesti = klub.listaSvezihVesti;

                return (
                  <div key={klub.id} className="pk-club-item">
                          
                    {/* CLUB BUTTON */}
                    <button
                      className={"pk-club-btn" + (isOpen ? " pk-club-btn-active" : "")}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleClubPanel(ind);
                      }}
                      type="button"
                    >
                      <div className="pk-club-logo-wrap">
                        <img src={klub.logo} alt={klub.naziv} className="pk-club-logo" />
                      </div>
                      <span className="pk-club-name">{klub.naziv}</span>
                      <span className={"pk-chevron" + (isOpen ? " pk-chevron-open" : "")}>▾</span>
                    </button>

                    {/* PANEL */}
                    {isOpen && (
                      <div className="pk-panel" style={{ backgroundColor: contentColor, color: letters }}>
                        {/* tabs */}
                        <div className="pk-tabs">
                          <button
                            className={"pk-subtab-btn" + (aktivniTab === "proslo" ? " pk-subtab-btn-active" : "")}
                            onClick={() => setClubTab(klub.id, "proslo")}
                            type="button"
                          >
                            Prošlo
                          </button>

                          <button
                            className={
                              "pk-subtab-btn" + (aktivniTab === "trenutno" ? " pk-subtab-btn-active" : "")
                            }
                            onClick={() => setClubTab(klub.id, "trenutno")}
                            type="button"
                          >
                            Trenutno
                          </button>

                          <button
                            className={
                              "pk-subtab-btn" + (aktivniTab === "sledece" ? " pk-subtab-btn-active" : "")
                            }
                            onClick={() => setClubTab(klub.id, "sledece")}
                            type="button"
                          >
                            Sledeće kolo
                          </button>
                        </div>

                        {/* matches */}
                        <div className="pk-matches">
                          {grupe.length === 0 ? (
                            <div className="pk-no-matches">Nema utakmica za ovaj prikaz.</div>
                          ) : (
                            grupe.map((g) => (
                              <div key={g.takmicenje} className="pk-competition-block">
                                <div className="pk-competition-title">{g.takmicenje}</div>

                                <div className="pk-matches-list">
                                  {g.items.map((u) => (
                                    <div
                                      key={u.id}
                                      className="pk-match-row"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        utakmicaHandler(u);
                                      }}
                                      role="button"
                                      tabIndex={0}
                                    >
                                      <div className="pk-match-teams">
                                        <div className="pk-team pk-team-home">{u.domacin}</div>
                                        <div className="pk-team pk-team-away">{u.gost}</div>
                                      </div>

                                      <div className="pk-match-center">
                                        <div className="pk-score">{u.goloviDomacin !== null ? u.goloviDomacin : "-"}</div>
                                        <div className="pk-score">{u.goloviGost !== null ? u.goloviGost : "-"}</div>
                                      </div>

                                      <div className="pk-match-meta">
                                        <div className="pk-status">{u.status}</div>
                                        <div className="pk-date">{formatDateTime(u.datum)}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* NOVOSTI (3 kartice po klubu) */}
                        <div className="pk-news-wrap">
                          <div className="pk-news-title">
                            <ArticleOutlinedIcon fontSize="small" />
                            <span>Novosti</span>
                          </div>

                          <div className="pk-news-grid">
                            {klub.listaSvezihVesti.slice(0, 3).map((n) => (
                              <div key={n.id} className="pk-news-card">
                                 
                                <div className="pk-news-head">
                                  <div className="pk-news-avatar">
                                    <img src={klub.logo} alt={klub.naziv} />
                                  </div>
                                  <div className="pk-news-head-text">
                                    <div className="pk-news-club">{klub.naziv}</div>
                                    <div className="pk-news-date">{formatDateTimeDDMMYYYY(n.datum)}</div>
                                  </div>
                                  {/* uklonjene 3 tačkice */}
                                </div>

                                <div className="pk-news-img">
                                  <img src={n.slika} alt={n.tip} />
                                </div>

                                <div className="pk-news-body">
                                  <div className="pk-news-naslov">{n.naslov}</div>
                                  <div className="pk-news-opis">{n.sazetak}</div>
                                </div>

                                <div className="pk-news-actions">
                                  <button type="button" className={`pk-news-like ${n.likedByMe===true ? "pk-news-like--active" : ""}`} disabled={korisnik==null?true:false} onClick={(e)=>{e.preventDefault();handleLajk(n.id,korisnik.id,true)}} aria-label="like" >
                                    <ThumbUpAltOutlinedIcon fontSize="small" />
                                    <span>{n.brojLajkova}</span>
                                  </button>

                                  <button type="button" className={`pk-news-dislike ${n.dislikedByMe===true? "pk-news-dislike--active" : ""}`} disabled={korisnik==null?true:false} onClick={(e)=>{e.preventDefault();handleLajk(n.id,korisnik.id,false)}} aria-label="dislike">
                                    <ThumbDownAltOutlinedIcon fontSize="small" />
                                    <span>{n.brojDislajkova}</span>
                                  </button>

                                  <div className="pk-news-spacer" />

                                  {/* samo ikonica koja sugeriše detalje (ne implementiramo modal ovde) */}
                                  <IconButton
                                    className="pk-news-details"
                                    size="small"
                                    aria-label="detalji vesti"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setNovost(n);
                                      setKlubZaNovost(klub);
                                      openN();
                                    }}
                                  >
                                    <ChevronRightRoundedIcon />
                                  </IconButton>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* /NOVOSTI */}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <UtakmicaContext.Provider value={{ utakmica, setUtakmica }}>
        <TakmicenjeContext.Provider value={{ takmicenje, setTakmicenje }}>
         
          {utakmica !== null && (
            <RezultatiModal open={openLogin} onClose={close} utakmica={utakmica} strelica={false} />
          )}
        </TakmicenjeContext.Provider>
      </UtakmicaContext.Provider>
      {novost!==null&&( <NovostModal
              open={openNovost}
              onClose={closeN}
              novost={novost}     
              korisnik={korisnik}         
              clubNaziv={klubZaNovost.naziv}      
              clubLogo={klubZaNovost.logo}        
        />)}
    </>
  );
};

export default GlavniPrikaz;
