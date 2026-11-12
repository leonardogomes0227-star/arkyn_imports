export function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)))
  return (
    <span className="ak-stars" aria-label={`${full} de 5 estrelas`}>
      <b>{'★★★★★'.slice(0, full)}</b><i>{'★★★★★'.slice(full)}</i>
    </span>
  )
}
