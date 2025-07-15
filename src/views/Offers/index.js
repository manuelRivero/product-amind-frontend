import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { CircularProgress, makeStyles, Tooltip } from '@material-ui/core'
import Button from 'components/CustomButtons/Button.js'
import { useDispatch, useSelector } from 'react-redux'
import Table from 'components/Table/Table.js'
import Card from '../../components/Card/Card'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import AddIcon from '@material-ui/icons/Add'

import { deleteOffer, getOffers } from '../../store/offers'
import moment from 'moment'
import { Delete, Edit } from '@material-ui/icons'
import CustomModal from '../../components/CustomModal'
import { formatNumber } from '../../helpers/product'
import EmptyTablePlaceholder from 'components/EmptyTablePlaceholder'
import UpgradePrompt from '../../components/UpgradePrompt'
// import { Edit } from '@material-ui/icons'
// import moment from 'moment'
// import { finalPrice, formatNumber } from '../../helpers/product'
// import { RemoveRedEye } from '@material-ui/icons'

const useStyles = makeStyles({
    paper: {
        padding: '1rem',
    },
    cardHeaderTitle: {
        margin: 0,
    },
    cardHeaderActions: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    cardHeaderActionsInner: {
        display: 'flex',
        alignItems: 'center',
        gap: '.5rem',
    },
    cardCategoryWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
    },
    tableWrapper: {
        minHeight: 300,
    },
    actionsRow: {
        display: 'flex',
        gap: '1rem',
    },
    actionButtonBox: {
        position: 'relative',
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
        <div>
            {loadingOffers && !offers ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </div>
            ) : (
                <>
                    <UpgradePrompt 
                        featureKey="offers" 
                        showPreview={true}
                    >
                        <Card>
                            <CardHeader color="primary">
                                <h4 className={classes.cardHeaderTitle}>Promociones activas</h4>
                                <p className={classes.cardCategoryWhite}>
                                    Aquí puedes ver, agregar, editar y eliminar promociones activas para tu tienda.
                                </p>
                                <div className={classes.cardHeaderActions}>
                                    <div className={classes.cardHeaderActionsInner}>
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
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div className={classes.tableWrapper}>
                                    {(!offers || offers.length === 0) ? (
                                        <EmptyTablePlaceholder title="No hay promociones activas para mostrar" />
                                    ) : (
                                        <Table
                                            styles={{}}
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
                                                moment(offer.startDate).format(
                                                    'DD-MM-YYYY'
                                                ),
                                                `${formatNumber(offer.discount)}%`,
                                                `${ moment(offer.startDate).diff(
                                                    moment(),
                                                    'hour'
                                                ) > 0 ? "Activa" : "Inactiva"}`,
                                                <div
                                                    className={classes.actionsRow}
                                                    key={offer._id}
                                                >
                                                    <Tooltip
                                                        title="Editar promoción"
                                                        placement="top"
                                                    >
                                                        <div>
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
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title="Eliminar promoción"
                                                        placement="top"
                                                    >
                                                        <div className={classes.actionButtonBox}>
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
                                                        </div>
                                                    </Tooltip>
                                                </div>,
                                            ])}
                                        />
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </UpgradePrompt>
                </>
            )}

            <CustomModal
                open={Boolean(targetForDelete)}
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
        </div>
    )
}
