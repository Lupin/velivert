// Vélivert — G2 display rendering

import type { Station } from '../config.ts'
import { APP_VERSION } from '../config.ts'

let pageCreated = false

/** Render the stations list on the G2 display */
export function updateG2Display(bridge: any, stations: Station[]): void {
  if (!bridge) return

  let text = ''
  if (stations.length === 0) {
    text = 'Aucune station\ndans ce rayon.\nAugmentez le rayon.'
  } else {
    // Build compact multi-line text
    const lines = stations.map((s) => {
      const name = s.name.length > 16 ? s.name.slice(0, 15) + '…' : s.name.padEnd(16)
      const dist = `${s.distance}m`.padStart(6)
      const bikes = `${s.bikes_available}v`.padStart(4)
      return `${name}${dist}${bikes}`
    })
    text = lines.join('\n')
  }

  text += `\n\nVélivert v${APP_VERSION}`

  const property: any = {
    type: 'TextContainerProperty',
    content: text,
  }

  if (!pageCreated) {
    pageCreated = true
    bridge
      .createStartUpPageContainer([
        {
          containerID: 1,
          property: property,
          isEventCapture: 1,
        },
      ])
      .then((result: number) => {
        if (result !== 0) console.error('[Vélivert] createStartUpPageContainer failed:', result)
      })
      .catch((e: any) => console.error('[Vélivert] G2 render error:', e))
  } else {
    bridge
      .createStartUpPageContainer([
        {
          containerID: 1,
          property: property,
          isEventCapture: 1,
        },
      ])
      .then((result: number) => {
        if (result !== 0) console.error('[Vélivert] createStartUpPageContainer failed:', result)
      })
      .catch((e: any) => console.error('[Vélivert] G2 render error:', e))
  }
}
