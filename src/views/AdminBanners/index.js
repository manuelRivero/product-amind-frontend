import React, { useEffect, useState } from 'react'
import {
    Box,
    CircularProgress,
    IconButton,
    makeStyles,
    Select,
    Switch,
} from '@material-ui/core'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { changeBannerSection, changeBannerStatus, deleteBanner, getBanners } from '../../api/banners'
import { DeleteForever } from '@material-ui/icons'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
    card: {
        maxWidth: 1000,
        margin: 'auto',
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(4),
    },
    paper: {
        padding: '1rem',
    },
    imagesWrapper: {
        position: 'relative',
        maxWidth: '1150px',
        // padding eliminado para evitar duplicidad con el Card
    },
    imagesWrapperResponsive: {
        position: 'relative',
        maxWidth: '400px',
        width: '100%',
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
    bannerResponsive: {
        borderRadius: '16px',
        width: '100%',
        aspectRatio: '1/1',
        objectFit: 'contain',
    },
    bannerTypeTitle: {
        fontWeight: 'bold',
        fontSize: '1.1rem',
        color: '#222',
        marginBottom: 16,
        marginTop: 0,
    },
}))

export default function AdminBanners() {
    const { user } = useSelector((state) => state.auth)
    const history = useHistory()
    const classes = useStyles()
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingBannerStatusChange, setLoadingBannerStatusChange] = useState(undefined)
    const [loadingDeleteBanner, setLoadingDeleteBanner] = useState(undefined)

    const handleStatusChange = async (id) => {
        try {
            setLoadingBannerStatusChange(id)

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
            setLoadingBannerStatusChange(undefined)
        }
    }

    const handleTargetSectionChange = async (id, targetSection) => {
        try {
            // Llamada al backend para cambiar el estado del banner
            const response = await changeBannerSection(id, targetSection, user.token)
            console.log('response', response)

        } catch (error) {
            console.log('banner status error', error)
        } finally {
            setLoadingBannerStatusChange(undefined)
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
            <Card className={classes.card}>
                <CardHeader color="primary">
                    <h4 style={{ color: '#fff', marginTop: 0, minHeight: 'auto', fontWeight: 300, fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif", marginBottom: 3, textDecoration: 'none' }}>
                        Administración de Banners
                    </h4>
                    <p style={{ color: '#fff', margin: 0, fontSize: 14, marginTop: 0, marginBottom: 0 }}>
                        Aquí puedes ver todos los banners cargados, activar o desactivar su visibilidad, cambiar la sección de destino o eliminarlos.
                    </p>
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <Box display="flex" justifyContent="center" padding={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box>
                            {banners.map((banner, index) => {
                                return (
                                    <Card key={banner._id} style={{ marginBottom: 32, background: '#fff' }}>
                                        <CardBody>
                                            <h5 className={classes.bannerTypeTitle}>
                                                {banner.type === '0'
                                                    ? 'Banner para Mobile (se mostrará en dispositivos móviles)'
                                                    : 'Banner para Desktop (se mostrará en computadoras)'}
                                            </h5>
                                            <Box
                                                position="relative"
                                                className={banner.type === '0' ? classes.imagesWrapperResponsive : classes.imagesWrapper}
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
                                                    className={banner.type === '0' ? classes.bannerResponsive : classes.banner}
                                                />
                                                <Box>
                                                    {loadingBannerStatusChange === banner._id ? (
                                                        <CircularProgress />
                                                    ) : (
                                                        <Box
                                                            display="flex"
                                                            flexDirection={{
                                                                xs: 'column',
                                                                md: 'row',
                                                            }}
                                                        >
                                                            <Box flexBasis={{xs:"auto", md:200}}>
                                                                <p>
                                                                    {banner.active
                                                                        ? 'Desactivar banner'
                                                                        : 'Activar banner'}
                                                                </p>
                                                                <Switch
                                                                    disabled={
                                                                        loadingDeleteBanner ===
                                                                        banner._id
                                                                    }
                                                                    id={`banner-${index}`}
                                                                    defaultChecked={banner.active}
                                                                    onChange={() =>
                                                                        handleStatusChange(
                                                                            banner._id
                                                                        )
                                                                    }
                                                                    inputProps={{
                                                                        'aria-label':
                                                                            'primary checkbox',
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Box
                                                                flexBasis={{xs:"auto", md:350}}
                                                                display="flex"
                                                                alignItems="end"
                                                                style={{ gap: '1rem' }}
                                                            >
                                                                <Box>
                                                                    <p>Sección de destino</p>
                                                                    <Select
                                                                        native
                                                                        defaultValue={
                                                                            banner.section || 'NONE'
                                                                        }
                                                                        onChange={(event) =>{
                                                                            if(
                                                                                event.target.value !== 'NONE'
                                                                            ){
                                                                                handleTargetSectionChange(
                                                                                    banner._id, event.target.value
                                                                                )

                                                                        }}}
                                                                        variant="outlined"
                                                                        style={{
                                                                            width: '100%',
                                                                        }}
                                                                    >
                                                                         <option value="NONE">
                                                                            Seleccione una sección
                                                                        </option>
                                                                        <option value="HOME-HERO">
                                                                            Sección de bienvedida
                                                                        </option>
                                                                        <option value="HOME-FOOTER">
                                                                            Píe de pagina
                                                                        </option>
                                                                    </Select>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </CardBody>
                                    </Card>
                                )
                            })}
                        </Box>
                    )}
                </CardBody>
            </Card>
        </Box>
    )
}
