export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className + " text-primary"}
      >
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    </div>
  )
}

export function LogoWithText({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className="flex items-center">
      <Logo className={className} />
      <span className="ml-2 font-bold text-xl">Corelio</span>
    </div>
  )
}
