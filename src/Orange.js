import React, {Component} from "react";
import axios from "axios";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import Alert from "./Alert";

window.MediaRecorder = require('audio-recorder-polyfill');
let mediaRecorder;
let audioChunks = [];
let audioBlob = undefined;

export default class Orange extends Component {

    constructor(props) {
        super(props);
        this.record = this.record.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.state = {
            download_url: undefined,
            transcription: "",
            transcriptionInProgress: false,
            recordingInProgress: false,
            room: "",
            timeChoice: "",
            timerOn: false,
            timerTime: 0,
            timerStart: 0,
            alertUserForSuccess: false
        };
        this.speechToText = this.speechToText.bind(this);
        this.submit = this.submit.bind(this);
        // this.handleSubmit = this.handleSubmit.bind(this);
        this.name = "";
        this.email = "";
        this.stream = undefined;
        this.handleRoomChange = this.handleRoomChange.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);

    }

    stopTimer = () => {
        this.setState({timerOn: false});
        clearInterval(this.timer);
    };

    startTimer = () => {
        this.resetTimer();
        this.setState({
            timerOn: true,
            timerTime: this.state.timerTime,
            timerStart: Date.now() - this.state.timerTime
        });
        this.timer = setInterval(() => {
            this.setState({
                timerTime: Date.now() - this.state.timerStart
            });
        }, 10);
    };

    resetTimer = () => {
        if (this.state.timerOn === false) {
            this.setState({
                timerTime: this.state.timerStart
            });
        }
    };

    record = () => {
        console.log("i am inside record");
        audioChunks = [];

        this.mediaRecorder.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
        });

        this.mediaRecorder.ondataavailable = function (e) {
            audioChunks.push(e.data);
        };

        this.mediaRecorder.addEventListener("stop", () => {
            audioBlob = new Blob(
                audioChunks,
                {type: "audio/webm"},
                {mimetype: "audio/webm"}
            );

            // audioUrl = URL.createObjectURL(audioBlob);
            // Play the audio
            // const audio = new Audio(audioUrl);
            // audio.play();

        });

    };

    startRecording = async () => {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
        } catch (e) {
            console.log(e);
            alert("Please allow microphone acceess")
        }
        console.log(this.stream, "stream");
        if (this.stream === undefined) {
            console.log(this.stream, 'stream');
            alert("please allow microphone access")
        } else {
            if (mediaRecorder === undefined) {
                let options = {mimeType: "audio/webm"};
                this.mediaRecorder = new MediaRecorder(this.stream, options);
                this.mediaRecorder.start();
                console.log(this.mediaRecorder.state, ".THEN");
                console.log("media recorderd started");
                this.startTimer();
                this.record();
                this.setState({recordingInProgress: true});
                //TODO: Start a timer here
                console.log(this.mediaRecorder.state)
            } else {
                console.log('media recorder is active')
            }
        }
    };

    stopRecording = () => {
        if (this.mediaRecorder !== undefined) {
            console.log(this.mediaRecorder.state);

            if (this.mediaRecorder.state !== "inactive") {
                console.log(this.mediaRecorder.state);
                this.mediaRecorder.stop();
                this.stopTimer();
                this.setState({recordingInProgress: false});
                //TODO: Stop a timer here

                console.log(this.mediaRecorder.state);
            } else {
                console.log("Please start the recording");
            }
        }
    };

    submit = () => {
        if (
            this.state.room === "" ||
            this.state.room === undefined ||
            this.state.room === "" ||
            this.state.timeChoice === "" ||
            audioBlob === undefined
        ) {
            alert("Please complete all required inputs");
        } else {
            this.speechToText()
        }
    };

    speechToText = async () => {
        var file = new File([audioBlob], "audio.weba", {
            contentType: "audio/weba"
        });

        const photoFormData = new FormData();
        // dict of all elements
        photoFormData.append("avatar", file);
        // photoFormData.append("email", this.state.email);
        photoFormData.append("room", this.state.room);
        photoFormData.append("time", this.state.timeChoice);


        // TODO: Make sure error is being caught and exits the loop
        this.setState({transcriptionInProgress: true});
        axios({
            method: "POST",
            url: "https://beluga-server.herokuapp.com/orange",
            // url: 'http://localhost:5001/orange',
            data: photoFormData,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
            .then(response => {

                if (response.status === 200) {
                    this.setState({alertUserForSuccess: true});
                }
                return response.data
            })
            .catch(function (error) {
                if (error.response) {
                    console.log("Something went wrong, please try again");
                }
            });

        audioChunks = [];
        // return response.data;
    };

    handleRoomChange(event) {
        this.setState({room: event.target.value});
    }

    handleTimeChange(event) {
        this.setState({timeChoice: event.target.value});
    }

    handleNameChange(event) {
        this.setState({name: event.target.value});
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let seconds = ("0" + (Math.floor(this.state.timerTime / 1000) % 60)).slice(-2);

        if (seconds >= "59") {
            this.stopRecording();
        }
    }

    useStyles = makeStyles(theme => ({
        root: {
            display: "flex"
        },
        transcription: {
            marginTop: 20
        },
        transcriptC: {
            marginTop: 50,
        },
        button: {
            margin: 10,
            padding: 20,
        }
    }));

    classes = this.useStyles;

    render() {

        let timerTime = this.state.timerTime;
        let centiseconds = ("0" + (Math.floor(timerTime / 10) % 100)).slice(-2);
        let seconds = ("0" + (Math.floor(this.state.timerTime / 1000) % 60)).slice(-2);
        let minutes = ("0" + (Math.floor(this.state.timerTime / 60000) % 60)).slice(-2);

        return (
            <div style={{display: "flex"}}>

                <Container maxWidth={'xl'} style={{
                    background: 'linear-gradient(#ded5f1, #f8aaa9)',
                    minHeight: 100 + 'vh',
                    padding: 20
                }}>
                    {this.state.alertUserForSuccess && <Alert/>}
                    <Grid>
                        <img src={require('./assets/orange.png')} alt='logo' width={200} style={{
                            marginTop: 5
                        }}/>
                    </Grid>
                    <Paper style={{
                        marginTop: 50,
                        paddingTop: 20,
                        borderRadius: 20
                    }}
                    >
                        <Grid container direction="column" justify="center" alignItems="center">

                            <Typography variant="h5"
                                        align={'center'}
                                        style={{
                                            padding: 0,
                                        }}>What was your key takeaway from this session?
                            </Typography>
                            <Typography
                                align={'center'}
                                style={{
                                    marginBottom: 30,
                                }}>(1 min max)
                            </Typography>
                            <Grid item>
                                <FormControl>
                                    <Select value={this.state.room}
                                            onChange={this.handleRoomChange}
                                            displayEmpty
                                            style={{marginRight: 30}}>
                                        <MenuItem value="" disabled>Session Name</MenuItem>
                                        <MenuItem value={"Collect"}>Collect</MenuItem>
                                        <MenuItem value={"Transport"}>Transport</MenuItem>
                                        <MenuItem value={"Share & Create"}>Share & Create</MenuItem>
                                        <MenuItem value={"Store & Process"}>Store & Process</MenuItem>
                                        <MenuItem value={"Protect"}>Protect</MenuItem>
                                        <MenuItem value={"Analyze"}>Analyze</MenuItem>
                                        <MenuItem value={"MSI"}>MSI</MenuItem>
                                        <MenuItem value={"Genesys"}>Genesys</MenuItem>
                                        <MenuItem value={"Infovista"}>Infovista</MenuItem>
                                        <MenuItem value={"Dell Technologies"}>Dell Technologies</MenuItem>
                                    </Select>
                                    <FormHelperText style={{marginRight: 30}}>Select a session</FormHelperText>
                                </FormControl>

                                <FormControl>
                                    <Select value={this.state.timeChoice}
                                            onChange={this.handleTimeChange}
                                            displayEmpty>
                                        <MenuItem value="" disabled>Time</MenuItem>
                                        <MenuItem value={'08:00'}>08:00</MenuItem>
                                        <MenuItem value={'09:00'}>09:00</MenuItem>
                                        <MenuItem value={"10:00"}>10:00</MenuItem>
                                        <MenuItem value={"11:00"}>11:00</MenuItem>
                                        <MenuItem value={"11:30"}>11:30</MenuItem>
                                    </Select>
                                    <FormHelperText>Select Time</FormHelperText>
                                </FormControl>

                            </Grid>
                            {this.state.recordingInProgress &&
                            <img src={require("./assets/recording.gif")} style={{maxWidth: 20 + '%', paddingTop: 5}}
                            alt={""}/>}{console.log()}
                            {!this.state.recordingInProgress &&
                            <img src={require("./assets/notRecording.gif")}
                                 style={{maxWidth: 20 + '%', paddingTop: 5}}
                            alt={""}/>}<Typography>
                                {minutes} : {seconds} : {centiseconds}
                            </Typography>
                            <Grid item >
                                <Grid item style={{
                                    paddingTop: 50,
                                    marginBottom: 10,
                                }}

                                >
                                    <Button style={{borderColor: '#685ca4'}} variant={'outlined'} color="primary"
                                            onClick={this.startRecording}>
                                        record
                                    </Button>
                                    <Button style={{
                                        margin: 10,
                                    }} variant={'outlined'} color="secondary" onClick={this.stopRecording}>
                                        stop
                                    </Button>
                                    <Button className={this.classes.button} onClick={this.submit}
                                            variant={'outlined'}>submit</Button>
                                </Grid>
                                <Grid item>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </div>

        );
    }
}
