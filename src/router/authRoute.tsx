import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const mode = process.env.MODE || 'admin'

const AuthRoute = ({ element: Element, layout: Layout, ...rest }: any) => {
  const navigate = useNavigate()
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem(mode)
        const token = storedUser ? JSON.parse(storedUser).access_token : null
        if (!token) {
          navigate('/apps/login')
        }
      } catch (error: any) {
        console.error(error.message)
      }
    }
    checkAuth()
  }, [])
  return <Layout>{Element}</Layout>
}

export default AuthRoute