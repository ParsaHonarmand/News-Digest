import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { IconButton, List, ListItem, ListItemAvatar, ListItemText, ListSubheader, Dialog } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import AddDigest from './AddDigest'
import { useCookies } from 'react-cookie/es6';
import Topbar from '../Topbar'

const apiEndpoint = (process.env.REACT_APP_ENV == "DEV"? "http://localhost:8000": "http://52.41.106.185/8000")

interface NewsInfo {
    source: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
}

interface Digest {
    creationDate: string;
    feed: NewsInfo[];
    id: string;
    name: string;
    subscriptionStatus: boolean;
}

interface LocationState {
    id: string;
    digest: Digest;
}

const useStyles = makeStyles((theme) => ({
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%',
      marginTop: theme.spacing(1),
    },
    header: {
        marginTop: theme.spacing(5)
    },
    feeds: {
        margin: theme.spacing(2),
        width: "100%",
        maxWidth: "100%",
        backgroundColor: '#ffebfd'
    },
    listItem: {
        color: 'black'
    },
    subsribeButton: {
        margin: theme.spacing(1),
    },
    unSubscribeButton: {
        margin: theme.spacing(1),
        backgroundColor: 'red',
        "&:hover": {
            backgroundColor: "red"
        }
    },
    deleteButton: {
        margin: theme.spacing(1),
        color: 'red'
    },
    large: {
        width: theme.spacing(6),
        height: theme.spacing(6),
    },
    feedHeader: {
        display: 'flex',
        flexDirection: 'row'
    },
    feedButtons: {
        justifyContent: 'flex-end'
    },
    feedHeaderText: {
        flexGrow: 8, 
        justifyContent: 'flex-start',
        margin: theme.spacing(1)
    }
  }));


export default function ViewDigest(props: any) {
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation<LocationState>();
    const [cookies] = useCookies(['cookie-name']);

    const digestID = location.state.id
    const digest = location.state.digest
    const feed = location.state.digest.feed

    const [subscriptionStatus, setSubscriptionStatus] = useState(location.state.digest.subscriptionStatus)

    const subscribeToFeed = async (digestID: string) => {
        let user = localStorage.getItem('user')
        let userID
        if (user) {
            userID = JSON.parse(user).id
        }
        let token = cookies["jwt_token"]

        try {
            const res = await axios.patch(
                apiEndpoint + '/digest/subscribe',
                {
                    userID: userID,
                    digestID: digestID
                },
                {  
                    headers: {
                      'Authorization': `Bearer ${token}` 
                    }
                }
            )
            console.log("Updated:")
            console.log(res)
            setSubscriptionStatus(true)
        } catch (error) {
            console.log("Failed to subscribe: ")
            console.log(error)
        }
        
    }

    const unsubscribeFromFeed = async (digestID: string) => {
        let user = localStorage.getItem('user')
        let userID
        if (user) {
            userID = JSON.parse(user).id
        }
        let token = cookies["jwt_token"]

        try {
            const res = await axios.patch(
                apiEndpoint + '/digest/unsubscribe',
                {
                    userID: userID,
                    digestID: digestID
                },
                {  
                    headers: {
                      'Authorization': `Bearer ${token}` 
                    }
                }
            )
            console.log("Unsubscribed: ")
            console.log(res)
            setSubscriptionStatus(false)
        } catch (error) {
            console.log("Failed: ")
            console.log(error)
        }
    }

    const deleteDigest = async (digestID: string) => {
        let user = localStorage.getItem('user')
        let userID
        if (user) {
            userID = JSON.parse(user).id
        }
        let token = cookies["jwt_token"]

        try {
            const res = await axios.patch(
                apiEndpoint + '/digest/delete',
                {
                    userID: userID,
                    digestID: digestID
                },
                {  
                    headers: {
                      'Authorization': `Bearer ${token}` 
                    }
                }
            )
            console.log("Deleted: ")
            console.log(res)
            history.push('/home')
        } catch (error) {
            console.log("Failed to delete: ")
            console.log(error)
        } 
    }

    const handleExternalLink = (url: string) => {
        window.open(url, "_blank")
    }
  
    return (
        <div style={{width: '100%'}}>
            <Topbar />
            <Container component="main" maxWidth="md">
                <div className={classes.paper}>
                    <Typography variant="h5" className={classes.header}>
                        Feed Summary
                    </Typography>
                    <List
                        dense
                        subheader={
                            <div className={classes.feedHeader}>
                            <ListSubheader className={classes.feedHeaderText} >
                                <b>{digest.name}</b>
                            </ListSubheader>
                            <div className={classes.feedButtons}>
                            {
                                !subscriptionStatus &&
                                <Button size="small" variant="contained" color="primary" className={classes.subsribeButton} onClick={() => subscribeToFeed(digestID)}>
                                    Subsribe
                                </Button>
                            }
                            {
                                subscriptionStatus &&
                                <Button size="small" variant="contained" color="primary" className={classes.unSubscribeButton} onClick={() => unsubscribeFromFeed(digestID)}>
                                    unSubsribe
                                </Button>
                            }
                            <IconButton color="primary" className={classes.deleteButton} onClick={() => deleteDigest(digestID)}>
                                <DeleteOutlineIcon />
                            </IconButton>
                            </div>
                            </div>
                        }
                        className={classes.feeds}
                        style={{borderRadius: 10}}
                    >
                        {feed.map((article: any, key: number) => (
                            <ListItem button key={key} onClick={() => handleExternalLink(article.url)}>
                                <ListItemAvatar>
                                    <Avatar alt="PIC" src={article.urlToImage} className={classes.large}/>
                                </ListItemAvatar>
                                <ListItemText
                                    className={classes.listItem}
                                    primary={<React.Fragment><b>{article.title}</b></React.Fragment>}
                                    secondary={article.publishedAt}
                                />
                            </ListItem>
                        ))}
                    </List>
                </div>
            </Container>
        </div> 
    );
}
