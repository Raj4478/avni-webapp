import api from "../api";
import { getFilterPayload } from "../reducers/SubjectAssignmentReducer";

export const fetchSubjectData = (query, filterCriteria) => {
  const requestBody = getFilterPayload(filterCriteria);
  return new Promise(resolve => {
    const pageElement = {};
    pageElement.pageNumber = query.page;
    pageElement.numberOfRecordPerPage = query.pageSize;
    requestBody.pageElement = pageElement;
    api
      .getSubjects(requestBody)
      .then(response => response.data)
      .then(result => {
        resolve({
          data: result.listOfRecords,
          page: query.page,
          totalCount: result.totalElements
        });
      });
  });
};

export const updateUserAssignmentToSubject = async ({ userId, subjectId, voided }) => {
  const payload = { userId, subjectIds: [subjectId], voided };
  return api.postUpdateUserAssignmentToSubject(payload);
};
