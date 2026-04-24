import { motion } from "motion/react";
import { cn } from "../../lib/utils";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        {/* Outer glow */}
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "blur-2xl"
          )}
        />
        {/* Inner shape */}
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-3xl",
            "border border-white/[0.05]"
          )}
        />
        {/* Shimmer sweep */}
        <motion.div
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay + 1,
          }}
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export default function HeroGeometric({
  badge = "CreditAssist AI",
  title1 = "Intelligent Member Support",
  title2 = "Instant Resolution",
}) {
  return (
    <div className="relative min-h-[70vh] w-full flex items-center justify-center overflow-hidden"
      style={{ background: "#030303" }}
    >
      {/* Absolute background layer for shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top-left cluster */}
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.08]"
          className="top-[-10%] left-[-10%] md:left-[-5%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-violet-500/[0.08]"
          className="top-[15%] left-[5%] md:left-[10%]"
        />

        {/* Top-right cluster */}
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-blue-500/[0.08]"
          className="top-[5%] right-[-5%] md:right-[5%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-cyan-500/[0.06]"
          className="top-[25%] right-[10%] md:right-[15%]"
        />

        {/* Bottom-left */}
        <ElegantShape
          delay={0.7}
          width={350}
          height={90}
          rotate={-12}
          gradient="from-purple-500/[0.06]"
          className="bottom-[10%] left-[-5%] md:left-[5%]"
        />

        {/* Bottom-right */}
        <ElegantShape
          delay={0.5}
          width={450}
          height={110}
          rotate={15}
          gradient="from-indigo-400/[0.07]"
          className="bottom-[5%] right-[-10%] md:right-[0%]"
        />

        {/* Center accent */}
        <ElegantShape
          delay={0.8}
          width={250}
          height={70}
          rotate={5}
          gradient="from-sky-500/[0.05]"
          className="top-[45%] left-[40%]"
        />
      </div>

      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, #030303 75%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide"
            style={{
              background: "rgba(79, 124, 255, 0.08)",
              border: "1px solid rgba(79, 124, 255, 0.15)",
              color: "#4F7CFF",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {badge}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-3"
        >
          <span
            style={{
              background: "linear-gradient(135deg, #E8E8E8 0%, #a0a0a0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {title1}
          </span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #4F7CFF 0%, #6C5CE7 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {title2}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-sm md:text-base max-w-lg mx-auto"
          style={{ color: "#666" }}
        >
          Your AI-powered credit union assistant. Get instant answers about accounts, loans, payments, and more.
        </motion.p>
      </div>
    </div>
  );
}
