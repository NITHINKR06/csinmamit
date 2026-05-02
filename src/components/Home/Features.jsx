import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const activities = [
  {
    numeral: '01',
    title: 'Technical Workshops',
    description: 'Hands-on learning with industry experts covering cutting-edge technologies from AI to cloud computing.',
    count: '30+',
    countLabel: 'Workshops',
  },
  {
    numeral: '02',
    title: 'Hackathons & Competitions',
    description: 'Intense coding challenges and innovation sprints that push your problem-solving limits.',
    count: '10+',
    countLabel: 'Hackathons',
  },
  {
    numeral: '03',
    title: 'Guest Lectures & Talks',
    description: 'Insights from tech leaders, alumni, and industry pioneers sharing real-world experience.',
    count: '20+',
    countLabel: 'Lectures',
  },
  {
    numeral: '04',
    title: 'Project Exhibitions',
    description: 'A platform to showcase your innovations, get feedback, and connect with fellow builders.',
    count: '15+',
    countLabel: 'Projects',
  },
]

const Features = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section className="py-28 relative bg-gray-50 dark:bg-gray-900/50" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="heading-2 mb-4">
            What We <span className="gradient-text">Offer</span>
          </h2>
          <p className="body-text max-w-3xl mx-auto">
            A structured ecosystem of activities designed to build technical depth, professional skills, and lasting connections.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12">
          {activities.map((item, index) => (
            <motion.div
              key={item.numeral}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="flex gap-6 group"
            >
              <div className="shrink-0 pt-1">
                <span className="text-4xl font-bold font-display text-gray-200 dark:text-gray-800 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-300">
                  {item.numeral}
                </span>
              </div>
              <div className="flex-1 pb-8 border-b border-gray-200 dark:border-gray-800 group-last:border-b-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  {item.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-display text-primary-500">{item.count}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{item.countLabel}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16"
        >
          {[
            { value: '30+', label: 'Workshops', sub: 'Hands-on sessions' },
            { value: '10+', label: 'Hackathons', sub: 'Coding battles' },
            { value: '20+', label: 'Lectures', sub: 'Industry talks' },
            { value: '15+', label: 'Projects', sub: 'Student showcases' },
          ].map(({ value, label, sub }) => (
            <div
              key={label}
              className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800"
            >
              <div className="text-2xl font-bold font-display text-gray-900 dark:text-white">{value}</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">{label}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Features
