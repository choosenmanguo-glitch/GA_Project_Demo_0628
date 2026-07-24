import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Result } from 'antd';
import { ArrowLeftOutlined, FolderOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { mockFileStores } from '@/mock/data';

const { Text } = Typography;

const FileStoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileStore = mockFileStores.find((fs) => fs.id === id);

  if (!fileStore) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Result status="404" title="文件库不存在" subTitle="未找到对应的文件库，可能已被删除" extra={<Button type="primary" onClick={() => navigate('/dev/filestore')}>返回文件库列表</Button>} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/dev/filestore')}>
          返回
        </Button>
        <PageHeader
          title={fileStore.name}
          hint={`创建人：${fileStore.creator} · 创建日期：${fileStore.createTime} · ${fileStore.fileCount} 个文件 · ${fileStore.storageSize}`}
        />
      </div>
      <div style={{
        flex: 1,
        background: '#f5f5f5',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <FolderOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
        <Text type="secondary" style={{ fontSize: 16 }}>文件库详情页面建设中...</Text>
      </div>
    </div>
  );
};

export default FileStoreDetailPage;
