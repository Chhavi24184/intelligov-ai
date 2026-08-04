// function Navbar() {
//   return (
//     <nav className="bg-[#0a1628] text-white flex justify-between items-center px-10 py-3 shadow-lg">
//       <h1 className="text-2xl font-bold text-white">IntelliGov AI</h1>

//       <ul className="flex items-center gap-8 font-medium">
//         <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">Home</li>
//         <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">Dashboard</li>
//         <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">About</li>
//         <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">Contact</li>
//       </ul>

//       <button className="bg-[#1a56db] px-5 py-2 rounded-lg hover:bg-blue-700">
//         Login
//       </button>
//     </nav>
//   );
// }

// export default Navbar;

// function Navbar() {
//   return (
//     <header className="w-full bg-[#081220] shadow-md">
//       <div className="max-w-7xl mx-auto h-16 flex items-center justify-center px-8">
//         <a href="#home" className="flex items-center gap-3">

//           <div className="w-10 h-10 rounded-full bg-[#1a56db] flex items-center justify-center text-white font-bold text-lg">
//             AI
//           </div>

//           <div>
//             <span className="text-sky-300 text-2xl font-bold">
//               IntelliGov
//             </span>{" "}
//             <span className="text-yellow-400 text-2xl font-bold">
//               AI
//             </span>
//           </div>

//         </a>

//         <ul className="flex items-right gap-8 text-white font-medium text-lg">

//           <li>
//             <a href="#home" className="hover:text-yellow-400 transition">
//               Home
//             </a>
//           </li>

//           <li>
//             <a href="#services" className="hover:text-yellow-400 transition">
//               Services
//             </a>
//           </li>

//           <li>
//             <a href="#about" className="hover:text-yellow-400 transition">
//               About
//             </a>
//           </li>

//           <li>
//             <a href="#contact" className="hover:text-yellow-400 transition">
//               Contact
//             </a>
//           </li>

//           <li>
//             <button className="bg-[#1a56db] px-5 py-2 rounded-lg hover:bg-blue-700 transition">
//               Login
//             </button>
//           </li>

//         </ul>

//       </div>
//     </header>
//   );
// }

// export default Navbar;



// function Navbar() {
//   return (
//     <header className="w-full bg-[#081220] shadow-md">
//       <div className="max-w-7xl mx-auto h-16 px-8 flex items-center justify-between">

//         {/* Logo */}

//         <a href="#home" className="flex items-center gap-3">

//           <div className="w-10 h-10 rounded-full bg-[#1a56db] flex items-center justify-center text-white font-bold">
//             AI
//           </div>

//           <div className="text-2xl font-bold">
//             <span className="text-sky-300">IntelliGov</span>{" "}
//             <span className="text-yellow-400">AI</span>
//           </div>

//         </a>

//         {/* Navigation */}
//         <nav>
//           <ul className="flex items-center gap-8 text-white font-medium">

//             <li>
//               <a
//                 href="#home"
//                 className="hover:text-yellow-400 transition duration-300"
//               >
//                 Home
//               </a>
//             </li>

//             <li>
//               <a
//                 href="#services"
//                 className="hover:text-yellow-400 transition duration-300"
//               >
//                 Services
//               </a>
//             </li>

//             <li>
//               <a
//                 href="#about"
//                 className="hover:text-yellow-400 transition duration-300"
//               >
//                 About
//               </a>
//             </li>

//             <li>
//               <a
//                 href="#contact"
//                 className="hover:text-yellow-400 transition duration-300"
//               >
//                 Contact
//               </a>
//             </li>

//             <li>
//               <button className="bg-[#1a56db] px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
//                 Login
//               </button>
//             </li>

//           </ul>
//         </nav>

//       </div>
//     </header>
//   );
// }

// export default Navbar;


import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="w-full bg-[#081220] shadow-md">
      <div className="max-w-7xl mx-auto h-16 px-8 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          <span className="text-sky-300">IntelliGov</span>{" "}
          <span className="text-yellow-400">AI</span>
        </Link>

        {/* Navigation */}
        <nav>
          <ul className="flex items-center gap-8 text-white font-medium">

            <li>
              <Link
                to="/"
                className="hover:text-yellow-400 transition"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/chat"
                className="hover:text-yellow-400 transition"
              >
                AI Chat
              </Link>
            </li>

            <li>
              <Link
                to="/schemes"
                className="hover:text-yellow-400 transition"
              >
                Schemes
              </Link>
            </li>

            <li>
              <Link
                to="/eligibility"
                className="hover:text-yellow-400 transition"
              >
                Eligibility
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard"
                className="hover:text-yellow-400 transition"
              >
                Dashboard
              </Link>
            </li>

            <li>
              <button className="bg-[#1a56db] px-5 py-2 rounded-lg hover:bg-blue-700 transition">
                Login
              </button>
            </li>

          </ul>
        </nav>

      </div>
    </header>
  );
}

export default Navbar;