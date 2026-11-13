import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, Package, SearchCheck, Truck, Users } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';

export function CategoriesPage() {
  const { categories } = useStore();
  return (
    <div className="bg-white min-h-screen">
      <SeoHead
        title="Our Collection – DoN Tea Traders India Private Limited"
        description="Explore DoN Tea Traders single-origin Valparai tea collection: CTC Dust Tea, Granules Tea, and Leaf Tea."
      />
      <div className="bg-[#FFF7E5] border-b border-[#29251F]/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
            100% Single-Origin Valparai Tea
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mt-1">
            Our Collection
          </h1>
          <p className="text-sm text-[#29251F]/75 mt-2 max-w-2xl">
            Pure Origin. Natural Strength. Authentic Taste. Explore CTC Dust Tea, Granules Tea, and Leaf Tea — all manageable from the Admin Dashboard.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/shop?category=${cat.slug}`}
            className="group border border-[#29251F]/10 rounded-lg overflow-hidden bg-white flex flex-col hover:border-[#B82025]/40 transition-colors"
          >
            <div className="aspect-[4/3] bg-[#FFF7E5] overflow-hidden">
              <SafeImage
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-2xl font-bold text-[#29251F] group-hover:text-[#B82025]">
                  {cat.name}
                </h2>
                {cat.isDemo && (
                  <span className="text-[11px] text-[#29251F]/55">Demo Category</span>
                )}
              </div>
              <p className="mt-2.5 text-sm text-[#29251F]/75 leading-relaxed flex-1">
                {cat.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B82025]">
                <span>Explore Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OurStoryPage() {
  const { settings } = useStore();
  const story = settings?.cmsContent?.brandStory;
  return (
    <div className="bg-white">
      <SeoHead
        title="Our Story – DoN Tea Traders India Private Limited"
        description="Rooted in Valparai. Crafted by Nature. Learn about DoN Tea Traders India Private Limited and our 100% single-origin, unblended Valparai tea."
      />
      <div className="bg-[#FFF7E5] border-b border-[#29251F]/10 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
            From 7th Heaven Valparai · Our Story
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#29251F] mt-2">
            {story?.headline || 'Rooted in Valparai. Crafted by Nature.'}
          </h1>
          <p className="mt-4 text-lg text-[#29251F]/80 leading-relaxed max-w-3xl">
            {story?.shortIntro ||
              'Discover the authentic character of Valparai tea — naturally strong, rich in colour and full of refreshing flavour. At DoN Tea Traders, we bring you 100% single-origin, unblended Valparai tea. No Artificial Flavours. No Additives.'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="aspect-[16/9] rounded-xl overflow-hidden border border-[#29251F]/10">
          <SafeImage
            src={story?.imageUrl || 'asset:tasting'}
            alt="DoN Tea Traders Valparai tea selection"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-4 text-base text-[#29251F]/85 leading-relaxed whitespace-pre-line">
            {story?.fullStory}
          </div>
          <div className="md:col-span-4 bg-[#FFF7E5] p-6 rounded-lg border border-[#29251F]/10 h-fit space-y-4">
            <h2 className="font-display text-xl font-bold text-[#29251F]">
              Single-Origin Commitment
            </h2>
            <p className="text-xs text-[#29251F]/80 leading-relaxed">
              DoN Tea Traders India Private Limited brings you 100% single-origin, unblended Valparai tea from 7th Heaven Valparai — with no artificial flavours and no additives.
            </p>
            <Link
              to="/our-sourcing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B82025] hover:underline"
            >
              <span>Explore Our 5-Step Process</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OurSourcingPage() {
  const { settings } = useStore();
  const steps = settings?.cmsContent?.sourcingSteps || [];
  const icons = [Users, SearchCheck, ClipboardCheck, Package, Truck];

  return (
    <div className="bg-white">
      <SeoHead
        title="Our Sourcing & Quality Process – DON TRADERS"
        description="See how DON TRADERS selects tea manufacturers, evaluates tea lots, verifies specifications, packs under private label, and fulfils domestic and export enquiries."
      />
      <div className="bg-[#FFF7E5] border-b border-[#29251F]/10 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
            Sourcing &amp; Specification Process
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#29251F] mt-2">
            How We Select and Pack Don Traders Tea
          </h1>
          <p className="mt-4 text-base text-[#29251F]/80 max-w-3xl leading-relaxed">
            Every tea offered under DON TRADERS follows a structured five-step procurement, specification check, and private-label packaging workflow.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        {steps.map((step, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div
              key={step.step}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-10 border-b border-[#29251F]/10 last:border-0"
            >
              <div className="md:col-span-5 aspect-[4/3] rounded-lg overflow-hidden bg-[#FFF7E5] border border-[#29251F]/10">
                <SafeImage
                  src={step.imageUrl}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B82025]">
                  <Icon className="w-4 h-4" />
                  <span>Step 0{step.step}</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#29251F]">
                  {step.title}
                </h2>
                <p className="text-base text-[#29251F]/80 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TeaOriginsPage() {
  const { settings } = useStore();
  const origins = settings?.cmsContent?.teaOrigins || [];

  return (
    <div className="bg-white">
      <SeoHead
        title="Valparai Tea Origin & Grades – DoN Tea Traders India Private Limited"
        description="Discover 100% single-origin, unblended Valparai tea from 7th Heaven Valparai across CTC Dust Tea, Granules Tea, and Leaf Tea."
      />
      <div className="bg-[#FFF7E5] border-b border-[#29251F]/10 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
            From 7th Heaven Valparai
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#29251F] mt-2">
            Single-Origin Valparai Tea
          </h1>
          <p className="mt-4 text-base text-[#29251F]/80 max-w-3xl">
            Naturally Valparai. Truly DoN. All origin notes are editable in the Admin Dashboard.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="aspect-[16/9] max-h-[440px] rounded-xl overflow-hidden mb-12 border border-[#29251F]/10">
          <SafeImage
            src="asset:plantation"
            alt="Indian hillside tea plantations at sunrise"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {origins.map((o) => (
            <div
              key={o.id}
              className="border border-[#29251F]/10 rounded-lg overflow-hidden bg-white flex flex-col"
            >
              <div className="aspect-[16/9] bg-[#FFF7E5] overflow-hidden">
                <SafeImage
                  src={o.imageUrl}
                  alt={o.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs text-[#B82025] font-semibold">
                  <span>{o.region}</span>
                  {o.isDemo && <span className="text-[#29251F]/50">Editable Profile</span>}
                </div>
                <h2 className="font-display text-2xl font-bold text-[#29251F] mt-1">
                  {o.name}
                </h2>
                <p className="mt-3 text-sm text-[#29251F]/80 leading-relaxed flex-1">
                  {o.description}
                </p>
                <p className="mt-4 pt-3 border-t border-[#29251F]/10 text-xs font-medium text-[#29251F]">
                  Typical Cup Profile:{' '}
                  <span className="text-[#29251F]/70">{o.flavorProfile}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
