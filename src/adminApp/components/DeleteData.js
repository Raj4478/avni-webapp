import { makeStyles } from "@mui/styles";
import { Grid, FormControlLabel, Checkbox, Button, Modal, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { get } from "lodash";
import http from "common/utils/httpClient";
import { AlertModal } from "./AlertModal";
import { Warning } from "@mui/icons-material";
import ActivityIndicatorModal from "../../common/components/ActivityIndicatorModal";
import MuiComponentHelper from "../../common/utils/MuiComponentHelper";

const useStyles = makeStyles(theme => ({
  paper: {
    position: "absolute",
    width: 800,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  },
  deleteButton: {
    backgroundColor: "red"
  }
}));

export const DeleteData = ({
  openModal,
  setOpenModal,
  orgName,
  hasOrgMetadataDeletionPrivilege,
  hasOrgAdminConfigDeletionPrivilege,
  setDataDeletedIndicator
}) => {
  const classes = useStyles();

  const [deleteMetadata, setDeleteMetadata] = useState(false);
  const [deleteAdminConfig, setDeleteAdminConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState();
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState({});

  useEffect(() => {
    if (!deleteMetadata) {
      setDeleteAdminConfig(false);
    }
  }, [deleteMetadata]);

  const warningMessage =
    "This will remove all transactional data such as subjects, program enrolments and encounters entered through the Field App. Do you want to continue?";
  const deleteMetadataMessage =
    "Delete all Metadata (such as subject types, encounter types and form definitions) except admin related configurations";
  const deleteAdminConfigurationMessage = "Delete all admin configurations except Administrators";
  const deleteClientDataMessage =
    "This only deletes data from the server database. Please make sure you delete data from the field app manually.";

  const deleteData = () => {
    setOpenModal(false);
    setLoading(true);
    http
      .delete(`/implementation/delete?deleteMetadata=${deleteMetadata}&deleteAdminConfig=${deleteAdminConfig}`)
      .then(res => {
        if (res.status === 200) {
          setDataDeletedIndicator(prevValue => !prevValue);
          setLoading(false);
          setMessage({ title: "Successfully deleted data", content: deleteClientDataMessage });
          setShowAlert(true);
        }
      })
      .catch(error => {
        setLoading(false);
        const errorMessage = `${get(error, "response.data") || get(error, "message") || "unknown error"}`;
        setMessage({ title: `Error occurred while deleting data`, content: errorMessage });
        setShowAlert(true);
      });
  };

  return (
    <div>
      <Modal onClose={MuiComponentHelper.getDialogClosingHandler(() => setOpenModal(false))} open={openModal}>
        <Grid container direction={"column"} spacing={3} className={classes.paper} style={{ top: "25%", left: "30%" }}>
          <Grid item container spacing={1} xs={12}>
            <Grid item xs={1}>
              {" "}
              <Warning color={"error"} style={{ fontSize: "40px" }} />
            </Grid>
            <Grid item xs={11}>
              {warningMessage}
            </Grid>
          </Grid>
          <Grid item>{deleteClientDataMessage}</Grid>
          {hasOrgMetadataDeletionPrivilege && (
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={deleteMetadata}
                    onChange={event => setDeleteMetadata(event.target.checked)}
                    name="deleteMetadata"
                    color="primary"
                  />
                }
                label={deleteMetadataMessage}
              />
            </Grid>
          )}
          {hasOrgAdminConfigDeletionPrivilege && deleteMetadata && (
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={deleteAdminConfig}
                    onChange={event => setDeleteAdminConfig(event.target.checked)}
                    name="deleteAdminConfig"
                    color="primary"
                  />
                }
                label={deleteAdminConfigurationMessage}
              />
            </Grid>
          )}
          <Grid item>
            <TextField
              fullWidth
              helperText="Please enter organisation name to proceed"
              onChange={event => setConfirmText(event.target.value)}
            />
          </Grid>
          <Grid item container spacing={3}>
            <Grid item>
              <Button variant="contained" color="primary" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                className={classes.deleteButton}
                onClick={deleteData}
                disabled={orgName !== confirmText}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Modal>
      <ActivityIndicatorModal open={loading} />
      <AlertModal message={message} setShowAlert={setShowAlert} showAlert={showAlert} />
    </div>
  );
};
