import React, { useContext, useState } from "react";
import { Modal, Box, Paper, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./Takmicenje.css";
import { Context, TakmicenjeContext } from "../../../Context/Context";
import Kolo from "./Kolo";
import UcinakIgracaNaTakmicenju from "./UcinakIgracaNaTakmicenju";
import Utakmica from "./Utakmica/Utakmica";

export default function RezultatiModal(props) {
  const { korisnik, setKorisnik } = useContext(Context);
  const { takmicenje, setTakmicenje } = useContext(TakmicenjeContext);
  const [option, setOption] = useState(1);

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      closeAfterTransition
    >
      {/* Overlay */}
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
        {/* CARD */}
        <Paper
          elevation={0}
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "relative",
            borderRadius: 3,
            background: "rgba(0,0,0,0.20)",

            // ✅ OVO JE KLJUČ: širina/visina
            width: "min(1100px, 95vw)",
            maxWidth: "95vw",
            height: "min(92vh, 900px)",
            maxHeight: "92vh",

            // ✅ ne seci sadržaj modala nego ga skroluj u content delu
            overflow: "hidden",

            // malo lepši blur
            backdropFilter: "blur(10px)",
          }}
        >
          {/* X dugme */}
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

          {/* HEADER (NE SKROLUJE) */}
          <div className="lh-wrap" style={{ width: "100%" }}>
            <div className="lh-inner" style={{ width: "100%" }}>
              <div className="lh-left">
                {props.utakmica == null && (
                  <div className="lh-logo" aria-hidden="true">
                    <img src={takmicenje?.logoURL ?? ""} alt={takmicenje?.naziv ?? ""} />
                  </div>
                )}
                <h1 className="lh-title">{takmicenje?.naziv ?? ""} :</h1>
              </div>

              <div className="lh-tabs" role="tablist" aria-label="Sekcije">
                {props.utakmica == null && (
                  <>
                    <button
                      className={option === 1 ? "lh-tab lh-tab--active" : "lh-tab"}
                      type="button"
                      aria-selected={option === 1 ? "true" : "false"}
                      onClick={() => setOption(1)}
                    >
                      Utakmice
                    </button>

                    <button
                      className={option === 2 ? "lh-tab lh-tab--active" : "lh-tab"}
                      type="button"
                      aria-selected={option === 2 ? "true" : "false"}
                      onClick={() => setOption(2)}
                    >
                      Tabela
                    </button>

                    <button
                      className={option === 3 ? "lh-tab lh-tab--active" : "lh-tab"}
                      type="button"
                      aria-selected={option === 3 ? "true" : "false"}
                      onClick={() => setOption(3)}
                    >
                      Statistike Igrača
                    </button>

                    <button
                      className={option === 4 ? "lh-tab lh-tab--active" : "lh-tab"}
                      type="button"
                      aria-selected={option === 4 ? "true" : "false"}
                      onClick={() => setOption(4)}
                    >
                      Spisak Igrača
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CONTENT (OVDE SKROLUJE) */}
          <Box
            sx={{
              height: "calc(100% - 84px)", // ako ti header nije 84px, promeni broj (npr 96px)
              overflowY: "auto",
              overflowX: "hidden",
              width: "100%",
            }}
          >
            {props.utakmica == null && (
              <>
                {option === 1 && <Kolo />}
                {option === 2 && <UcinakIgracaNaTakmicenju timovi={true} igraci={false} />}
                {option === 3 && <UcinakIgracaNaTakmicenju timovi={false} igraci={false} />}
                {option === 4 && <UcinakIgracaNaTakmicenju timovi={false} igraci={true} />}
              </>
            )}

            {props.utakmica != null && <Utakmica strelica={props.strelica} />}
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
}
