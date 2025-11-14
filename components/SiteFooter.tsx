import Container from "./Container";
import Link from "next/link";

const link = "hover:text-white/90 text-white/80";

export default function SiteFooter() {
  return (
    <footer className="bg-[#172965] text-white mt-12">
      <Container>
        {/* Top row */}
        <div className="py-10 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">Resourcin Human Capital Advisors</h3>
            <p className="mt-2 text-white/80 text-sm max-w-md">
              Connecting talent with opportunity — tech-driven recruitment, EOR, and HR advisory.
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/services" className={link}>Services</Link></li>
              <li><Link href="/jobs" className={link}>Jobs</Link></li>
              <li><Link href="/insights" className={link}>Insights</Link></li>
              <li><Link href="/about" className={link}>About</Link></li>
              <li><Link href="/contact" className={link}>Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="mailto:hello@resourcin.com" className={link}>hello@resourcin.com</a>
              </li>
              <li>
                <a href="tel:+2347045582393" className={link}>+234 704 558 2393</a>
              </li>
            </ul>

            {/* Tiny social row */}
            <div className="mt-4 flex items-center gap-4">
              <Link href="https://www.linkedin.com/company/resourcin" target="_blank" className="text-white/80 hover:text-white" aria-label="LinkedIn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path fill="currentColor" d="M6.94 8.5H4V20h2.94V8.5Zm.2-4.25a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0ZM20 20h-2.89v-5.59c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95V20H10.2V8.5h2.77v1.57h.04c.39-.73 1.33-1.5 2.73-1.5 2.92 0 3.46 1.92 3.46 4.41V20Z"/></svg>
              </Link>
              <Link href="https://x.com/resourcinhq" target="_blank" className="text-white/80 hover:text-white" aria-label="X">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path fill="currentColor" d="M18.244 3H21l-6.5 7.43L22 21h-5.9l-4.62-5.53L6.2 21H3l7.03-8.03L2.8 3h6.02l4.18 4.98L18.244 3Zm-2.064 16h1.64L7.9 5h-1.7l9.98 14Z"/></svg>
              </Link>
              <Link href="https://www.instagram.com/resourcinhq/" target="_blank" className="text-white/80 hover:text-white" aria-label="Instagram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.75-3.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z"/></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-4 border-t border-white/15 text-xs text-white/70 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Resourcin Human Capital Advisors</span>
          <span>Built for clarity • No fluff</span>
        </div>
      </Container>
    </footer>
  );
}
