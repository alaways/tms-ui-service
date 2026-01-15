import { createHashRouter } from 'react-router-dom'

import BlankLayout from '../components/Layouts/BlankLayout'
import DefaultLayout from '../components/Layouts/DefaultLayout'
import CustomerLayout from '../components/Layouts/CustomerLayout'

import AuthRoute from './authRoute'
import { routes } from './routes'
import { overrideRoutes } from '../overrides/router/routes'

// const finalRoutes = routes.map((route) => {
//   if (route.layout === 'blank') {
//     return {
//       ...route,
//       element: <BlankLayout>{route.element}</BlankLayout>,
//     }
//   }
//   if (route.layout === 'customer') {
//     return {
//       ...route,
//       element: (
//         <AuthRoute
//           element={route.element}
//           layout={CustomerLayout}
//         />
//       ),
//     }
//   }
//   return {
//     ...route,
//     element: (
//       <AuthRoute
//         element={route.element}
//         layout={DefaultLayout}
//       />
//     ),
//   }
// })


// รวม routes ทั้งหมด โดย override จะทับ route ที่มี path ซ้ำ
const mergedMap = new Map()

// ใส่ routes ปกติก่อน
routes.forEach((route) => {
  mergedMap.set(route.path, route)
})

// ใส่ override route จะทับอันที่มี path เดียวกัน
overrideRoutes.forEach((route) => {
  mergedMap.set(route.path, route)
})

// ทำให้กลายเป็น array อีกครั้ง
const mergedRoutes = Array.from(mergedMap.values())

// Apply layout และ AuthRoute
const finalRoutes = mergedRoutes.map((route) => {
  if (route.layout === 'blank') {
    return {
      ...route,
      element: <BlankLayout>{route.element}</BlankLayout>,
    }
  }
  if (route.layout === 'customer') {
    return {
      ...route,
      element: (
        <AuthRoute
          element={route.element}
          layout={CustomerLayout}
        />
      ),
    }
  }
  return {
    ...route,
    element: (
      <AuthRoute
        element={route.element}
        layout={DefaultLayout}
      />
    ),
  }
})

const router = createHashRouter(finalRoutes)
export default router