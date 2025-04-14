import React, { ReactNode, MouseEventHandler } from 'react'
import classNames from 'classnames'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
}) => {
  const baseStyles =
    'w-full max-w-xs rounded py-2 font-medium transition duration-300 ease-in-out'

  const variantStyles = {
    primary: 'bg-[#00AAFF] text-white hover:bg-sky-600',
    secondary: 'bg-[#EBEEF7] text-[#191F33] hover:bg-violet-200',
    outline:
      'bg-transparent text-[#7D8592] border border-[#D8E0F0] hover:bg-[#D8E0F0]',
  }

  const disabledStyles = 'bg-[#727f94] text-white cursor-not-allowed'

  return (
    <button
      className={classNames(
        baseStyles,
        disabled ? disabledStyles : variantStyles[variant!]
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
