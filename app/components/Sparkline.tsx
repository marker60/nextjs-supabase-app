import * as React from "react";
export default function Sparkline({ data, width=120, height=32, strokeWidth=2, ariaLabel="trend" }:{
  data:number[]; width?:number; height?:number; strokeWidth?:number; ariaLabel?:string;
}) {
  if (!data?.length) return <svg width={width} height={height} role="img" aria-label={ariaLabel}>
    <line x1={0} y1={height/2} x2={width} y2={height/2} stroke="currentColor" strokeOpacity="0.25"/></svg>;
  const max=Math.max(...data), min=Math.min(...data), span=Math.max(1,max-min);
  const stepX=data.length>1? width/(data.length-1): width;
  const pts=data.map((v,i)=>`${i*stepX},${height-((v-min)/span)*height}`);
  return <svg width={width} height={height} role="img" aria-label={ariaLabel}>
    <polyline fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" points={pts.join(" ")} />
  </svg>;
}
