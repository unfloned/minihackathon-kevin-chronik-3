import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
    children: React.ReactNode;
}

// Subtle page transition - just a quick fade, minimal movement
const pageVariants = {
    initial: {
        opacity: 0,
    },
    enter: {
        opacity: 1,
        transition: {
            duration: 0.15,
            ease: [0, 0, 0.2, 1] as const, // easeOut cubic-bezier
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.1,
            ease: [0.4, 0, 1, 1] as const, // easeIn cubic-bezier
        },
    },
};

export function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                style={{ height: '100%' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// Stagger children animation for lists
export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
        },
    },
};

// Fade in animation for cards
export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
        },
    },
};

// Scale animation for buttons and interactive elements
export const scaleOnHover = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: {
        type: 'spring',
        stiffness: 400,
        damping: 17,
    },
};

// Slide in from left/right for sidebars
export const slideIn = {
    left: {
        initial: { x: -20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -20, opacity: 0 },
    },
    right: {
        initial: { x: 20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 20, opacity: 0 },
    },
};

export default PageTransition;
