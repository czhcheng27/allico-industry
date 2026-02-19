function CatalogFooter() {
  return (
    <footer className="border-t-4 border-primary bg-gray-900 pb-8 pt-16 text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-black">
                <span className="material-symbols-outlined text-lg">precision_manufacturing</span>
              </div>
              <span className="font-display text-xl font-bold uppercase tracking-tighter">
                Allico Industries
              </span>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Industry leaders in towing, recovery, and heavy-duty industrial hardware
              since 1985. We build strength you can rely on.
            </p>
            <div className="flex space-x-4">
              <a className="text-gray-400 transition-colors hover:text-primary" href="#">
                <span className="material-symbols-outlined">social_leaderboard</span>
              </a>
              <a className="text-gray-400 transition-colors hover:text-primary" href="#">
                <span className="material-symbols-outlined">photo_camera</span>
              </a>
              <a className="text-gray-400 transition-colors hover:text-primary" href="#">
                <span className="material-symbols-outlined">smart_display</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-primary">
              Products
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Towing Chains
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Recovery Straps
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Winch Cables
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Hardware and Hooks
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Safety Lighting
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-primary">
              Customer Service
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  My Account
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Order Status
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Returns and Warranty
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-primary">
              Contact Info
            </h4>
            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5 text-lg text-primary">
                  location_on
                </span>
                <p>
                  4500 Industrial Blvd
                  <br />
                  Chicago, IL 60632
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-primary">phone</span>
                <a className="hover:text-white" href="tel:8885550123">
                  (888) 555-0123
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-primary">mail</span>
                <a className="hover:text-white" href="mailto:sales@allico.com">
                  sales@allico.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-gray-800 pt-8 text-center text-xs text-gray-500 md:flex-row md:text-left">
          <p>(c) 2026 Allico Industries. All rights reserved.</p>
          <div className="mt-4 flex space-x-6 md:mt-0">
            <a className="hover:text-gray-300" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-gray-300" href="#">
              Terms of Service
            </a>
            <a className="hover:text-gray-300" href="#">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { CatalogFooter };
