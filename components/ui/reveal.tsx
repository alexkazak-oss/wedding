'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const fadeUp: Variants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
	},
}

const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { duration: 0.6, ease: 'easeOut' },
	},
}

const staggerContainer: Variants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.12 },
	},
}

interface RevealProps {
	children: ReactNode
	className?: string
	variant?: 'fadeUp' | 'fadeIn'
	delay?: number
}

const variants = { fadeUp, fadeIn }

export function Reveal({ children, className, variant = 'fadeUp', delay = 0 }: RevealProps) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: '-60px' }}
			variants={variants[variant]}
			transition={{ delay }}
			className={className}
		>
			{children}
		</motion.div>
	)
}

interface StaggerProps {
	children: ReactNode
	className?: string
}

export function Stagger({ children, className }: StaggerProps) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: '-40px' }}
			variants={staggerContainer}
			className={className}
		>
			{children}
		</motion.div>
	)
}

export { fadeIn, fadeUp, staggerContainer }

