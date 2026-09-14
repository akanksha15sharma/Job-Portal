import {createBrowserRouter} from "react-router-dom";
import './App.css'
import AppLayout from "./layouts/app-Layout";
import LandingPage from "./pages/landing";
import Onboarding from "./pages/onboarding";
import JobListing from "./pages/job-listing";
import JobPage from "./pages/job-page";
import MyJobs from "./pages/my-jobs";
import PostJob from "./pages/post-job";
import SavedJobs from "./pages/saved-jobs";

const router = createBrowserRouter([
  {
    element:<AppLayout/>,
    children:[
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
  return <RouterProvider router={router} />;
}

export default App

{
        path:"/onboarding",
        element:<Onboarding/>,
      }
       {
        path:"/onboarding",
        element:<Onboarding/>,
      };
    

function App() {
  return <RouterProvider router={router} />;
}

export default App;
