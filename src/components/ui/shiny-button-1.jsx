// Ported from realestate-outreach/components/ui/shiny-button-1.tsx
// <style jsx global> replaced with @keyframes speen/woah in index.css
import * as React from 'react'
import { useId } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const shinyButtonVariants = cva(
  'group relative isolate inline-flex shrink-0 cursor-pointer select-none rounded-[1.1rem]',
  {
    variants: {
      variant: {
        default: '',
        outline: '',
        secondary: '',
        destructive: '',
      },
      size: {
        default: 'h-10 text-sm',
        sm: 'h-9 text-xs',
        lg: 'h-11 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

const surfaceVariants = cva(
  'relative z-10 flex h-full w-full items-center justify-center gap-2 overflow-hidden rounded-[1.05rem] border px-4 font-semibold text-white transition-transform duration-300 group-hover:scale-[1.01] group-active:scale-[0.985] disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-cyan-200/15 bg-[linear-gradient(180deg,rgba(10,16,28,0.94),rgba(7,10,18,0.98))] text-white',
        outline:
          'border-cyan-200/15 bg-[linear-gradient(180deg,rgba(9,15,25,0.86),rgba(7,10,18,0.94))] text-stone-100',
        secondary:
          'border-emerald-300/15 bg-[linear-gradient(180deg,rgba(8,20,18,0.94),rgba(6,10,12,0.98))] text-white',
        destructive:
          'border-red-300/20 bg-[linear-gradient(180deg,rgba(28,10,14,0.94),rgba(16,7,10,0.98))] text-white',
      },
      size: {
        default: 'px-5 py-2.5',
        sm: 'px-4 py-2',
        lg: 'px-6 py-3',
        icon: 'px-0 py-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

const borderVariants = cva('rounded-[1.1rem] p-[1px]', {
  variants: {
    variant: {
      default:
        'bg-[linear-gradient(135deg,rgba(255,212,145,0.42),rgba(0,0,0,0.25)_35%,rgba(128,236,255,0.52))]',
      outline:
        'bg-[linear-gradient(135deg,rgba(255,212,145,0.36),rgba(0,0,0,0.18)_38%,rgba(128,236,255,0.45))]',
      secondary:
        'bg-[linear-gradient(135deg,rgba(190,255,214,0.32),rgba(0,0,0,0.18)_40%,rgba(102,255,225,0.38))]',
      destructive:
        'bg-[linear-gradient(135deg,rgba(255,187,145,0.44),rgba(0,0,0,0.2)_38%,rgba(255,110,110,0.42))]',
    },
  },
  defaultVariants: { variant: 'default' },
})

const glowVariants = cva(
  'absolute inset-0 -z-10 opacity-60 transition-opacity duration-300 group-hover:opacity-90 group-active:opacity-100',
  {
    variants: {
      variant: {
        default: '',
        outline: '',
        secondary: '',
        destructive: '',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function glowGradient(variant) {
  switch (variant) {
    case 'secondary':
      return 'linear-gradient(90deg, #c7ffb2 10%, #0000 42% 58%, #4effcb 88%)'
    case 'destructive':
      return 'linear-gradient(90deg, #ffb497 10%, #0000 42% 58%, #ff5d6c 88%)'
    case 'outline':
      return 'linear-gradient(90deg, #f8d88d 10%, #0000 42% 58%, #6fdfff 88%)'
    default:
      return 'linear-gradient(90deg, #ffb85f 10%, #0000 42% 58%, #42c8ff 88%)'
  }
}

export const GlowButton = React.forwardRef(
  ({ children, className, surfaceClassName, variant = 'default', size = 'default', ...props }, ref) => {
    const resolvedVariant = variant ?? 'default'
    const id = useId().replace(/:/g, '')
    const filters = {
      unopaq: `unopaq-${id}`,
      unopaq2: `unopaq2-${id}`,
      unopaq3: `unopaq3-${id}`,
    }

    return (
      <button
        ref={ref}
        className={cn(shinyButtonVariants({ variant, size }), className)}
        {...props}
      >
        <svg aria-hidden="true" className="absolute size-0">
          <filter width="300%" x="-100%" height="300%" y="-100%" id={filters.unopaq}>
            <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 9 0" />
          </filter>
          <filter width="300%" x="-100%" height="300%" y="-100%" id={filters.unopaq2}>
            <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 3 0" />
          </filter>
          <filter width="300%" x="-100%" height="300%" y="-100%" id={filters.unopaq3}>
            <feColorMatrix values="1 0 0 0.2 0 0 1 0 0.2 0 0 0 1 0.2 0 0 0 0 2 0" />
          </filter>
        </svg>

        <div
          className={cn(
            glowVariants({ variant: resolvedVariant }),
            'pointer-events-none inset-[-1px] overflow-hidden rounded-[1.2rem] opacity-30 group-hover:opacity-55'
          )}
          style={{ filter: `blur(0.24em) url(#${filters.unopaq2})` }}
        >
          <div
            className="absolute inset-[-24%] group-hover:animate-[speen_8s_cubic-bezier(0.56,0.15,0.28,0.86)_infinite]"
            style={{ background: glowGradient(resolvedVariant) }}
          />
        </div>

        <div className={cn(borderVariants({ variant: resolvedVariant }), size === 'icon' ? 'rounded-[1rem]' : '')}>
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-[-1px] -z-10 overflow-hidden rounded-[1.15rem] opacity-38 transition-opacity duration-300 group-hover:opacity-62"
              style={{ filter: `blur(2px) url(#${filters.unopaq3})` }}
            >
              <div
                className="absolute inset-[-20%] group-hover:animate-[speen_8s_cubic-bezier(0.56,0.15,0.28,0.86)_infinite]"
                style={{ background: glowGradient(resolvedVariant) }}
              />
            </div>

            <div className={cn(surfaceVariants({ variant: resolvedVariant, size }), size === 'icon' ? 'rounded-[0.95rem]' : '', surfaceClassName)}>
              {children}
            </div>
          </div>
        </div>
      </button>
    )
  }
)

GlowButton.displayName = 'GlowButton'
