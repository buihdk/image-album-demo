import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import { Spin, Select, Divider, Modal, Button, List, Card, Tooltip, Checkbox, message } from 'antd';
import { CloudUploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import I18n from 'i18n-js';

import UploadImage from 'src/components/UploadImage';
import sv from 'src/services';

import 'antd/dist/antd.css';
import './index.css';

const { Option } = Select;
const { Item } = List;
const { Meta } = Card;

const previewImageProps = {
  maskStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  bodyStyle: {
    textAlign: 'center',
    padding: 0,
  },
};

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisibility, setUploadVisibility] = useState(false);
  const [previewVisibility, setPreviewVisibility] = useState(false);
  const [selectedSkip, setSelectedSkip] = useState(0);
  const [selectedLimit, setSelectedLimit] = useState(25);
  const [listPhotos, setListPhotos] = useState([]);
  const [selectedLocale, setSelectedLocale] = useState(I18n.locale);
  const [imageURL, setImageURL] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState({ count: 0 });
  console.log('listPhotos', listPhotos);
  console.log('params', { skip: selectedSkip, limit: selectedLimit });

  const handleFetchPhotos = () => {
    setIsLoading(true);
    const params = { skip: 0, limit: selectedLimit };
    sv.getListPhotos(params)
      .then(res => setListPhotos(res.data.documents))
      .catch(res => console.error(res));
    setTimeout(() => {
      setIsLoading(false);
      message.info(I18n.t('fetchInitialPhotos', { total: selectedLimit }));
    }, 500);
  };

  const handleChangeLimit = limit => {
    setSelectedLimit(Number(limit));
    selectedSkip(0);
  };

  const handleChangeLocale = locale => {
    setSelectedLocale(locale);
    I18n.translations[locale] = require(`src/locales/${locale}.json`);
    I18n.locale = locale;
  };
  const showUploadModal = () => setUploadVisibility(true);

  const handlePreviewPhoto = event => {
    setImageURL(event.currentTarget.getAttribute('src'));
    setPreviewVisibility(true);
  };

  const handleCancelModal = callback => () => callback(false);

  const handleSelectPhoto = event => {
    const photoID = event.nativeEvent.path[0].getAttribute('id');
    const newSelectedPhotos = { ...selectedPhotos };
    if (!newSelectedPhotos[photoID]) {
      newSelectedPhotos[photoID] = true;
      newSelectedPhotos.count += 1;
    } else {
      newSelectedPhotos[photoID] = false;
      newSelectedPhotos.count -= 1;
    }
    setSelectedPhotos(newSelectedPhotos);
  };

  const handleDeletePhoto = event => {
    sv.deletePhoto(event)
      .then(() => {
        message.success(I18n.t('delete.success'));
        setSelectedPhotos({ count: 0 });
        handleFetchPhotos();
      })
      .catch(res => {
        message.error(I18n.t('delete.error'));
        console.error(res);
      });
  };

  const handleDeletePhotos = () => {
    const deleteData = [];
    Object.entries(selectedPhotos).forEach(([key, value]) => {
      if (value && typeof value === 'boolean') {
        const [album, name] = key.split(':');
        const albumIndex = deleteData.findIndex(obj => obj.album === album);
        if (albumIndex >= 0) {
          deleteData[albumIndex].documents += `, ${name}`;
        } else {
          deleteData.push({ album, documents: name });
        }
      }
    });
    sv.deletePhotos(deleteData)
      .then(() => {
        message.success(I18n.t('delete.successMultiple'));
        setSelectedPhotos({ count: 0 });
        handleFetchPhotos();
      })
      .catch(res => {
        message.error(I18n.t('delete.errorMultiple'));
        console.error(res);
      });
  };

  const handleLoadMore = () => {
    const newSkip = selectedSkip + selectedLimit;
    setSelectedSkip(newSkip);
    setIsLoading(true);
    const params = { skip: newSkip, limit: selectedLimit };
    sv.getListPhotos(params)
      .then(res => setListPhotos(prevList => [...prevList, ...res.data.documents]))
      .catch(res => console.error(res));
    setTimeout(() => {
      setIsLoading(false);
      message.info(I18n.t('loadMorePhotos', { total: selectedLimit }));
    }, 500);
  };

  useEffect(() => {
    handleFetchPhotos();
  }, [selectedLimit]);

  return (
    <Spin tip="Loading..." spinning={isLoading} style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="header">
          <span className="title">{I18n.t('photos')}</span>
          <div>
            <Select value={selectedLocale} onChange={handleChangeLocale}>
              <Option value="en">EN 🇬🇧</Option>
              <Option value="vi">VI 🇻🇳</Option>
              <Option value="zh">ZH 🇨🇳</Option>
            </Select>
            <Divider type="vertical" />
            {selectedPhotos.count > 0 && (
              <>
                <Button type="primary" danger onClick={handleDeletePhotos}>
                  <DeleteOutlined /> Delete {selectedPhotos.count} photos
                </Button>
                <Divider type="vertical" />
              </>
            )}
            <Button type="primary" onClick={showUploadModal}>
              <CloudUploadOutlined /> {I18n.t('upload.title')}
            </Button>
            <Divider type="vertical" />
            <Select value={selectedLimit} onChange={handleChangeLimit}>
              <Option value="5">5</Option>
              <Option value="10">10</Option>
              <Option value="25">25</Option>
              <Option value="50">50</Option>
              <Option value="100">100</Option>
              <Option value="250">250</Option>
              <Option value="500">500</Option>
            </Select>
          </div>
        </div>
        <div className="list-photos">
          <List
            grid={{ gutter: 16, column: 5 }}
            dataSource={listPhotos}
            renderItem={photo => (
              <Item key={photo.id}>
                <Card
                  key={photo.id}
                  hoverable
                  cover={<img alt={photo.album} src={photo.raw} />}
                  actions={[
                    <Tooltip key="select" title="select">
                      <Checkbox
                        defaultChecked={false}
                        id={`${photo.album}:${photo.name}`}
                        onChange={handleSelectPhoto}
                      />
                    </Tooltip>,
                    <Tooltip key="preview" title="preview">
                      <EyeOutlined src={photo.raw} onClick={handlePreviewPhoto} />
                    </Tooltip>,
                    <Tooltip key="delete" title="delete">
                      <DeleteOutlined path={`${photo.album.toLowerCase()}/${photo.name}`} onClick={handleDeletePhoto} />
                    </Tooltip>,
                  ]}
                >
                  <Meta title={photo.name} description={photo.album} />
                </Card>
              </Item>
            )}
          />
        </div>
        <Modal
          title="Upload Photo(s)"
          visible={modalVisibility}
          onCancel={handleCancelModal(setUploadVisibility)}
          footer={null}
        >
          <UploadImage handleFetchPhotos={handleFetchPhotos} />
        </Modal>
        <Modal
          {...previewImageProps}
          centered
          width="auto"
          closable={false}
          visible={previewVisibility}
          onCancel={handleCancelModal(setPreviewVisibility)}
          footer={null}
        >
          <img alt="preview" className="preview-photo" src={imageURL} />
        </Modal>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button type="primary" onClick={handleLoadMore}>
          Load More
        </Button>
      </div>
    </Spin>
  );
};

export default hot(App);
