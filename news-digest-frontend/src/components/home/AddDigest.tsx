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
import { Card, CardContent, Chip, FormControl, FormLabel, IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader, MenuItem, Radio, RadioGroup, Select } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import axios from 'axios';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useHistory } from 'react-router-dom';
// Picker
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import DateFnsUtils from "@date-io/date-fns"; // choose your lib
import { DatePicker, LocalizationProvider } from "@material-ui/pickers";
import { useCookies } from 'react-cookie/es6';

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

const apiEndpoint = "http://localhost:8000"
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
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
  }));

function AddDigest(props: any) {
    const classes = useStyles();
    const history = useHistory();

    const [name, setName] = useState("")
    const [keyword, setKeyword] = useState("")
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortBy, setSortBy] = useState("Newest First")
    const [radioValue, setRadioValue] = React.useState('yes');
    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name']);

    const handleSubscription = () => {
        props.handleSubscription()
    };
    const handleClose = () => {
        props.handleClose()
    };

    const handleStartDate = (event: React.ChangeEvent<{ value: unknown }>) => {
        setStartDate(event.target.value as string);
    };
    const handleEndDate = (event: React.ChangeEvent<{ value: unknown }>) => {
        setEndDate(event.target.value as string);
    };
    const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSortBy(event.target.value as string);
    };
    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRadioValue((event.target as HTMLInputElement).value);
    };

    function submitSubscription(e: any) {
        let user: any
        if (localStorage) {
            user = localStorage.getItem("user")
        } 
        let subscriptionObj = {
            user: {
                email: JSON.parse(user).email,
                id: JSON.parse(user).id
            },
            news: {
                digestName: name,
                keyword: keyword,
                startDate: startDate,
                endDate: endDate,
                sortBy: sortBy,
            },
            subscriptionStatus: radioValue == "yes" ? true: false,
            creationDate: new Date().toISOString().slice(0,10)
        }

        let token = cookies['jwt_token']
        console.log(token)
        axios.post(
            apiEndpoint + '/subscribe', 
            subscriptionObj,
            {  
                headers: {
                  'Authorization': `Bearer ${token}` 
                }
            }
            )
            .then(response => {
                // setTimeout(() => {
                    console.log(response)
                    handleSubscription()
                // }, 4000);
            });
    }

    return (
        <div>
            <DialogTitle id="form-dialog-title">Add and subscribe to a news digest</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Add and subscribe to a news digest
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <TextField
                    autoFocus
                    margin="dense"
                    id="keyword"
                    label="Keyword to search for"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                />
                <TextField
                    id="date"
                    label="From"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    id="date"
                    label="To"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <FormControl className={classes.formControl}>
                    <InputLabel shrink id="demo-simple-select-placeholder-label-label">
                        Sort by
                    </InputLabel>
                    <Select
                        labelId="demo-simple-select-placeholder-label-label"
                        id="demo-simple-select-placeholder-label"
                        value={sortBy}
                        onChange={handleSortChange}
                        className={classes.selectEmpty}
                    >
                        <MenuItem value="Newest First">
                            <em>Newest First</em>
                        </MenuItem>
                        <MenuItem value="popularity">Popularity</MenuItem>
                        <MenuItem value="relevance">Relevance</MenuItem>
                    </Select>
                    {/* <FormHelperText>Label + placeholder</FormHelperText> */}
                </FormControl>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Subscribe to email digest?</FormLabel>
                    <RadioGroup aria-label="gender" name="gender1" value={radioValue} onChange={handleRadioChange} row>
                        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={submitSubscription} color="primary">
                    Subscribe
                </Button>
            </DialogActions>
        </div>
    );
}

export default AddDigest;
