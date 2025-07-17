import React from 'react'
import PropTypes from 'prop-types'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CancelIcon from '@material-ui/icons/Cancel'
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects'
import Button from 'components/CustomButtons/Button'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  modalContent: {
    padding: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  description: {
    marginBottom: theme.spacing(2),
    color: '#666',
    fontSize: '1rem',
  },
  list: {
    padding: 0,
  },
  listItem: {
    padding: theme.spacing(0.5, 0),
  },
  benefitIcon: {
    color: theme.palette.success.main,
    fontSize: '1.2rem',
  },
  lossIcon: {
    color: theme.palette.error.main,
    fontSize: '1.2rem',
  },
  exampleIcon: {
    color: theme.palette.warning.main,
    fontSize: '1.2rem',
  },
  listItemText: {
    fontSize: '0.95rem',
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
}))

const FeatureDetailModal = ({ open, onClose, featureInfo }) => {
  const classes = useStyles()

  if (!featureInfo) {
    return null
  }

  const { title, headline, description, benefits, withoutFeature, closing, examples } = featureInfo

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent className={classes.modalContent}>
        {headline && (
          <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 8 }}>
            {headline}
          </Typography>
        )}
        <div className={classes.section}>
          <Typography className={classes.description}>
            {description}
          </Typography>
        </div>

        <Divider className={classes.divider} />

        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>
            ✅ Beneficios con esta función
          </Typography>
          <List className={classes.list}>
            {benefits.map((benefit, index) => (
              <ListItem key={index} className={classes.listItem}>
                <ListItemIcon>
                  <CheckCircleIcon className={classes.benefitIcon} />
                </ListItemIcon>
                <ListItemText 
                  primary={benefit}
                  className={classes.listItemText}
                />
              </ListItem>
            ))}
          </List>
        </div>

        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>
            ❌ Sin esta función
          </Typography>
          <List className={classes.list}>
            {withoutFeature.map((loss, index) => (
              <ListItem key={index} className={classes.listItem}>
                <ListItemIcon>
                  <CancelIcon className={classes.lossIcon} />
                </ListItemIcon>
                <ListItemText 
                  primary={loss}
                  className={classes.listItemText}
                />
              </ListItem>
            ))}
          </List>
        </div>

        {closing && (
          <div className={classes.section}>
            <Typography style={{ color: '#1976d2', fontWeight: 500, fontSize: '1.08rem' }}>
              {closing}
            </Typography>
          </div>
        )}

        {examples && examples.length > 0 && (
          <>
            <Divider className={classes.divider} />
            <div className={classes.section}>
              <Typography className={classes.sectionTitle}>
                💡 Ejemplos de uso
              </Typography>
              <List className={classes.list}>
                {examples.map((example, index) => (
                  <ListItem key={index} className={classes.listItem}>
                    <ListItemIcon>
                      <EmojiObjectsIcon className={classes.exampleIcon} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={example}
                      className={classes.listItemText}
                    />
                  </ListItem>
                ))}
              </List>
            </div>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  )
}

FeatureDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  featureInfo: PropTypes.shape({
    title: PropTypes.string.isRequired,
    headline: PropTypes.string,
    description: PropTypes.string.isRequired,
    benefits: PropTypes.arrayOf(PropTypes.string).isRequired,
    withoutFeature: PropTypes.arrayOf(PropTypes.string).isRequired,
    closing: PropTypes.string,
    examples: PropTypes.arrayOf(PropTypes.string),
  }),
}

export default FeatureDetailModal 