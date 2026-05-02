import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const CTA = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 to-gray-900 dark:from-gray-950 dark:to-gray-900" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.08]"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)',
        }}
      />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="heading-2 mb-4 text-white">
            Ready to Join the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyber-blue">Tech Revolution?</span>
          </h2>

          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Become a part of CSI NMAMIT and unlock endless opportunities to learn, grow, and excel in the world of technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/recruit"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all duration-200 translate-y-0 hover:-translate-y-[1px]"
            >
              <span>Join CSI Now</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-gray-600 text-gray-300 font-semibold hover:border-gray-400 hover:text-white transition-all duration-200 translate-y-0 hover:-translate-y-[1px]"
            >
              Explore Events
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Membership registration for 2025-26 is now open!
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA
