import ChatWidget from "./components/ChatWidget";
import './App.css'

function App() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">QT</div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">Quality Thought Insurance Center</h1>
              <p className="text-sm text-gray-500">Trusted coverage. Clear answers. Human support.</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-brand-700">Plans</a>
            <a href="#" className="hover:text-brand-700">Claims</a>
            <a href="#" className="hover:text-brand-700">Support</a>
            <a href="#" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700">
              Get a Quote
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Insurance made simple, support made personal.
            </h2>
            <p className="mt-4 text-gray-600">
              We help individuals and families find the right plan — health, life, and beyond.
              Chat with a licensed agent anytime from the widget on the right.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#" className="px-5 py-3 rounded-lg bg-brand-600 text-white hover:bg-brand-700">Explore Plans</a>
              <a href="#" className="px-5 py-3 rounded-lg border border-gray-300 hover:border-brand-600 hover:text-brand-700">How it works</a>
            </div>
            <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500"></span>
              Agents online now
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-2xl p-6 border">
            <h3 className="text-lg font-semibold">Why choose us</h3>
            <ul className="mt-4 space-y-3 text-gray-700">
              <li className="flex gap-3"><span className="mt-1">✅</span> Transparent pricing and no hidden fees</li>
              <li className="flex gap-3"><span className="mt-1">✅</span> Compare top providers in minutes</li>
              <li className="flex gap-3"><span className="mt-1">✅</span> Dedicated human support 7 days a week</li>
              <li className="flex gap-3"><span className="mt-1">✅</span> Paperless claims and quick updates</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <article className="bg-white border rounded-2xl p-6">
            <h4 className="font-semibold text-lg">Health Insurance</h4>
            <p className="mt-2 text-gray-600">Flexible plans for individuals and families with cashless hospitalization.</p>
            <a href="#" className="mt-4 inline-flex text-brand-700 hover:underline">Learn more →</a>
          </article>

          <article className="bg-white border rounded-2xl p-6">
            <h4 className="font-semibold text-lg">Life Insurance</h4>
            <p className="mt-2 text-gray-600">Term and whole life coverage with easy riders and benefits.</p>
            <a href="#" className="mt-4 inline-flex text-brand-700 hover:underline">Learn more →</a>
          </article>

          <article className="bg-white border rounded-2xl p-6">
            <h4 className="font-semibold text-lg">Accident & Critical Illness</h4>
            <p className="mt-2 text-gray-600">Financial protection when you need it most, with quick claims.</p>
            <a href="#" className="mt-4 inline-flex text-brand-700 hover:underline">Learn more →</a>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-gray-500">
          © {new Date().getFullYear()} Quality Thought Insurance Center. All rights reserved.
        </div>
      </footer>

      {/* Chat */}
      <ChatWidget />
    </div>
  );
}

export default App
