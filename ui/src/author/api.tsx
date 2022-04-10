import axios from "axios";
import { settings } from "../api";

export async function getAuthorsListing(): Promise<AuthorData[]> {
  const response = await axios.get<AuthorData[]>(
    `${settings.url}/author/listing`
  );

  return response.data;
}

export async function getAuthorImage(request: {
  id: number;
}): Promise<AuthorImageData> {
  const response = await axios.get<AuthorImageData>(
    `${settings.url}/image/author`,
    {
      params: request,
    }
  );

  return response.data;
}

export type AuthorImageData = {
  id: number;
  imageName: string;
  imageSrc: string;
};

export type AuthorData = {
  id: number;
  name: string;
  descriptionPl: string;
  descriptionEn: string;
};
