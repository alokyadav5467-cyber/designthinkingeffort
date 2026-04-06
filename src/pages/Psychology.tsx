import { Brain, Eye, Zap, Target } from 'lucide-react';

export function Psychology() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">The Psychology of Effort Illusion</h1>
        <p className="text-gray-400">Understanding why we misjudge our own productivity</p>
      </div>

      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-600/20 rounded-xl">
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Self-Serving Bias</h2>
            <p className="text-gray-300 leading-relaxed">
              We tend to attribute success to our own effort while downplaying external factors
              or distractions. This cognitive bias makes us believe we've studied longer than we
              actually have, because we remember the intention to study more vividly than the
              actual behavior.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-green-600/20 rounded-xl">
            <Eye className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Attention Fragmentation</h2>
            <p className="text-gray-300 leading-relaxed">
              Modern digital environments create micro-interruptions that fragment our attention
              without us noticing. Each tab switch, notification, or brief distraction breaks our
              flow state, but we rarely account for the cumulative impact of these small disruptions
              on our actual productive time.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-yellow-600/20 rounded-xl">
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Cognitive Dissonance</h2>
            <p className="text-gray-300 leading-relaxed">
              When our behavior conflicts with our self-image as a productive person, we experience
              discomfort. To resolve this, we often adjust our perception of reality rather than our
              behavior - convincing ourselves we worked harder than we did to maintain our self-concept.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-600/20 rounded-xl">
            <Target className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Intention-Action Gap</h2>
            <p className="text-gray-300 leading-relaxed">
              The gap between what we intend to do and what we actually do is often wider than we
              recognize. We remember our intentions vividly and conflate them with actions, leading
              to overestimation of actual effort. This is why time-tracking reveals surprising
              discrepancies between perceived and actual work time.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">The Effort Mirror Approach</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          Effort Mirror uses behavioral tracking to create an objective record of your focus patterns.
          By monitoring tab visibility, idle time, and switching behavior, it reveals the gap between
          perceived and actual effort.
        </p>
        <p className="text-gray-300 leading-relaxed mb-4">
          This isn't about judgment or productivity shaming. It's about building self-awareness and
          honest feedback loops. When you see objective data about your behavior, you can make informed
          decisions about changing your environment, habits, or expectations.
        </p>
        <p className="text-gray-300 leading-relaxed">
          The goal is cognitive honesty: accurate self-assessment of your effort. This honesty is the
          foundation for genuine improvement, not just the illusion of productivity.
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Research Foundation</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              "People consistently overestimate the amount of time they spend on productive activities
              by 30-50% when self-reporting compared to objective time-tracking methods."
            </p>
            <p className="text-gray-500 text-xs mt-2">Source: Time Perception Research, 2019</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              "Context switching can reduce productivity by up to 40% due to cognitive residue - the
              mental remnants of previous tasks that persist during new tasks."
            </p>
            <p className="text-gray-500 text-xs mt-2">Source: Attention Residue Theory, Sophie Leroy</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              "Self-serving attributional bias leads individuals to take credit for positive outcomes
              while deflecting responsibility for negative ones, affecting accurate self-assessment."
            </p>
            <p className="text-gray-500 text-xs mt-2">Source: Social Psychology, Miller & Ross, 1975</p>
          </div>
        </div>
      </div>
    </div>
  );
}
