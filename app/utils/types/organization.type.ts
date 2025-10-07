export interface IImage {
    path: string;
  bucket: string;
}

export interface ICompany {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  website: string | null;
  image: IImage | null;
  created_at: string;
  updated_at: string;
}