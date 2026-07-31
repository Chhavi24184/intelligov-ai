function Navbar() {
  return (
    <nav className="bg-[#0a1628] text-white flex justify-between items-center px-10 py-5 shadow-lg">
      <h1 className="text-2xl font-bold text-yellow-400">IntelliGov AI</h1>

      <ul className="flex items-center gap-8 font-medium">
        <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">Home</li>
        <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">Dashboard</li>
        <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">About</li>
        <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">Contact</li>
      </ul>

      <button className="bg-[#1a56db] px-5 py-2 rounded-lg hover:bg-blue-700">
        Login
      </button>
    </nav>
  );
}

export default Navbar;

