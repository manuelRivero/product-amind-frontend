import React from 'react'
// @material-ui/core
import { makeStyles } from '@material-ui/core/styles'
// @material-ui/icons
import BugReport from '@material-ui/icons/BugReport'
import Code from '@material-ui/icons/Code'
import Cloud from '@material-ui/icons/Cloud'
// core components
import GridItem from 'components/Grid/GridItem.js'
import GridContainer from 'components/Grid/GridContainer.js'
import Table from 'components/Table/Table.js'
import Tasks from 'components/Tasks/Tasks.js'
import CustomTabs from 'components/CustomTabs/CustomTabs.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'

import { bugs, website, server } from 'variables/general.js'


import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import MainStats from 'components/dashboard/mainStats'
import MainCharts from 'components/dashboard/mainCharts'

const useStyles = makeStyles(styles)

export default function Dashboard() {
    const classes = useStyles()
    return (
        <div>
            <MainStats />
            <MainCharts />
            <GridContainer>
                <GridItem xs={12} sm={12} md={6}>
                    <CustomTabs
                        title="Tasks:"
                        headerColor="primary"
                        tabs={[
                            {
                                tabName: 'Bugs',
                                tabIcon: BugReport,
                                tabContent: (
                                    <Tasks
                                        checkedIndexes={[0, 3]}
                                        tasksIndexes={[0, 1, 2, 3]}
                                        tasks={bugs}
                                    />
                                ),
                            },
                            {
                                tabName: 'Website',
                                tabIcon: Code,
                                tabContent: (
                                    <Tasks
                                        checkedIndexes={[0]}
                                        tasksIndexes={[0, 1]}
                                        tasks={website}
                                    />
                                ),
                            },
                            {
                                tabName: 'Server',
                                tabIcon: Cloud,
                                tabContent: (
                                    <Tasks
                                        checkedIndexes={[1]}
                                        tasksIndexes={[0, 1, 2]}
                                        tasks={server}
                                    />
                                ),
                            },
                        ]}
                    />
                </GridItem>
                <GridItem xs={12} sm={12} md={6}>
                    <Card>
                        <CardHeader color="warning">
                            <h4 className={classes.cardTitleWhite}>
                                Employees Stats
                            </h4>
                            <p className={classes.cardCategoryWhite}>
                                New employees on 15th September, 2016
                            </p>
                        </CardHeader>
                        <CardBody>
                            <Table
                                tableHeaderColor="warning"
                                tableHead={['ID', 'Name', 'Salary', 'Country']}
                                tableData={[
                                    ['1', 'Dakota Rice', '$36,738', 'Niger'],
                                    [
                                        '2',
                                        'Minerva Hooper',
                                        '$23,789',
                                        'Curaçao',
                                    ],
                                    [
                                        '3',
                                        'Sage Rodriguez',
                                        '$56,142',
                                        'Netherlands',
                                    ],
                                    [
                                        '4',
                                        'Philip Chaney',
                                        '$38,735',
                                        'Korea, South',
                                    ],
                                ]}
                            />
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>
        </div>
    )
}
