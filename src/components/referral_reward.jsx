import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function MeControlSVG() {
  const rootRef = useRef(null);

  useEffect(() => {
    const q = gsap.utils.selector(rootRef);

    gsap.set(q('#present-top'), { y: 140 });
    gsap.set([q('#blast-inner'), q('#blast-outer')], { scale: 0, transformOrigin: "50% 50%" });
    gsap.set(q('#stars > *'), { scale: 0 });

    const tlm = gsap.timeline({ repeat: -1, paused: true });

    tlm
      .to(q('#present-top'), { y: 0, ease: 'elastic.inOut(1,1)', duration: 1.5 })
      .to(q('#shade'), { scaleY: 0, ease: 'elastic.inOut(1,1)', duration: 1.5 }, 0)
      .to(q('#present-top'), { rotate: 2, x: 5, duration: 0.9, repeat: 1, yoyo: true, transformOrigin: "50% 50%" }, '-=0.5')
      .to(q('#present-top'), { rotate: -2, x: -5, duration: 0.9, repeat: 1, yoyo: true, transformOrigin: "50% 50%" })
      .to(q('#present-layer'), { scale: 0.9, transformOrigin: "50% 50%", ease: 'elastic.inOut(1,1)' }, 0.4)
      .to(q('#blast-inner'), { scale: 1, transformOrigin: "50% 50%", rotate: 180, ease: 'power1.out', duration: 1 }, 0.4)
      .to(q('#blast-outer'), { scale: 1, transformOrigin: "50% 50%", rotate: -180, ease: 'power1.out', duration: 1 }, 0.4)
      .to(q('#blast'), { opacity: 0, duration: 2 }, 0.8)
      .to(q('#stars > *'), { scale: 1.1, stagger: 0.1, duration: 1, ease: 'elastic.inOut(1,1)', transformOrigin: "50% 50%" }, 1.1)
      .to(q('#stars > *'), { scale: 0, stagger: 0.1, duration: 1, ease: 'elastic.inOut(1,1)', transformOrigin: "50% 50%" }, 1.9)
      .to(q('#present-top'), { y: 140, ease: 'elastic.inOut(2.1,1)', duration: 2 }, 3.2)
      .to(q('#shade'), { scaleY: 1, ease: 'elastic.out(2.1,1)', duration: 1.5 }, 4.1)
      .to(q('#present-layer'), { scale: 1, transformOrigin: "50% 50%", ease: 'elastic.inOut(1,1)' }, 4);

    tlm.duration(3);
    tlm.play();

    return () => tlm.kill();
  }, []);

  return (
    <div ref={rootRef} className="w-full h-full">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 1280 1024"
      >
        <style type="text/css">{
          `
          .st0{fill:none;stroke:#C338B3;stroke-width:6;stroke-linecap:round;stroke-miterlimit:10;}
          .st1{fill:none;stroke:#0177D9;stroke-width:6;stroke-linecap:round;stroke-miterlimit:10;}
          .st2{fill:none;stroke:#01CC69;stroke-width:6;stroke-linecap:round;stroke-miterlimit:10;}
          .st3{fill:none;stroke:#FD4341;stroke-width:6;stroke-linecap:round;stroke-miterlimit:10;}
          .st4{fill:none;stroke:#FFB900;stroke-width:6;stroke-linecap:round;stroke-miterlimit:10;}
          .st21{fill:#FFBA01;}
          .st22{fill:#FD4341;}
          .st23{fill:#FD8C00;}
          .st24{fill:#E81223;}
          `
        }</style>
        <g id="Layer_1">
          <g id="present-layer">
            <g id="blast">
              <g id="blast-inner">
                <line className="st0" x1="535.1" y1="459.3" x2="526.4" y2="464.7"/>
              </g>
              <g id="blast-outer">
                <line className="st1" x1="451.1" y1="445" x2="440.9" y2="445.3"/>
              </g>
            </g>
          </g>
          <g id="stars">
            <path className="st21" d="M837.4,562.3c-1.6-3.3-2.3-9.8-2.3-9.8s-0.8,6.6-2.4,9.8c-1.7,3.5-4.2,6.2-6.9,8.1c2.7,1.8,5.2,4.6,6.9,8.1 c1.9,3.8,2.4,11.6,2.4,11.6s0.5-7.8,2.4-11.6c1.7-3.5,4.2-6.2,6.9-8.1C841.6,568.6,839.1,565.8,837.4,562.3z"/>
          </g>
          <g id="present">
            <g id="present-bottom">
              <path className="st21" d="M717.4,612H563.6c-6.9,0-12.6-5.7-12.6-12.6V465.5h179v133.9C730,606.4,724.3,612,717.4,612z"/>
              <rect x="622.4" y="465.5" className="st22" width="36.5" height="146.5"/>
            </g>
            <g id="shade">
              <polygon className="st23" points="551.4,465.5 550.9,521.2 730.4,521.2 730.4,465.5"/>
              <rect x="622.2" y="465.5" className="st24" width="36.5" height="55.6"/>
            </g>
            <g id="present-top">
              <path className="st22" d="M732.3,256.5c0-3.8-2.6-7.1-6.3-7.7c-3.5-0.6-7.3,0.5-10,3.2l-60.3,38.7c-1.3-3.5-4.6-6-8.5-6h-13.1 c-3.9,0-7.3,2.6-8.5,6.1l-60.5-38.9c-3.2-3.2-7.9-4.1-12-2.7c-2.6,0.9-4.4,3.5-4.4,6.3l0.4,46.3l83.6,0.9 c0.5,0.1,0.9,0.1,1.4,0.1h13.1c0.5,0,1,0,1.4-0.1l83.3-0.9L732.3,256.5z"/>
              <path className="st21" d="M729.5,339.8h-179c-10.7,0-19.5-8.8-19.5-19.5v0c0-10.7,8.8-19.5,19.5-19.5h179c10.7,0,19.5,8.8,19.5,19.5 v0C749,331.1,740.2,339.8,729.5,339.8z"/>
              <rect x="622.4" y="300.8" className="st22" width="36.5" height="39.1"/>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
