import axios from 'axios';

const API_URL = 'http://localhost:8888';

export default {
  uploadPhotos: formData =>
    axios({
      method: 'put',
      url: `${API_URL}/photos`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getListPhotos: params =>
    axios({
      method: 'post',
      url: `${API_URL}/photos/list`,
      data: params,
      headers: { 'Content-Type': 'application/json' },
    }),

  deletePhoto: event =>
    axios({
      method: 'delete',
      url: `${API_URL}/photos/${event.currentTarget.getAttribute('path')}`,
    }),

  deletePhotos: deleteData =>
    axios({
      method: 'delete',
      url: `${API_URL}/photos`,
      data: deleteData,
      headers: { 'Content-Type': 'application/json' },
    }),
};
