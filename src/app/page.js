import Image from "next/image";

export default function Home() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center py-10">
      <div className="flex items-center justify-center">
        <Image
          src="/ENFJ.png"
          alt="ENFJ"
          width={512}
          height={512}
          priority
          className="object-contain max-w-full h-auto"
        />
      </div>
    </section>
  );
}
