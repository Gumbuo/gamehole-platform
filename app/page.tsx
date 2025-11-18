export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            GameHole
          </h1>
          <p className="text-2xl text-gray-300">
            Free Game Hosting for Developers
          </p>
        </header>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Host Your Games. Zero Cost. Zero Limits.
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Built by developers, for developers. Upload your HTML5 games, Unity WebGL builds,
            or any web-based game and share them with the world instantly.
          </p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
            Coming Soon - Join Waitlist
          </button>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2 text-white">Instant Deploy</h3>
            <p className="text-gray-300">
              Upload your game and go live in seconds. No complicated setup required.
            </p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2 text-white">100% Free</h3>
            <p className="text-gray-300">
              No hidden fees, no storage limits, no bandwidth caps. Host as many games as you want.
            </p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-2 text-white">All Game Types</h3>
            <p className="text-gray-300">
              HTML5, Unity WebGL, Godot, Phaser, or custom engines. If it runs in a browser, we host it.
            </p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2 text-white">Fast CDN</h3>
            <p className="text-gray-300">
              Global content delivery network ensures your games load fast anywhere in the world.
            </p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold mb-2 text-white">Custom URLs</h3>
            <p className="text-gray-300">
              Get clean, shareable URLs for your games. Perfect for portfolios and sharing.
            </p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
            <div className="text-4xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold mb-2 text-white">Dev-Friendly</h3>
            <p className="text-gray-300">
              Built by indie developers who understand your needs. Simple, powerful, no BS.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Share Your Games?
          </h2>
          <p className="text-gray-300 mb-6">
            We're building something special for the indie game dev community.
            Sign up for early access and be the first to know when we launch.
          </p>
          <div className="flex gap-4 justify-center">
            <input
              type="email"
              placeholder="your@email.com"
              className="px-6 py-3 rounded-lg bg-gray-800 border border-purple-500 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 w-64"
            />
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Notify Me
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500">
          <p>GameHole.ink - Made with ❤️ for indie game developers</p>
        </footer>
      </div>
    </main>
  );
}
