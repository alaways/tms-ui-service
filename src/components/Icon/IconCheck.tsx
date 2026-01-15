import { FC } from 'react'

interface IconCheckCircleProps {
  className?: string
  fill?: boolean
  duotone?: boolean
}

const IconCheckCircle: FC<IconCheckCircleProps> = ({ className, fill = false, duotone = true }) => {
  return (
    <>
    {!fill ? (
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: 'inline-block' }}>
        <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
        <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
       </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: 'inline-block' }}>
        <circle opacity="0.5" cx="12" cy="12" r="10" stroke={duotone ? 'currentColor' : 'white'} strokeWidth="1.5"></circle>
        <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke={duotone ? 'currentColor' : 'white'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={duotone ? 'currentColor' : 'white'}></path>
     </svg>
    )}
    </>
  )
}

export default IconCheckCircle