import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  navbar: props => ({
    width: '100%',
    height: 56,
    background: props.primaryColor,
    color: props.contrastTextColor,
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    marginBottom: 24,
    boxSizing: 'border-box',
  }),
  logo: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid #ccc',
    background: '#fff',
    marginRight: 16,
  },
  title: {
    fontWeight: 600,
    fontSize: '1.1rem',
    letterSpacing: 0.5,
    color: 'inherit',
  },
}))

function StorePreviewNavbar({ logo, primaryColor, contrastTextColor }) {
  const classes = useStyles({ primaryColor, contrastTextColor })
  return (
    <nav className={classes.navbar} aria-label="Store preview navbar">
      {logo && (
        <img src={logo} alt="Logo de la tienda" className={classes.logo} />
      )}
      <div style={{ flex: 1 }} />
      {/* Menú icono hamburguesa */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ marginRight: 18, verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
        <rect y="5" width="24" height="2.5" rx="1.25" fill={contrastTextColor} />
        <rect y="11" width="24" height="2.5" rx="1.25" fill={contrastTextColor} />
        <rect y="17" width="24" height="2.5" rx="1.25" fill={contrastTextColor} />
      </svg>
      {/* Carrito de compras */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
        <path d="M7 20c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm10 0c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zM7.16 16h9.72c.75 0 1.41-.41 1.75-1.03l3.24-5.88a1 1 0 0 0-.87-1.47H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.16 19.37 4.48 20 5.09 20h14v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63z" fill={contrastTextColor}/>
      </svg>
    </nav>
  )
}

StorePreviewNavbar.propTypes = {
  logo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  primaryColor: PropTypes.string,
  contrastTextColor: PropTypes.string,
}

export default StorePreviewNavbar 