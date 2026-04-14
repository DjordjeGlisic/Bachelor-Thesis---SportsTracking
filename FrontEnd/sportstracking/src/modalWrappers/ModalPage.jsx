import { Box, IconButton, Modal, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import AddOrEditNovost from "../Klub/AdminModali/AddOrEditNovost";
import AddOrEditIgrac from "../Klub/AdminModali/AddOrEditIgrac";
import EditKlubInfo from "../Klub/AdminModali/EditKlubInfo";
import AddOrEditKlub from "../Admin/AddOrEditKlub";
import UcinakKlubaZaTakmicenje from "../Admin/UcinakKlubaZaTakmicenje";
import TransferForma from "../Admin/TransferForma";
import AddOrEditTakmicenje from "../Admin/AddOrEditTakmicenje";
import AddOrEditSekcija from "../Admin/AddOrEditSekcija";
import AddNewMatch from "../Admin/AddNewMatch";
const ModalPage = ({open,onClose,data,setData,onSubmit,tip,setSelectedFile,selectedFile,podtip,dostupnaTakmicenja,parseMoneyToNumber,sport,kliknutUcinak,idTakmicenja
    ,setOpenSnack,setTip,setPoruka,onDodavanje,ukloniPostojecuSekciju,onEdit,onIzmena,dodavanje,izborKlubova,labelKolo
}) =>
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
                     {tip === 'AddOrEditGeneralClub'&& (
                    <AddOrEditKlub
                        data={data} 
                        setData = {setData}
                        podtip = {podtip}
                        selectedFile = { selectedFile }
                        setSelectedFile = {setSelectedFile }
                        onSubmit={() => {
                        onSubmit();
                        }} 
                    />

                )}
                {tip==="UcinakKlubaZaTakmicenje" &&(
                    <UcinakKlubaZaTakmicenje
                        data={data} 
                        setData = {setData}
                        podtip = {podtip}
                        sport = {sport}
                        onClose= {onClose}
                        kliknutUcinak={kliknutUcinak} 
                        idTakmicenja={idTakmicenja}
                    />
                )}
                {tip==="TransferForPlayer"&&(
                    <TransferForma
                        data = {data}
                        setData = {setData}
                        podtip = {podtip}
                        sport = {sport}
                         onClose= {onClose}
                         setOpenSnack={setOpenSnack}
                        setTip = {setTip}
                        setPoruka = {setPoruka}
                        onSubmit = {onSubmit}
                        

                    />
                )}
                {tip === 'AddOrEditGeneralTakmicenje'&& (
                <AddOrEditTakmicenje
                    onClose= {onClose}
                    data = {data}
                    setData = {setData}
                    onDodavanje = {onDodavanje}
                    onIzmena = {onIzmena}
                    setSelectedFile={setSelectedFile}
                    selectedFile = {selectedFile}
                    podtip = {podtip}
                    setOpenSnack={ setOpenSnack}
                    setTip = {setTip}
                    setPoruka = {setPoruka}
                />

                )}
                 {tip === 'AddOrEditSekcijaTakmicenja'&& (
                <AddOrEditSekcija
                    onClose= {onClose}
                    data = {data}
                    setData = {setData}
                    onSubmit = {onSubmit}
                    podtip = {podtip}
                    setOpenSnack={ setOpenSnack}
                    setTip = {setTip}
                    setPoruka = {setPoruka}
                    dodavanje = {dodavanje}
                    ukloniPostojecuSekciju = {ukloniPostojecuSekciju}
                    onEdit = {onEdit}
                />

                )}
                {tip === 'AddNewMatch'&& (
                <AddNewMatch
                onClose = {onClose}
                open = {open}
                data = {data}
                setData = {setData}
                labelKolo = {labelKolo}
                onDodavanje = {onDodavanje}
                podtip = {podtip}
                setOpenSnack={ setOpenSnack}
                setTip = {setTip}
                setPoruka = {setPoruka}
                izborKlubova = {izborKlubova}
                />

                )}
        
            
            </Paper>
        </Box>
        </Modal>
    );

}
export default ModalPage;
