import React from 'react';
import { Select, Typography } from 'antd';

const { Text } = Typography;

export interface MemberOption {
  name: string;
  dept: string;
  value: string;
}

interface MemberSelectProps {
  options: MemberOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}

const MemberSelect: React.FC<MemberSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '按部门/姓名搜索并选择成员',
}) => {
  const memberMap = new Map(options.map(m => [m.value, m]));

  return (
    <Select
      mode="multiple"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ borderRadius: 6 }}
      filterOption={(input, option) => {
        const member = memberMap.get(option?.value as string);
        if (!member) return false;
        const kw = input.toLowerCase();
        return member.name.toLowerCase().includes(kw) || member.dept.toLowerCase().includes(kw);
      }}
      optionRender={(option) => {
        const member = memberMap.get(option.value as string);
        if (!member) return option.label;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
            }}>
              {member.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{member.name}</div>
              <Text type="secondary" style={{ fontSize: 11 }}>{member.dept}</Text>
            </div>
          </div>
        );
      }}
      options={options.map(m => ({ label: `${m.dept} - ${m.name}`, value: m.value }))}
    />
  );
};

export default MemberSelect;
