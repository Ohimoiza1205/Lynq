import { Play, ArrowLeft, Mail, MapPin, Phone, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const Contact = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: 'General Inquiries',
      content: 'info@lynq.app',
      description: 'For general questions and support'
    },
    {
      icon: Phone,
      title: 'Sales & Partnerships',
      content: '+1 (806) 559-6366',
      description: 'Discuss enterprise solutions'
    },
    {
      icon: MapPin,
      title: 'Headquarters',
      content: 'Houston, Texas, USA',
      description: 'HackRice 2025'
    },
    {
      icon: Clock,
      title: 'Support Hours',
      content: '24/7 Platform Support',
      description: 'Business hours: 8AM - 6PM CST'
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Get in touch with our team for support, partnership opportunities, or to learn more about Lynq's healthcare training solutions.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {contactMethods.map((method, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
                  <method.icon className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{method.title}</h3>
                    <p className="text-blue-600 font-medium mb-1">{method.content}</p>
                    <p className="text-gray-700 text-sm">{method.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Specialized Support</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Technical Support</h3>
                    <p className="text-gray-700 text-sm">Platform issues and technical assistance</p>
                  </div>
                  <a href="mailto:support@lynq.app" className="text-blue-600 hover:underline font-medium">
                    support@lynq.app
                  </a>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Security Issues</h3>
                    <p className="text-gray-700 text-sm">Report vulnerabilities and security concerns</p>
                  </div>
                  <a href="mailto:security@lynq.app" className="text-blue-600 hover:underline font-medium">
                    security@lynq.app
                  </a>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Privacy & Legal</h3>
                    <p className="text-gray-700 text-sm">Data protection and legal inquiries</p>
                  </div>
                  <a href="mailto:legal@lynq.app" className="text-blue-600 hover:underline font-medium">
                    legal@lynq.app
                  </a>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Enterprise Solutions</h2>
              <p className="text-gray-700 mb-4">
                Interested in implementing Lynq across your healthcare organization? Our enterprise team can help you with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Custom deployment and integration options</li>
                <li>Volume pricing and institutional licenses</li>
                <li>Dedicated support and training programs</li>
                <li>Advanced security and compliance configurations</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Contact our enterprise team at{' '}
                <a href="mailto:enterprise@lynq.app" className="text-blue-600 hover:underline">
                  enterprise@lynq.app
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Response Times</h2>
              <p className="text-gray-700 mb-4">
                We strive to respond to all inquiries promptly. Typical response times:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Technical support: Within 4 hours during business hours</li>
                <li>General inquiries: Within 24 hours</li>
                <li>Security issues: Within 2 hours</li>
                <li>Enterprise sales: Within 1 business day</li>
              </ul>
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
              <Link to="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link>
              <Link to="/contact" className="text-blue-400 font-medium">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Contact
