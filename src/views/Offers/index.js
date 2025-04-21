import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Box, CircularProgress, makeStyles, Tooltip } from '@material-ui/core'
import Button from 'components/CustomButtons/Button.js'
import { useDispatch, useSelector } from 'react-redux'
import Table from 'components/Table/Table.js'
import Card from '../../components/Card/Card'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import AddIcon from '@material-ui/icons/Add'

import { deleteOffer, getOffers } from '../../store/offers'
import moment from 'moment'
import { formatNumber } from '../../helpers/product'
import { Delete, Edit } from '@material-ui/icons'
import CustomModal from '../../components/CustomModal'
// import { Edit } from '@material-ui/icons'
// import moment from 'moment'
// import { finalPrice, formatNumber } from '../../helpers/product'
// import { RemoveRedEye } from '@material-ui/icons'

const useStyles = makeStyles({
    paper: {
        padding: '1rem',
    },
})

export default function Offers() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const history = useHistory()

    const { loadingOffers, offers } = useSelector((state) => state.offers)

    const [loadingDeleteOffer, setLoadingDeleteOffer] = useState(null)
    const [targetForDelete, setTargetForDelete] = useState(null)
    useEffect(() => {
        dispatch(getOffers())
    }, [])

    const handleDeleteOffer = async (offerId) => {
        try {
            setLoadingDeleteOffer(offerId)
            await dispatch(deleteOffer({ id: offerId }))
        } catch (error) {
            console.log('error', error)
        } finally {
            setLoadingDeleteOffer(null)
        }
    }
    return (
        <Box>
            {loadingOffers && !offers ? (
                <Box display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Card>
                        <CardHeader color="primary">
                            <h4 style={{ margin: 0 }}>Promociones activas</h4>
                            <Box display="flex" justifyContent="flex-end">
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    style={{ gap: '.5rem' }}
                                >
                                    <p className={classes.cardCategoryWhite}>
                                        Agrega una nueva promoción
                                    </p>
                                    <Link to="/admin/offers/add-offers">
                                        <Button
                                            isLoading={false}
                                            variant="contained"
                                            color="white"
                                            type="button"
                                            size="sm"
                                            justIcon
                                        >
                                            <AddIcon />
                                        </Button>
                                    </Link>
                                </Box>
                            </Box>
                        </CardHeader>
                        <CardBody>
                            <Table
                                styles={{
                                    tableWrapper: {
                                        minHeight: 300,
                                    },
                                }}
                                tableHeaderColor="primary"
                                tableHead={[
                                    'Nombre',
                                    'Fecha de inicio',
                                    'Fecha de finalización',
                                    'Descuento por promoción',
                                    'Estatus',
                                    'Acciones',
                                ]}
                                tableData={offers.map((offer) => [
                                    offer.name,
                                    moment(offer.startDate).format(
                                        'DD-MM-YYYY'
                                    ),
                                    moment(offer.endDate).format('DD-MM-YYYY'),
                                    `${formatNumber(offer.discount)}%`,
                                    offer.isActive ? 'Activa' : 'Inactiva',
                                    <Box
                                        display="flex"
                                        style={{ gap: '1rem' }}
                                        key={offer._id}
                                    >
                                        <Tooltip
                                            title="Editar promoción"
                                            placement="top"
                                        >
                                            <Box>
                                                <Button
                                                    isLoading={false}
                                                    variant="contained"
                                                    color="primary"
                                                    type="button"
                                                    onClick={() =>
                                                        history.push(
                                                            `/admin/offers/add-offers/${offer._id}`
                                                        )
                                                    }
                                                >
                                                    <Edit />
                                                </Button>
                                            </Box>
                                        </Tooltip>
                                        {offer.isActive && (
                                            <Tooltip
                                                title="Eliminar promoción"
                                                placement="top"
                                            >
                                                <Box position="relative">
                                                    <Button
                                                        isLoading={
                                                            loadingDeleteOffer ===
                                                            offer._id
                                                        }
                                                        variant="contained"
                                                        color="primary"
                                                        type="button"
                                                        onClick={() =>
                                                            setTargetForDelete(
                                                                offer._id
                                                            )
                                                        }
                                                    >
                                                        <Delete />
                                                    </Button>
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>,
                                ])}
                            />
                        </CardBody>
                    </Card>
                </>
            )}

            <CustomModal
                open={targetForDelete}
                handleClose={() => {
                    setTargetForDelete(false)
                }}
                icon={'warning'}
                title="¿Seguro que deseas eliminar esta promoción?"
                subTitle="Esta acción es irreversible"
                hasCancel={true}
                hasConfirm={true}
                cancelCb={() => {
                    setTargetForDelete(null)
                }}
                confirmCb={() => {
                    setTargetForDelete(null)
                    handleDeleteOffer(targetForDelete)
                }}
            />
        </Box>
    )
}
