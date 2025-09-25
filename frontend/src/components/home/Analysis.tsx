import React from 'react'
import Graphs from './Graphs'

export type GraphSpec = {
  type: 'bar' | 'line' | 'scatter' | 'area' | 'pie'
  title: string
  description: string
  data: Array<Record<string, any>>
  xKey: string
  yKey: string | string[]
  colors?: string[]
}

type AnalysisProps = { graphs: GraphSpec[] }

const Analysis: React.FC<AnalysisProps> = ({ graphs }) => {
  const valid = Array.isArray(graphs)
    ? graphs.filter(g => g && g.type && Array.isArray(g.data) && g.data.length > 0)
    : []
  if (valid.length === 0) return null

  return (
    <div className='mt-3 space-y-3'>
      {valid.slice(0, 3).map((spec, idx) => (
        <Graphs key={idx} spec={spec} />
      ))}
    </div>
  )
}

export default Analysis
