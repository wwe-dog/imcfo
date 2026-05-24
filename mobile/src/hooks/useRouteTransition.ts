import { useCallback, useMemo, useState } from "react";
import type { ScreenTransitionDirection } from "../components/ScreenTransition";

type RouteTransitionState<T> = {
  depth: number;
  direction: ScreenTransitionDirection;
  route: T;
  transitionKey: string;
};

export function useRouteTransition<T>(
  initialRoute: T,
  getKey: (route: T) => string,
  getDepth: (route: T) => number,
) {
  const [state, setState] = useState<RouteTransitionState<T>>(() => ({
    depth: getDepth(initialRoute),
    direction: "neutral",
    route: initialRoute,
    transitionKey: getKey(initialRoute),
  }));

  const navigate = useCallback(
    (nextRoute: T) => {
      setState((current) => {
        const nextDepth = getDepth(nextRoute);
        const nextKey = getKey(nextRoute);
        const direction: ScreenTransitionDirection =
          nextDepth > current.depth ? "forward" : nextDepth < current.depth ? "back" : "neutral";

        return {
          depth: nextDepth,
          direction,
          route: nextRoute,
          transitionKey: nextKey,
        };
      });
    },
    [getDepth, getKey],
  );

  const goBack = useCallback(
    (nextRoute: T) => {
      setState({
        depth: getDepth(nextRoute),
        direction: "back",
        route: nextRoute,
        transitionKey: getKey(nextRoute),
      });
    },
    [getDepth, getKey],
  );

  return useMemo(
    () => ({
      direction: state.direction,
      goBack,
      navigate,
      route: state.route,
      transitionKey: state.transitionKey,
    }),
    [goBack, navigate, state.direction, state.route, state.transitionKey],
  );
}
