const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

const defaultResolveRequest = config.resolver.resolveRequest;

const tryResolve = (context, candidate, platform) => {
  try {
    return context.resolveRequest(context, candidate, platform);
  } catch {
    return null;
  }
};

/**
 * @/* maps to src/* in tsconfig, but Expo template files live at repo root
 * (components/, hooks/, constants/). Resolve both locations.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/src/')) {
    const subpath = moduleName.slice('@/src/'.length);
    const fromSrc = tryResolve(context, path.join(projectRoot, 'src', subpath), platform);
    if (fromSrc) return fromSrc;
  }

  if (moduleName.startsWith('@/hooks/')) {
    const subpath = moduleName.slice('@/hooks/'.length);
    const fromRoot = tryResolve(context, path.join(projectRoot, 'hooks', subpath), platform);
    if (fromRoot) return fromRoot;
    const fromSrc = tryResolve(context, path.join(projectRoot, 'src/hooks', subpath), platform);
    if (fromSrc) return fromSrc;
  }

  if (moduleName.startsWith('@/constants/')) {
    const subpath = moduleName.slice('@/constants/'.length);
    const fromRoot = tryResolve(context, path.join(projectRoot, 'constants', subpath), platform);
    if (fromRoot) return fromRoot;
  }

  if (moduleName.startsWith('@/components/')) {
    const subpath = moduleName.slice('@/components/'.length);
    const fromSrc = tryResolve(
      context,
      path.join(projectRoot, 'src/components', subpath),
      platform
    );
    if (fromSrc) return fromSrc;
    const fromRoot = tryResolve(context, path.join(projectRoot, 'components', subpath), platform);
    if (fromRoot) return fromRoot;
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
