function ServiceCard({ title, description }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-8 text-center hover:shadow-2xl transition duration-300">

      <h3 className="text-2xl font-bold text-[#1a56db]">
        {title}
      </h3>

      <p className="mt-4 text-gray-600">
        {description}
      </p>

    </div>
  );
}

export default ServiceCard;