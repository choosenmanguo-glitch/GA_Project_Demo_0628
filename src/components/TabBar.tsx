import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabs, TabInfo } from '@/contexts/TabsContext';

const TAB_HEIGHT = 36;

const TabBar: React.FC = () => {
  const { tabs, activePath, addTab, removeTab, setActivePath } = useTabs();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightShadow, setShowRightShadow] = useState(false);

  // 检测是否需要右侧渐变遮罩
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setShowRightShadow(el.scrollWidth > el.clientWidth + el.scrollLeft + 1);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    return () => el.removeEventListener('scroll', check);
  }, [tabs]);

  const handleTabClick = (tab: TabInfo) => {
    setActivePath(tab.path);
    navigate(tab.path);
  };

  const handleClose = (e: React.MouseEvent, tab: TabInfo) => {
    e.stopPropagation();
    removeTab(tab.path);
  };

  return (
    <div
      style={{
        height: TAB_HEIGHT,
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'stretch',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 标签滚动容器 */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'stretch',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          padding: '0 4px',
        }}
        className="tab-bar-scroll"
      >
        {tabs.map((tab) => {
          const isActive = tab.path === activePath;
          return (
            <div
              key={tab.path}
              onClick={() => handleTabClick(tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 10px 0 12px',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#1677ff' : 'rgba(0,0,0,0.55)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                userSelect: 'none',
                borderBottom: isActive ? '2px solid #1677ff' : '2px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.85)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.55)';
                }
              }}
            >
              {/* 圆点指示 */}
              {isActive && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#1677ff',
                    flexShrink: 0,
                  }}
                />
              )}
              {tab.label}
              {/* 关闭按钮 - 始终可见 */}
              <span
                onClick={(e) => handleClose(e, tab)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  marginLeft: 0,
                  cursor: 'pointer',
                  color: 'rgba(0,0,0,0.25)',
                  transition: 'color 0.15s, background 0.15s',
                  fontSize: 10,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.06)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.45)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.25)';
                }}
              >
                ✕
              </span>
            </div>
          );
        })}
      </div>

      {/* 右侧渐变遮罩 */}
      {showRightShadow && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 32,
            background: 'linear-gradient(to right, transparent, #fff 80%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* CSS 注入 */}
      <style>{`
        .tab-bar-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default TabBar;
