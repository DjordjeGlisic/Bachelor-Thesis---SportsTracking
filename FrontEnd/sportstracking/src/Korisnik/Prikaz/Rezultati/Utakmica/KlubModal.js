import React, { useContext, useState } from "react";
import { Modal, Box, Paper, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";


import HeaderKluba from "../../../../Klub/HeaderKluba";

export default function KlubModal(props) {

 
 
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

        

          {/* CONTENT (OVDE SKROLUJE) */}
          <Box
            sx={{
              height: "calc(100% - 84px)", // ako ti header nije 84px, promeni broj (npr 96px)
              overflowY: "auto",
              overflowX: "hidden",
              width: "100%",
            }}
          >
           <HeaderKluba />
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
}
