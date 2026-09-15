import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import './Preloader.css';

interface PreloaderProps {
  onFinish: () => void;
}

export default function Preloader({ onFinish }: PreloaderProps) {
  const [hide, setHide] = useState(false);
  const isMounted = useRef(true);

  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const line4Ref = useRef<HTMLSpanElement>(null);

  const scrambleText = (element: HTMLElement | null, targetText: string) => {
    if (!element) return;

    gsap.killTweensOf(element);

    gsap.to(element, {
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: function () {
        const progress = this.progress();
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';

        for (let i = 0; i < targetText.length; i++) {
          const targetChar = targetText[i];
          if (targetChar === ' ') {
            result += ' ';
          } else {
            if (i / targetText.length < progress) {
              result += targetChar;
            } else {
              result += chars[Math.floor(Math.random() * chars.length)];
            }
          }
        }
        element.textContent = result;
      },
      onComplete: () => {
        element.textContent = targetText;
      }
    });
  };

  useEffect(() => {
    isMounted.current = true;

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    tl.fromTo('.logo',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 }
    )
    .call(() => {

      scrambleText(line1Ref.current, 'MATT');
      setTimeout(() => scrambleText(line2Ref.current, 'INNOVA'), 150);
      setTimeout(() => scrambleText(line3Ref.current, 'SOLUTION'), 300);
      setTimeout(() => scrambleText(line4Ref.current, 'SOLUCIONES TI QUE TRANSFORMAN'), 450);
    }, [], '+=0.1')

    .fromTo('.loader-indicator',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.2'
    )

    .to('.logo', {
      filter: 'drop-shadow(0 0 60px rgba(14, 165, 233, 0.3))',
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.2');

    const hideTimer = setTimeout(() => {
      if (isMounted.current) {
        setHide(true);
        setTimeout(() => {
          if (isMounted.current) {
            onFinish();
          }
        }, 500);
      }
    }, 2200);

    return () => {
      isMounted.current = false;
      clearTimeout(hideTimer);
      tl.kill();
    };
  }, [onFinish]);

  return (
    <div className={`preloader ${hide ? 'preloader--hide' : ''}`}>
      <div className="preloader-content">
        <div className="logo">
          <span className="logo-line logo-line--1" ref={line1Ref}>MATT</span>
          <span className="logo-line logo-line--2" ref={line2Ref}>INNOVA</span>
          <span className="logo-line logo-line--3" ref={line3Ref}>SOLUTION</span>
          <span className="logo-line logo-line--4" ref={line4Ref}>
            SOLUCIONES TI QUE TRANSFORMAN
          </span>
        </div>

        <div className="loader-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}