import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';

const DeleteDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  description,
  openSuccess,
   openError,
   handleOpenSuccess,
   handleOpenError,
   content,
  loading = false // Novi prop za stanje učitavanja
}) => {

  
  return (
    <Dialog
      open={open}
      onClose={loading ? null : onClose} // Onemogući zatvaranje dok traje brisanje
      aria-labelledby="delete-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 1,
          backgroundColor: '#1a1a1a', 
          backgroundImage: 'none',
          color: '#fff',
          maxWidth: '400px',
          width: '100%'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
        <Box 
          sx={{ 
            backgroundColor: 'rgba(244, 67, 54, 0.1)', 
            borderRadius: '50%', 
            p: 2, 
            mb: 2 
          }}
        >
          <DeleteForeverRoundedIcon sx={{ color: '#f44336', fontSize: 40 }} />
        </Box>
        
        <DialogTitle id="delete-dialog-title" sx={{ textAlign: 'center', pt: 0 }}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </DialogTitle>
      </Box>

      <DialogContent>
        <DialogContentText sx={{ color: '#aaa', textAlign: 'center' }}>
          {description}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, gap: 1.5 }}>
        <Button 
          onClick={onClose} 
          disabled={loading} // Onemogući "Otkaži" dok traje brisanje
          sx={{ 
            flex: 1,
            color: '#fff', 
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
            '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
          }}
        >
          Otkaži
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          disabled={loading}
          sx={{ 
            flex: 1,
            textTransform: 'none', 
            borderRadius: 2,
            fontSize: '1rem',
            fontWeight: 'bold',
            minHeight: '42px', // Da dugme ne menja visinu kad se pojavi spiner
            boxShadow: '0 4px 14px 0 rgba(244, 67, 54, 0.39)',
            '&:hover': { backgroundColor: '#d32f2f', boxShadow: '0 6px 20px 0 rgba(244, 67, 54, 0.5)' }
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Obriši"
          )}
        </Button>
      </DialogActions>
       <Snackbar open={openSuccess} autoHideDuration={6000} onClose={handleOpenSuccess}>
          <Alert
            onClose={handleOpenSuccess}
            severity={'success'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {`Uspesno brisanje ${content}!`}
          </Alert>
        </Snackbar>
       <Snackbar open={openError} autoHideDuration={6000} onClose={handleOpenError}>
          <Alert
            onClose={handleOpenError}
            severity={'error'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {`Neuspesan pokusaj brisanja ${content}!`}
          </Alert>
        </Snackbar>

    </Dialog>
  );
};

export default DeleteDialog;