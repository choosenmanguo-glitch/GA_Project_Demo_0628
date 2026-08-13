import React, { useState, useEffect } from 'react';
import { Segmented, Input, Upload, Avatar, ColorPicker, Space, message, theme } from 'antd';
import {
  UploadOutlined,
  SafetyOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  RobotOutlined,
  HomeOutlined,
  TeamOutlined,
  BankOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const ICON_PRESETS = [
  { key: 'safety', icon: <SafetyOutlined />, label: '盾' },
  { key: 'search', icon: <SearchOutlined />, label: '搜' },
  { key: 'thunder', icon: <ThunderboltOutlined />, label: '闪' },
  { key: 'file', icon: <FileTextOutlined />, label: '文' },
  { key: 'robot', icon: <RobotOutlined />, label: '智' },
  { key: 'home', icon: <HomeOutlined />, label: '家' },
  { key: 'team', icon: <TeamOutlined />, label: '队' },
  { key: 'bank', icon: <BankOutlined />, label: '府' },
  { key: 'star', icon: <StarOutlined />, label: '星' },
];

export type IconMode = 'text' | 'image' | 'icon';

export interface IconPickerValue {
  mode: IconMode;
  /** 文字头像 — 单字符 */
  text?: string;
  /** 文字头像 — 背景色 */
  textBgColor?: string;
  /** 文字头像 — 文字颜色 */
  textColor?: string;
  /** 图片头像 — data URL */
  imageSrc?: string;
  /** Icon 头像 — 预设 key */
  iconKey?: string;
  /** Icon 头像 — 背景色 */
  iconBgColor?: string;
  /** Icon 头像 — 图标颜色 */
  iconColor?: string;
}

interface IconPickerProps {
  value?: IconPickerValue;
  onChange?: (v: IconPickerValue) => void;
  /** 预览区域尺寸，默认 64 */
  size?: number;
  /** 默认名称首字，用于文字模式自动填充 */
  defaultName?: string;
  /** 禁用交互 */
  disabled?: boolean;
}

const defaultColors = {
  textBg: '#e6f4ff',
  text: '#1677ff',
  iconBg: '#e6f4ff',
  icon: '#1677ff',
};

const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  size = 64,
  defaultName,
  disabled = false,
}) => {
  const { token } = theme.useToken();

  const [mode, setMode] = useState<IconMode>(value?.mode ?? 'text');
  const [textChar, setTextChar] = useState(value?.text ?? defaultName?.charAt(0) ?? '');
  const [textBgColor, setTextBgColor] = useState(value?.textBgColor ?? defaultColors.textBg);
  const [textColor, setTextColor] = useState(value?.textColor ?? defaultColors.text);
  const [imageSrc, setImageSrc] = useState(value?.imageSrc ?? '');
  const [iconKey, setIconKey] = useState(value?.iconKey ?? ICON_PRESETS[0].key);
  const [iconBgColor, setIconBgColor] = useState(value?.iconBgColor ?? defaultColors.iconBg);
  const [iconColor, setIconColor] = useState(value?.iconColor ?? defaultColors.icon);

  useEffect(() => {
    if (value) {
      setMode(value.mode ?? 'text');
      setTextChar(value.text ?? defaultName?.charAt(0) ?? '');
      setTextBgColor(value.textBgColor ?? defaultColors.textBg);
      setTextColor(value.textColor ?? defaultColors.text);
      setImageSrc(value.imageSrc ?? '');
      setIconKey(value.iconKey ?? ICON_PRESETS[0].key);
      setIconBgColor(value.iconBgColor ?? defaultColors.iconBg);
      setIconColor(value.iconColor ?? defaultColors.icon);
    }
  }, [value, defaultName]);

  const emit = (overrides: Partial<IconPickerValue>) => {
    const next: IconPickerValue = {
      mode,
      text: textChar || undefined,
      textBgColor,
      textColor,
      imageSrc: imageSrc || undefined,
      iconKey,
      iconBgColor,
      iconColor,
      ...overrides,
    };
    onChange?.(next);
  };

  const handleModeChange = (m: string | number) => {
    const newMode = m as IconMode;
    setMode(newMode);
    emit({ mode: newMode });
  };

  const uploadProps: UploadProps = {
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('仅支持上传图片文件');
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB');
        return Upload.LIST_IGNORE;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        setImageSrc(src);
        emit({ mode: 'image', imageSrc: src });
      };
      reader.readAsDataURL(file);
      return Upload.LIST_IGNORE;
    },
  };

  // ── 渲染预览 Avatar ──
  const renderAvatar = () => {
    if (mode === 'image' && imageSrc) {
      return <Avatar size={size} src={imageSrc} shape="square" style={{ flexShrink: 0 }} />;
    }
    if (mode === 'icon') {
      const preset = ICON_PRESETS.find(p => p.key === iconKey);
      return (
        <Avatar
          size={size}
          icon={preset ? React.cloneElement(preset.icon as React.ReactElement, { style: { fontSize: size * 0.45 } }) : undefined}
          shape="square"
          style={{ backgroundColor: iconBgColor, color: iconColor, flexShrink: 0 }}
        />
      );
    }
    // text mode
    return (
      <Avatar
        size={size}
        shape="square"
        style={{ backgroundColor: textBgColor, color: textColor, fontWeight: 600, fontSize: size * 0.38, flexShrink: 0 }}
      >
        {textChar || defaultName?.charAt(0) || '?'}
      </Avatar>
    );
  };

  const segmentStyle: React.CSSProperties = {
    width: '100%',
    marginBottom: 16,
  };

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* 左侧：预览 */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: token.borderRadius,
          border: `2px dashed ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {renderAvatar()}
      </div>

      {/* 右侧：配置 — 编辑态显示 */}
      {!disabled && (
      <div style={{ flex: 1, minWidth: 0 }}>
        <Segmented
          block
          value={mode}
          onChange={handleModeChange}
          options={[
            { label: '文字', value: 'text' },
            { label: '上传', value: 'image' },
            { label: 'Icon', value: 'icon' },
          ]}
          style={segmentStyle}
        />

        {mode === 'text' && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              maxLength={1}
              value={textChar}
              placeholder="输入单字（默认取名称首字）"
              disabled={disabled}
              onChange={e => {
                const v = e.target.value.slice(-1);
                setTextChar(v);
                emit({ mode: 'text', text: v });
              }}
              style={{ width: '100%' }}
            />
            <Space>
              <span style={{ fontSize: 13, color: token.colorTextSecondary }}>背景色</span>
              <ColorPicker
                value={textBgColor}
                disabled={disabled}
                onChange={(_, hex) => { setTextBgColor(hex); emit({ mode: 'text', textBgColor: hex }); }}
              />
              <span style={{ fontSize: 13, color: token.colorTextSecondary, marginLeft: 8 }}>文字色</span>
              <ColorPicker
                value={textColor}
                disabled={disabled}
                onChange={(_, hex) => { setTextColor(hex); emit({ mode: 'text', textColor: hex }); }}
              />
            </Space>
          </Space>
        )}

        {mode === 'image' && (
          <div>
            <Upload {...uploadProps} disabled={disabled}>
              <div
                style={{
                  border: `1px dashed ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  padding: '12px 16px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: token.colorTextSecondary,
                }}
              >
                <UploadOutlined />
                <span style={{ fontSize: 13 }}>{imageSrc ? '重新上传' : '点击上传本地图片'}</span>
              </div>
            </Upload>
            {imageSrc && (
              <div style={{ fontSize: 12, color: token.colorTextTertiary, marginTop: 6 }}>
                已上传图片
              </div>
            )}
          </div>
        )}

        {mode === 'icon' && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ICON_PRESETS.map(p => (
                <div
                  key={p.key}
                  onClick={() => { if (!disabled) { setIconKey(p.key); emit({ mode: 'icon', iconKey: p.key }); } }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontSize: 18,
                    background: iconKey === p.key ? iconBgColor : token.colorFillSecondary,
                    color: iconKey === p.key ? iconColor : token.colorTextSecondary,
                    border: iconKey === p.key ? `2px solid ${iconColor}` : `2px solid transparent`,
                    transition: 'all 0.15s',
                  }}
                >
                  {p.icon}
                </div>
              ))}
            </div>
            <Space>
              <span style={{ fontSize: 13, color: token.colorTextSecondary }}>背景色</span>
              <ColorPicker
                value={iconBgColor}
                disabled={disabled}
                onChange={(_, hex) => { setIconBgColor(hex); emit({ mode: 'icon', iconBgColor: hex }); }}
              />
              <span style={{ fontSize: 13, color: token.colorTextSecondary, marginLeft: 8 }}>图标色</span>
              <ColorPicker
                value={iconColor}
                disabled={disabled}
                onChange={(_, hex) => { setIconColor(hex); emit({ mode: 'icon', iconColor: hex }); }}
              />
            </Space>
          </Space>
        )}
      </div>
      )}
    </div>
  );
};

export interface IconAvatarProps {
  value?: IconPickerValue;
  size?: number;
  defaultName?: string;
  shape?: 'square' | 'circle';
}

/** 只读渲染 IconPickerValue（用于列表/卡片/详情等展示场景） */
export const IconAvatar: React.FC<IconAvatarProps> = ({ value, size = 40, defaultName, shape = 'square' }) => {
  const mode = value?.mode ?? 'text';
  if (mode === 'image' && value?.imageSrc) {
    return <Avatar size={size} src={value.imageSrc} shape={shape} style={{ flexShrink: 0 }} />;
  }
  if (mode === 'icon') {
    const preset = ICON_PRESETS.find(p => p.key === (value?.iconKey ?? ICON_PRESETS[0].key));
    return (
      <Avatar
        size={size}
        shape={shape}
        style={{ backgroundColor: value?.iconBgColor ?? defaultColors.iconBg, color: value?.iconColor ?? defaultColors.icon, fontSize: size * 0.45, flexShrink: 0 }}
      >
        {preset?.icon}
      </Avatar>
    );
  }
  return (
    <Avatar
      size={size}
      shape={shape}
      style={{ backgroundColor: value?.textBgColor ?? defaultColors.textBg, color: value?.textColor ?? defaultColors.text, fontWeight: 600, fontSize: size * 0.38, flexShrink: 0 }}
    >
      {value?.text || defaultName?.charAt(0) || '?'}
    </Avatar>
  );
};

export default IconPicker;
