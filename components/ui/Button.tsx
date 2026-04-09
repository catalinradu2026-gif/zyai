'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  isLoading?: boolean
  icon?: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-semibold transition-all duration-200 flex items-center justify-center gap-2 rounded-2xl transform hover:scale-[1.03] active:scale-[0.98]'

  const variants = {
    primary: 'gradient-main text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
    secondary: 'glass glass-hover text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
    danger: 'bg-red-500/80 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
    ghost: 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
  }

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={variant === 'primary' && !disabled ? { boxShadow: '0 0 24px rgba(139,92,246,0.35)' } : undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Se încarcă...
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}
