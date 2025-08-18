import React, { useState, useRef, useEffect } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { makeStyles } from '@material-ui/core/styles'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@material-ui/core'
import PropTypes from 'prop-types'

const useStyles = makeStyles({
  cropContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
  },
     cropArea: {
     width: '100%',
     maxWidth: '500px',
     maxHeight: '450px',
     border: '1px solid #ddd',
     borderRadius: '8px',
     display: 'block',
     overflow: 'hidden',
    '& .ReactCrop__crop-selection': {
      border: '3px solid #00ACC1',
      boxShadow: '0 0 0 1px rgba(0, 172, 193, 0.5)',
      cursor: 'move',
    },
    '& .ReactCrop__drag-handle': {
      display: 'none !important',
    },
    '& .ReactCrop__drag-bar': {
      display: 'none !important',
    },
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
})

const initialCrop = {
  unit: 'px',
  width: 350,
  height: 350,
  x: 50,
  y: 50,
}

const CropModal = ({ open, onClose, imageUrl, onCropComplete }) => {
  const classes = useStyles()
  const [crop, setCrop] = useState(initialCrop)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef(null)

  // Función removida ya que no necesitamos cambiar aspect ratio

  const onImageLoad = (e) => {
    console.log('Imagen cargada:', e.currentTarget)
    imageRef.current = e.currentTarget
    setImageLoaded(true)
  }

  useEffect(() => {
    if (open) {
      console.log('Modal abierto, reseteando estados')
      setImageLoaded(false)
      setCrop({ ...initialCrop, aspect: 1 }) // Siempre cuadrado
    }
  }, [open, imageUrl])

  const handleSave = () => {
    console.log('handleSave llamado', { crop, imageRef: imageRef.current })
    
    if (!imageRef.current) {
      console.error('No hay referencia a la imagen')
      return
    }
    
    if (!crop.width || !crop.height) {
      console.error('No hay área de crop seleccionada')
      return
    }

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const scaleX = imageRef.current.naturalWidth / imageRef.current.width
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height

      console.log('Escalas:', { scaleX, scaleY, crop })

      canvas.width = crop.width * scaleX
      canvas.height = crop.height * scaleY

      ctx.drawImage(
        imageRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      )

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('No se pudo crear el blob')
          return
        }
        console.log('Blob creado exitosamente:', blob)
        const croppedImageUrl = URL.createObjectURL(blob)
        onCropComplete(croppedImageUrl, blob)
        onClose()
      }, 'image/jpeg', 0.9)
    } catch (error) {
      console.error('Error en handleSave:', error)
    }
  }

  return (
         <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ style: { minHeight: '500px' } }}>
      <DialogTitle>
        <Typography variant="h6">Recortar imagen</Typography>
                 <Typography variant="body2" style={{ marginTop: '8px', color: '#666' }}>
           El área de recorte está fija a 350px x 350px. Puedes moverla pero no cambiar su tamaño.
         </Typography>
         <Typography variant="body2" style={{ marginTop: '8px', color: '#666' }}>
            Se recomienda una imagen cuadrada para que el recorte sea más preciso.
         </Typography>
      </DialogTitle>
      <DialogContent>
        <Box className={classes.cropContainer}>
          <ReactCrop
            crop={crop}
                         onChange={(c) => {
               console.log('Crop cambiado:', c)
               // Mantener el crop fijo a 350px x 350px, solo permitir movimiento
               setCrop({
                 ...c,
                 width: 350,
                 height: 350,
                 unit: 'px'
               })
             }}
            aspect={1}
            className={classes.cropArea}
            disabled={false}
                         locked={true}
             keepSelection={true}
             minWidth={350}
             minHeight={350}
             maxWidth={350}
             maxHeight={350}
          >
            <img
              src={imageUrl}
              alt="Crop target"
              onLoad={onImageLoad}
                             style={{ maxWidth: '100%', maxHeight: '450px' }}
            />
          </ReactCrop>

                     {imageLoaded && (
             <Box className={classes.controls}>
               <Typography variant="body2" style={{ color: '#666' }}>
                 Área de recorte fija: 350px x 350px (Se recomienda una imagen cuadrada)
               </Typography>
             </Box>
           )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button 
          onClick={() => {
            console.log('Botón Guardar clickeado')
            handleSave()
          }} 
          color="primary" 
          variant="contained"
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

CropModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imageUrl: PropTypes.string.isRequired,
  onCropComplete: PropTypes.func.isRequired,
}

export default CropModal
