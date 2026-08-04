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

import Sidebar from "../components/dashboard/Sidebar";

function Dashboard() {
  return (
    <div className="flex bg-[#0a1628] h-screen overflow-hidden">
      
      <Sidebar />

      <main className="flex-1 p-6 overflow-hidden">

      </main>

    </div>
  );
}

export default Dashboard;