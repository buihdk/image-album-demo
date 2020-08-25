import React, { useState } from 'react';
import { Upload, Select, Button, message } from 'antd';
import { InboxOutlined, CloudUploadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import I18n from 'i18n-js';

import sv from 'src/services';

import './index.css';

const { Dragger } = Upload;
const { Option } = Select;

const UploadImage = ({ handleFetchPhotos }) => {
  const [fileList, setFileList] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    if (!selectedAlbum) {
      message.error(I18n.t('missingAlbum'));
      return false;
    }
    const formData = new FormData();
    formData.append('album', selectedAlbum);
    fileList.forEach(file => formData.append('documents', file));

    setUploading(true);
    sv.uploadPhotos(formData)
      .then(() => {
        message.success(I18n.t('upload.success'));
        setFileList([]);
        setSelectedAlbum(null);
        handleFetchPhotos();
      })
      .catch(res => {
        message.error(I18n.t('upload.error'));
        console.error(res);
      });
    setUploading(false);

    return true;
  };

  const handleRemove = file => {
    setFileList(prevFileList => {
      const index = prevFileList.indexOf(file);
      const newFileList = prevFileList.slice();
      newFileList.splice(index, 1);
      return newFileList;
    });
  };

  const handleBeforeUpload = file => {
    setFileList(prevFileList => [...prevFileList, file]);
    return false; // to upload files manually
  };

  const handleChangeAlbum = album => setSelectedAlbum(album);

  return (
    <div>
      <Dragger
        className="upload"
        accept="image/*"
        beforeUpload={handleBeforeUpload}
        fileList={fileList}
        multiple
        onRemove={handleRemove}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{I18n.t('upload.text')}</p>
        <p className="ant-upload-hint">{I18n.t('upload.hint')}</p>
      </Dragger>
      <div className="button-group">
        <Select placeholder="Select album" value={selectedAlbum} onChange={handleChangeAlbum}>
          <Option value="travel">Travel</Option>
          <Option value="personal">Personal</Option>
          <Option value="food">Food</Option>
          <Option value="nature">Nature</Option>
          <Option value="other">Other</Option>
        </Select>
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
        >
          {uploading ? 'Uploading' : 'Start Upload'}
        </Button>
      </div>
    </div>
  );
};

UploadImage.propTypes = {
  handleFetchPhotos: PropTypes.func,
};

UploadImage.defaultProps = {
  handleFetchPhotos: () => {},
};

export default UploadImage;
