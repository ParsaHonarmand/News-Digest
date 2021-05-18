import React, { useState } from 'react';
import logo from './logo.svg';
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
import { Card, CardContent } from '@material-ui/core';
import axios from 'axios';
import { useHistory } from "react-router-dom";
import { useCookies } from 'react-cookie/es6';


const apiEndpoint = (process.env.REACT_APP_ENV == "DEV"? "http://localhost:8000": "https://18.236.160.150:8000")
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
    }
  }));

function Login() {
    const classes = useStyles();
    const history = useHistory();

    const [cookies, setCookie, removeCookie] = useCookies(['jwt_token']);
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e: any) => {
        e.preventDefault();
        let loginObj = {
            email: email,
            password: password
        }
        try {
            const res = await axios.post(apiEndpoint + '/login', loginObj)
            console.log(res)
            setCookie("jwt_token", res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
            history.push("/home")
        } catch(error) {
            console.log("Failed to login")
            console.log(error)
        }
    }
  
    return (
        <Container component="main" maxWidth="xs">
            <Card>
                <CardContent>
                    <CssBaseline />
                    <div className={classes.paper}>
                        <Avatar className={classes.avatar}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <form className={classes.form} noValidate onSubmit={handleLogin}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoFocus
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            {/* <FormControlLabel
                              control={<Checkbox value="remember" color="primary" />}
                              label="Remember me"
                            /> */}
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={handleLogin}
                            >
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid item>
                                    <Link href="/signup" variant="body2">
                                        {"Don't have an account? Sign Up"}
                                    </Link>
                                </Grid>
                            </Grid>
                        </form>
                    </div>
                </CardContent>
            </Card>  
        </Container>
    );
}

export default Login;
