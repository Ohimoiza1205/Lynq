import { useAuth0 } from '@auth0/auth0-react'
import { Navigate } from 'react-router-dom'
import { Play, Shield, Zap, Users, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'

const Login = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [typingText, setTypingText] = useState('')
  const [currentCharIndex, setCurrentCharIndex] = useState(0)

  const procedures = [
    { 
      title: 'Video Analysis - Cardiac Surgery', 
      timestamp: '12:34 - 18:45', 
      progress: 45,
      typingContent: 'Extracting video elements into transcript for semantic analysis and procedural identification...'
    },
    { 
      title: 'Segment [23:15-31:28] Laparoscopic Procedure', 
      timestamp: '23:15 - 31:28', 
      progress: 68,
      typingContent: 'Inserting incision in the abdomen to view and operate on internal organs with minimal invasive techniques...'
    },
    { 
      title: 'Timestamp [56:07-69:02] Tumor Removal', 
      timestamp: '56:07 - 69:02', 
      progress: 93,
      typingContent: 'Identifying malignant tissue boundaries and surgical margins for precise oncological resection procedures...'
    }
  ]

  // Handle procedure cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % procedures.length)
      setCurrentCharIndex(0)
      setTypingText('')
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Handle typing animation
  useEffect(() => {
    const currentContent = procedures[currentIndex].typingContent
    if (currentCharIndex < currentContent.length) {
      const timeout = setTimeout(() => {
        setTypingText(currentContent.slice(0, currentCharIndex + 1))
        setCurrentCharIndex(prev => prev + 1)
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, currentCharIndex])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const features = [
    { icon: Zap, title: 'AI-Powered Analysis', desc: 'Automated video segmentation and content understanding' },
    { icon: Shield, title: 'HIPAA Compliant', desc: 'Secure handling of medical training content' },
    { icon: Users, title: 'Team Collaboration', desc: 'Role-based access for medical teams' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <Play className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">Lynq</span>
            </div>
            <div className="ml-10 mt-1">
              <span className="text-sm text-blue-300 font-medium animate-pulse opacity-60">
                Linking Medical Knowledge to AI
              </span>
            </div>
          </div>
          <button
            onClick={() => loginWithRedirect()}
            className="px-4 py-2 border border-blue-400 text-blue-400 rounded-lg hover:bg-blue-400 hover:text-slate-900 transition-all duration-200"
          >
            Sign In
          </button>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  MEDICAL
                  <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    TRAINING.
                  </span>
                  <span className="block text-gray-300 text-3xl lg:text-4xl font-normal">
                    Reimagined.
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                  Transform medical education with AI-powered video analysis, 
                  interactive assessments, and comprehensive training documentation 
                  for healthcare professionals.
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">LIVE PLATFORM</span>
                </div>
                <div className="text-gray-400 text-sm">
                  847 videos analyzed
                </div>
              </div>

              <button
                onClick={() => loginWithRedirect()}
                className="group bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Content */}
            <div className="space-y-6">
              {/* Animated Mock Interface */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="text-gray-400 text-sm ml-4 transition-all duration-500 ease-in-out">
                    {procedures[currentIndex].title}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Animated Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${procedures[currentIndex].progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Processing...</span>
                      <span>{procedures[currentIndex].progress}%</span>
                    </div>
                  </div>
                  
                  {/* Typing Animation Text */}
                  <div className="h-12 flex items-center">
                    <div className="text-sm text-gray-300 font-mono leading-relaxed">
                      {typingText}
                      <span className="animate-pulse">|</span>
                    </div>
                  </div>
                  
                  {/* Timestamp and Boxes Layout */}
                  <div className="flex items-center justify-between mt-6">
                    {/* Timestamp on the left */}
                    <div className="flex-shrink-0">
                      <div className="bg-slate-700/70 px-4 py-2 rounded-lg text-sm text-blue-300 font-medium transition-all duration-500">
                        {procedures[currentIndex].timestamp}
                      </div>
                    </div>
                    
                    {/* Animated Boxes on the right */}
                    <div className="flex space-x-2">
                      {[0, 1, 2].map((index) => (
                        <div 
                          key={index}
                          className={`w-16 h-12 rounded-lg transition-all duration-500 ease-in-out ${
                            index === currentIndex 
                              ? 'bg-blue-600 scale-105 shadow-lg' 
                              : 'bg-slate-700 scale-100'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <feature.icon className="w-6 h-6 text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              Copyright © 2025 Lynq. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="/security" className="text-gray-400 hover:text-white transition-colors">Security</a>
              <a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Login
