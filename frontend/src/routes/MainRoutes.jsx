import { lazy } from 'react';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import EmployeeReport from 'views/pages/EmployeeReport';
import CourseReport from 'views/pages/CourseReport';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard')));
const Courses = Loadable(lazy(() => import('views/pages/Courses')));
const Certifications = Loadable(lazy(() => import('views/pages/Certifications')));
const AssignedCourses = Loadable(lazy(() => import('views/pages/AssignedCourses')));
// const Status = Loadable(lazy(() => import('views/pages/Status')));
const CoursesCompleted = Loadable(lazy(() => import('views/pages/CoursesCompleted')));
const CertificationsCompleted = Loadable(lazy(() => import('views/pages/CertificationsCompleted')));

const Requests = Loadable(lazy(() => import('views/pages/Requests')));
const AllCourses = Loadable(lazy(() => import('views/pages/AllCourses')));
const AddCourse = Loadable(lazy(() => import('views/pages/AddCourse')));

const MonthlyCourses = Loadable(lazy(() => import('views/pages/MonthlyCourses')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: '/',
      children: [
        {
          path: 'courses',
          element: <Courses />
        },
        {
          path: 'certifications',
          element: <Certifications />
        },
        {
          path: 'assigned-courses',
          element: <AssignedCourses />
        },
        // {
        //   path: 'status',
        //   element: <Status />
        // },
        {
          path: 'courses-completed',
          element: <CoursesCompleted />
        },
        {
          path: 'certifications-completed',
          element: <CertificationsCompleted />
        },
        {
          path: 'pending-requests',
          element: <Requests />
        },
        {
          path: 'all-courses',
          element: <AllCourses />
        },
        {
          path:'AllCourses/add-course',
          element: <AddCourse />
        },

        {
          path: '/monthly-courses',
          element: <MonthlyCourses />
        },
        // {
        //   path: '/MonthlyCourses/add-course',
        //   element: <AddCourse />,
        // }
        {
          path: 'employee-report',
          element: <EmployeeReport />
        },
        {
          path: 'course-report',
          element: <CourseReport />
        }
      ]
    }
  ]
};

export default MainRoutes;
