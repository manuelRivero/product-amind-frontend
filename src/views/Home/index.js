import React from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardIcon from 'components/Card/CardIcon.js'
import CardBody from 'components/Card/CardBody.js'
import StoreIcon from '@material-ui/icons/Store'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import logo from '../../assets/img/logo-blue.svg'
import { getTenantFromHostname } from '../../utils/tenant'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    padding: '20px',
  },
  logoContainer: {
    border: '5px solid #0065ea',
    padding: '10px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'fit-content',
  },
  welcomeSection: {
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: '500px',
    marginTop: '20px',
  },
  storeLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#0065ea',
    fontWeight: 600,
    fontSize: '16px',
    padding: '10px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      textDecoration: 'none',
      color: '#0052cc',
    },
  },
  linkText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  descriptionText: {
    textAlign: 'center',
    color: '#666',
    fontSize: '14px',
    marginBottom: '15px',
    lineHeight: '1.5',
  },
})

export default function Home() {
  const classes = useStyles()
  const { tenant } = useSelector((state) => state.config)
  
  // Obtener el subdomain del tenant o del hostname
  const getSubdomain = () => {
    if (tenant) {
      // Si el tenant tiene el sufijo "-admin", lo removemos
      return tenant.replace('-admin', '')
    }
    return getTenantFromHostname()
  }
  
  const subdomain = getSubdomain()
  const storeUrl = subdomain ? `https://${subdomain}.tiendapro.com.ar` : null

  return (
    <div className={classes.container}>
      <div className={classes.logoContainer}>
        <img src={logo} alt="logo" style={{ width: '100px', height: '100px' }} />
      </div>
      <div className={classes.welcomeSection}>
        <h3>Bienvenido al administrador de tú tienda</h3>

      </div>
      
      {storeUrl && (
        <div className={classes.cardContainer}>
          <Card>
            <CardHeader color="primary" icon>
              <CardIcon color="primary">
                <StoreIcon />
              </CardIcon>
              <h3 style={{ color: '#fff', margin: '10px 0', fontSize: '20px' }}>
                Visita tu tienda
              </h3>
            </CardHeader>
            <CardBody>
              <p className={classes.descriptionText}>
                Haz clic en el siguiente enlace para ver tu tienda en línea y verificar cómo la ven tus clientes.
              </p>
              <a 
                href={storeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={classes.storeLink}
              >
                <div className={classes.linkText}>
                  <span>Ver mi tienda</span>
                  <OpenInNewIcon style={{ fontSize: '18px' }} />
                </div>
              </a>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
