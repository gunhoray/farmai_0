import Navigation from "~/common/components/navagation";

export function loader() {
  return {};
}

export function action() {
  return {};
}

export function meta() {
  return [
    { title: "FarmAI - AI Farm Consulting" },
    { name: "description", content: "Easy and exact management of your farm with AI consulting" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/main_image.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/10 to-background" />
      </div>

      {/* Content */}
      <div className="relative">
        <Navigation />
        <main className="container mx-auto px-4 pt-24">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <h1 className="pt-40 text-8xl font-bold tracking-tight mb-3 text-center text-white">
              AI farm consulting
            </h1>
            <p className="py-10 text-4xl text-white/90 mb-8 text-center">
              Easy and exact management of your farm
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}