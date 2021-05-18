import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { FormControl, FormLabel, InputLabel, MenuItem, Radio, RadioGroup, Select, Tooltip } from '@material-ui/core';
import axios from 'axios';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useCookies } from 'react-cookie/es6';

const apiEndpoint = (process.env.REACT_APP_ENV == "DEV"? "http://localhost:3000": "https://18.236.160.150:8000")
const useStyles = makeStyles((theme) => ({
    textField: {
        margin: theme.spacing(2),
        width: 200,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    formControl: {
        margin: theme.spacing(2),
        width: 200,
    },
    radio: {
        margin: theme.spacing(2),
        width: 200,
    }
  }));

function AddDigest(props: any) {
    const classes = useStyles();

    const [name, setName] = useState("")
    const [keyword, setKeyword] = useState("")
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortBy, setSortBy] = useState("Newest First")
    const [radioValue, setRadioValue] = React.useState('yes');
    const [cookies] = useCookies(['cookie-name']);

    const handleSubscription = () => {
        props.handleSubscription()
    };
    const handleClose = () => {
        props.handleClose()
    };
    const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSortBy(event.target.value as string);
    };
    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRadioValue((event.target as HTMLInputElement).value);
    };

    const submitSubscription = async (e: any) => {
        let user: any
        if (localStorage) {
            user = localStorage.getItem("user")
        } 
        user = JSON.parse(user)

        const subscriptionObj = {
            user: {
                email: user.email,
                id: user.id
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
        
        try {
            const res = await axios.post(
                apiEndpoint + '/subscribe', 
                subscriptionObj,
                {  
                    headers: {
                      'Authorization': `Bearer ${token}` 
                    }
                }
            );
            console.log("Created: ")
            console.log(res)
            handleSubscription()
        } catch(err) {
            console.log("Error occured while adding a new feed: ")
            console.log(err)
        }
    }

    return (
        <div>
            <DialogTitle id="form-dialog-title">
                <Typography variant="h5">
                    Add and subscribe to a news digest
                </Typography>
            </DialogTitle>
            <DialogContent>
                <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={classes.textField}
                />
                <TextField
                    required
                    margin="dense"
                    id="keyword"
                    label="Keyword to search for"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    className={classes.textField}
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
                </FormControl>
                <Tooltip placement="top" title="We will use your email to send you weekly digests. You can always opt out by unsubscribing later">
                    <FormControl component="fieldset" className={classes.radio}>
                        <FormLabel component="legend">Subscribe to email digest?</FormLabel>
                        <RadioGroup aria-label="gender" name="gender1" value={radioValue} onChange={handleRadioChange} row>
                            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="no" control={<Radio />} label="No" />
                        </RadioGroup>
                    </FormControl>
                </Tooltip>
            </DialogContent>
            <DialogActions className={classes.formControl}>
                <Button variant="contained" onClick={handleClose} color="primary" style={{backgroundColor: 'red'}}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submitSubscription} color="primary">
                    Subscribe
                </Button>
            </DialogActions>
        </div>
    );
}

export default AddDigest;
