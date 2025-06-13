import React, { useEffect, useState } from "react";
import { cloneDeep, isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@mui/material/Box";
import { CreateComponent } from "../../common/components/CreateComponent";
import { Title } from "react-admin";
import http from "common/utils/httpClient";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import UserInfo from "../../common/model/UserInfo";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/DeleteOutline";
import { LinearProgress } from "@mui/material";

const ResourceListView = ({ history, title, resourceName, resourceURLName, columns, userInfo, editPrivilegeType }) => {
  const [redirect, setRedirect] = useState(false);
  const [result, setResult] = useState([]);
  const [resultFetched, setResultFetched] = useState(false);
  const tableRef = React.createRef();

  useEffect(() => {
    http.get(`/web/${resourceName}`).then(response => {
      const result = response.data.filter(({ voided }) => !voided);
      setResultFetched(true);
      setResult(result);
    });
  }, []);

  const editResource = rowData => ({
    icon: () => <Edit />,
    tooltip: `Edit ${title}`,
    onClick: event => history.push(`/appDesigner/${resourceURLName}/${rowData.id}`)
  });

  const voidResource = rowData => ({
    icon: () => <Delete />,
    tooltip: `Delete ${title}`,
    onClick: (event, rowData) => {
      const voidedMessage = `Do you really want to delete ${title} ${rowData.name} ?`;
      if (window.confirm(voidedMessage)) {
        http.delete(`/web/${resourceName}/${rowData.id}`).then(response => {
          if (response.status === 200) {
            const index = result.indexOf(rowData);
            const clonedResult = cloneDeep(result);
            clonedResult.splice(index, 1);
            setResult(clonedResult);
          }
        });
      }
    }
  });

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={title} />
        <div className="container">
          {resultFetched && UserInfo.hasPrivilege(userInfo, editPrivilegeType) && (
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <CreateComponent onSubmit={() => setRedirect(true)} name={`New ${title}`} />
            </div>
          )}
          {!resultFetched && <LinearProgress />}
          {resultFetched && (
            <AvniMaterialTable
              title=""
              ref={tableRef}
              columns={columns}
              fetchData={result}
              options={{
                addRowPosition: "first",
                sorting: true,
                debounceInterval: 500,
                search: false,
                rowStyle: rowData => ({
                  backgroundColor: rowData["voided"] ? "#DBDBDB" : "#fff"
                }),
                pageSizeOptions: [10, 25, 100],
                pageSize: 10
              }}
              actions={UserInfo.hasPrivilege(userInfo, editPrivilegeType) && [editResource, voidResource]}
              route={`/appdesigner/${resourceURLName}`}
            />
          )}
        </div>
      </Box>
      {redirect && <Redirect to={`/appDesigner/${resourceURLName}/create`} />}
    </>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default withRouter(React.memo(ResourceListView, areEqual));
