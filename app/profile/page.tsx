"use client"

import { useState } from "react"
import { User, Mail, Phone, MapPin, Camera, Palette } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State 12345",
    bio: "Professional appointment manager with 5+ years of experience.",
  })

  const [selectedPalette, setSelectedPalette] = useState("purple-blue")

  const colorPalettes = [
    {
      id: "purple-blue",
      name: "Purple Ocean",
      primary: "from-purple-500 to-blue-500",
      background: "from-slate-900 via-purple-900 to-slate-900",
      accent1: "bg-purple-500/30",
      accent2: "bg-blue-500/30",
      preview: "bg-gradient-to-r from-purple-500 to-blue-500",
    },
    {
      id: "emerald-teal",
      name: "Forest Depths",
      primary: "from-emerald-500 to-teal-500",
      background: "from-slate-900 via-emerald-900 to-slate-900",
      accent1: "bg-emerald-500/30",
      accent2: "bg-teal-500/30",
      preview: "bg-gradient-to-r from-emerald-500 to-teal-500",
    },
    {
      id: "orange-pink",
      name: "Sunset Glow",
      primary: "from-orange-500 to-pink-500",
      background: "from-slate-900 via-orange-900 to-slate-900",
      accent1: "bg-orange-500/30",
      accent2: "bg-pink-500/30",
      preview: "bg-gradient-to-r from-orange-500 to-pink-500",
    },
    {
      id: "cyan-violet",
      name: "Cyber Neon",
      primary: "from-cyan-400 to-violet-500",
      background: "from-slate-900 via-slate-800 to-slate-900",
      accent1: "bg-cyan-400/30",
      accent2: "bg-violet-500/30",
      preview: "bg-gradient-to-r from-cyan-400 to-violet-500",
    },
    {
      id: "rose-indigo",
      name: "Rose Gold",
      primary: "from-rose-400 to-indigo-500",
      background: "from-slate-900 via-rose-900 to-slate-900",
      accent1: "bg-rose-400/30",
      accent2: "bg-indigo-500/30",
      preview: "bg-gradient-to-r from-rose-400 to-indigo-500",
    },
  ]

  const currentPalette = colorPalettes.find((p) => p.id === selectedPalette) || colorPalettes[0]

  const handlePaletteChange = (paletteId: string) => {
    setSelectedPalette(paletteId)
    // Store in localStorage for persistence
    localStorage.setItem("selectedPalette", paletteId)
    // Apply theme to document root
    document.documentElement.setAttribute("data-theme", paletteId)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentPalette.background} p-6`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 ${currentPalette.accent1} rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 ${currentPalette.accent2} rounded-full blur-3xl animate-pulse delay-1000`}
        ></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h1
              className={`text-3xl font-bold bg-gradient-to-r ${currentPalette.primary} bg-clip-text text-transparent`}
            >
              Profile Settings
            </h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-2 bg-gradient-to-r ${currentPalette.primary} text-white rounded-xl hover:opacity-90 transition-all duration-200`}
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Picture */}
            <div className="md:col-span-1">
              <div className="relative">
                <div
                  className={`w-48 h-48 mx-auto bg-gradient-to-br ${currentPalette.primary}/20 rounded-full border border-white/20 flex items-center justify-center`}
                >
                  <User className="w-20 h-20 text-white/60" />
                </div>
                {isEditing && (
                  <button
                    className={`absolute bottom-4 right-4 p-3 bg-gradient-to-r ${currentPalette.primary} text-white rounded-full hover:opacity-90 transition-colors`}
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Theme
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {colorPalettes.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => handlePaletteChange(palette.id)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        selectedPalette === palette.id
                          ? "border-white/60 bg-white/10"
                          : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      <div className={`w-full h-8 rounded-lg ${palette.preview} mb-2`}></div>
                      <span className="text-white/80 text-sm font-medium">{palette.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={profile.name}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-current focus:outline-none transition-colors disabled:opacity-60 ${isEditing ? `focus:border-opacity-60 ${currentPalette.primary}` : ""}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-current focus:outline-none transition-colors disabled:opacity-60 ${isEditing ? `focus:border-opacity-60 ${currentPalette.primary}` : ""}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="tel"
                      value={profile.phone}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-current focus:outline-none transition-colors disabled:opacity-60 ${isEditing ? `focus:border-opacity-60 ${currentPalette.primary}` : ""}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={profile.address}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-current focus:outline-none transition-colors disabled:opacity-60 ${isEditing ? `focus:border-opacity-60 ${currentPalette.primary}` : ""}`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={profile.bio}
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-current focus:outline-none transition-colors disabled:opacity-60 resize-none ${isEditing ? `focus:border-opacity-60 ${currentPalette.primary}` : ""}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
