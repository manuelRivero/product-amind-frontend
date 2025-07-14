import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  header: {
    marginBottom: 24,
    textAlign: 'center',
  },
  title: props => ({
    fontFamily: props.titleFont || 'inherit',
    fontWeight: 700,
    fontSize: '1.35rem',
    color: props.textColor || "#2F4858",
    margin: 0,
    marginBottom: 8,
    lineHeight: 1.2,
  }),
  description: props => ({
    fontFamily: props.bodyFont || 'inherit',
    fontWeight: 400,
    fontSize: '1rem',
    color: props.textColor || "#2F4858",
    margin: 0,
    lineHeight: 1.5,
  }),
}))

function StorePreviewHeader({ title, description, titleFont, bodyFont, textColor }) {
  const classes = useStyles({ titleFont, bodyFont, textColor })
  return (
    <div className={classes.header}>
      <h2 className={classes.title}>{title || 'Nombre de la tienda'}</h2>
      <p className={classes.description}>{description || 'Aquí irá la descripción de tu tienda.'}</p>
    </div>
  )
}

StorePreviewHeader.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  titleFont: PropTypes.string,
  bodyFont: PropTypes.string,
  textColor: PropTypes.string,
}

export default StorePreviewHeader 