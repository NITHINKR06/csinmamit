import { motion } from 'framer-motion'
import { Mail, Linkedin } from 'lucide-react'

const FacultyCard = ({ member, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="h-full group"
    >
      <div className="h-full bg-white dark:bg-gray-900 rounded-2xl p-6 text-center 
                      border border-gray-100 dark:border-gray-800 
                      hover:border-primary-200 dark:hover:border-primary-900
                      transition-all duration-300">
        {/* Profile Image */}
        <div className="relative mb-6">
          <img
            src={member.image}
            alt={member.name}
            className="w-28 h-28 mx-auto rounded-full object-cover 
                       ring-2 ring-primary-400/40 dark:ring-primary-500/30
                       group-hover:ring-primary-500 transition-all duration-300"
          />
        </div>
        
        {/* Member Info */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-3">
          {member.role}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 tracking-wide uppercase mb-4">
          {member.department}
        </p>
        
        {/* Social Links */}
        <div className="flex justify-center gap-3 mt-auto">
          <a
            href={`mailto:${member.email}`}
            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"
            aria-label={`Email ${member.name}`}
          >
            <Mail size={18} />
          </a>
          <a
            href={member.linkedin}
            target="_blank"
            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"
            aria-label={`${member.name}'s LinkedIn`}
          >
            <Linkedin size={18} />
          </a>
        </div>
      </div>
    </motion.div>
  )
}

export default FacultyCard
