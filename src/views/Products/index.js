import { Icon, makeStyles } from '@material-ui/core'
import Card from 'components/Card/Card'
import CardFooter from 'components/Card/CardFooter'
import CardHeader from 'components/Card/CardHeader'
import CardIcon from 'components/Card/CardIcon'
import GridContainer from 'components/Grid/GridContainer'
import GridItem from 'components/Grid/GridItem'
import Danger from 'components/Typography/Danger'
import Warning from 'components/Typography/Warning'
import React from 'react'

const useStyles = makeStyles({
    cardCategory: {
        color: '#999',
    },
    cardTitle: { color: '#3C4858' },
})

export default function Products() {
    const classes = useStyles()
    return (
        <GridContainer>
            <GridItem xs={12} sm={6} md={3}>
                <Card>
                    <CardHeader color="warning" stats icon>
                        <CardIcon color="warning">
                            <Icon>content_copy</Icon>
                        </CardIcon>
                        <p className={classes.cardCategory}>Used Space</p>
                        <h3 className={classes.cardTitle}>
                            49/50 <small>GB</small>
                        </h3>
                    </CardHeader>
                    <CardFooter stats>
                        <div>
                            <Danger>
                                <Warning />
                            </Danger>
                            <a
                                href="#pablo"
                                onClick={(e) => e.preventDefault()}
                            >
                                Get more space
                            </a>
                        </div>
                    </CardFooter>
                </Card>
            </GridItem>
        </GridContainer>
    )
}
