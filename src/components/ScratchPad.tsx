// 草稿区组件（预留，未来实现）
// 使用 Canvas 实现，支持触摸和鼠标手写/涂鸦

export interface ScratchPadProps {
  enabled: boolean;
  width: number;
  height: number;
}

export default function ScratchPad({ enabled, width, height }: ScratchPadProps) {
  if (!enabled) return null;

  return (
    <canvas
      width={width}
      height={height}
      style={{
        border: '2px dashed #ddd',
        borderRadius: 12,
        background: '#fafafa',
        touchAction: 'none',
      }}
    />
  );
}
