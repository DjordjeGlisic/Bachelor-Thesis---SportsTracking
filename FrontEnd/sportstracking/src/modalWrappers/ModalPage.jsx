import { Box, IconButton, Modal, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import AddOrEditNovost from "../Klub/AdminModali/AddOrEditNovost";
import AddOrEditIgrac from "../Klub/AdminModali/AddOrEditIgrac";
import EditKlubInfo from "../Klub/AdminModali/EditKlubInfo";
const ModalPage = ({open,onClose,data,setData,onSubmit,tip,setSelectedFile,selectedFile,podtip,dostupnaTakmicenja,parseMoneyToNumber}) =>
{
  
    console.log(data);
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
                {tip === 'AddOrEditNovost' && (
                    <AddOrEditNovost 
                        data={data} 
                        setData = {setData}
                        selectedFile = { selectedFile }
                        setSelectedFile = {setSelectedFile }
                        podtip = {podtip}
                        onSubmit={() => {
                        onSubmit();
                        onClose();
                        }} 
                    />
                )}
                {tip === 'AddOrEditIgrac' && (
                    <AddOrEditIgrac 
                        data={data} 
                        setData = {setData}
                        podtip = {podtip}
                        dostupnaTakmicenja ={dostupnaTakmicenja}
                        onSubmit={() => {
                        onSubmit();
                        onClose();
                        }} 
                    />
                )}
                {tip === 'EditInfo'&& (
                    <EditKlubInfo
                        data={data} 
                        setData = {setData}
                        podtip = {podtip}
                        parseMoneyToNumber = {parseMoneyToNumber}
                        onSubmit={() => {
                        onSubmit();
                        onClose();
                        }} 
                    />

                )}
        
            
            </Paper>
        </Box>
        </Modal>
    );

}
export default ModalPage;
