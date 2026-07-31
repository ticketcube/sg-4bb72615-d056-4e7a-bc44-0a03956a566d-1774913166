import { SEO } from "@/components/SEO";

export default function Home() {
  return (
    <>
      <SEO 
        title="Working Bear - StubHub Arts"
        description="Experience Working Bear on Maestro TV"
      />
      <div className="fixed inset-0 w-full h-full">
        <iframe 
          src="https://maestro.tv/working-bear?embed=theater"
          className="w-full h-full border-0"
          title="Working Bear on Maestro TV"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
        />
      </div>
    </>
  );
}