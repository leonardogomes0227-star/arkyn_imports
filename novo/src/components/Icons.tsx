import type { SVGProps } from 'react'

const base = (p: SVGProps<SVGSVGElement>) => ({ width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p })

export const ISearch = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
export const IHeart = ({ filled, ...p }: SVGProps<SVGSVGElement> & { filled?: boolean }) => <svg {...base(p)} fill={filled ? 'currentColor' : 'none'}><path d="M12 20s-7-4.4-9.2-8.6C1.3 8.5 3 5 6.4 5c2 0 3.3 1.1 4 2.3h3.2C14.3 6.1 15.6 5 17.6 5 21 5 22.7 8.5 21.2 11.4 19 15.6 12 20 12 20z" /></svg>
export const IBag = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
export const IMenu = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 6h18M3 12h18M3 18h12" /></svg>
export const IClose = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
export const IChevron = ({ dir = 'right', ...p }: SVGProps<SVGSVGElement> & { dir?: 'left' | 'right' | 'down' }) => <svg {...base(p)} style={{ transform: dir === 'left' ? 'rotate(180deg)' : dir === 'down' ? 'rotate(90deg)' : undefined }}><path d="m9 5 7 7-7 7" /></svg>
export const ITruck = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>
export const ICard = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></svg>
export const IStore = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 9 5.5 4h13L20 9M4 9h16v11H4zM4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M10 20v-5h4v5" /></svg>
export const IShield = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 3 4 6v6c0 4.5 3.4 7.8 8 9 4.6-1.2 8-4.5 8-9V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
export const IChat = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 18.5 5.3 15A7.5 7.5 0 1 1 9 18.3z" /></svg>
export const IStar = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></svg>
export const IPlane = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 13.5 21 6l-4 14-5-5-3 4v-6l9-7-11 6z" /></svg>
