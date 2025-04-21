import { Box, Modal, makeStyles } from '@material-ui/core'
import React from 'react'
import Button from 'components/CustomButtons/Button'
import PropTypes from 'prop-types'

import Success from 'assets/img/success-icon.png'
import Error from 'assets/img/error-icon.png'
import Warning from 'assets/img/alert-icon.jpg'

icons

const icons = {
    success: Success,
    error: Error,
    warning: Warning,
}

const useStyles = makeStyles({
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '1rem',
        top: `50%`,
        left: `50%`,
        transform: `translate(-50%, -50%)`,
    },
    imageWrapper: {
        display: 'flex',
        justifyContent: 'center',
    },
    image: {
        width: '80px',
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& h4, & p': {
            margin: 0,
            marginBottom: '5px',
            textAlign: 'center',
        },
    },
    buttonsWrapper: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1rem',
    },
})

export default function CustomModal({
    open,
    handleClose,
    icon,
    title,
    subTitle,
    hasConfirm,
    hasCancel,
    confirmCb,
    cancelCb,
}) {
    const classes = useStyles()
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
        >
            <Box className={classes.paper}>
                <Box className={classes.imageWrapper}>
                    <img
                        className={classes.image}
                        src={icons[icon]}
                        alt="modal-icon"
                    />
                </Box>
                <Box className={classes.titleWrapper}>
                    <h4>{title}</h4>
                    <p>{subTitle}</p>
                </Box>
                <Box className={classes.buttonsWrapper}>
                    {hasCancel && (
                        <Button
                            isLoading={false}
                            variant="contained"
                            color="primary"
                            type="button"
                            onClick={() => cancelCb()}
                        >
                            Cancelar
                        </Button>
                    )}
                    {hasConfirm && (
                        <Button
                            isLoading={false}
                            variant="contained"
                            color="primary"
                            type="button"
                            onClick={() => confirmCb()}
                        >
                            Aceptar
                        </Button>
                    )}
                </Box>
            </Box>
        </Modal>
    )
}

CustomModal.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func,
    body: PropTypes.node,
    icon: PropTypes.string,
    title: PropTypes.string,
    subTitle: PropTypes.string,
    hasConfirm: PropTypes.bool,
    hasCancel: PropTypes.bool,
    confirmCb: PropTypes.func,
    cancelCb: PropTypes.func,
}
