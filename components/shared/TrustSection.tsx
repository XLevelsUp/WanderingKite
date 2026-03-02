export function TrustSection() {
  return (
    <section className='border-y border-primary/10 py-16'>
      <div className='container mx-auto px-6'>
        <div className='grid gap-12 md:grid-cols-3'>
          {/* Trusted By */}
          <div>
            <h3 className='mb-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-75'>
              Trusted By
            </h3>
            <div className='flex flex-wrap gap-3'>
              {['100+ Clients', '500+ Projects'].map((label) => (
                <div
                  key={label}
                  className='
                    rounded-xl border border-primary/15
                    bg-primary/6
                    px-5 py-2.5 text-sm font-medium text-foreground/75
                  '
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Google Reviews */}
          <div>
            <h3 className='mb-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-75'>
              Client Reviews
            </h3>
            <div className='flex items-center gap-4'>
              <span className='text-4xl font-bold text-white'>4.9</span>
              <div>
                <div className='text-lg text-primary'>★★★★★</div>
                <p className='text-sm text-foreground/55'>Google Reviews</p>
              </div>
            </div>
          </div>

          {/* Premium Gear */}
          <div>
            <h3 className='mb-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-75'>
              Premium Gear
            </h3>
            <div className='flex flex-wrap gap-2'>
              {['Sony', 'Canon', 'Nikon', 'Rode'].map((brand) => (
                <span
                  key={brand}
                  className='
                    rounded-full border border-primary/20
                    bg-primary/7
                    px-4 py-1.5 text-sm text-foreground/75
                    transition-all duration-200
                    hover:border-primary/40 hover:opacity-100 hover:text-primary
                  '
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
