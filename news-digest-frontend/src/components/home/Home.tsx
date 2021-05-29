import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { AppBar, Dialog, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, ListSubheader, Toolbar } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import AddDigest from './AddDigest'
import { useCookies } from 'react-cookie';
import MenuIcon from '@material-ui/icons/Menu';
import Topbar from '../Topbar'

const apiEndpoint = (process.env.REACT_APP_ENV == "DEV"? "http://localhost:3000": "https://news-digest-backend.herokuapp.com/")

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

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%'
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    header: {
        marginTop: theme.spacing(2)
    },
    button: {
        margin: 'auto auto'
    },
    feeds: {
        margin: theme.spacing(5),
        width: "100%",
        maxWidth: "100%",
        backgroundColor: '#ffebfd',
    },
    listItem: {
        color: 'black',
        justifyContent: 'flex-start',
        wordWrap: 'break-word'
    },
    unSubscribeButton: {
        backgroundColor: 'red',
        "&:hover": {
            backgroundColor: "red"
        },
        width: '110px'
    },
    subscribeButton: {
        width: '110px'
    },
    deleteButton: {
        color: 'red',
    },
    smallButton: {
        justifyContent: 'flex-end',
        margin: theme.spacing(2)
    },
    feedHeader: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: '#cccccc',
        wordWrap: 'break-word'
    },
    feedHeaderText: {
        color: 'black',
        flexGrow: 8, 
        justifyContent: 'flex-start',
        margin: theme.spacing(2),
    },
    listRow: {
        display: 'flex',
        flexDirection: 'row',
    }
  }));

function Home() {
    const classes = useStyles();
    const history = useHistory();
    const [cookies, removeCookie] = useCookies(['jwt_token']);

    const [open, setOpen] = useState(false);
    const [userDigests, setUserDigests] = useState<Digest[]>([])

    useEffect(() => {
        getFeed()
    },[]);

    const getFeed = async () => {
        let user = localStorage.getItem('user')
        let userID
        if (user) {
            userID = JSON.parse(user).id
        }
        let token = cookies["jwt_token"]
        try {
            const res = await axios.get(
                apiEndpoint + '/userFeed' + `?id=${userID}`,
                {  
                    headers: {
                      'Authorization': `Bearer ${token}` 
                    }
                }
            )
            console.log("Got feed: " + JSON.stringify(res))
            setUserDigests(res.data)
            console.log(userDigests)
        } catch(err) {
            console.log("Failed: ")
            console.log(err)
        }
    }

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
            getFeed()
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
            getFeed()
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
            const result = userDigests.filter(digest => digest.id !== digestID)
            setUserDigests(result)
        } catch (error) {
            console.log("Failed to delete: ")
            console.log(error)
        }
        
    }

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };
    const handleSubscription = async () => {
        await getFeed()
        setOpen(false)
    };

    function openFeed(id: string) {
        let selectedDigest
        userDigests.forEach((digest: Digest) => {
            if (digest.id === id) {
                selectedDigest = digest
            }
        });
        history.push({
            pathname: `/digest/${id}`,
            state: {
                id: id, 
                digest: selectedDigest
            },
        })
    }
  
    return (
        <div style={{width: '100%'}}>
            <Topbar />
            <Container component="main" maxWidth="md" style={{height: '100vh'}}>
                <div className={classes.paper}>
                    <List
                        dense
                        subheader={
                                <ListSubheader className={classes.feedHeader}>
                                    <Typography className={classes.feedHeaderText} variant="h6">
                                        <b>Your Feed</b>
                                    </Typography>
                                    <Button variant="contained" color="primary" size="small" className={classes.smallButton} onClick={handleClickOpen}>
                                        Add new feed
                                    </Button>
                                </ListSubheader>
                        }
                        className={classes.feeds}
                        style={{borderRadius: 10}}
                    >
                        {userDigests.map((digest: Digest) => (
                            <ListItem button key={digest.id} onClick = {() => {openFeed(digest.id)}} className={classes.listRow}>
                                <ListItemText
                                    className={classes.listItem}
                                    primary={
                                        <React.Fragment>
                                            {digest.name}
                                        </React.Fragment>
                                    }
                                    secondary={digest.creationDate}
                                />
                                <ListItemSecondaryAction className={classes.listItem}> 
                                    {
                                        !digest.subscriptionStatus &&
                                        <Button size="small" variant="contained" color="primary" className={classes.subscribeButton} onClick={() => subscribeToFeed(digest.id)}>
                                            Subscribe
                                        </Button>
                                    }
                                    {
                                        digest.subscriptionStatus &&
                                        <Button size="small" variant="contained" color="primary" className={classes.unSubscribeButton} onClick={() => unsubscribeFromFeed(digest.id)}>
                                            unSubscribe
                                        </Button>
                                    }
                                    <IconButton color="primary" className={classes.deleteButton} onClick={() => deleteDigest(digest.id)}>
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                        <AddDigest handleClose={handleClose} handleSubscription={handleSubscription}/>
                    </Dialog>
                </div>
            </Container>
        </div>
    );
}

export default Home;
