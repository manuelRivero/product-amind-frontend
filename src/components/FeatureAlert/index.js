import React from 'react'
import PropTypes from 'prop-types'

const COLORS = {
  info: {
    background: '#fff',
    color: '#222',
    borderLeft: '6px solid #20B6C9',
  },
  warning: {
    background: '#fff',
    color: '#fbc02d',
    borderLeft: '6px solid #fbc02d',
  },
  error: {
    background: '#fff',
    color: '#d32f2f',
    borderLeft: '6px solid #d32f2f',
  },
  success: {
    background: '#fff',
    color: '#388e3c',
    borderLeft: '6px solid #388e3c',
  },
}

const FeatureAlert = ({ severity = 'info', children, className = '' }) => {
  const style = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    margin: '16px 0',
    borderRadius: 6,
    fontSize: '1rem',
    background: COLORS[severity].background,
    color: COLORS[severity].color,
    borderLeft: COLORS[severity].borderLeft,
    boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
  }
  return (
    <div style={style} className={className}>
      <span>{children}</span>
    </div>
  )
}

FeatureAlert.propTypes = {
  severity: PropTypes.oneOf(['info', 'warning', 'error', 'success']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export default FeatureAlert 