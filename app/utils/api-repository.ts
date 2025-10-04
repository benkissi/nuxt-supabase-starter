import type { NitroFetchRequest, $Fetch } from "nitropack";

import memberApi from "./apis/members";

export const apiRepository = <T>(fetch: $Fetch<T, NitroFetchRequest>) => {
  return {
    members: memberApi(fetch),
  };
};
