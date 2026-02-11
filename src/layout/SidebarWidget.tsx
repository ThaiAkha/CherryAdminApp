export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
    >
      <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
        #1 Cooking School <br /> Chiang Mai - Thailand
      </h4>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        Explore the way of Akha Cooking.
      </p>
      <a
        href="https://www.thaiakhakitchen.com/"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600"
      >
        Go Website
      </a>
    </div>
  );
}
