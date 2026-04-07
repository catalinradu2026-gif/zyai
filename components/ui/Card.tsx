import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  shadow?: 'sm' | 'md' | 'lg'
}

const shadowMap = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
}

export default function Card({ children, className = '', shadow = 'md' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg p-6 ${shadowMap[shadow]} ${className}`}>
      {children}
    </div>
  )
}
