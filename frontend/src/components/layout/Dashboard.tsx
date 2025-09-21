import { useEffect } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface DashboardProps {
  children: React.ReactNode
}

const Dashboard = ({ children }: DashboardProps) => {
  useEffect(() => {
    // Initialize dark mode based on system preference or saved preference
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
