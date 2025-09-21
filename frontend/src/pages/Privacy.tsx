import { Play, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-slate-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/login" className="flex items-center space-x-2">
            <Play className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">Lynq</span>
          </Link>
          <Link 
            to="/login"
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> January 1, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                Lynq collects information to provide healthcare training services while maintaining the highest standards of data protection and HIPAA compliance.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Account information including name, email, and institutional affiliation</li>
                <li>Video content uploaded for analysis and training purposes</li>
                <li>Usage analytics and learning progress data</li>
                <li>System logs for security and performance monitoring</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide AI-powered video analysis and training features</li>
                <li>Generate personalized learning assessments and progress tracking</li>
                <li>Ensure platform security and prevent unauthorized access</li>
                <li>Improve our services through aggregated usage analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">HIPAA Compliance</h2>
              <p className="text-gray-700 mb-4">
                Lynq maintains strict HIPAA compliance for all medical training content. We implement administrative, physical, and technical safeguards to protect protected health information (PHI).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 mb-4">
                We employ industry-standard encryption, secure cloud infrastructure, and regular security audits to protect your data. All video content is stored in encrypted format with restricted access controls.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                For privacy-related questions or to exercise your data rights, contact us at{' '}
                <a href="mailto:privacy@lynq.app" className="text-blue-600 hover:underline">
                  privacy@lynq.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              Copyright © 2025 Lynq. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-blue-400 font-medium">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Privacy
