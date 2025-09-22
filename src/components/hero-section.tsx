export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-red-400">FANTASY</span>
          <span className="text-white">RED ZONE</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
          Your ultimate destination for fantasy football content, analysis, and insights. 
          Discover the latest videos, articles, and expert analysis to dominate your fantasy leagues!
        </p>
        
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors transform hover:scale-105">
          START DOMINATING NOW
        </button>
      </div>
    </section>
  );
}
