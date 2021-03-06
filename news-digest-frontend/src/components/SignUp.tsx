import React, { useState } from 'react';
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
import useCookies from 'react-cookie/es6/useCookies';
import { useHistory } from 'react-router-dom';



const apiEndpoint = (process.env.REACT_APP_ENV === "DEV"? "http://localhost:8000": "https://news-digest-backend.herokuapp.com")
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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  card: {
      marginTop: theme.spacing(15)
  }
}));

export default function SignUp() {
  const classes = useStyles();
  const history = useHistory();
  const [cookies, setCookie, removeCookie] = useCookies(['jwt_token']);
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [isFirstNameValid, setIsFirstNameValid] = useState(true)
  const [isLastNameValid, setIsLastNameValid] = useState(true)
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailError, setEmailError] = useState("")
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [passwordError, setPasswordError] = useState("")

  const handleSignup = async(e: any) => {
    setIsFirstNameValid(true)
    setIsLastNameValid(true)
    setIsEmailValid(true)
    setIsPasswordValid(true)

    e.preventDefault();
    if (email === "") {
        setIsEmailValid(false);
        setEmailError("Fill in the email field")
        return
    }
    if (password === "") {
        setIsPasswordValid(false);
        setPasswordError("Fill in the password field")
        return
    } 
    if (firstName === "") {
        setIsFirstNameValid(false);
        return
    } 
    if (lastName === "") {
        setIsLastNameValid(false);
        return
    }
    const found = password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
    if (found) {
        console.log("Password is strong")
    } else {
        setIsPasswordValid(false)
        setPasswordError("Password should have at least 8 characters, a lowercase letter, an uppercase letter, and a number")
        return
    }
    let signupObj = {
        firstName: firstName,
        lastName: lastName, 
        email: email.toLowerCase(),
        password: password
    }
    try {
        const response = await axios.post(apiEndpoint + '/signup', signupObj)
        console.log(response)
        setCookie("jwt_token", response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        history.push('/home')
    } catch (error) {
        console.log("Failed to sign up")
        console.log(error)
        if (!error.response) return
        if (error.response.status === 500) {
            alert("Server error occured, please try again later")
        }
        if (error.response.status === 400) {
            if (error.response.data === "Please Enter a valid email") {
                setIsEmailValid(false)
                setEmailError("Please use a correct email format")
            }else if (error.response.data === "Email already exists") {
                setIsEmailValid(false)
                setEmailError("User already exists, use a different email")
            }
        }
    }
    axios.post(apiEndpoint + '/signup', signupObj)
        .then(response => {
            console.log(response)
            setCookie("jwt_token", response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            history.push('/home')
        });
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
                        Sign up
                    </Typography>
                    <form className={classes.form} noValidate onSubmit={handleSignup}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    error={!isFirstNameValid}
                                    helperText={!isFirstNameValid && "Please enter your first name"}
                                    autoComplete="fname"
                                    name="firstName"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    error={!isLastNameValid}
                                    helperText={!isLastNameValid && "Please enter your last name"}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="lname"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    error={!isEmailValid}
                                    helperText={!isEmailValid && emailError}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    error={!isPasswordValid}
                                    helperText={!isPasswordValid && passwordError}
                                    variant="outlined"
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
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            onClick={handleSignup}
                        >
                            Sign Up
                        </Button>
                        <Grid container justify="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    Already have an account? Sign in
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
