import { useAuth0 } from '@auth0/auth0-react'

export interface User {
  id: string
  email: string
  name: string
  role: 'uploader' | 'reviewer' | 'admin'
  picture?: string
}

export const useAuthService = () => {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0()

  const login = () => {
    loginWithRedirect()
  }

  const logoutUser = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
  }

  const getToken = async () => {
    try {
      return await getAccessTokenSilently()
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }

  const user: User | null = auth0User ? {
    id: auth0User.sub || '',
    email: auth0User.email || '',
    name: auth0User.name || '',
    role: auth0User['https://lynq.app/role'] || 'uploader',
    picture: auth0User.picture,
  } : null

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout: logoutUser,
    getToken,
  }
}
