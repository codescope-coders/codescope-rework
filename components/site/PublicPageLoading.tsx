/** Invisible readiness marker: the transition retains the outgoing page/menu
 * until this boundary resolves, without exposing a loader or skeleton. */
export default function PublicPageLoading() {
  return <div data-public-page-loading className="min-h-[65dvh]" aria-hidden="true" />;
}
