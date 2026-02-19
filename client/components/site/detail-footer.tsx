function DetailFooter() {
  return (
    <footer className="border-t-4 border-primary bg-surface-dark pb-8 pt-16 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-6">
              <div className="mb-1 font-display text-2xl font-black italic leading-none tracking-tighter">
                ALLICO <span className="not-italic text-primary">INDUSTRIES</span>
              </div>
              <div className="text-[10px] tracking-widest text-gray-400">ESTABLISHED 1985</div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Your trusted partner for heavy-duty industrial lifting solutions.
              Quality, Safety, and Reliability in every link.
            </p>
            <div className="flex space-x-4">
              <a className="text-gray-400 transition hover:text-primary" href="#">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a className="text-gray-400 transition hover:text-primary" href="#">
                <span className="material-symbols-outlined">mail</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wide text-primary">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a className="transition hover:text-white" href="#">
                  Chain Slings
                </a>
              </li>
              <li>
                <a className="transition hover:text-white" href="#">
                  Rigging Hardware
                </a>
              </li>
              <li>
                <a className="transition hover:text-white" href="#">
                  Hoist Rings
                </a>
              </li>
              <li>
                <a className="transition hover:text-white" href="#">
                  Safety Inspections
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wide text-primary">
              Customer Service
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a className="transition hover:text-white" href="#">
                  My Account
                </a>
              </li>
              <li>
                <a className="transition hover:text-white" href="#">
                  Order Status
                </a>
              </li>
              <li>
                <a className="transition hover:text-white" href="#">
                  Request Catalog
                </a>
              </li>
              <li>
                <a className="transition hover:text-white" href="#">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wide text-primary">
              Contact Allico
            </h4>
            <div className="space-y-4 text-sm text-gray-400">
              <p className="flex items-start">
                <span className="material-symbols-outlined mr-2 mt-1 text-sm text-primary">
                  location_on
                </span>
                100 Industrial Parkway
                <br />
                Cleveland, OH 44101
              </p>
              <p className="flex items-center">
                <span className="material-symbols-outlined mr-2 text-sm text-primary">phone</span>
                <a className="hover:text-white" href="#">
                  (888) 555-0199
                </a>
              </p>
              <p className="flex items-center">
                <span className="material-symbols-outlined mr-2 text-sm text-primary">email</span>
                <a className="hover:text-white" href="#">
                  sales@allicoind.com
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-gray-800 pt-8 text-xs text-gray-500 md:flex-row">
          <div className="mb-4 md:mb-0">(c) 2026 Allico Industries. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">lock</span>
            Secure Payment Processing
          </div>
        </div>
      </div>
    </footer>
  );
}

export { DetailFooter };
