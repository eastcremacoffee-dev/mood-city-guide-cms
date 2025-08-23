'use client'

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">CMS Simple - Funcionando</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado del Sistema</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded">
              <div className="text-green-800 font-medium">✅ API Backend</div>
              <div className="text-green-600 text-sm">Funcionando correctamente</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-green-800 font-medium">✅ Supabase</div>
              <div className="text-green-600 text-sm">Conectado y operacional</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Enlaces Directos</h2>
          <div className="space-y-2">
            <a 
              href="/api/health" 
              target="_blank"
              className="block p-3 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
            >
              🔍 Health Check API
            </a>
            <a 
              href="/api/cities" 
              target="_blank"
              className="block p-3 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
            >
              🏙️ API Ciudades
            </a>
            <a 
              href="/api/cafeterias" 
              target="_blank"
              className="block p-3 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
            >
              ☕ API Cafeterías
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
