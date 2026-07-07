import Link from 'next/link';

const navigation = {
  solutions: [
    { name: 'For Job Seekers', href: '/applicants' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contacts' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Use', href: '/terms' },
  ],
};

// Tech-inspired footer background
const TechFooterPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-900/10 to-transparent"></div>
    
    {/* Circuit-like lines */}
    <svg className="absolute bottom-0 left-0 w-full text-indigo-500/5" height="150" viewBox="0 0 1440 150">
      <path d="M0,128 L1440,32" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M0,96 L1440,64" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M0,64 L1440,96" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M0,32 L1440,128" stroke="currentColor" strokeWidth="0.5" fill="none" />
      
      {/* Connection nodes */}
      {[...Array(12)].map((_, i) => (
        <circle 
          key={i} 
          cx={i * 120 + 60} 
          cy={(i % 2 === 0 ? 45 : 105)} 
          r="2" 
          fill="currentColor"
        />
      ))}
    </svg>
  </div>
);

export default function Footer() {
  return (
    <footer className="relative bg-black" aria-labelledby="footer-heading">
      <TechFooterPattern />
      
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-8 sm:pb-12 pt-16 sm:pt-20 lg:px-8 lg:pt-24 relative z-10">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6 sm:space-y-8">
            <Link href="/" className="inline-block relative group">
              <span className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 transition-all duration-300">
                Pass.hr
              </span>
              <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-orange-500/5 via-yellow-500/5 to-orange-500/5 blur opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
            </Link>
            <p className="text-sm sm:text-base leading-6 sm:leading-7 text-gray-300 max-w-md">
              AI-powered career platform that helps job seekers find better opportunities and optimize their careers.
            </p>
            
            <div className="flex space-x-6">
              {/* Social media icons */}
              <a href="#" className="text-gray-400 hover:text-orange-400">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="mt-12 sm:mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Solutions</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.solutions.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-orange-400 transition-colors duration-200">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-orange-400 transition-colors duration-200">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-orange-400 transition-colors duration-200">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Get Started</h3>
                <div className="mt-6 space-y-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center rounded-md bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 px-4 py-2 text-sm font-medium text-black shadow-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 border-t border-gray-700 pt-8 sm:mt-20 lg:mt-24 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs leading-5 text-gray-400">
            &copy; {new Date().getFullYear()} Pass.hr. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs leading-5 text-gray-400 hover:text-orange-400 transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs leading-5 text-gray-400 hover:text-orange-400 transition-colors duration-200">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 