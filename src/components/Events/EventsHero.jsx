import { motion } from 'framer-motion'

const EventsHero = ({ eventCount }) => {
  return (
    <section className="relative pt-28 pb-16 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(59,130,246,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(168,85,247,0.3) 0%, transparent 50%)',
        }}
      />
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="heading-1 mb-4">
            Our <span className="gradient-text">Events</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            From technical workshops to competitive hackathons — explore everything happening at CSI NMAMIT.
          </p>
          {eventCount !== undefined && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-4 font-display">
              {eventCount} {eventCount === 1 ? 'event' : 'events'} and counting
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default EventsHero
