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
import { Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemAvatar, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import AddDigest from './AddDigest'
import { StringLiteral } from 'typescript';
import { useCookies } from 'react-cookie/es6';

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
    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name']);

    const digestID = location.state.id
    const digest = location.state.digest
    const feed = location.state.digest.feed

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [open, setOpen] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [userDigests, setUserDigests] = useState<Digest[]>([])

    useEffect(() => {
        getFeed()
    },[]);

    const getFeed = () => {
        let user: any
        if (localStorage) {
            user = localStorage.getItem("user")
        }
        let token = cookies['jwt_token']
        axios.get(
            apiEndpoint + '/userFeed' + `?id=${user.id}`,
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
        console.log(id)
    }

    const handleExternalLink = (url: string) => {
        window.open(url, "_blank")
    }
  
    return (
        <Container component="main" maxWidth="md">
            <div className={classes.paper}>
                <Typography variant="h2" className={classes.header}>
                    Your Feed
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
                            digest.subscriptionStatus &&
                            <Button size="small" variant="contained" color="primary" className={classes.subsribeButton}>
                                Subsribe
                            </Button>
                        }
                        {
                            !digest.subscriptionStatus &&
                            <Button size="small" variant="contained" color="primary" className={classes.unSubscribeButton}>
                                unSubsribe
                            </Button>
                        }
                        <IconButton color="primary" className={classes.deleteButton}>
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
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <AddDigest handleClose={handleClose} handleSubscription={handleSubscription}/>
                </Dialog>
            </div>
        </Container>
    );
}
