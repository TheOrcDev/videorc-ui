"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { SocialPreview } from "@/components/social/social-previews";
import { siteConfig } from "@/lib/site";
import type { SocialCardDefinition } from "@/lib/social-catalog";
import { previewOptions } from "@/lib/social-catalog";

import styles from "./social-card.module.css";
import "./social-capture.css";

const DEFAULT_ZOOM = 1.5;
// A demo that opens a popup stays at 1×, so the trigger matches its popup.
const POPUP_ZOOM = 1;
const LONG_TITLE = 22;

/**
 * One social image, laid out at 800 × 420 and captured at 1.5× for 1200 × 630.
 * The whole page scales, so a demo's portalled popups scale with it.
 */
export const SocialCard = ({ card }: { card: SocialCardDefinition }) => {
  const cardRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const options = previewOptions[card.preview] ?? {};

  useEffect(() => {
    const stage = stageRef.current?.getBoundingClientRect();
    if (stage) {
      // Dialogs and toasts centre on the stage, not the page.
      const { style } = document.documentElement;
      style.setProperty(
        "--social-stage-x",
        `${stage.left + stage.width / 2}px`
      );
      style.setProperty(
        "--social-stage-y",
        `${stage.top + stage.height / 2}px`
      );
    }
    if (cardRef.current) {
      cardRef.current.dataset.socialReady = "true";
    }
  }, []);

  return (
    <article
      className={styles.card}
      data-social-card={card.id}
      data-social-kind={card.category.startsWith("Hook") ? "hook" : "page"}
      data-social-long-title={card.title.length > LONG_TITLE}
      data-social-ready="false"
      ref={cardRef}
    >
      <header className={styles.header}>
        <div className={styles.brand}>
          <BrandLogo className="size-6 rounded-md" size={48} />
          <span>{siteConfig.name}</span>
        </div>
        <span className={styles.headerLabel}>REACT · BASE UI · SHADCN/UI</span>
      </header>
      <div className={styles.body}>
        <div className={styles.copy}>
          <p className={styles.category}>{card.category}</p>
          <h1 className={styles.title}>{card.title}</h1>
          <p className={styles.caption}>{card.caption}</p>
        </div>
        <figure className={styles.stage} ref={stageRef}>
          <div
            className={styles.preview}
            data-align={options.align}
            data-social-preview={card.preview}
            style={
              {
                "--social-width": options.width
                  ? `${options.width}px`
                  : undefined,
                "--social-zoom":
                  options.zoom ?? (options.open ? POPUP_ZOOM : DEFAULT_ZOOM),
              } as CSSProperties
            }
          >
            <SocialPreview name={card.preview} />
          </div>
          <figcaption className="sr-only">{card.alt}</figcaption>
        </figure>
      </div>
      <footer className={styles.footer}>
        <span>THE COMPONENTS BEHIND VIDEORC</span>
        <span>{new URL(siteConfig.url).host}</span>
      </footer>
    </article>
  );
};
