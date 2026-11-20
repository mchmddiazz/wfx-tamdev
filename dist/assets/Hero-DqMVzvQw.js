import{h as a,t,w as p,x as h}from"./index-BYgPH3M4.js";const g=`Design.
Deploy.
Connect.
Engineering
functional digital
experiences that drive
real results.`;function y(){const s=a.useRef(null),[o,c]=a.useState(!1),[d,x]=a.useState(g);a.useEffect(()=>{const n=new IntersectionObserver(([e])=>c(e.isIntersecting),{threshold:.3});s.current&&n.observe(s.current);async function i(){const{data:e,error:r}=await h.from("site_profile").select("headline").eq("id",1).single();!r&&e?.headline&&x(e.headline)}return i(),()=>{s.current&&n.unobserve(s.current)}},[]);const u=n=>n.split(`
`).map((i,e,r)=>t.jsxs("span",{children:[i.split(".").map((f,l,m)=>t.jsxs("span",{children:[f,l<m.length-1&&t.jsx("span",{className:"text-orange-600",children:"."})]},l)),e<r.length-1&&t.jsx("br",{})]},e));return t.jsx("section",{id:"intro","aria-label":"Hero section: I code. I design. I adapt. I create digital experiences that feel alive.",className:"min-h-screen w-full flex flex-col items-start justify-center bg-neutral-200 dark:bg-black transition-colors px-4 px-6 md:py-auto",children:t.jsx(p.div,{ref:s,initial:{opacity:0,y:50},animate:o?{opacity:1,y:0}:{opacity:0,y:50},transition:{duration:.8,ease:"easeOut"},className:"flex flex-col items-start justify-center text-left max-w-5xl mx-auto",children:t.jsx("h1",{className:"font-gambarino text-[2.5rem] sm:text-6xl md:text-6xl leading-tight text-neutral-900 dark:text-white mb-8",children:u(d)})})})}export{y as default};
