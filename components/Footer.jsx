export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Spatial Risk Analyzer</h3>
            <p className="text-gray-400 text-sm">
              A Web GIS application for identifying settlements located in high-risk flood zones
              using MySQL spatial functions and interactive mapping.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Technology Stack</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Next.js 14 + React</li>
              <li>• MySQL with GIS Functions</li>
              <li>• Leaflet.js for Mapping</li>
              <li>• phpMyAdmin for Database</li>
              <li>• Tailwind CSS</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Real-time Spatial Analysis</li>
              <li>• Interactive Risk Visualization</li>
              <li>• GeoJSON Data Import/Export</li>
              <li>• Settlement Risk Classification</li>
              <li>• Database-driven Results</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Spatial Risk Analyzer - Web GIS Project</p>
          <p className="mt-2">Academic Project for Flood Risk Assessment</p>
        </div>
      </div>
    </footer>
  );
}