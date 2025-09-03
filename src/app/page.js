import Link from "next/link";

export default function Home() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-bold mb-3">Welcome to MindShift</h1>
      <p className="text-neutral-600 mb-6">Track progress, build habits, and climb the leaderboard.</p>
      <Link
        href="/leaderboard"
        className="btn btn-primary"
      >
        View Leaderboard
      </Link>
    </section>
  );
}
