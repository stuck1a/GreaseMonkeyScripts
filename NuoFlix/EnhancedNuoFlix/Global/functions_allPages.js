
/**
 * Uses the predefined route mappings to determine the route name
 * to decide the path of the further execution flow.
 * 
 * @return {string}  - Route name
 */
function getActiveRoute() {
  for (const route of pageRoutes.entries()) {
    if (window.location.pathname.match(new RegExp(`^${route[0]}/*$`, 'i'))) return route[1];
  }
  return '';
}
