import { motion } from 'framer-motion'
import { Linkedin, Github } from 'lucide-react'

const StudentCard = ({ member, index, onClick }) => {
  const displayRole = member?.roleDetails?.position || member?.role || 'Member'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={() => onClick(member)}
      className="cursor-pointer group"
    >
      <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-black
                      ring-1 ring-black/5 dark:ring-white/5
                      hover:ring-primary-500/30 transition-all duration-300">
        
        <img
          src={member.imageSrc}
          alt={member.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] 
                     transition-transform duration-500"
        />

        {/* Always visible bottom strip */}
        <div className="absolute bottom-0 inset-x-0 p-4 
                        bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <h3 className="text-sm font-semibold text-white leading-snug">{member.name}</h3>
          <p className="text-xs text-yellow-400 font-medium mt-0.5">{displayRole}</p>
        </div>

        {/* Hover reveal — social links only */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300 flex items-end justify-end p-4">
          <div className="flex gap-2">
            {member.linkedin && member.linkedin !== '#' && (
              <a href={member.linkedin} target="_blank" onClick={(e) => e.stopPropagation()}
                 className="p-2 rounded-lg bg-white/10 hover:bg-white/20 
                            border border-white/10 transition-colors">
                <Linkedin size={16} className="text-white" />
              </a>
            )}
            {member.github && member.github !== '#' && (
              <a href={member.github} target="_blank" onClick={(e) => e.stopPropagation()}
                 className="p-2 rounded-lg bg-white/10 hover:bg-white/20 
                            border border-white/10 transition-colors">
                <Github size={16} className="text-white" />
              </a>
            )}
          </div>
        </div>

        {displayRole === 'President' && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md 
                          bg-yellow-400/90 backdrop-blur-sm">
            <span className="text-[10px] font-bold text-yellow-900 tracking-wide uppercase">
              President
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StudentCard
