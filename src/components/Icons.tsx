type P = { size?: number }
const svg = (d: JSX.Element, size = 22) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
export const IconSearch = ({ size }: P) => svg(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>, size)
export const IconBag = ({ size }: P) => svg(<><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8a3 3 0 0 1 6 0" /></>, size)
export const IconUser = ({ size }: P) => svg(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>, size)
export const IconCard = ({ size }: P) => svg(<><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></>, size)
export const IconStore = ({ size }: P) => svg(<><path d="M4 9l1.5-5h13L20 9" /><path d="M4 9h16v3a3 3 0 0 1-5.3 2 3 3 0 0 1-5.4 0A3 3 0 0 1 4 12V9z" /><path d="M5 14v6h14v-6" /></>, size)
export const IconTruck = ({ size }: P) => svg(<><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></>, size)
export const IconChat = ({ size }: P) => svg(<><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></>, size)
export const IconHeart = ({ size, filled }: P & { filled?: boolean }) => <svg width={size ?? 22} height={size ?? 22} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20.5S4 15.6 4 9.6A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 8 2.2c0 6-8 10.9-8 10.9z" /></svg>
