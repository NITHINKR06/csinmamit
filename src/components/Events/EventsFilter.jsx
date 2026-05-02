import { motion } from 'framer-motion'
import { EVENT_YEARS } from '../../constants/eventConstants'

const EventsNavigator = ({ selectedYear, setSelectedYear, selectedType, setSelectedType }) => {
  return (
    <section className="pb-8">
      <div className="container-custom max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-wrap justify-center gap-2">
            {EVENT_YEARS.map((year, index) => (
              <motion.button
                key={year}
                onClick={() => setSelectedYear(year)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedYear === year
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {year}-{(parseInt(year) + 1).toString().slice(2)}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default EventsNavigator
