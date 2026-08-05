// function Dashboard() {
//   return (

//     <div className="p-10">

//       <h1 className="text-4xl font-bold text-[#0a1628]">

//         Dashboard

//       </h1>

//       <div className="grid md:grid-cols-3 gap-6 mt-10">

//         <div className="bg-white shadow-lg p-8 rounded-xl">

//           Government Schemes

//         </div>

//         <div className="bg-white shadow-lg p-8 rounded-xl">

//           Scholarships

//         </div>

//         <div className="bg-white shadow-lg p-8 rounded-xl">

//           Profile

//         </div>

//       </div>

//     </div>

//   );
// }

// export default Dashboard;



import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Sidebar from "../components/dashboard/Sidebar";
import StatsCards from "../components/dashboard/StatsCards";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import WelcomeSection from "../components/dashboard/WelcomeSection";
import AIAssistantCard from "../components/dashboard/AIAssistantCard";


function Dashboard() {
  return (
    <div className="flex bg-[#0a1628] h-screen overflow-hidden">
      
      <Sidebar />

      <main className="flex-1 bg-[#0a1628] p-4 overflow-hidden">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sky-300 hover:text-white transition mb-3"
        >
          ← Back
        </Link>

        <WelcomeSection />

        <StatsCards />

        <AIAssistantCard />

      </main>

    </div>
  );
}

export default Dashboard;