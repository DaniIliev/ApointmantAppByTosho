import { useTranslation } from "react-i18next";

export default function BlogPage() {
  const { t } = useTranslation();
  const blogPosts = [
    {
      id: 1,
      title: t("5 Tips for Better Appointment Management"),
      excerpt: t(
        "Learn how to optimize your appointment scheduling process and reduce no-shows."
      ),
      date: "2024-01-15",
      readTime: t("5 min read"),
    },
    {
      id: 2,
      title: t("The Future of Digital Scheduling"),
      excerpt: t(
        "Explore upcoming trends in appointment management and digital transformation."
      ),
      date: "2024-01-10",
      readTime: t("7 min read"),
    },
    {
      id: 3,
      title: t("Customer Experience in Service Industries"),
      excerpt: t(
        "How modern appointment systems can enhance customer satisfaction and loyalty."
      ),
      date: "2024-01-05",
      readTime: t("6 min read"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-8">
            {t("Blog & Insights")}
          </h1>

          <div className="space-y-6">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-slate-800/30 p-6 rounded-xl border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white hover:text-purple-400 transition-colors">
                    {post.title}
                  </h2>
                  <span className="text-sm text-white/60 whitespace-nowrap ml-4">
                    {post.readTime}
                  </span>
                </div>
                <p className="text-white/70 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <button className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium">
                    {t("Read More")} →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
