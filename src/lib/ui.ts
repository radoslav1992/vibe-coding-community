// Shared presentation helpers: tag palette, avatar gradients, relative time.
// Colors come from the original design handoff.

export const TAG_NAMES = ['Discussion', 'Help', 'Guide', 'Show & Tell', 'Community'] as const;

export const TAG_COLORS: Record<string, { bg: string; fg: string }> = {
  Discussion: { bg: '#E3E6FF', fg: '#3D53D6' },
  Help: { bg: '#FFECC9', fg: '#A66300' },
  Guide: { bg: '#DCE9FF', fg: '#2456C9' },
  'Show & Tell': { bg: '#FFE0F1', fg: '#C4005D' },
  Community: { bg: '#FFE4D3', fg: '#C24E00' },
};

export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#FF6D1B,#FF0178)',
  'linear-gradient(135deg,#4B73FF,#FFA6F9)',
  'linear-gradient(135deg,#FF0178,#4B73FF)',
  'linear-gradient(135deg,#FFA517,#F7101D)',
];

export function avatarGradient(seed: number | string): string {
  const n = typeof seed === 'number' ? seed : [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[Math.abs(n) % AVATAR_GRADIENTS.length]!;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function timeAgo(unixSeconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSeconds;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2 * 86400) return 'yesterday';
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function eventDay(unixSeconds: number): { day: string; month: string } {
  const d = new Date(unixSeconds * 1000);
  return {
    day: String(d.getUTCDate()).padStart(2, '0'),
    month: d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
  };
}

export function longDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
