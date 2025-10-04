export interface IMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  picture: {
    url: string
  } | null;
  createdAt: string;
  updatedAt: string;
}