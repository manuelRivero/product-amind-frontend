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
    justifyContent: 'center',
    gap: '1rem',
    padding: '1rem',
    height: '100%',
    minHeight: '400px',
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
     '& .ReactCrop__child-wrapper': {
       height: '100% !important',
     },
   },
     cropAreaSquare: {
     width: '100%',
     maxWidth: '500px',
     maxHeight: '500px',
     border: '1px solid #ddd',
     borderRadius: '8px',
     overflow: 'hidden',
     minHeight: '400px',
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
    '& .ReactCrop__child-wrapper': {
      height: '100% !important',
    },
  },
     cropAreaVertical: {
     width: '100%',
     maxWidth: '350px',
     height: '550px',
     border: '1px solid #ddd',
     borderRadius: '8px',
     overflow: 'hidden',
     minHeight: '400px',
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
    '& .ReactCrop__child-wrapper': {
      height: '100% !important',
    },
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
})

const getInitialCrop = (isSquare) => ({
  unit: 'px',
  width: isSquare ? 350 : 300,
  height: isSquare ? 350 : 520, // 3:4 aspect ratio para rectangular vertical
  x:  0,
  y:  0,
})

const CropModal = ({ open, onClose, imageUrl, onCropComplete, isSquareAspectRatio = true }) => {
  const classes = useStyles()
  const [crop, setCrop] = useState(getInitialCrop(isSquareAspectRatio))
  const [imageLoaded, setImageLoaded] = useState(false)
  const [zoom, setZoom] = useState(1) // Estado para el zoom
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
      setZoom(1) // Resetear zoom
      const newCrop = getInitialCrop(isSquareAspectRatio)
      setCrop({ ...newCrop, aspect: isSquareAspectRatio ? 1 : 4 / 3 }) // 1:1 para cuadrado, 4:3 para rectangular vertical
    }
  }, [open, imageUrl, isSquareAspectRatio])

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

       // Dimensiones del canvas resultante (área de recorte)
       const canvasWidth = crop.width * scaleX
       const canvasHeight = crop.height * scaleY

       canvas.width = canvasWidth
       canvas.height = canvasHeight

       // Llenar el canvas con fondo blanco
       ctx.fillStyle = '#FFFFFF'
       ctx.fillRect(0, 0, canvasWidth, canvasHeight)

       // Calcular las dimensiones reales de la imagen dentro del área de recorte
       const imageWidth = imageRef.current.naturalWidth
       const imageHeight = imageRef.current.naturalHeight

       // Calcular las coordenadas de origen para el recorte
       const sourceX = Math.max(0, crop.x * scaleX)
       const sourceY = Math.max(0, crop.y * scaleY)
       const sourceWidth = Math.min(imageWidth - sourceX, crop.width * scaleX)
       const sourceHeight = Math.min(imageHeight - sourceY, crop.height * scaleY)

       // Calcular las coordenadas de destino para centrar la imagen
       const destX = (canvasWidth - sourceWidth) / 2
       const destY = (canvasHeight - sourceHeight) / 2

       // Dibujar la imagen centrada
       ctx.drawImage(
         imageRef.current,
         sourceX,
         sourceY,
         sourceWidth,
         sourceHeight,
         destX,
         destY,
         sourceWidth,
         sourceHeight
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          minHeight: '500px',
          maxHeight: '90vh',
          overflow: 'auto'
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">Recortar imagen</Typography>
                 <Typography variant="body2" style={{ marginTop: '8px', color: '#666' }}>
           Puedes mover y redimensionar el área de recorte. Se mantendrá la proporción {isSquareAspectRatio ? 'cuadrada (1:1)' : 'rectangular vertical (4:3)'}.
         </Typography>
        <Typography variant="body2" style={{ marginTop: '8px', color: '#666' }}>
          Se recomienda una imagen {isSquareAspectRatio ? 'cuadrada' : 'rectangular vertical'} para que el recorte sea más preciso.
        </Typography>
      </DialogTitle>
      <DialogContent style={{ overflow: 'visible', padding: '20px' }}>
        <Box className={classes.cropContainer}>
                     <ReactCrop
             crop={crop}
             onChange={(c) => {
               console.log('Crop cambiado:', c)
               // Permitir que el crop se mueva libremente manteniendo el aspect ratio
               setCrop({
                 ...c,
                 unit: 'px'
               })
             }}
             aspect={isSquareAspectRatio ? 1 : 4 / 3}
             className={isSquareAspectRatio ? classes.cropAreaSquare : classes.cropAreaVertical}
             disabled={false}
             locked={false}
             keepSelection={true}
                           minWidth={isSquareAspectRatio ? 150 : 150}
              minHeight={isSquareAspectRatio ? 150 : 200}
              maxWidth={isSquareAspectRatio ? 400 : 400}
              maxHeight={isSquareAspectRatio ? 400 : 533}
           >
            <img
              src={imageUrl}
              alt="Crop target"
              onLoad={onImageLoad}
                             style={{
                 maxWidth: '100%',
                 maxHeight: isSquareAspectRatio ? '450px' : '500px',
                 objectFit: 'contain',
                 transform: `scale(${zoom})`,
                 transformOrigin: 'center center',
                 transition: 'transform 0.2s ease-in-out'
               }}
            />
          </ReactCrop>

          {/* Control de zoom */}
          {imageLoaded && (
            <Box style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1rem',
              width: '100%',
              maxWidth: '400px'
            }}>
              <Typography variant="body2" style={{ color: '#666', fontWeight: 'bold' }}>
                Zoom: {Math.round(zoom * 100)}%
              </Typography>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: '#ddd',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <Box style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Typography variant="caption" style={{ color: '#999' }}>50%</Typography>
                <Typography variant="caption" style={{ color: '#999' }}>300%</Typography>
              </Box>
            </Box>
          )}

                     {imageLoaded && (
             <Box className={classes.controls}>
               <Typography variant="body2" style={{ color: '#666' }}>
                 Proporción: {isSquareAspectRatio ? 'Cuadrada (1:1)' : 'Rectangular vertical (4:3)'} - Puedes mover y redimensionar el área de recorte
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
  isSquareAspectRatio: PropTypes.bool,
}

export default CropModal
