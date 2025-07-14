import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  card: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    padding: 24,
    margin: '0 auto',
    maxWidth: 300,
    textAlign: 'center',
    marginBottom: 16,
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    maxHeight: 300,
    marginBottom: 16,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  text: props => ({
    fontFamily: props.bodyFont || 'inherit',
    fontSize: '1rem',
    color: props.textColor || "#2F4858",
    marginBottom: 20,
  }),
  button: props => ({
    background: props.primaryColor,
    color: props.contrastTextColor,
    border: 'none',
    borderRadius: 8,
    padding: '10px 28px',
    fontWeight: 600,
    fontFamily: props.bodyFont || 'inherit',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
    outline: 'none',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  }),
}))

function StorePreviewCard({ primaryColor, contrastTextColor, bodyFont, textColor }) {
  const classes = useStyles({ primaryColor, contrastTextColor, bodyFont, textColor })
  return (
    <div className={classes.card}>
      <img
        src="https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
        alt="Ejemplo de producto"
        className={classes.previewImg}
      />
      <p className={classes.text}>
        Este es un ejemplo de cómo se verá una tarjeta en tu tienda. Puedes personalizar los colores y las fuentes desde la configuración.
      </p>
      <button className={classes.button} type="button">Aceptar</button>
    </div>
  )
}

StorePreviewCard.propTypes = {
  primaryColor: PropTypes.string,
  contrastTextColor: PropTypes.string,
  bodyFont: PropTypes.string,
  textColor: PropTypes.string,
}

export default StorePreviewCard 