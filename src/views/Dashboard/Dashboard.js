import React from 'react'
import MainStats from 'components/dashboard/mainStats'
import MainCharts from 'components/dashboard/mainCharts'
import PendingOrders from '../../components/dashboard/pendingOrders'
import PendingOrdersSummary from '../../components/dashboard/pendingOrdersSummary'
import BestSellers from 'components/dashboard/bestSellers'
import StockAlerts from 'components/dashboard/stock'
import ClientsBehavior from 'components/dashboard/clientsBehavior'
import { UpgradePrompt } from 'components/UpgradePrompt'
import GridItem from 'components/Grid/GridItem'
import GridContainer from 'components/Grid/GridContainer'

export default function Dashboard() {
    return (
        <div>
            <GridContainer>
                <GridItem xs={12} md={6}>
                    <PendingOrdersSummary />
                </GridItem>
                <GridItem xs={12} md={6}>
                    <MainStats />
                </GridItem>
            </GridContainer>
            <PendingOrders />
            <MainCharts />
            <UpgradePrompt
                featureKey="analytics"
            >
                <>
                    <BestSellers />
                </>
            </UpgradePrompt>
            <UpgradePrompt
                featureKey="analytics"
            >
                <>
                    <StockAlerts />
                </>
            </UpgradePrompt>
            <UpgradePrompt
                featureKey="analytics"
            >
                <>
                    <ClientsBehavior />
                </>
            </UpgradePrompt>
        </div>
    )
}
