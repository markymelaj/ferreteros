import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B2545',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 120,
          fontWeight: 900,
          color: '#F77F00',
          letterSpacing: -4,
          fontFamily: 'system-ui'
        }}
      >
        N
      </div>
    ),
    { ...size }
  );
}
