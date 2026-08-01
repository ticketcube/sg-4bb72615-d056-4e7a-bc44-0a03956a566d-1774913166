import { SEO } from "@/components/SEO";

export default function Home() {
  return (
    <>
      <SEO 
        title="StubHub Arts"
       
      />
      <div className="fixed inset-0 w-full h-full">
        <iframe 
          src="https://maestro.tv/working-bear?embed=theater"
          className="w-full h-full border-0"
          title="StubHub Arts"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
        />
      </div>
    </>
  );
}