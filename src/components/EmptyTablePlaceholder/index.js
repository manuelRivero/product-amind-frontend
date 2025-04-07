import React from 'react'
import { Box } from '@material-ui/core'
import image from 'assets/img/empty-table-placeholder.jpg'
import PropTypes from 'prop-types'

export default function EmptyTablePlaceholder({title}) {
  return (
    <Box marginTop={5} display="flex" flexDirection="column" alignItems="center">
        <img src={image} alt="empty" style={{ width: 200 }} />
        <h4 style={{ textAlign: 'center' }}>{title}</h4>
    </Box>
  )
}

EmptyTablePlaceholder.propTypes = {
    title: PropTypes.string,
}