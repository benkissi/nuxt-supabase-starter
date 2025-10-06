export interface IMember {
  id: string;
  role: "admin" | "editor" | "viewer" | "owner";
  email: string;
  name: string;
  job_title?: string;
  createdAt: string;
  account: {
    id: string;
    name: string;
    email: string;
    image: {
      path: string;
      bucket: string;
    };
  };
}

export interface IInvitation {
  id: string;
  email: string;
  status: "pending" | "accepted" | "declined";
  role: "admin" | "editor" | "viewer" | "member" | "owner";
  createdAt: string;
  updatedAt: string;
}