function Button({ text }) {
  return (
    <button className="bg-[#1a56db] text-white px-8 py-3 rounded-lg hover:bg-blue-700">
      {text}
    </button>
  );
}

export default Button;