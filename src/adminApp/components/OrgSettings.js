import { useState, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import { httpClient as http } from "common/utils/httpClient";
import { getOperationalModules } from "../../reports/reducers";
import { useDispatch } from "react-redux";
import { noop, toNumber } from "lodash";
import { AvniTextField } from "../../common/components/AvniTextField";
import { setOrganisationConfig } from "../../rootApp/ducks";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";

export const OrgSettings = ({ hasEditPrivilege, dataDeletedIndicator }) => {
  const [orgSettings, setOrgSettings] = useState();
  const [showEncryptionWarningMessage, setShowEncryptionWarningMessage] = useState(false);
  const [defaultSnackbarStatus, setDefaultSnackbarStatus] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOperationalModules());
    http
      .fetchJson("/web/organisationConfig")
      .then(response => response.json)
      .then(({ organisationConfig }) => setOrgSettings(organisationConfig));
  }, [dataDeletedIndicator]);

  const onSettingsChange = (settingsName, value) => {
    const payload = { settings: { [settingsName]: value } };
    http.put("/organisationConfig", payload).then(response => {
      if (response.status === 200 || response.status === 201) {
        setOrgSettings(response.data.settings);
        dispatch(setOrganisationConfig(response.data.settings));
      }
      return response;
    });
  };

  function renderSimpleSetting(key, name, tooltip, disabled = false, onEnabled = noop) {
    return (
      <Grid>
        <AvniSwitch
          switchFirst
          checked={orgSettings[key] || false}
          onChange={event => {
            if (event.target.checked === true) onEnabled();
            onSettingsChange(key, event.target.checked);
          }}
          name={name}
          toolTipKey={tooltip}
          disabled={disabled || !hasEditPrivilege}
        />
      </Grid>
    );
  }

  const organisationConfigSettingKeys = {
    approvalWorkflow: "enableApprovalWorkflow",
    draftSave: "saveDrafts",
    hideDateOfBirth: "hideDateOfBirth",
    enableComments: "enableComments",
    showSummaryButton: "showSummaryButton",
    useKeycloakAsIDP: "useKeycloakAsIDP",
    enableMessaging: "enableMessaging",
    useMinioForStorage: "useMinioForStorage",
    skipRuleExecution: "skipRuleExecution",
    maxAddressDisplayInlineCount: "maxAddressDisplayInlineCount",
    showHierarchicalLocation: "showHierarchicalLocation",
    donotRequirePasswordChangeOnFirstLogin: "donotRequirePasswordChangeOnFirstLogin",
    enableMobileAppDbEncryption: "enableMobileAppDbEncryption"
  };

  const getDefaultSnackbarStatus = defaultSnackbarStatus => {
    setDefaultSnackbarStatus(defaultSnackbarStatus);
  };

  return orgSettings ? (
    <Grid container direction={"column"}>
      <Grid>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Organisation settings
        </Typography>
      </Grid>
      <Grid container spacing={1} direction={"column"}>
        {renderSimpleSetting(organisationConfigSettingKeys.draftSave, "Draft save", "ADMIN_SAVE_DRAFT")}
        {renderSimpleSetting(organisationConfigSettingKeys.hideDateOfBirth, "Hide Date of Birth on DEA", "ADMIN_HIDE_DOB")}
        {renderSimpleSetting(organisationConfigSettingKeys.enableComments, "Enable comments", "ADMIN_ENABLE_COMMENTS")}
        {renderSimpleSetting(
          organisationConfigSettingKeys.enableMobileAppDbEncryption,
          "Enable mobile app db encryption",
          "ADMIN_ENABLE_MOBILE_APP_DB_ENCRYPTION",
          false,
          () => setShowEncryptionWarningMessage(true)
        )}
        {renderSimpleSetting(organisationConfigSettingKeys.showSummaryButton, "Show summary button", "ADMIN_SHOW_SUMMARY_BUTTON")}
        {renderSimpleSetting(organisationConfigSettingKeys.enableMessaging, "Enable Messaging", "ENABLE_MESSAGING_BUTTON")}
        {renderSimpleSetting(organisationConfigSettingKeys.useKeycloakAsIDP, "Use Keycloak as IDP", "USE_KEYCLOAK_AS_IDP", true)}
        {renderSimpleSetting(organisationConfigSettingKeys.useMinioForStorage, "Use MinIO for Storage", "USE_MINIO_FOR_STORAGE", true)}
        {renderSimpleSetting(
          organisationConfigSettingKeys.skipRuleExecution,
          "Skip rule executions on upload",
          "SKIP_RULE_EXECUTION_ON_UPLOAD"
        )}
        {renderSimpleSetting(
          organisationConfigSettingKeys.showHierarchicalLocation,
          "Show hierarchical location",
          "SHOW_HIERARCHICAL_LOCATION"
        )}
        {renderSimpleSetting(
          organisationConfigSettingKeys.donotRequirePasswordChangeOnFirstLogin,
          "Do not require password change for new user",
          "DO_NOT_REQUIRE_PASSWORD_CHANGE_FOR_NEW_USER"
        )}
        <AvniTextField
          style={{ marginLeft: 8, marginTop: 10 }}
          id="maxAddressDisplayInlineCount"
          type="number"
          variant="outlined"
          label="Inline address count"
          autoComplete="off"
          value={orgSettings.maxAddressDisplayInlineCount}
          onChange={event => onSettingsChange(organisationConfigSettingKeys.maxAddressDisplayInlineCount, toNumber(event.target.value))}
          toolTipKey={"MAX_ADDRESS_DISPLAY_INLINE_COUNT"}
        />
        {showEncryptionWarningMessage && (
          <CustomizedSnackbar
            message="Enabling this will not permit user to use fast sync and upload db feature in mobile app."
            getDefaultSnackbarStatus={getDefaultSnackbarStatus}
            defaultSnackbarStatus={defaultSnackbarStatus}
            variant={"warning"}
            onExited={() => {
              setShowEncryptionWarningMessage(false);
              setDefaultSnackbarStatus(true);
            }}
          />
        )}
      </Grid>
    </Grid>
  ) : (
    <div />
  );
};
