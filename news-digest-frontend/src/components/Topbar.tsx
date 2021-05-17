import classes from "*.module.css";
import { AppBar, Button, makeStyles, Toolbar, Typography } from "@material-ui/core";
import React from "react";
import { useCookies } from "react-cookie";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%'
    },
    title: {
        flexGrow: 1,
        justifyContent: 'left',
        color: 'white'
    },
  }));

export default function Topbar () {
    const classes = useStyles();
    const history = useHistory();
    const [cookies, removeCookie] = useCookies(['jwt_token']);
    
    const signout = () => {
        localStorage.clear();
        removeCookie("jwt_token", "");
        history.push('/')
    }

    return(
        <AppBar position="static" className={classes.root}>
                <Toolbar>
                    <Button className={classes.title}  onClick={() => history.push('/home')}>
                    <Typography variant="h6" >
                        News Digest
                    </Typography>
                    </Button>
                    <Button size="small" color="inherit" onClick={signout}>Signout</Button>
                </Toolbar>
        </AppBar>
    )
}