import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './App.css'
import AppLayout from "./layouts/app-Layout";
import { lazy } from 'react';
import { NotFound, RouteError } from './components/route-feedback';
const JobAlerts = lazy(() => import('./pages/job-alerts'));
const Notifications = lazy(() => import('./pages/notifications'));
const Profile = lazy(() => import('./pages/profile'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const LandingPage = lazy(() => import('./pages/landing'));
const Onboarding = lazy(() => import('./pages/onboarding'));
const JobListing = lazy(() => import('./pages/job-listing'));
const JobPage = lazy(() => import('./pages/job-page'));
const MyJobs = lazy(() => import('./pages/my-job'));
const PostJob = lazy(() => import('./pages/post-job'));
const SavedJobs = lazy(() => import('./pages/saved-job'));
import { ThemeProvider } from "./components/ui/theme-provider";

const router = createBrowserRouter([
  {
    element:<AppLayout/>,
    errorElement: <RouteError />,
    children:[
      { path: "*", element: <NotFound /> },
      { path: "/alerts", element: <JobAlerts /> },
      { path: "/notifications", element: <Notifications /> },
      { path: "/profile", element: <Profile /> },
      { path: "/dashboard", element: <Dashboard /> },
      {
        path:"/",
        element:<LandingPage/>
      },
      {
        path:"/onboarding",
        element:<Onboarding/>,
      },
     {
        path:"/jobs",
        element:<JobListing/>,
      },
      {
        path:"/job/:id",
        element:<JobPage/>,
      },
      {
        path:"/my-jobs",
        element:<MyJobs/>,
      },
      {
        path:"/post-job",
        element:<PostJob/>,
      },
      {
        path:"/saved-jobs",
        element:<SavedJobs/>,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;


