import { makeStyles } from '@material-ui/core'
import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display:'grid',
        placeItems:'center'
    },
})
export default function LoadinScreen() {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            <CircularProgress />
        </div>
    )
}
