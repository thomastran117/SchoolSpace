import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

/**
 * Header
 *
 * Renders two separate, self-contained header implementations:
 *  - DesktopHeader  — visible at ≥ 768px (hidden on mobile via CSS)
 *  - MobileHeader   — visible at  < 768px (hidden on desktop via CSS)
 *
 * Each header owns its own module CSS and state, making them
 * independently maintainable without media-query spaghetti.
 */
export default function Header() {
  return (
    <>
      <DesktopHeader />
      <MobileHeader />
    </>
  );
}