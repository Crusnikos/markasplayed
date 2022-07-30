import axios from "axios";
import { settings } from "../../api";

export async function getFrontImage(request: {
  id: number;
  small?: boolean;
}): Promise<ImageData> {
  const response = await axios.get<ImageData>(
    `${settings.url}/files/article/${request.id}/front`,
    {
      params: request.small,
    }
  );

  return response.data;
}

export async function getSliderImages(): Promise<ImageData[]> {
  const response = await axios.get<ImageData[]>(`${settings.url}/files/slider`);
  return response.data;
}

export async function getGallery(request: {
  id: number;
}): Promise<ImageData[]> {
  const response = await axios.get<ImageData[]>(
    `${settings.url}/files/article/${request.id}/gallery`
  );
  return response.data;
}

export async function setFrontImage(
  request: {
    id: number;
    file: File;
  },
  token: string
): Promise<void> {
  const formData = new FormData();
  formData.append("file", request.file);
  await axios.put<MainImageCreationRequest>(
    `${settings.url}/files/article/${request.id}/front`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function updateGallery(
  updateRequest: {
    id: number;
    galleryIds: number[];
  },
  token: string
): Promise<void> {
  await axios.put(
    `${settings.url}/files/article/${updateRequest.id}/gallery`,
    { galleryIds: updateRequest.galleryIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function addToGallery(
  addRequest: {
    articleId: number;
    files: File[];
  },
  token: string
): Promise<number | undefined> {
  const formData = new FormData();
  Array.from(addRequest.files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await axios.post(
    `${settings.url}/files/article/${addRequest.articleId}/gallery`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.status;
}

export type ImageData = {
  id: number;
  imageFileName: string;
  imagePathName: string;
};

export type MainImageCreationRequest = {
  id: number;
  file: File;
};
