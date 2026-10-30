'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState, useSyncExternalStore, type ReactElement } from 'react'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import {
  WELCOME_BACKDROP,
  backdropStartStillReason,
  startBackdropPlayer,
  welcomeBackdropDim,
  welcomeBackdropPictureFilter,
  type BackdropPlayerHandle,
  type BackdropStillReason,
  type WelcomeBackdropLook
} from '@/lib/hero-chrome/player'

// The site ships the Polished poster only: the hero always shows that look.
const POSTERS: Partial<Record<WelcomeBackdropLook, string>> = {
  polished: '/hero/liquid-chrome-polished.webp'
}

function subscribeVisibility(onChange: () => void): () => void {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

/** Whether the page is on screen, so the shader stops drawing in a background tab. */
function useDocumentVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState !== 'hidden',
    () => true
  )
}

const MORE_CONTRAST_QUERY = '(prefers-contrast: more)'

function subscribeMoreContrast(onChange: () => void): () => void {
  const media = window.matchMedia?.(MORE_CONTRAST_QUERY)
  media?.addEventListener('change', onChange)
  return () => media?.removeEventListener('change', onChange)
}

function usePrefersMoreContrast(): boolean {
  return useSyncExternalStore(
    subscribeMoreContrast,
    () => Boolean(window.matchMedia?.(MORE_CONTRAST_QUERY).matches),
    () => false
  )
}

type BackdropState =
  | { mode: 'starting' }
  | { mode: 'moving' }
  | { mode: 'still'; reason: BackdropStillReason }

/**
 * The home page hero's backdrop: Videorc's first-run Liquid Chrome, edge to
 * edge. Copied from Videorc's WelcomeBackdrop for the site only (not a
 * registry item). The poster paints at once; the moving WebGL2 canvas fades
 * in over it on its first frame. Under reduced motion, without a GPU or when
 * the budget guard trips, the poster stays. Under light the picture is
 * inverted: white liquid with black reflections. Decoration only: hidden from
 * assistive tech, no pointer events, nothing allocated once it unmounts.
 */
export function HeroChrome({
  hardwareAccelerationDisabled = false,
  look = WELCOME_BACKDROP.look
}: {
  /** Electron's GPU fallback is on: the poster, no WebGL. */
  hardwareAccelerationDisabled?: boolean
  look?: WelcomeBackdropLook
}): ReactElement {
  const { resolvedTheme } = useTheme()
  const reducedMotion = useReducedMotion()
  const moreContrast = usePrefersMoreContrast()
  const visible = useDocumentVisible()
  const tone = welcomeBackdropDim({ dark: resolvedTheme !== 'light', moreContrast })
  const shaderDim = tone.shader
  const startStill = backdropStartStillReason({ reducedMotion, hardwareAccelerationDisabled })

  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<BackdropPlayerHandle | null>(null)
  const dimRef = useRef(shaderDim)
  dimRef.current = shaderDim
  const [state, setState] = useState<BackdropState>({ mode: 'starting' })

  // One player per look while motion is allowed. The main window keeps
  // running animation frames while hidden (backgroundThrottling is off), so
  // visibility pauses it below.
  useEffect(() => {
    const host = hostRef.current
    if (startStill || !host) return
    setState({ mode: 'starting' })
    const player = startBackdropPlayer({
      host,
      look,
      dim: dimRef.current,
      onFirstFrame: () => setState({ mode: 'moving' }),
      onStill: (reason) => {
        setState({ mode: 'still', reason })
      }
    })
    playerRef.current = player
    return () => {
      player.dispose()
      playerRef.current = null
    }
  }, [look, startStill])

  useEffect(() => {
    playerRef.current?.setDim(shaderDim)
  }, [shaderDim])

  useEffect(() => {
    playerRef.current?.setRunning(visible)
  }, [visible])

  const shown: BackdropState = startStill ? { mode: 'still', reason: startStill } : state
  const moving = shown.mode === 'moving'

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-glass-solid"
      data-hero-chrome={moving ? 'moving' : shown.mode === 'still' ? 'still' : 'starting'}
      data-hero-chrome-look={look}
      data-hero-chrome-reason={shown.mode === 'still' ? shown.reason : undefined}
      data-hero-chrome-tone={tone.tone}
    >
      {/* The picture: turned around under light, a compositor filter over
          poster and canvas alike, so the still and the motion always match.
          The root's solid behind it is never inverted. */}
      <div
        className="absolute inset-0"
        data-hero-chrome-picture=""
        style={{ filter: welcomeBackdropPictureFilter(tone) }}
      >
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          draggable={false}
          // The shader's Dim, matched on the still so a fallback reads the same.
          style={{ filter: shaderDim > 0 ? `brightness(${1 - shaderDim})` : undefined }}
          src={POSTERS[look]}
        />
        {startStill || shown.mode === 'still' ? null : (
          // The player puts its own canvas in here and takes it away again.
          <div
            ref={hostRef}
            className="absolute inset-0 opacity-0 transition-opacity duration-150 ease-out data-[drawn=true]:opacity-100 motion-reduce:transition-none"
            data-drawn={moving}
            data-hero-chrome-canvas=""
          />
        )}
      </div>
    </div>
  )
}
