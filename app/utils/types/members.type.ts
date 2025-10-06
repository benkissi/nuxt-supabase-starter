export interface IMember {
  id: string;
  role: "admin" | "editor" | "viewer";
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