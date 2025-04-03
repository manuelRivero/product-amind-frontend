import React, { useEffect, useState } from 'react'
import {
    Box,
    CircularProgress,
    IconButton,
    makeStyles,
    Switch,
    Typography,
} from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { changeBannerStatus, deleteBanner, getBanners } from '../../api/banners'
import { DeleteForever } from '@material-ui/icons'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles({
    paper: {
        padding: '1rem',
    },
    imagesWrapper: {
        position: 'relative',
        maxWidth: '1150px',
        padding: '2rem',
    },
    banner: {
        aspectRatio: '3/1',
        width: '100%',
        objectFit: 'cover',
    },
    trashIcon: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        '& img': {
            width: '24px',
        },
    },
})

export default function AdminBanners() {
    const { user } = useSelector((state) => state.auth)
    const history = useHistory()
    const classes = useStyles()
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingBanner, setLoadingBanner] = useState(undefined)
    const [loadingDeleteBanner, setLoadingDeleteBanner] = useState(undefined)

    const handleChange = async (id) => {
        try {
            setLoadingBanner(id)

            // Llamada al backend para cambiar el estado del banner
            const response = await changeBannerStatus(id, user.token)
            console.log('response', response)

            // Actualizar el estado local de banners
            setBanners((prevBanners) =>
                prevBanners.map((banner) =>
                    banner._id === id
                        ? { ...banner, active: !banner.active } // Cambiar el estado de active
                        : banner
                )
            )
        } catch (error) {
            console.log('banner status error', error)
        } finally {
            setLoadingBanner(undefined)
        }
    }

    const handleDelete = async (id) => {
        try {
            setLoadingDeleteBanner(id)

            // Llamada al backend para cambiar el estado del banner
            const response = await deleteBanner(id, user.token)
            console.log('response', response)

            // Actualizar el estado local de banners
            setBanners((prevBanners) =>
                prevBanners.filter((banner) => banner._id !== id)
            )
        } catch (error) {
            console.log('banner status error', error)
        } finally {
            setLoadingDeleteBanner(undefined)
        }
    }

    useEffect(() => {
        const getData = async () => {
            try {
                setLoading(true)
                const { data } = await getBanners(user.token)
                console.log('banners', data)
                setBanners(data.banners)
            } catch (error) {
                console.log('error', error)
            } finally {
                setLoading(false)
            }
        }
        getData()
    }, [])
    return (
        <Box>
            <IconButton
                className={classes.backButton}
                onClick={() => history.push('/admin/banners')}
            >
                <ArrowBackIcon />
            </IconButton>
            {loading ? (
                <Box display="flex" justifyContent="center" padding={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    {banners.map((banner, index) => (
                        <Box
                            position="relative"
                            key={banner._id}
                            className={classes.imagesWrapper}
                        >
                            {loadingDeleteBanner === banner._id ? (
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    padding={4}
                                >
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <IconButton
                                    className={classes.trashIcon}
                                    onClick={() => handleDelete(banner._id)}
                                >
                                    <DeleteForever />
                                </IconButton>
                            )}
                            <img
                                src={banner.url}
                                alt="banner"
                                style={{ width: '100%' }}
                                className={classes.banner}
                            />
                            <Box
                                display="flex"
                                flexDirection="column"
                                justifyContent="center"
                                alignItems="flex-start"
                            >
                                {loadingBanner === banner._id ? (
                                    <CircularProgress />
                                ) : (
                                    <>
                                        <Typography>
                                            {banner.active
                                                ? 'Desactivar banner'
                                                : 'Activar banner'}
                                        </Typography>
                                        <Switch
                                            disabled={
                                                loadingDeleteBanner ===
                                                banner._id
                                            }
                                            id={`banner-${index}`}
                                            defaultChecked={banner.active}
                                            onChange={() =>
                                                handleChange(banner._id)
                                            }
                                            inputProps={{
                                                'aria-label':
                                                    'primary checkbox',
                                            }}
                                        />
                                    </>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    )
}
