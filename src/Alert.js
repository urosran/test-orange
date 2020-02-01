import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Typography} from "@material-ui/core";

export default function AlertDialog() {

    const refreshPage = () => {
        window.location.reload();
    };

    return (
        <div>
            <Dialog
                open={true}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Thank you for your submission!</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Results will be available soon...
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={refreshPage}>
                        <Typography color={"primary"}> OK </Typography>
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}