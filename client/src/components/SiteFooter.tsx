import { Heart } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-6 h-6 text-[#E26D5C] fill-[#E26D5C]" />
            <span className="font-bold text-lg">ろかいずみ</span>
          </div>
          <p className="text-sm text-gray-500">{t("footer.tagline")}</p>
          <nav
            aria-label="事業内容"
            className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold text-[#014488]"
          >
            <a href="/linbo-ai" className="hover:underline">
              林博AI
            </a>
            <a href="/candles/" className="hover:underline">
              手作蠟燭
            </a>
            <a href="/line-shop/" className="hover:underline">
              LINE商店
            </a>
            <Link href="/ag" className="hover:underline">
              批發
            </Link>
            <Link href="/b2b" className="hover:underline">
              企業採購
            </Link>
            <Link href="/about" className="hover:underline">
              会社案内
            </Link>
          </nav>
          <p className="text-sm text-gray-500">大阪市淀川区西中島六丁目10番1の502</p>
          <p className="text-xs text-gray-400 mt-4">
            © 2026 ろかいずみ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
