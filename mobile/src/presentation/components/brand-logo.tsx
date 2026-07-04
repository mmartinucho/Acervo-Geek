import Svg, { Circle, Path, Polygon } from 'react-native-svg';

// Logo da marca (hexágono sci-fi do protótipo), em versão estática.
export function BrandLogo({
  size = 48,
  color = '#FFFFFF',
  opacity = 1,
}: {
  size?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" opacity={opacity}>
      <Path
        d="M50 6L88 28V72L50 94L12 72V28L50 6Z"
        stroke={color}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Path
        d="M50 6V50M88 28L50 50M12 28L50 50M50 50V94"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.4}
      />
      <Polygon points="50,30 66,39 66,61 50,70 34,61 34,39" fill={color} opacity={0.25} />
      <Circle cx={50} cy={50} r={6} fill={color} />
      <Circle
        cx={50}
        cy={50}
        r={45}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="4 12"
        fill="none"
        opacity={0.5}
      />
    </Svg>
  );
}
