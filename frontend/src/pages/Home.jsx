// import ServiceCard from "../components/cards/ServiceCard";
// import Button from "../components/common/Button";
// import Footer from "../components/layout/Footer";

// function Home() {
//   return (
//     <>

//       {/* Hero Section */}

//       <section className="bg-gray-50 text-center py-24">

//         <h1 className="text-6xl font-bold text-[#0a1628]">
//           Welcome to IntelliGov AI
//         </h1>

//         <p className="text-xl text-gray-600 mt-6">
//           Your AI-powered Government Services Assistant
//         </p>

//         <div className="mt-10">
//           <Button text="Get Started" />
//         </div>

//       </section>



//       {/* Features */}

//       <section className="py-20 px-10">

//         <h2 className="text-4xl font-bold text-center text-[#0a1628] mb-12">
//           Our Services
//         </h2>

//         <div className="grid md:grid-cols-3 gap-8">

//           <ServiceCard
//           title="Government Schemes"
//           description="Find government welfare schemes based on your eligibility."/>

//           <ServiceCard
//           title="Scholarships"
//           description="Discover scholarships that match your profile."/>

//           <ServiceCard
//           title="Jobs & Internships"
//           description="Explore career opportunities and internships."/>

//         </div>

//       </section>

//       {/* About */}

//       <section className="bg-[#0a1628] text-white py-20 px-12">

//         <h2 className="text-4xl font-bold text-white mb-6 text-center">
//           About IntelliGov AI
//         </h2>

//         <p className="text-lg leading-8 text-gray-200 text-center max-w-5xl mx-auto">
//           IntelliGov AI is an intelligent government assistant that helps
//           citizens discover schemes, scholarships, jobs, and internships
//           through AI-powered recommendations. It simplifies access to
//           government services in one platform.
//         </p>

//       </section>

//       {/* Footer */}

//       <Footer />

//     </>
//   );
// }

// export default Home;

import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import About from "../components/home/About";
import Footer from "../components/layout/Footer";

function Home() {

  return (

    <>

      <Hero />

      <Features />

      <About />

      <Footer />

    </>

  );

}

export default Home;