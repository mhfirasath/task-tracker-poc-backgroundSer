import { useEffect, useState } from 'react'

import App from './App.tsx'
import AdminApp from './components/AdminApp.tsx'

const isAdminHash = () => window.location.hash.startsWith('#/admin')

// The admin console lives at /#/admin so it needs no server-side route.
function Root() {
  const [isAdminRoute, setIsAdminRoute] = useState(isAdminHash)

  useEffect(() => {
    const onHashChange = () => setIsAdminRoute(isAdminHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return isAdminRoute ? <AdminApp /> : <App />
}

export default Root
