import type { NitroFetchRequest, $Fetch } from "nitropack";

import memberApi from "./apis/members";
import organizationsApi from "./apis/organizations";

export const apiRepository = <T>(fetch: $Fetch<T, NitroFetchRequest>) => {
  return {
    members: memberApi(fetch),
    organizations: organizationsApi(fetch),
  };
};
