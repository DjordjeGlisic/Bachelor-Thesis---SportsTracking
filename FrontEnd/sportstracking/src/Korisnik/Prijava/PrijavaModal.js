import React from "react";
import { Modal, Box, Paper, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Prijava from "./Prijava"; // putanja prilagodi
import { useContext, useState } from "react";
import { Context } from "../../Context/Context";
export default function PrijavaModal({ open, onClose }) {
  const { korisnik, setKorisnik } = useContext(Context);
  return (
    <Modal
      open={open}
      onClose={onClose}      // klik na pozadinu / ESC zatvara
      closeAfterTransition
    >
      {/* Overlay: zatamnjenje + blur cele aplikacije */}
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
        {/* Kartica wrapper (da klik unutra ne zatvori) */}
        <Paper
          elevation={0}
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "relative",
            borderRadius: 3,
            overflow: "hidden",
            background: "transparent", // Prijava već ima Paper; ovde može i transparent
          }}
        >
          {/* X dugme gore levo */}
          <IconButton
            onClick={onClose}
            aria-label="close"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 10,
              color: "rgba(255,255,255,0.9)",
              backgroundColor: "rgba(255,255,255,0.08)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" },
            }}
          >
            <CloseIcon />
          </IconButton>

      
          <Prijava onClose={onClose} korisnik={korisnik} setKorisnik={setKorisnik} />
        </Paper>
      </Box>
    </Modal>
  );
}
