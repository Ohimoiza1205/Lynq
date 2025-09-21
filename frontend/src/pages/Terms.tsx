import { Play, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const Terms = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> September 21, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Lynq's healthcare training platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Description</h2>
              <p className="text-gray-700 mb-4">
                Lynq provides AI-powered video analysis and interactive training tools for healthcare professionals, including automated transcription, content segmentation, and assessment generation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Ensure all uploaded content complies with applicable healthcare regulations</li>
                <li>Maintain confidentiality of patient information and medical data</li>
                <li>Use the platform solely for legitimate educational and training purposes</li>
                <li>Respect intellectual property rights of all content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content Ownership</h2>
              <p className="text-gray-700 mb-4">
                Users retain ownership of their uploaded content. Lynq processes content solely to provide requested services and does not claim ownership rights to user-generated materials.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability</h2>
              <p className="text-gray-700 mb-4">
                While we strive for continuous service availability, Lynq may experience scheduled maintenance or unexpected downtime. We are not liable for service interruptions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                For questions regarding these terms, contact us at{' '}
                <a href="mailto:legal@lynq.app" className="text-blue-600 hover:underline">
                  legal@lynq.app
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
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-blue-400 font-medium">Terms of Service</Link>
              <Link to="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Terms
