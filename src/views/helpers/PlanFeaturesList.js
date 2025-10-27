import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import HelpIcon from '@material-ui/icons/Help';
import { Tooltip, IconButton } from '@material-ui/core'
import { 
  getFeatureLimitationText, 
  getFeatureModalInfo 
} from './planFeatures'
import FeatureDetailModal from './FeatureDetailModal'

const useStyles = makeStyles((theme) => ({
  featuresList: {
    margin: '12px 0 0 0',
    padding: 0,
    listStyle: 'none',
  },
  featureItem: {
    marginBottom: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  featureHeader: {
    display: 'flex',
    alignItems: 'center',
    color: '#111',
    fontWeight: 500,
    fontSize: '0.97rem',
    marginBottom: theme.spacing(0.5),
  },
  featureIcon: {
    fontSize: '1rem',
    marginRight: theme.spacing(0.5),
    color: theme.palette.success.main,
  },
  featureTitle: {
    margin: 0,
  },
  featureLimitation: {
    fontSize: '0.85rem',
    color: '#666',
    marginLeft: theme.spacing(1.5),
    fontStyle: 'italic',
  },
  infoButton: {
    marginLeft: theme.spacing(1),
    padding: theme.spacing(0.5),
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.04)',
    },
  },
}))

const PlanFeaturesList = ({ features }) => {
  const classes = useStyles()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)

  if (!features) {
    return null
  }

  // Convertir la nueva estructura de features a la estructura esperada
  const convertFeaturesToObject = (featuresArray) => {
    if (!Array.isArray(featuresArray)) {
      return featuresArray || {}
    }
    
    const featuresObject = {}
    featuresArray.forEach(featureItem => {
      if (featureItem.feature && featureItem.feature.name) {
        featuresObject[featureItem.feature.name] = {
          ...featureItem.feature,
          enabled: featureItem.enabled !== false, // Asegurar que siempre tenga enabled
          limits: featureItem.limits
        }
      }
    })
    return featuresObject
  }

  const convertedFeatures = convertFeaturesToObject(features)

  if (Object.keys(convertedFeatures).length === 0) {
    return null
  }

  const handleFeatureClick = (featureKey, feature) => {
    const featureInfo = getFeatureModalInfo(featureKey, feature)
    if (featureInfo) {
      setSelectedFeature(featureInfo)
      setModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedFeature(null)
  }

  return (
    <>
      <ul className={classes.featuresList}>
        {Object.entries(convertedFeatures)
          .filter(([, feature]) => feature.enabled)
          .map(([key, feature]) => {
            const limitationText = getFeatureLimitationText(key, feature)
            const hasModalInfo = getFeatureModalInfo(key, feature)
            
            return (
              <li key={key} className={classes.featureItem}>
                <div className={classes.featureHeader}>
                  <CheckCircleIcon className={classes.featureIcon} />
                  <span className={classes.featureTitle}>
                    {feature.title}
                  </span>
                  {hasModalInfo && (
                    <Tooltip title={'Has click para ver más información'} arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleFeatureClick(key, feature)}
                        className={classes.infoButton}
                      >
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
                {limitationText && (
                  <span className={classes.featureLimitation}>
                    {limitationText}
                  </span>
                )}
              </li>
            )
          })}
      </ul>

      <FeatureDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        featureInfo={selectedFeature}
      />
    </>
  )
}

PlanFeaturesList.propTypes = {
  features: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
}

PlanFeaturesList.defaultProps = {
  features: {},
}

export default PlanFeaturesList 