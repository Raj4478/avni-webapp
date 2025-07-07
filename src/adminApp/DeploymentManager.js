import { Admin, Resource } from "react-admin";
import { authProvider, LogoutButton } from "./react-admin-config";
import { adminHistory, store } from "../common/store";
import { WithProps } from "../common/components/utils";
import customRoutes from "./customRoutes";
import AdminLayout from "../common/components/AdminLayout";
import { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getAdminOrgs } from "../rootApp/ducks";
import { AccountCreate, AccountDetails, AccountEdit, AccountList } from "./Account";
import {
  AccountOrgAdminUserCreate,
  AccountOrgAdminUserDetail,
  AccountOrgAdminUserEdit,
  AccountOrgAdminUserList
} from "./AccountOrgAdminUser";
import { OrganisationCreate, OrganisationDetails, OrganisationEdit, OrganisationList } from "./Organisation";
import { organisationGroupCreate, organisationGroupEdit, OrganisationGroupList, OrganisationGroupShow } from "./OrganisationGroup";

class DeploymentManager extends Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return { store };
  }

  render() {
    const { user, userInfo } = this.props;

    return (
      <Admin
        title="Manage Account"
        authProvider={authProvider}
        history={adminHistory}
        logoutButton={WithProps({ user }, LogoutButton)}
        customRoutes={customRoutes}
        appLayout={AdminLayout}
      >
        <Resource
          name={"account"}
          options={{ label: "Accounts" }}
          list={AccountList}
          show={AccountDetails}
          create={AccountCreate}
          edit={AccountEdit}
        />
        <Resource
          name="accountOrgAdmin"
          options={{ label: "Admins" }}
          list={AccountOrgAdminUserList}
          create={WithProps({ user, region: userInfo.region }, AccountOrgAdminUserCreate)}
          show={WithProps({ user, region: userInfo.region }, AccountOrgAdminUserDetail)}
          edit={WithProps({ user, region: userInfo.region }, AccountOrgAdminUserEdit)}
        />
        <Resource
          name="organisation"
          options={{ label: "Organisations" }}
          list={OrganisationList}
          create={OrganisationCreate}
          show={OrganisationDetails}
          edit={OrganisationEdit}
        />
        <Resource
          name={"organisationGroup"}
          options={{ label: "Organisation Groups" }}
          list={OrganisationGroupList}
          create={organisationGroupCreate}
          show={OrganisationGroupShow}
          edit={organisationGroupEdit}
        />
        <Resource name={"organisationCategory"} />
        <Resource name={"organisationStatus"} />
      </Admin>
    );
  }
}

const mapStateToProps = state => ({
  user: state.app.authSession,
  userInfo: state.app.userInfo,
  organisations: state.app.organisations
});

export default withRouter(
  connect(
    mapStateToProps,
    { getAdminOrgs }
  )(DeploymentManager)
);
