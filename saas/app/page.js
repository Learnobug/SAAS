"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Music, Users, Zap, Shield, ArrowRight } from "lucide-react"

export default function Home() {
  const [roomCode, setRoomCode] = useState("")
  const router = useRouter()

  function generateRoomCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleCreateRoom = async () => {
    const code = generateRoomCode()
    console.log(code)
    router.push(`/room/${code}`)
  }

  const handleJoinRoom = async () => {
    if (roomCode.length === 6) {
      router.push(`/room/${roomCode}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold">Music Hub</div>
          <div className="space-x-4">
            <a href="#features" className="hover:text-blue-400 transition duration-300">
              Features
            </a>
            <a href="#pricing" className="hover:text-blue-400 transition duration-300">
              Pricing
            </a>
            <a href="#contact" className="hover:text-blue-400 transition duration-300">
              Contact
            </a>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Welcome to Music Hub</h1>
          <p className="text-xl mb-8">Tune in Together, Vibe as One</p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleCreateRoom}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 flex items-center"
            >
              Create a Room <ArrowRight className="ml-2" size={20} />
            </button>
            <div className="flex">
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                type="text"
                placeholder="Enter room code"
                className="p-3 border border-gray-500 rounded-l-lg text-black w-48 shadow-md"
              />
              <button
                onClick={handleJoinRoom}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-r-lg shadow-md transition duration-300"
              >
                Join
              </button>
            </div>
          </div>
        </section>

        <section id="features" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Music size={40} />}
              title="Synchronized Playback"
              description="Listen to music in perfect sync with friends, no matter where you are."
            />
            <FeatureCard
              icon={<Users size={40} />}
              title="Collaborative Playlists"
              description="Create and edit playlists together in real-time."
            />
            <FeatureCard
              icon={<Zap size={40} />}
              title="Low Latency"
              description="Experience seamless playback with our optimized streaming technology."
            />
            <FeatureCard
              icon={<Shield size={40} />}
              title="Secure Rooms"
              description="Private, encrypted rooms ensure your listening sessions stay exclusive."
            />
          </div>
        </section>

        <section id="pricing" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              title="Basic"
              price="Free"
              features={[
                "Up to 5 listeners per room",
                "Standard audio quality",
                "Limited song selection",
                "Ad-supported",
              ]}
            />
            <PricingCard
              title="Pro"
              price="$9.99/month"
              features={[
                "Up to 20 listeners per room",
                "High-quality audio",
                "Unlimited song selection",
                "Ad-free experience",
                "Custom room themes",
              ]}
            />
            <PricingCard
              title="Enterprise"
              price="Contact Us"
              features={[
                "Unlimited listeners",
                "Ultra-high-quality audio",
                "Dedicated support",
                "API access",
                "Custom integrations",
              ]}
            />
          </div>
        </section>

        <section id="contact" className="text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="mb-4">Have questions? We're here to help!</p>
          <a
            href="mailto:support@musichub.com"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 inline-block"
          >
            Contact Us
          </a>
        </section>
      </main>

      <footer className="bg-gray-800 py-8 text-center">
        <p>&copy; 2023 Music Hub. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

function PricingCard({ title, price, features }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-4">{price}</p>
      <ul className="text-left mb-6">
        {features.map((feature, index) => (
          <li key={index} className="mb-2 flex items-center">
            <ArrowRight size={16} className="text-green-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 w-full">
        Choose Plan
      </button>
    </div>
  )
}

