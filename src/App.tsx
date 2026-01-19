import { PropsWithChildren, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleRTL, toggleTheme, toggleLocale, toggleMenu, toggleLayout, toggleAnimation, toggleNavbar, toggleSemidark, setSidebarActive, setPageTitle } from './store/themeConfigSlice'
import { store, IRootState } from './store'
import { messaging } from './../firebase-config'
import { getToken, onMessage } from "firebase/messaging"
import themeInit from './theme.init'

function App({ children }: PropsWithChildren) {
  // const deploy = process?.env?.DEPLOY ?? 'dev'
  // if (deploy == 'prod') {
  //    console.log = function () {};
  // }
  const themeConfig = useSelector((state: IRootState) => state.themeConfig)
  const dispatch = useDispatch()

  useEffect(() => {
    setPageTitle(themeInit.name)
    const requestPermission = async () => {
      try {
        const permission = Notification.permission
        if (permission === 'default') {
          const status = await Notification.requestPermission()
          if (status === 'granted') {
            // Get FCM token
            const token = await getToken(messaging, {
              vapidKey: "BE95a0gEJhpQ4kuY8NhKeQ-BttmP3Cm4I0MNh-hQ_flCeFvm2qtm9TC1FSnbWeqPuieE14pHn61IjnMLWqvWBCc"
            })
          }
        } else if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: "BE95a0gEJhpQ4kuY8NhKeQ-BttmP3Cm4I0MNh-hQ_flCeFvm2qtm9TC1FSnbWeqPuieE14pHn61IjnMLWqvWBCc"
          })
          if (token) {
            localStorage.setItem('FCM_TOKEN', token)
          }
        }
      } catch (error) {
        // console.error('Error getting FCM token', error)
      }
    }
    requestPermission()
  }, [])

  useEffect(() => {
    const handleIncomingMessages = () => {
      onMessage(messaging, (payload: any) => {
      })
    }
    handleIncomingMessages()
  }, [])

  useEffect(() => {
    dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme))
    dispatch(toggleMenu(localStorage.getItem('menu') || themeConfig.menu))
    dispatch(toggleLayout(localStorage.getItem('layout') || themeConfig.layout))
    dispatch(toggleRTL(localStorage.getItem('rtlClass') || themeConfig.rtlClass))
    dispatch(toggleAnimation(localStorage.getItem('animation') || themeConfig.animation))
    dispatch(toggleNavbar(localStorage.getItem('navbar') || themeConfig.navbar))
    dispatch(toggleLocale(localStorage.getItem('i18nextLng') || themeConfig.locale))
    dispatch(toggleSemidark(localStorage.getItem('semidark') || themeConfig.semidark))
    dispatch(setSidebarActive(localStorage.getItem('sidebarActive') || themeConfig.sidebarActive))
  }, [dispatch, themeConfig.theme, themeConfig.menu, themeConfig.layout, themeConfig.rtlClass, themeConfig.animation, themeConfig.navbar, themeConfig.locale, themeConfig.semidark])
  return (
    <div className={`${(store.getState().themeConfig.sidebar && 'toggle-sidebar') || ''} ${themeConfig.menu} ${themeConfig.layout} ${themeConfig.rtlClass} main-section antialiased relative text-sm font-normal`}>
      {children}
    </div>
  )
}
export default App