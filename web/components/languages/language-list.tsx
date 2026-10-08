import Link from "next/link";
import { StatusBadge } from "@/components/languages/status-badge";
import type { Language } from "@/lib/languages";

export function LanguageList({ languages }: { languages: Language[] }) {
  return (
    <>
      {/* Table — desktop and tablet */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Region</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((language) => (
              <tr
                key={language.language_code}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/languages/${language.language_code}`}
                    className="font-medium transition-colors hover:text-accent"
                  >
                    {language.name}
                  </Link>
                  <div className="text-xs text-muted">
                    {language.language_code}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{language.region}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={language.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <ul className="grid gap-4 md:hidden">
        {languages.map((language) => (
          <li key={language.language_code}>
            <Link
              href={`/languages/${language.language_code}`}
              className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{language.name}</div>
                  <div className="text-xs text-muted">
                    {language.language_code}
                  </div>
                </div>
                <StatusBadge status={language.status} />
              </div>
              <p className="mt-3 text-sm text-muted">{language.region}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
