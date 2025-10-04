import type { $Fetch } from "nitropack";
import { promisify } from "../functions";

const memberApi = (fetch: $Fetch) => {
  return {
    getMembers: async () => {
      return await promisify(
        {
          success: true,
          data: [
            {
              id: "1",
              name: "Bob Jones",
              email: "bob@example.com",
              role: "editor",
              picture: {
                url: "https://i.pravatar.cc/150?img=2",
              },
              createdAt: "2023-01-01T00:00:00Z",
              updatedAt: "2023-01-01T00:00:00Z",
            },
            {
              id: "2",
              name: "Alice Smith",
              email: "alice@example.com",
              role: "admin",
              picture: {
                url: "https://i.pravatar.cc/150?img=3",
              },
              createdAt: "2023-01-02T00:00:00Z",
              updatedAt: "2023-01-02T00:00:00Z",
            },
          ],
        },
        500
      );
    },
  };
};

export default memberApi;
