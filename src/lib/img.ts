// Versões reduzidas das fotos locais (geradas ao lado dos originais em s160/ e s480/).
// Imagens de outra origem (ex.: enviadas pelo painel) não têm versão reduzida e passam sem alteração.
const LOCAL = /^\/(produtos-net|produtos|hero)\/([^/]+)\.(webp|jpg)$/

export const isLocal = (src: string) => LOCAL.test(src)

export function sized(src: string, size: 160 | 480): string {
  const m = LOCAL.exec(src)
  return m ? `/${m[1]}/s${size}/${m[2]}.webp` : src
}
