import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import AddDigest from './AddDigest'
import { useCookies } from 'react-cookie';

const apiEndpoint = "http://localhost:8000"

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
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
    card: {
        marginTop: theme.spacing(15)
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
        backgroundColor: '#ffebfd'
    },
    listItem: {
        maxWidth: '40%',
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
    }
  }));

function Home() {
    const classes = useStyles();
    const history = useHistory();
    const [cookies, setCookie, removeCookie] = useCookies(['jwt_token']);
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [open, setOpen] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [userDigests, setUserDigests] = useState<Digest[]>([])

    useEffect(() => {
        getFeed()
    },[]);

    const getFeed = () => {
        let user = localStorage.getItem('user')
        let userID
        if (user) {
            userID = JSON.parse(user).id
        }
        let token = cookies["jwt_token"]
        axios.get(
            apiEndpoint + '/userFeed' + `?id=${userID}`,
            {  
                headers: {
                  'Authorization': `Bearer ${token}` 
                }
            }
            )
            .then(response => {
                console.log(response)
                setUserDigests(response.data)
                console.log(userDigests)
            });
    }

    const subscribeToFeed = (digestID: string) => {
        let user = localStorage.getItem('user')
        let userID
        if (user) {
            userID = JSON.parse(user).id
        }
        let token = cookies["jwt_token"]
        axios.patch(
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
            .then(response => {
                console.log(response)
            });
    }

    const unsubscribeFromFeed = (digestID: string) => {
        let user = localStorage.getItem('user')
        let userID
        if (user) {
            userID = JSON.parse(user).id
        }
        let token = cookies["jwt_token"]
        axios.patch(
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
            .then(response => {
                console.log(response)
            });
    }

    const deleteDigest = (digestID: string) => {
        let user = localStorage.getItem('user')
        let userID
        if (user) {
            userID = JSON.parse(user).id
        }
        let token = cookies["jwt_token"]
        axios.patch(
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
            .then(response => {
                console.log(response)
                
            });
    }

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };
    const handleSubscription = () => {
        // setSubscribed(true)
        getFeed()
        setOpen(false)
    }

    function openFeed(id: string) {
        console.log(userDigests)
        let selectedDigest
        userDigests.forEach((digest: Digest) => {
            if (digest.id === id) {
                selectedDigest = digest
            }
        });
        history.push({
            pathname: `/digest/${id}`,
            // search: `id=${id}`,  // query string
            state: {  // location state
                id: id, 
                digest: selectedDigest
            },
          })
    }
  
    return (
        <Container component="main" maxWidth="md">
            <div className={classes.paper}>
                <Typography variant="h2" className={classes.header}>
                    Welcome to Your News Digest
                </Typography>
                <Button variant="contained" color="primary" className={classes.button} onClick={handleClickOpen}>
                    Add new feed
                </Button>
                <List
                    dense
                    subheader={<ListSubheader style={{borderRadius: 10}}>Your Feed</ListSubheader>}
                    className={classes.feeds}
                    style={{borderRadius: 10}}
                >
                    {userDigests.map((digest: Digest) => (
                        <ListItem button key={digest.id} onClick = {() => {openFeed(digest.id)}}>
                            <ListItemText
                                className={classes.listItem}
                                primary={<React.Fragment>{digest.name}</React.Fragment>}
                                secondary={digest.creationDate}
                            />
                            <ListItemSecondaryAction className={classes.listItem}> 
                                {
                                    !digest.subscriptionStatus &&
                                    <Button size="small" variant="contained" color="primary" className={classes.subsribeButton} onClick={() => subscribeToFeed(digest.id)}>
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
    );
}

export default Home;
