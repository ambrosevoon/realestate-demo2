import { motion } from 'framer-motion'
import React from 'react'
import { cn } from '@/lib/utils'

const defaultContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const defaultItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const presetVariants = {
  fade: {
    container: defaultContainerVariants,
    item: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  },
  'blur-slide': {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(8px)', y: 12 },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: { type: 'spring', bounce: 0.3, duration: 1.2 },
      },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } },
  },
}

export function AnimatedGroup({ children, className, variants, preset = 'fade' }) {
  const selected = preset ? presetVariants[preset] : { container: defaultContainerVariants, item: defaultItemVariants }
  const containerVariants = variants?.container || selected.container
  const itemVariants = variants?.item || selected.item

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
