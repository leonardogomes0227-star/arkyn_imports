import { forwardRef, useState, type ImgHTMLAttributes } from 'react'
import { isLocal, sized } from '../lib/img'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  src: string
  /** Tamanho da versão reduzida usada por padrão. */
  size: 160 | 480
  /** Oferece também o original (800 px) para telas de alta densidade. */
  responsive?: boolean
}

/** Usa a versão reduzida da foto e volta ao original se ela não existir. */
const SizedImg = forwardRef<HTMLImageElement, Props>(function SizedImg({ src, size, responsive, ...rest }, ref) {
  const [failed, setFailed] = useState(false)
  const useSmall = !failed && isLocal(src)
  return (
    <img
      ref={ref}
      {...rest}
      src={useSmall ? sized(src, size) : src}
      srcSet={useSmall && responsive ? `${sized(src, 480)} 480w, ${src} 800w` : undefined}
      onError={() => setFailed(true)}
    />
  )
})
export default SizedImg
