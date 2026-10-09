import { useDeferredValue, useEffect, useMemo } from 'react'
import { createTheme, ThemeStyle, themeToCss } from '../src'
import { EARLY_STYLE_ID, ensureFontLoaded, getBuilderState, monoFont, sansFont, saveEarlyCss, toConfig, useThemeBuilder } from './theme-store'

export function SiteTheme() {
  // Each theme swap restyles the whole page. A color picker fires many changes per
  // second while dragged; deferring lets React skip the ones that are already stale.
  const state = useDeferredValue(useThemeBuilder().state);
  const config = useMemo(() => toConfig(state), [state]);

  useEffect(() => {
    ensureFontLoaded(sansFont(state));
    ensureFontLoaded(monoFont(state));
  }, [state]);

  const tokens = useMemo(() => createTheme(config), [config]);

  // Keep the pre-paint copy of this theme (see saveEarlyCss) current for the next visit and
  // drop it once the live <ThemeStyle> below has taken over. Hydration starts from the
  // default state and the stored one arrives a render later (deferred), so both wait until
  // the rendered state is the stored one: removing the early CSS (or overwriting its cache)
  // before that would flash the default theme.
  useEffect(() => {
    if (state !== getBuilderState()) return;
    saveEarlyCss(themeToCss(tokens));
    document.getElementById(EARLY_STYLE_ID)?.remove();
  }, [state, tokens]);

  return <ThemeStyle tokens={tokens} />;
}
