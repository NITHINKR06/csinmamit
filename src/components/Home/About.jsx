import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Award, Target, Lightbulb, Users2 } from 'lucide-react'

const StatCounter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return <span ref={ref} className="font-display">{count}{suffix}</span>
}

const About = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const stats = [
    { icon: Users2, value: 500, suffix: '+', label: 'Active Members' },
    { icon: Award, value: 10, suffix: '+', label: 'Years of Excellence' },
    { icon: Target, value: 50, suffix: '+', label: 'Events Conducted' },
    { icon: Lightbulb, value: 100, suffix: '+', label: 'Projects Launched' },
  ]

  return (
    <section className="py-20 relative" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-2 mb-4">
            About <span className="gradient-text">CSI NMAMIT</span>
          </h2>
          <p className="body-text max-w-3xl mx-auto">
            We are not just an organization; we are a family that fosters growth, innovation,
            and a shared passion for all things tech.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              <Award size={16} />
              Excellence in Technology Education
            </div>

            <h3 className="text-2xl md:text-3xl font-semibold mb-4">
              Transforming Students into{' '}
              <span className="gradient-text">Tech Leaders</span>
            </h3>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              At CSI NMAMIT, we believe in shaping the future of technology enthusiasts
              by providing a holistic perspective on development and empowering students
              to turn their ideas into impactful solutions.
            </p>

            <div className="space-y-3">
              {[
                { label: 'Industry Connections', desc: 'Network with professionals and alumni' },
                { label: 'Practical Learning', desc: 'Hands-on workshops and projects' },
                { label: 'Career Growth', desc: 'Mentorship and placement support' },
              ].map(({ label, desc }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">{label}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img src="/team.jpg" alt="CSI Team" className="w-full h-auto rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-2xl font-bold font-display">10+ Years</p>
                <p className="text-sm text-white/80">of Excellence</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, value, suffix, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 text-center"
            >
              <Icon size={20} className="mx-auto mb-2 text-primary-500" />
              <div className="text-2xl font-bold font-display text-gray-900 dark:text-white">
                <StatCounter end={value} suffix={suffix} />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute top-1/2 left-0 w-96 h-96 bg-gradient-to-r from-primary-500/5 to-cyber-blue/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-r from-cyber-purple/5 to-cyber-pink/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
    </section>
  )
}

export default About
