import { AssetGalleryPage } from './components/AssetGalleryPage';
import ButtonSystem from './components/ButtonSystem';
import CardSystem from './components/CardSystem';
import { DesignSystemComponentsPage } from './components/DesignSystemComponentsPage';
import ElementsSystem from './components/ElementsSystem';
import { HeaderVariantsPage } from './components/HeaderVariantsPage';
import { IndexScreen } from './components/IndexScreen';
import LightMode from './components/LightColors';
import SystemEffect from './components/SystemEffect';
import SystemLayoutGrid from './components/SystemLayoutGrid';
import TypographySystem from './components/TypographySystem';
import type { HeaderVariant } from './components/headers/EcommerceHeader';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const isAssetView =
    window.location.pathname === '/assets' ||
    params.get('view') === 'assets';
  const isComponentsView =
    window.location.pathname === '/components' ||
    params.get('view') === 'components';
  const isLayoutGridView =
    window.location.pathname === '/layout-grid' ||
    params.get('view') === 'layout-grid';
  const isSystemEffectView =
    window.location.pathname === '/system-effect' ||
    params.get('view') === 'system-effect';
  const isLightColorsView =
    window.location.pathname === '/light-colors' ||
    params.get('view') === 'light-colors';
  const isTypographyView =
    window.location.pathname === '/typography' ||
    params.get('view') === 'typography';
  const isButtonSystemView =
    window.location.pathname === '/button-system' ||
    params.get('view') === 'button-system';
  const isElementsSystemView =
    window.location.pathname === '/elements' ||
    params.get('view') === 'elements';
  const isCardSystemView =
    window.location.pathname === '/card-system' ||
    params.get('view') === 'card-system';
  const isHeaderVariantsView =
    window.location.pathname === '/header-variants' ||
    params.get('view') === 'header-variants';

  const headerParam = params.get('header');
  const headerVariant: HeaderVariant =
    headerParam === 'mega-search' || headerParam === 'sticky-compact' || headerParam === 'search-centered'
      ? headerParam
      : 'search-centered';

  if (isAssetView) {
    return <AssetGalleryPage />;
  }

  if (isComponentsView) {
    return <DesignSystemComponentsPage />;
  }

  if (isLayoutGridView) {
    return <SystemLayoutGrid />;
  }

  if (isSystemEffectView) {
    return <SystemEffect />;
  }

  if (isLightColorsView) {
    return <LightMode />;
  }

  if (isTypographyView) {
    return <TypographySystem />;
  }

  if (isButtonSystemView) {
    return <ButtonSystem />;
  }

  if (isElementsSystemView) {
    return <ElementsSystem />;
  }

  if (isCardSystemView) {
    return <CardSystem />;
  }

  if (isHeaderVariantsView) {
    return <HeaderVariantsPage />;
  }

  return <IndexScreen headerVariant={headerVariant} />;
}
