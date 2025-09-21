import { Play, ArrowLeft, Shield, Lock, Eye, Server } from 'lucide-react'
import { Link } from 'react-router-dom'

const Security = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data is encrypted in transit and at rest using AES-256 encryption standards.'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliance',
      description: 'Full compliance with healthcare data protection regulations and audit trails.'
    },
    {
      icon: Eye,
      title: 'Access Controls',
      description: 'Role-based permissions with multi-factor authentication requirements.'
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Cloud infrastructure with SOC 2 Type II certification and 99.9% uptime.'
    }
  ]

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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Security & Compliance</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Lynq implements enterprise-grade security measures to protect sensitive healthcare data and ensure regulatory compliance.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
                  <feature.icon className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-700">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Protection</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>All video content encrypted with industry-standard AES-256 encryption</li>
                <li>Zero-knowledge architecture ensures only authorized users can access content</li>
                <li>Automated data backup with geographic redundancy</li>
                <li>Regular penetration testing and vulnerability assessments</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Compliance Standards</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>HIPAA (Health Insurance Portability and Accountability Act)</li>
                <li>SOC 2 Type II certification for security controls</li>
                <li>GDPR compliance for international users</li>
                <li>Regular third-party security audits and assessments</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Management</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Multi-factor authentication required for all accounts</li>
                <li>Role-based access controls with principle of least privilege</li>
                <li>Session management with automatic timeout policies</li>
                <li>Comprehensive audit logging for all user activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Incident Response</h2>
              <p className="text-gray-700 mb-4">
                Our security team maintains 24/7 monitoring and incident response capabilities. In the event of a security incident, we follow established protocols to contain, investigate, and remediate any issues while maintaining transparent communication with affected users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Report Security Issues</h2>
              <p className="text-gray-700">
                If you discover a security vulnerability, please report it responsibly to{' '}
                <a href="mailto:security@lynq.app" className="text-blue-600 hover:underline">
                  security@lynq.app
                </a>
                . We appreciate responsible disclosure and will work with you to address any issues promptly.
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
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/security" className="text-blue-400 font-medium">Security</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Security
