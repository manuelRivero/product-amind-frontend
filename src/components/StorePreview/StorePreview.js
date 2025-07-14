import React from 'react'
import PropTypes from 'prop-types'
import StorePreviewNavbar from './StorePreviewNavbar'
import StorePreviewHeader from './StorePreviewHeader'
import StorePreviewCard from './StorePreviewCard'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  explanation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 1.4,
    maxWidth: 400,
    margin: '0 auto 16px auto',
  },
  root: {
    background: '#f5f6fa',
    maxWidth: 350,
    margin: '0 auto',
    fontFamily: 'inherit',
  },
  previewBody: {
    padding: 16,
    margin: 0,
  },
}))

export default function StorePreview({
  logo,
  title,
  description,
  primaryColor,
  contrastTextColor,
  textColor,
  backgroundColor,
  titleFont,
  bodyFont,
}) {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <h3 className={classes.title}>Previsualización de tu tienda</h3>
      <p className={classes.explanation}>
        Los textos que visualizas aquí son solo ejemplos y no forman parte de tu tienda. 
        Esta previsualización te ayuda a guiarte al momento de escoger colores y fuentes.
      </p>
      <div className={classes.root} style={{ background: backgroundColor }}>
        <StorePreviewNavbar
          logo={logo}
          primaryColor={primaryColor}
          contrastTextColor={contrastTextColor}
        />
        <div className={classes.previewBody}>
          <StorePreviewHeader
            title={title}
            description={description}
            titleFont={titleFont}
            bodyFont={bodyFont}
            textColor={textColor}
          />
          <StorePreviewCard
            primaryColor={primaryColor}
            contrastTextColor={contrastTextColor}
            bodyFont={bodyFont}
            textColor={textColor}
          />
        </div>
      </div>
    </div>
  )
}

StorePreview.propTypes = {
  logo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  title: PropTypes.string,
  description: PropTypes.string,
  primaryColor: PropTypes.string,
  contrastTextColor: PropTypes.string,
  textColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  titleFont: PropTypes.string,
  bodyFont: PropTypes.string,
} 