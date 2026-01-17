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

import { deleteCoupon, getCoupons } from '../../store/coupons'
import moment from 'moment'
import { Delete, Edit } from '@material-ui/icons'
import CustomModal from '../../components/CustomModal'
import EmptyTablePlaceholder from 'components/EmptyTablePlaceholder'
import UpgradePrompt from '../../components/UpgradePrompt'
import { getCouponStatus, getCouponStatusColor, formatCouponValue, getCouponTypeLabel } from '../../helpers/coupon'
import { COUPON_STATUS_LABELS } from '../../const/coupons'

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
    ctaRow: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '1rem',
        margin: '1rem 0',
        padding: 0,
        width: '100%',
    },
    cardCategory: {
        color: '#999',
        margin: 0,
        fontSize: '14px',
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

export default function Coupons() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const history = useHistory()

    const { loadingCoupons, coupons } = useSelector((state) => state.coupons)

    const [loadingDeleteCoupon, setLoadingDeleteCoupon] = useState(null)
    const [targetForDelete, setTargetForDelete] = useState(null)
    
    useEffect(() => {
        dispatch(getCoupons())
    }, [])

    const handleDeleteCoupon = async (couponId) => {
        try {
            setLoadingDeleteCoupon(couponId)
            await dispatch(deleteCoupon({ id: couponId }))
        } catch (error) {
            console.log('error', error)
        } finally {
            setLoadingDeleteCoupon(null)
        }
    }


    return (
        <div>
            {loadingCoupons && !coupons ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </div>
            ) : (
                <>
                    <UpgradePrompt 
                        featureKey="discountCoupons" 
                        showPreview={true}
                        showUpgradePrompt={true}
                    >
                        <Card>
                            <CardHeader color="primary">
                                <h4 className={classes.cardHeaderTitle}>Cupones</h4>
                                <p className={classes.cardCategoryWhite}>
                                    Aquí puedes ver, agregar, editar y eliminar cupones de descuento para tu tienda.
                                </p>
                                <div className={classes.ctaRow}>
                                    <div className={classes.cardHeaderActionsInner}>
                                        <p className={classes.cardCategoryWhite}>
                                            Agregar nuevo cupón
                                        </p>
                                        <Link to="/admin/coupons/add-coupon">
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
                                    {(!coupons || coupons.length === 0) ? (
                                        <EmptyTablePlaceholder title="No hay cupones para mostrar" />
                                    ) : (
                                        <Table
                                            styles={{}}
                                            tableHeaderColor="primary"
                                            tableHead={[
                                                'Código',
                                                'Nombre',
                                                'Tipo',
                                                'Valor',
                                                'Fecha inicio',
                                                'Fecha fin',
                                                'Estado',
                                                'Acciones',
                                            ]}
                                            tableData={coupons.map((coupon) => [
                                                coupon.code,
                                                coupon.name,
                                                getCouponTypeLabel(coupon.type),
                                                formatCouponValue(coupon.type, coupon.value),
                                                moment(coupon.validFrom).format('DD-MM-YYYY'),
                                                moment(coupon.validUntil).format('DD-MM-YYYY'),
                                                <span key={`status-${coupon._id}`} style={{ 
                                                    color: getCouponStatusColor(coupon.validFrom, coupon.validUntil),
                                                    fontWeight: 'bold'
                                                }}>
                                                    {COUPON_STATUS_LABELS[getCouponStatus(coupon.validFrom, coupon.validUntil)]}
                                                </span>,
                                                <div
                                                    className={classes.actionsRow}
                                                    key={coupon._id}
                                                >
                                                    <Tooltip
                                                        title="Editar cupón"
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
                                                                        `/admin/coupons/add-coupon/${coupon._id}`
                                                                    )
                                                                }
                                                            >
                                                                <Edit />
                                                            </Button>
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title="Eliminar cupón"
                                                        placement="top"
                                                    >
                                                        <div className={classes.actionButtonBox}>
                                                            <Button
                                                                isLoading={
                                                                    loadingDeleteCoupon ===
                                                                    coupon._id
                                                                }
                                                                variant="contained"
                                                                color="primary"
                                                                type="button"
                                                                onClick={() =>
                                                                    setTargetForDelete(
                                                                        coupon._id
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
                title="¿Seguro que deseas eliminar este cupón?"
                subTitle="Esta acción es irreversible"
                hasCancel={true}
                hasConfirm={true}
                cancelCb={() => {
                    setTargetForDelete(null)
                }}
                confirmCb={() => {
                    setTargetForDelete(null)
                    handleDeleteCoupon(targetForDelete)
                }}
            />
        </div>
    )
}
