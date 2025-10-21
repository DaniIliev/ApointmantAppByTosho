import { Clock, Zap, CheckCircle, CalendarCheck } from "lucide-react"; // Lucide Icons Import

export function HeroSection() {
  return (
    <section
      className="relative h-[550px] md:h-[650px] flex items-center justify-center overflow-hidden bg-background 
    md-clip-bottom-slant
    "
    >
      <div className="absolute inset-0 z-0">
        <img
          src="/appointDiHero.jpg"
          alt="Professional appointment booking"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/20 to-primary-dark/30" />
      </div>
      <div
        className="absolute w-32 h-32 flex flex-col items-center justify-center rounded-full bg-secondary/20 top-5 md:top-16 left-5 md:left-80 opacity-70 text-sm font-semibold text-white/90 shadow-xl p-2"
        style={{ animation: "float 20s ease-in-out infinite" }}
      >
        <Clock className="w-8 h-8 text-white mb-1" />
        <span className="text-sm tracking-wider">24/7</span>
      </div>

      {/* 2. Елемент "EASY BOOKING" (Плаващо движение) - Горе вдясно, близо до центъра */}
      <div
        className="absolute w-40 h-12 flex items-center justify-center rounded-full bg-accent/30 top-20 right-[5%] md:right-1/4 opacity-80 text-sm font-bold text-white shadow-xl px-4"
        style={{ animation: "float 20s ease-in-out infinite" }}
      >
        <CalendarCheck className="w-5 h-5 mr-2" />
        EASY BOOKING
      </div>

      {/* 3. Елемент "EFFORTLESS" (Въртеливо движение) - Долу вдясно */}
      <div
        className="absolute w-40 h-12 flex items-center justify-center rounded-full bg-white/20 bottom-27 right-5 md:right-80 opacity-70 text-sm font-semibold text-primary shadow-lg"
        style={{ animation: "float 20s ease-in-out infinite" }}
      >
        <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
        EFFORTLESS
      </div>

      {/* 4. Елемент "FAST" (Плаващо движение) - Долу вляво */}
      <div
        className="absolute w-28 h-28 flex flex-col items-center justify-center rounded-full bg-white/10 bottom-25 left-[10%] md:left-1/4 opacity-70 text-base font-bold text-white/90 shadow-md p-2 "
        style={{ animation: "float 25s ease-in-out infinite" }}
      >
        <Zap className="w-8 h-8 text-yellow-300 mb-1" />
        <span className="text-sm tracking-wider">FAST</span>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        {/* Title */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 text-balance font-sans
                     text-white animate-in fade-in slide-in-from-top-8 duration-700 [text-shadow:_0_4px_10px_rgb(0_0_0_/_0.5)]"
        >
          Book Your <span className="text-accent/80">Perfect Slot</span>
          <br className="sm:hidden" /> with AppointDI
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto text-balance
                     animate-in fade-in slide-in-from-top-8 duration-700 delay-150 [text-shadow:_0_2px_5px_rgb(0_0_0_/_0.5)]"
        >
          Secure services from top-rated businesses, available instantly.
        </p>
        <div className="mt-8 animate-in fade-in duration-700 delay-300">
          <button className="px-8 py-3 text-lg font-semibold bg-accent text-white rounded-full shadow-lg hover:bg-accent-dark transition duration-300 transform hover:scale-105">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
}
