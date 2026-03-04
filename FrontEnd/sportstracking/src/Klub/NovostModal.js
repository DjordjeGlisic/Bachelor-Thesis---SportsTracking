import React, { useMemo } from "react";
import { Modal, Box, Paper, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import "./NovostModal.css";

function formatDatumVreme(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

export default function NovostModal(props) {
  const n = props.novost ?? null;

  const datumTxt = useMemo(() => formatDatumVreme(props.novost.datum), [props.novost.datum]);

  return (
    <Modal open={props.open} onClose={props.onClose} closeAfterTransition>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.75)", 
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          zIndex: 1300,
        }}
      >
        <Paper
          elevation={0}
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "relative",
            borderRadius: "24px",
            background: "rgba(18, 18, 18, 0.9)", 
            width: "min(980px, 95vw)",
            height: "min(92vh, 900px)",
            maxHeight: "92vh",
            overflow: "hidden", // Sprečava dupli skrol na samom Paper-u
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Dugme za zatvaranje (X) */}
          <IconButton
            onClick={props.onClose}
            aria-label="close"
            sx={{
              position: "absolute",
              top: 15,
              left: 15,
              zIndex: 110,
              color: "rgba(255,255,255,0.8)",
              backgroundColor: "rgba(255,255,255,0.06)",
              "&:hover": { 
                backgroundColor: "rgba(255,121,0,0.2)", 
                color: "#ff7900",
                transform: "rotate(90deg)"
              },
              transition: "all 0.3s ease",
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* FIKSNI HEADER (Ne mrda se prilikom skrolovanja vesti) */}
          <div className="nm-head">
            <div className="nm-headLeft">
              <div className="nm-clubBadge">
                <img src={props.clubLogo} alt={props.clubNaziv} />
              </div>

              <div className="nm-headText">
                <div className="nm-clubName">{props.clubNaziv}</div>
                <div className="nm-meta">
                  <span className="nm-author">{props.novost.autor}</span>
                  <span className="nm-dot">•</span>
                  <span className="nm-date">{datumTxt}</span>
                </div>
              </div>
            </div>

            <div className="nm-headRight">
              <div className="nm-tag">NOVOST</div>
            </div>
          </div>

          {/* SKROLABILNI SADRŽAJ (Ovde se nalazi cela vest) */}
          <div className="nm-body">
            {!n ? (
              <div className="nm-empty">Nema podataka o vesti.</div>
            ) : (
              <>
                {/* NASLOV */}
                <h1 className="nm-title">{props.novost.naslov}</h1>

                {/* SAZETAK */}
                {n.sazetak && <div>
                  
                   
                     {( props.novost.sazetak ?? "")
                  .split("\n")
                  .filter((x) => x.trim().length)
                  .map((p, i) => (
                    <p 
                      key={i} 
                     className="nm-summary"
                      style={{ 
                        wordBreak: 'break-all',    // Force prelamanje bilo gde
                        overflowWrap: 'anywhere',  // Dodatna podrška za dugačke stringove
                        whiteSpace: 'pre-wrap'     // Čuva formatiranje teksta
                      }}
                    >
                      {p}
                    </p>
                  ))}
                      
                    
                    
                    
                  
                  </div>}

                {/* SLIKA VESTI */}
                {n.slika && (
                  <div className="nm-heroWrap">
                    <img className="nm-hero" src={props.novost.slika} alt={props.novost.naslov} />
                  </div>
                )}

                {/* TEKST ARTIKLA (Sada bez ograničenja visine, raste unutar nm-body) */}
              <div className="nm-article">
                {(props.novost.vest ?? "")
                  .split("\n")
                  .filter((x) => x.trim().length)
                  .map((p, i) => (
                    <p 
                      key={i} 
                      className="nm-par" 
                      style={{ 
                        wordBreak: 'break-all',    // Force prelamanje bilo gde
                        overflowWrap: 'anywhere',  // Dodatna podrška za dugačke stringove
                        whiteSpace: 'pre-wrap'     // Čuva formatiranje teksta
                      }}
                    >
                      {p}
                    </p>
                  ))}
              </div>

               
              </>
            )}
          </div>
        </Paper>
      </Box>
    </Modal>
  );
}
