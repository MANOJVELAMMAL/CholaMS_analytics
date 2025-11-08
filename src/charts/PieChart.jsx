import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function PieChart({ data = [], xKey, yKey }){
  const ref = useRef();
  useEffect(()=>{
    const chart = echarts.init(ref.current);
    const agg = {};
    data.forEach(d=> { const k = d[xKey] || 'undefined'; agg[k] = (agg[k]||0) + Number(d[yKey]||0); });
    const seriesData = Object.entries(agg).map(([name,value])=>({name, value}));
    const option = { tooltip:{trigger:'item'}, legend:{top:'5%',orient: 'vertical',left: 'left'}, series:[{type:'pie', radius:'60%', data:seriesData, emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }}}] };
    chart.setOption(option);
    return ()=>chart.dispose();
  },[data,xKey,yKey]);
  return <div ref={ref} style={{ width:'100%', height:300 }} />;
}
