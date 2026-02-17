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
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          elevation={0}
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "relative",
            borderRadius: 3,
            background: "rgba(0,0,0,0.20)",
            width: "min(980px, 95vw)",
            maxWidth: "95vw",
            height: "min(92vh, 900px)",
            maxHeight: "92vh",
            overflow: "hidden",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          {/* X */}
          <IconButton
            onClick={props.onClose}
            aria-label="close"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 50,
              color: "rgba(255,255,255,0.9)",
              backgroundColor: "rgba(255,255,255,0.08)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* HEADER (ne skroluje) */}
          <div className="nm-head">
            <div className="nm-headLeft">
              <div className="nm-clubBadge" aria-hidden="true">
                {/* ako imaš props.clubLogo možeš umesto n.slika ili dodaj posebno */}
                <img src={props.clubLogo} alt="" />
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

          {/* CONTENT (skroluje) */}
          <div className="nm-body">
            {!n ? (
              <div className="nm-empty">Nema podataka o vesti.</div>
            ) : (
              <>
                {/* NASLOV */}
                <h1 className="nm-title">{props.novost.naslov}</h1>

                {/* SAZETAK */}
                {n.sazetak ? <p className="nm-summary">{props.novost.sazetak}</p> : null}

                {/* GLAVNA SLIKA */}
                {n.slika ? (
                  <div className="nm-heroWrap">
                    <img className="nm-hero" src={props.novost.slika} alt={props.novost.naslov} />
                  </div>
                ) : null}

                {/* TEKST */}
                <div className="nm-article">
                  {(props.novost.vest ?? "")
                    .split("\n")
                    .filter((x) => x.trim().length)
                    .map((p, i) => (
                      <p key={i} className="nm-par">
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
