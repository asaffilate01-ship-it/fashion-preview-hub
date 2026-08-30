"use client";

import * as React from "react";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const slides = [
  {
    image: "/campaign/hero-six-models-v2.jpg",
    video: "/campaign/kalethon-hero-walk-6s.mp4",
    alt: "Five diverse KALËTHON models walking toward camera in premium polo, tracksuit, T-shirt and below-knee shorts looks",
    eyebrow: "KALËTHON campaign / 2026",
    title: <>Poise<br />in motion.</>,
    copy: "The full expression of modern sport. One standard of quiet confidence.",
    note: <>The full collection.<br />Walking as one.</>,
    cta: "Explore the collections",
    href: "#collections",
  },
  {
    image: "/campaign/hero-tennis-golf-v2.jpg",
    video: undefined,
    alt: "KALËTHON tennis and golf models walking beside a clay court in premium polos and full-length tailored trousers",
    eyebrow: "Court to clubhouse / 2026",
    title: <>Play,<br />refined.</>,
    copy: "Technical ease for the first serve, the final round and everything after.",
    note: <>Tennis / Golf<br />Built beyond play.</>,
    cta: "Discover sport",
    href: "#tennis",
  },
  {
    image: "/campaign/hero-casual-motion-v2.jpg",
    video: undefined,
    alt: "Three KALËTHON models walking in hoodies, a tracksuit, a graphic T-shirt and full-length trousers",
    eyebrow: "The off-court edit / 2026",
    title: <>Relaxed.<br />Resolved.</>,
    copy: "Substantial hoodies, considered tracksuits and expressive graphic tees.",
    note: <>Hoodies / Tracksuits<br />Everyday movement.</>,
    cta: "Shop the hoodie edit",
    href: "#hoodies",
  },
];

const SLIDE_DURATION_MS = 6000;

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const videoRefs = React.useRef<Array<HTMLVideoElement | null>>([]);

  React.useEffect(() => {
    if (!api) return;

    const select = () => {
      const next = api.selectedScrollSnap();
      setCurrent(next);
      videoRefs.current.forEach((video, index) => {
        if (video && index !== next) {
          video.pause();
          video.currentTime = 0;
        }
      });
    };
    select();
    api.on("select", select);
    api.on("reInit", select);

    return () => {
      api.off("select", select);
      api.off("reInit", select);
    };
  }, [api]);

  React.useEffect(() => {
    if (!api || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => api.scrollNext(), SLIDE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [api, current, paused]);

  React.useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === current && !paused && !reduceMotion) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [current, paused]);

  return (
    <section
      className="hero"
      id="top"
      aria-label="KALËTHON campaign carousel"
      data-paused={paused ? "true" : "false"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Carousel className="hero-carousel" opts={{ loop: true, duration: 32 }} setApi={setApi}>
        <CarouselContent className="hero-carousel-content">
          {slides.map((slide, index) => (
            <CarouselItem className="hero-carousel-item" key={slide.image} aria-hidden={current !== index}>
              <article className={`hero-slide hero-slide-${index + 1}`}>
                <div
                  className="hero-slide-media"
                  role="img"
                  aria-label={slide.alt}
                  style={{ backgroundImage: `url('${slide.image}')` }}
                >
                  {slide.video ? (
                    <video
                      ref={(node) => { videoRefs.current[index] = node; }}
                      className="hero-slide-video"
                      muted
                      playsInline
                      preload={index === 0 ? "auto" : "metadata"}
                      poster={slide.image}
                      aria-hidden="true"
                    >
                      <source src={slide.video} type="video/mp4" />
                    </video>
                  ) : null}
                </div>
                <div className="hero-shade" />
                <div className="hero-content">
                  <p className="eyebrow light">{slide.eyebrow}</p>
                  {index === 0 ? <h1 id="hero-title">{slide.title}</h1> : <h2>{slide.title}</h2>}
                  <p className="hero-copy">{slide.copy}</p>
                  <a className="button button-light" href={slide.href}>{slide.cta} <Arrow /></a>
                </div>
                <div className="hero-note">
                  <span>0{index + 1}</span>
                  <span>{slide.note}</span>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="hero-controls" aria-label="Campaign controls">
          <div className="hero-dots">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={slide.image}
                className={current === index ? "is-active" : ""}
                aria-label={`Show campaign slide ${index + 1}`}
                aria-current={current === index ? "true" : undefined}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
          <span className="hero-index">0{current + 1} / 0{slides.length}</span>
        </div>

        <CarouselPrevious className="hero-arrow hero-arrow-prev" />
        <CarouselNext className="hero-arrow hero-arrow-next" />
      </Carousel>
    </section>
  );
}
