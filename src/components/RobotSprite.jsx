// 像素风小机器人(纯 SVG rect 手绘,16×16 网格)
export default function RobotSprite({ big = false }) {
  const P = {
    ink: '#33291f', body: '#e4572e', body2: '#b53d1c', face: '#f6f0df',
    eye: '#221c33', gold: '#f2b705', green: '#7ef29d', grey: '#8a7a63',
  }
  const r = (x, y, w, h, c, key) => <rect key={key} x={x} y={y} width={w} height={h} fill={c} />
  const cells = [
    r(7, 0, 2, 2, P.gold, 'ant'),
    r(7, 2, 2, 1, P.ink, 'stem'),
    r(4, 3, 8, 1, P.body2, 'headtop'),
    r(3, 4, 10, 5, P.body, 'head'),
    r(4, 5, 8, 3, P.face, 'face'),
    r(5, 6, 2, 2, P.eye, 'eyeL'),
    r(9, 6, 2, 2, P.eye, 'eyeR'),
    r(6, 10, 4, 1, P.ink, 'neck'),
    r(4, 11, 8, 5, P.body, 'body'),
    r(6, 12, 4, 2, P.dark || '#221c33', 'screen'),
    r(7, 12.5, 2, 1, P.green, 'led'),
    r(2, 11, 2, 3, P.body2, 'armL'),
    r(12, 11, 2, 3, P.body2, 'armR'),
    r(2, 14, 2, 1, P.ink, 'handL'),
    r(12, 14, 2, 1, P.ink, 'handR'),
    r(5, 16, 2, 2, P.body2, 'legL'),
    r(9, 16, 2, 2, P.body2, 'legR'),
    r(4, 18, 3, 1, P.ink, 'footL'),
    r(9, 18, 3, 1, P.ink, 'footR'),
  ]
  return (
    <svg viewBox="0 0 16 19" shapeRendering="crispEdges" style={{ width: big ? 120 : 44, height: 'auto', imageRendering: 'pixelated' }} aria-hidden>
      {cells}
    </svg>
  )
}
