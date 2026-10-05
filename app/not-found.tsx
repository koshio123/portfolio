import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-start gap-6 py-32">
      <span className="label text-ink-muted">404</span>
      <h1 className="text-h1 font-bold">ページが見つかりません</h1>
      <ButtonLink href="/">Homeへ戻る</ButtonLink>
    </div>
  );
}
